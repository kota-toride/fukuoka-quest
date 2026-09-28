export interface Title {
  id: string;
  ja: string;
  en: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "MYTHIC";
  hint: { ja: string; en: string };
}

export const TITLES: Title[] = [
  { id: "first-step", ja: "旅立ちの冒険者", en: "First-Step Adventurer", tier: "BRONZE", hint: { ja: "最初のQUESTをCLEAR", en: "Clear your first quest" } },
  { id: "food-culture", ja: "福岡食文化探究者", en: "Seeker of Fukuoka Food Culture", tier: "SILVER", hint: { ja: "食のQUESTを10回CLEAR", en: "Clear 10 food quests" } },
  { id: "genkai-explorer", ja: "玄界灘の探索者", en: "Explorer of the Genkai Sea", tier: "SILVER", hint: { ja: "玄界灘のQUESTをCLEAR", en: "Clear a Genkai Sea quest" } },
  { id: "hakata-gourmet", ja: "博多の夜を知る者", en: "One Who Knows the Hakata Night", tier: "SILVER", hint: { ja: "博多の限定QUESTをCLEAR", en: "Clear a limited quest in Hakata" } },
  { id: "yame-tea-explorer", ja: "八女茶探索者", en: "Yame Tea Explorer", tier: "GOLD", hint: { ja: "八女茶の秘密を発見する", en: "Discover the secret of Yame tea" } },
  { id: "chikugo-knower", ja: "筑後を知る者", en: "One Who Knows Chikugo", tier: "GOLD", hint: { ja: "筑後のエリアを3つ発見", en: "Discover 3 areas in Chikugo" } },
  { id: "side-walker", ja: "寄り道の達人", en: "Master of Detours", tier: "SILVER", hint: { ja: "SIDE QUESTを2つCLEAR", en: "Clear 2 side quests" } },
  { id: "canal-navigator", ja: "水路の航海士", en: "Canal Navigator", tier: "SILVER", hint: { ja: "柳川の秘密を探す", en: "Find Yanagawa's secret" } },
  { id: "sea-road-walker", ja: "海の道の巡礼者", en: "Sea Road Pilgrim", tier: "SILVER", hint: { ja: "宗像の海の道を渡る", en: "Cross Munakata's sea road" } },
  { id: "hidden-seeker", ja: "隠れたQUESTを見る者", en: "Seer of Hidden Quests", tier: "GOLD", hint: { ja: "HIDDEN QUESTを3つCLEAR", en: "Clear 3 hidden quests" } },
  { id: "yame-meister", ja: "八女茶マイスター", en: "Yame Tea Meister", tier: "MYTHIC", hint: { ja: "八女茶QUEST WEEKを制覇", en: "Complete Yame Tea QUEST WEEK" } },
  { id: "fukuoka-conqueror", ja: "福岡県踏破者", en: "Walker of All Fukuoka", tier: "MYTHIC", hint: { ja: "探索率100%", en: "Reach 100% exploration" } },
];

export const titleById = (id: string) => TITLES.find((t) => t.id === id);

/** 称号の格（朱・真鍮・銅・紺のインク色） */
export const TIER_COLOR: Record<Title["tier"], string> = {
  BRONZE: "#8b5e3c",
  SILVER: "#4b5d6e",
  GOLD: "#a8823a",
  MYTHIC: "#b3432f",
};
