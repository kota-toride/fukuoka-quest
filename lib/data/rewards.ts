// REWARD CABINET のアイテム。
// 運営が自腹で仕入れるのではなく、地元企業・JA・漁協・自治体などが
// 販促 / 地域PRとして提供するモデル（provider に提供元を持たせる）。

export interface RewardItem {
  id: string;
  name: { ja: string; en: string };
  description: { ja: string; en: string };
  points: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  region: string;
  provider: string;
  stock: number;
  image?: string;
  /** アイコン用の絵文字（画像が無い時のフォールバック） */
  glyph: string;
  kind: "ITEM" | "EXPERIENCE";
}

export const REWARDS: RewardItem[] = [
  {
    id: "yame-tea",
    name: { ja: "八女茶 一番摘み", en: "Yame Tea — First Flush" },
    description: { ja: "八女の茶師が選んだ一番茶。50g。", en: "First-flush tea selected by a Yame tea master. 50g." },
    points: 500,
    rarity: "COMMON",
    region: "yame",
    provider: "八女茶振興パートナーズ（デモ）",
    stock: 42,
    image: "/images/items/yame-tea.png",
    glyph: "🍵",
    kind: "ITEM",
  },
  {
    id: "amaou",
    name: { ja: "あまおう フリーズドライ", en: "Amaou Strawberry Crisps" },
    description: { ja: "福岡生まれのいちご「あまおう」を丸ごと閉じ込めた一品。", en: "Fukuoka's Amaou strawberries, freeze-dried whole." },
    points: 800,
    rarity: "RARE",
    region: "kurume",
    provider: "JA連携スポンサー（デモ）",
    stock: 18,
    image: "/images/items/amaou.png",
    glyph: "🍓",
    kind: "ITEM",
  },
  {
    id: "genkai-seafood",
    name: { ja: "玄界灘 水産加工品セット", en: "Genkai Sea Seafood Set" },
    description: { ja: "糸島の漁港から届く、干物と明太子の詰め合わせ。", en: "Dried fish and mentaiko from Itoshima's harbor." },
    points: 1200,
    rarity: "EPIC",
    region: "itoshima",
    provider: "漁協連携スポンサー（デモ）",
    stock: 9,
    image: "/images/items/genkai-seafood.png",
    glyph: "🐟",
    kind: "ITEM",
  },
  {
    id: "fukuoka-box",
    name: { ja: "福岡特産品 トレジャーボックス", en: "Fukuoka Treasure Box" },
    description: { ja: "4地方の特産品を詰め込んだ、冒険者のための宝箱。", en: "A treasure chest of specialties from all four provinces." },
    points: 3000,
    rarity: "LEGENDARY",
    region: "fukuoka",
    provider: "福岡県内スポンサー企業連合（デモ）",
    stock: 3,
    image: "/images/items/treasure-box.png",
    glyph: "🎁",
    kind: "ITEM",
  },
  {
    id: "yanagawa-boat",
    name: { ja: "柳川 川下り 乗船券", en: "Yanagawa River Cruise Pass" },
    description: { ja: "水路の迷宮を、船頭と一緒に。", en: "Explore the water labyrinth with a boatman." },
    points: 1500,
    rarity: "EPIC",
    region: "yanagawa",
    provider: "観光事業者スポンサー（デモ）",
    stock: 12,
    image: "/images/items/yanagawa-boat.png",
    glyph: "🛶",
    kind: "EXPERIENCE",
  },
  {
    id: "mentaiko",
    name: { ja: "博多 明太子 ミニ", en: "Hakata Mentaiko Mini" },
    description: { ja: "博多の食卓の定番を、小さな一箱で。", en: "A Hakata table staple in a small box." },
    points: 650,
    rarity: "COMMON",
    region: "fukuoka",
    provider: "食品メーカースポンサー（デモ）",
    stock: 30,
    image: "/images/items/mentaiko.png",
    glyph: "🌶️",
    kind: "ITEM",
  },
];

export const RARITY_STYLE: Record<RewardItem["rarity"], { color: string; label: string }> = {
  COMMON: { color: "#4b5563", label: "COMMON" },
  RARE: { color: "#3c6f80", label: "RARE" },
  EPIC: { color: "#8b5e3c", label: "EPIC" },
  LEGENDARY: { color: "#a8823a", label: "LEGENDARY" },
};
