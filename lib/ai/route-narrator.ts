import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { narrateDemo, PREFERENCES, type NarrateInput } from "@/lib/game/route";
import { zoneById } from "@/lib/data/regions";
import { FORBIDDEN_FOR_PLAYERS } from "./sanitize";
import { isAiEnabled } from "./provider";

// ============================================================
// AI ADVENTURE ROUTE — GAME MASTER の「語り」
// 時間・運賃・SIDE QUESTはルートエンジンが決定的に計算済み。
// AIはその事実だけを使って、命令ではなく「提案」の口調で語る。
// ============================================================

const Schema = z.object({ ja: z.array(z.string()), en: z.array(z.string()) });

const SYSTEM = `あなたは「FUKUOKA QUEST」のAI GAME MASTERです。福岡県全体を現実世界のRPGにするサービスで、プレイヤーが目的地へ向かう「冒険ルート」を案内します。

# 口調
- 冒険の案内人として、静かで上質な語り口。子供向け・ファンタジー表現（剣・魔法・モンスター等）は使わない。
- 絶対に命令しない。「〜できます」「〜という冒険もあります」「寄るかどうかはあなたが決めてください」のように提案する。
- ja / en それぞれ3〜5行。1行は短く。英語は自然なトーンで。

# 事実
- 与えられた所要時間・経由地・SIDE QUEST・EXP・追加時間だけを使う。数値や施設名を作らない。
- 店舗の内部事情（空席・余剰など）には触れない。`;

export async function narrateRoute(input: NarrateInput): Promise<{ ja: string[]; en: string[]; source: "ai" | "demo" }> {
  const demo = narrateDemo(input);
  if (!isAiEnabled()) return { ...demo, source: "demo" };
  try {
    const { plan, destTitle, sides } = input;
    const pref = PREFERENCES.find((p) => p.id === plan.preference);
    const facts = {
      destination: { quest: destTitle.ja, area: zoneById(plan.path[plan.path.length - 1])?.ja },
      style: pref?.ja,
      mode: plan.mode,
      travelMinutes: plan.travelMinutes,
      path: plan.path.map((z) => zoneById(z)?.ja),
      via: plan.via ? zoneById(plan.via)?.ja : null,
      sideQuestsOnRoute: sides.map((s) => ({ title: s.title.ja, area: zoneById(s.zone)?.ja, exp: s.exp, extraMinutes: s.detour, recommendedForThisStyle: plan.recommended.includes(s.id) })),
    };
    const client = new Anthropic();
    const res = await client.messages.parse(
      {
        model: "claude-opus-5",
        max_tokens: 4000,
        system: SYSTEM,
        output_config: { effort: "low", format: zodOutputFormat(Schema) },
        messages: [{ role: "user", content: `この冒険ルートをプレイヤーに提案してください。\n${JSON.stringify(facts, null, 2)}` }],
      },
      { timeout: 30_000, maxRetries: 1 },
    );
    const out = res.parsed_output;
    if (res.stop_reason !== "end_turn" || !out || !out.ja.length || !out.en.length) return { ...demo, source: "demo" };
    const bad = [...out.ja, ...out.en].some((l) => FORBIDDEN_FOR_PLAYERS.some((w) => l.toLowerCase().includes(w.toLowerCase())));
    if (bad) return { ...demo, source: "demo" };
    return { ja: out.ja.slice(0, 6), en: out.en.slice(0, 6), source: "ai" };
  } catch (err) {
    console.error("[route] AI narration failed, falling back to demo:", err);
    return { ...demo, source: "demo" };
  }
}
