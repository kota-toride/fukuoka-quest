import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { GenerateRequest, GeneratedQuest } from "@/lib/types";

// ============================================================
// AI GAME MASTER — Claude 実装
// ANTHROPIC_API_KEY があるときだけ使われる。失敗時は呼び出し側でDEMOにフォールバック。
// 別プロバイダ（OpenAI等）を足す場合は provider.ts に同じシグネチャで追加する。
// ============================================================

const L = z.object({ ja: z.string(), en: z.string() });

const QuestSchema = z.object({
  title: L,
  tagline: L,
  story: L,
  category: z.enum(["FOOD", "FARM", "FISH", "CULTURE", "PEOPLE", "DISCOVERY", "ADVENTURE", "LIMITED", "DAILY"]),
  kind: z.enum(["STANDARD", "LIMITED", "DAILY", "HIDDEN", "RAINY", "TIME", "SPONSOR"]),
  difficulty: z.number().int(),
  exp: z.number().int(),
  points: z.number().int(),
  duration: z.number().int(),
  recommendedTime: z.string(),
  reward: L,
  objectives: z.array(L),
  titleReward: L,
  reasoning: z.array(z.string()),
});

const SYSTEM = `あなたは「FUKUOKA QUEST」のAI GAME MASTERです。
FUKUOKA QUESTは福岡県全体を現実世界のRPGにするサービスで、福岡で起きていること（店・農家・漁業・文化・今日だけの出来事）をQUESTに変換します。

# あなたの仕事
事業者や地域から届いた情報を、プレイヤーが「面白そう」「今しかない」と感じて実際に現地へ向かいたくなるQUESTに変換します。

# 文体
- タイトルは命令形の短い一文（例：「八女茶の秘密を探れ」「博多の夜を攻略せよ」）。20文字以内。
- ストーリーは2〜3行、改行区切り。静かで上質な冒険譚のトーン。子供向け・安っぽい表現は避ける。
- 英語は直訳ではなく、同じトーンの自然な英語で書く。
- objectives は現地で実際にできる行動を2〜3個。

# 絶対に守るルール
- プレイヤー向けのテキスト（title / tagline / story / reward / objectives / titleReward）に、事業者の裏事情を一切書かない。
  禁止：空席・暇・閑散・廃棄・余剰・売れ残り・在庫・食品ロス・「協力して」「助けて」などの社会課題的な表現。
- 数量限定は「今日だけ」「限定」などゲームの言葉で表現する。
- 食品は、事業者が販売・提供可能と判断した商品として扱う。
- 実在しない施設名や事実を作り上げない。入力にない固有名詞は使わない。

# 数値の目安
- difficulty: 1〜5
- exp: 300〜1500（所要時間・希少性・物語性で決める）。Dynamic QUEST で事業者がEXPを指定した場合はその値を使う。
- points: exp の約1/8（10単位）。Dynamic QUEST で事業者が指定した場合はその値を使う。
- duration: 分

reasoning には、どう判断したかを事業者向けに日本語で3〜5行で書く（ここだけは裏事情に触れてよい）。`;

function userPrompt(req: GenerateRequest) {
  if (req.mode === "resource") {
    const i = req.input;
    return `# 地域資源からQUESTを生成
地域：${i.region}
資源：${i.resource}
体験：${i.experience}
開催時間：${i.hours}
対象：${i.audience}
特徴：${i.feature}

観光情報への露出が少なそうなら kind を HIDDEN に、そうでなければ STANDARD にする。`;
  }
  const i = req.input;
  const reason = { idle_time: "来店の少ない時間帯に来てほしい", surplus: "当日提供可能な商品を届けたい", new_menu: "新メニューを知ってほしい", event: "イベントに合わせたい" }[i.internalReason];
  return `# 店舗・事業者から Dynamic QUEST を生成（kind は LIMITED、category は FOOD）
店舗：${i.businessName}
エリア：${i.region}
時間：${i.startAt}〜${i.endAt}
限定商品：${i.item}
提供可能数：${i.quantity}
EXP：${i.exp}
POINT：${i.points}
【事業者の内部事情（プレイヤー向けテキストには絶対に出さない）】${reason}${i.note ? ` / ${i.note}` : ""}`;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(n)));

export async function generateWithClaude(req: GenerateRequest): Promise<{ quest: GeneratedQuest; reasoning: string[] } | null> {
  const client = new Anthropic();
  const response = await client.messages.parse(
    {
      model: "claude-opus-5",
      max_tokens: 16000,
      system: SYSTEM,
      output_config: { effort: "low", format: zodOutputFormat(QuestSchema) },
      messages: [{ role: "user", content: userPrompt(req) }],
    },
    { timeout: 45_000, maxRetries: 1 },
  );

  // 安全分類器による拒否などは DEMO にフォールバック
  if (response.stop_reason !== "end_turn" || !response.parsed_output) return null;
  const { reasoning, ...q } = response.parsed_output;

  const quest: GeneratedQuest = {
    ...q,
    difficulty: clamp(q.difficulty, 1, 5) as GeneratedQuest["difficulty"],
    exp: req.mode === "dynamic" ? req.input.exp : clamp(q.exp, 100, 3000),
    points: req.mode === "dynamic" ? req.input.points : clamp(q.points, 10, 400),
    duration: clamp(q.duration, 10, 480),
    objectives: q.objectives.slice(0, 4),
    ...(req.mode === "dynamic" ? { kind: "LIMITED" as const, category: "FOOD" as const, recommendedTime: `${req.input.startAt}〜${req.input.endAt}` } : {}),
  };
  return { quest, reasoning };
}
