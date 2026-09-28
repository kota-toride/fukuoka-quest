import type { DynamicInput, GeneratedQuest, QuestCategory, ResourceInput } from "@/lib/types";

// ============================================================
// DEMO MODE の QUEST 生成エンジン
// APIキーが無くても、入力から「それらしい」QUESTをルールベースで組み立てる。
// ============================================================

const EN: Record<string, string> = {
  福岡: "Fukuoka", 福岡市: "Fukuoka", 博多: "Hakata", 天神: "Tenjin", 中洲: "Nakasu", 糸島: "Itoshima", 糸島市: "Itoshima",
  宗像: "Munakata", 宗像市: "Munakata", 太宰府: "Dazaifu", 太宰府市: "Dazaifu", 北九州: "Kitakyushu", 北九州市: "Kitakyushu",
  門司港: "Mojiko", 小倉: "Kokura", 行橋: "Yukuhashi", 飯塚: "Iizuka", 田川: "Tagawa", 朝倉: "Asakura", 朝倉市: "Asakura",
  久留米: "Kurume", 久留米市: "Kurume", 八女: "Yame", 八女市: "Yame", 柳川: "Yanagawa", 柳川市: "Yanagawa", 大牟田: "Omuta",
  大牟田市: "Omuta", うきは: "Ukiha", うきは市: "Ukiha", 筑後: "Chikugo", 玄界灘: "the Genkai Sea",
  八女茶: "Yame tea", 茶: "tea", 茶畑: "tea fields", 茶園: "tea gardens", 玉露: "gyokuro", いちご: "strawberries", あまおう: "Amaou strawberries", 明太子: "mentaiko",
  ラーメン: "ramen", 魚: "fish", 鯛: "sea bream", 牡蠣: "oysters", 柿: "persimmons", 梨: "pears", ぶどう: "grapes",
  酒: "sake", 日本酒: "sake", 提灯: "lanterns", 和紙: "washi paper", 祭り: "the festival", 屋台: "yatai stalls",
};
const en = (s: string) => EN[s.trim()] ?? EN[s.trim().replace(/[市町村]$/, "")] ?? s;
const strip = (s: string) => s.trim().replace(/[市町村]$/, "") || s.trim();

const CATEGORY_RULES: [RegExp, QuestCategory][] = [
  [/茶|畑|農|収穫|果|いちご|苺|あまおう|柿|梨|ぶどう|野菜|米/, "FARM"],
  [/魚|漁|港|海|牡蠣|鯛|市場|釣/, "FISH"],
  [/祭|伝統|文化|工芸|提灯|和紙|神社|寺|歴史|能|舞/, "CULTURE"],
  [/職人|生産者|店主|語り|話|師/, "PEOPLE"],
  [/食|ラーメン|料理|店|一皿|明太|酒|グルメ|屋台/, "FOOD"],
  [/山|登|滝|島|洞窟|ハイク|自転車|カヤック/, "ADVENTURE"],
];

function detectCategory(text: string): QuestCategory {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(text)) return cat;
  return "DISCOVERY";
}

function hashPick<T>(seed: string, list: T[]): T {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

function hoursToMinutes(hours: string): number {
  const m = hours.match(/(\d{1,2}):?(\d{2})?\s*[〜~\-ー－]\s*(\d{1,2}):?(\d{2})?/);
  if (!m) return 60;
  const s = Number(m[1]) * 60 + Number(m[2] ?? 0);
  const e = Number(m[3]) * 60 + Number(m[4] ?? 0);
  // 開催時間の 1/6 を所要時間の目安にする（10:00〜16:00 → 約60分）
  return Math.max(30, Math.min(120, Math.round((e - s) / 6 / 10) * 10 || 60));
}

const round50 = (n: number) => Math.round(n / 50) * 50;

export function demoFromResource(input: ResourceInput): { quest: GeneratedQuest; reasoning: string[] } {
  const region = strip(input.region || "福岡");
  const rawResource = input.resource.trim() || "地域の宝";
  // 「茶畑」「茶園」のような場所は、その土地の産品として物語にする（八女 × 茶畑 → 八女茶）
  const resource = /^(茶畑|茶園)$/.test(rawResource) ? `${region}茶` : rawResource;
  const all = `${input.resource} ${input.experience} ${input.feature}`;
  const category = detectCategory(all);
  const direct = /直接|生産者|職人|本人|農家|漁師/.test(input.feature);
  const hidden = /知られていない|隠れ|秘密|地元|少人数|未掲載|ガイドに載っていない/.test(all);
  const duration = hoursToMinutes(input.hours);
  const difficulty = (Math.min(5, Math.max(1, Math.round(duration / 40) + (direct ? 0 : 1)))) as GeneratedQuest["difficulty"];
  const exp = round50(400 + difficulty * 150 + (direct || hidden ? 100 : 0));
  const points = Math.round(exp / 8 / 10) * 10;

  // 人から話を聞ける体験 →「秘密を探れ」、隠れた資源 →「眠る〜を解き明かせ」
  const titleJa = direct
    ? `${resource}の秘密を探れ`
    : hidden
      ? `${region}に眠る${resource}を解き明かせ`
      : hashPick(resource, [`${resource}の秘密を探れ`, `${resource}の真髄に触れよ`]);
  const resEn = EN[resource] ?? (resource.endsWith("茶") && resource !== "茶" ? `${en(region)} tea` : en(resource));
  const titleEn = titleCase(
    titleJa.includes("秘密")
      ? `Uncover the Secret of ${resEn}`
      : titleJa.includes("眠る")
        ? `Unveil the ${resEn} Sleeping in ${en(region)}`
        : `Touch the Essence of ${resEn}`,
  );

  const person = direct ? "生産者" : "土地の人";
  const scape = /(畑|園|田|港|浜|川|山)$/.test(rawResource) ? `${region}に広がる${rawResource}。` : `${region}の地に、${rawResource}がある。`;
  const storyJa = [scape, "", `この土地の${resource}には、`, "まだ知られていない物語がある。", "", `${person}の言葉を手がかりに、`, "その秘密を発見せよ。"].join("\n");
  const storyEn = [
    `In ${en(region)} lie ${en(rawResource)}.`,
    "",
    `The ${resEn} of this land`,
    "holds a story not yet told.",
    "",
    `Follow the words of the ${direct ? "growers themselves" : "people of the land"}`,
    "and discover its secret.",
  ].join("\n");

  const quest: GeneratedQuest = {
    title: { ja: titleJa, en: titleEn },
    tagline: {
      ja: hidden
        ? `観光サイトには載っていない、${resource.startsWith(region) ? resource : `${region}の${resource}`}の物語。`
        : `${region}で、${resource}の物語に触れる。`,
      en: hidden ? `The ${resEn} of ${en(region)} no guidebook shows.` : `Step into the story of ${resEn} in ${en(region)}.`,
    },
    story: { ja: storyJa, en: storyEn },
    category,
    kind: hidden ? "HIDDEN" : "STANDARD",
    difficulty,
    exp,
    points,
    duration,
    recommendedTime: input.hours || "10:00〜16:00",
    reward: { ja: `${resource} 体験記念品＋称号`, en: `${cap(resEn)} keepsake + Title` },
    objectives: [
      { ja: `${region}のQUEST地点にたどり着く`, en: `Reach the quest point in ${en(region)}` },
      { ja: input.experience ? input.experience.replace(/できる$/, "する") : `${resource}を体験する`, en: `Experience ${resEn} firsthand` },
      { ja: `${person}から秘密を1つ聞き出す`, en: `Learn one secret from the ${direct ? "producer" : "locals"}` },
    ],
    titleReward: { ja: `${resource}ハンター`, en: `${cap(resEn)} Hunter` },
  };

  const reasoning = [
    `資源「${resource}」を解析 → カテゴリー ${category}`,
    direct ? "生産者が直接説明 → 物語性が高いため EXP を加算" : "体験型資源として標準EXPを設定",
    hidden ? "観光情報への露出が少ない → HIDDEN QUEST に分類" : "一般公開QUESTとして分類",
    `開催時間 ${input.hours || "未設定"} から所要 ${duration} 分と推定 → 難易度 ★${difficulty}`,
    `対象「${input.audience || "全員"}」向けにストーリーを日英で生成`,
  ];
  return { quest, reasoning };
}

export function demoFromDynamic(input: DynamicInput): { quest: GeneratedQuest; reasoning: string[] } {
  const area = strip(input.region || "博多");
  const start = Number(input.startAt.split(":")[0] || 17);
  const slot =
    start >= 17 ? { ja: "夜", en: "Night" } : start >= 14 ? { ja: "夕暮れ", en: "Dusk" } : start >= 11 ? { ja: "昼", en: "Noon" } : { ja: "朝", en: "Morning" };
  const item = input.item.trim() || "今日だけの一皿";

  const quest: GeneratedQuest = {
    title: { ja: `${area}の${slot.ja}を攻略せよ`, en: `Conquer the ${en(area)} ${slot.en}` },
    tagline: { ja: `${input.startAt}〜${input.endAt}、今しか出会えない「${item}」。`, en: `${input.startAt}–${input.endAt}: a dish you can only meet now.` },
    story: {
      ja: `${area}の街に、今だけのQUESTが発生した。\n${input.businessName}が今日のために用意した「${item}」。\nこの時間を逃せば、二度と同じ一皿には出会えない。`,
      en: `A quest has appeared in ${en(area)} — for now only.\n${input.businessName} prepared "${item}" just for today.\nMiss this window and you will never meet the same plate again.`,
    },
    category: "FOOD",
    kind: "LIMITED",
    difficulty: 2,
    exp: input.exp || 500,
    points: input.points || 50,
    duration: 45,
    recommendedTime: `${input.startAt}〜${input.endAt}`,
    reward: { ja: `限定メニュー「${item}」`, en: `Limited menu: ${item}` },
    objectives: [
      { ja: `${input.businessName}にたどり着く`, en: `Find ${input.businessName}` },
      { ja: "店主にQUEST画面を見せる", en: "Show your quest screen to the owner" },
      { ja: `「${item}」を味わう`, en: `Taste "${item}"` },
    ],
    titleReward: { ja: `${area}の${slot.ja}の覇者`, en: `Ruler of the ${en(area)} ${slot.en}` },
  };

  const reasonLabel: Record<DynamicInput["internalReason"], string> = {
    idle_time: "来店の少ない時間帯",
    surplus: "当日提供可能な商品の活用",
    new_menu: "新メニューの認知",
    event: "イベント連動",
  };
  const reasoning = [
    `事業者の目的：${reasonLabel[input.internalReason]}（※プレイヤーには非表示）`,
    `時間窓 ${input.startAt}〜${input.endAt} → LIMITED QUEST として発生させる`,
    `提供可能数 ${input.quantity} → QUEST枠を ${input.quantity} に設定（先着）`,
    `開始 ${start}時 → 「${slot.ja}」を攻略するストーリーに変換`,
    "裏事情ワードを検査 → プレイヤー向け文面から除外済み",
  ];
  return { quest, reasoning };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const SMALL = new Set(["of", "the", "in", "a", "an", "and", "to"]);
function titleCase(s: string) {
  return s
    .split(" ")
    .map((w, i) => (i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : cap(w)))
    .join(" ");
}
