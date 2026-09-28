// 福岡県 WORLD MAP のゾーン・地形・移動グラフ。
// 座標は実際の経緯度から簡易投影（測量図ではなく「冒険地図」として使う）。

/** 福岡県の市町村数（29市・29町・2村 = 60） */
export const TOTAL_MUNICIPALITIES = 60;

export type Province = "FUKUOKA" | "KITAKYUSHU" | "CHIKUHO" | "CHIKUGO";

export const PROVINCES: Record<Province, { ja: string; en: string; color: string }> = {
  FUKUOKA: { ja: "福岡地方", en: "Fukuoka", color: "#3c6f80" },
  KITAKYUSHU: { ja: "北九州地方", en: "Kitakyushu", color: "#5e422c" },
  CHIKUHO: { ja: "筑豊地方", en: "Chikuho", color: "#8b5e3c" },
  CHIKUGO: { ja: "筑後地方", en: "Chikugo", color: "#2e4a3b" },
};

export interface Zone {
  id: string;
  ja: string;
  en: string;
  /** 地図に添える一言 */
  epithet: { ja: string; en: string };
  province: Province;
  lon: number;
  lat: number;
  /** 景色の良いルートとして提案できるか */
  scenic?: boolean;
}

export const ZONES: Zone[] = [
  { id: "fukuoka", ja: "福岡・博多", en: "Fukuoka / Hakata", epithet: { ja: "屋台の灯る港町", en: "Port town of yatai lights" }, province: "FUKUOKA", lon: 130.41, lat: 33.59 },
  { id: "itoshima", ja: "糸島", en: "Itoshima", epithet: { ja: "玄界灘の浜", en: "Shores of the Genkai Sea" }, province: "FUKUOKA", lon: 130.19, lat: 33.56, scenic: true },
  { id: "munakata", ja: "宗像", en: "Munakata", epithet: { ja: "神宿る海の道", en: "Sea road of the gods" }, province: "FUKUOKA", lon: 130.54, lat: 33.8, scenic: true },
  { id: "dazaifu", ja: "太宰府", en: "Dazaifu", epithet: { ja: "千年の古都", en: "The thousand-year capital" }, province: "FUKUOKA", lon: 130.53, lat: 33.51 },
  { id: "kitakyushu", ja: "北九州・門司港", en: "Kitakyushu / Mojiko", epithet: { ja: "鉄と港のまち", en: "City of steel and harbors" }, province: "KITAKYUSHU", lon: 130.87, lat: 33.87 },
  { id: "yukuhashi", ja: "行橋・京築", en: "Yukuhashi", epithet: { ja: "周防灘の門", en: "Gate of the Suo-nada" }, province: "KITAKYUSHU", lon: 131.0, lat: 33.7 },
  { id: "iizuka", ja: "飯塚", en: "Iizuka", epithet: { ja: "炭鉱の記憶", en: "Memory of the mines" }, province: "CHIKUHO", lon: 130.69, lat: 33.64 },
  { id: "tagawa", ja: "田川・英彦山", en: "Tagawa / Hikosan", epithet: { ja: "修験の霊峰", en: "Peak of the ascetics" }, province: "CHIKUHO", lon: 130.87, lat: 33.5, scenic: true },
  { id: "asakura", ja: "朝倉", en: "Asakura", epithet: { ja: "水車の里", en: "Village of waterwheels" }, province: "CHIKUGO", lon: 130.68, lat: 33.41, scenic: true },
  { id: "kurume", ja: "久留米", en: "Kurume", epithet: { ja: "とんこつの源流", en: "Source of tonkotsu" }, province: "CHIKUGO", lon: 130.51, lat: 33.32 },
  { id: "hirokawa", ja: "広川", en: "Hirokawa", epithet: { ja: "茶の郷への入口", en: "Gateway to tea country" }, province: "CHIKUGO", lon: 130.55, lat: 33.25 },
  { id: "yame", ja: "八女", en: "Yame", epithet: { ja: "玉露の隠れ郷", en: "Hidden realm of gyokuro" }, province: "CHIKUGO", lon: 130.63, lat: 33.2, scenic: true },
  { id: "yanagawa", ja: "柳川", en: "Yanagawa", epithet: { ja: "水路の迷宮", en: "Labyrinth of canals" }, province: "CHIKUGO", lon: 130.41, lat: 33.16, scenic: true },
  { id: "omuta", ja: "大牟田", en: "Omuta", epithet: { ja: "世界遺産の港", en: "Heritage harbor" }, province: "CHIKUGO", lon: 130.46, lat: 33.03 },
];

export const zoneById = (id: string) => ZONES.find((z) => z.id === id);

/** デモの現在地（博多駅） */
export const HOME_ZONE = "fukuoka";
export const HOME_POINT = { lon: 130.42, lat: 33.59, ja: "博多駅", en: "Hakata Sta." };

// ---------------- projection ----------------
export const MAP_W = 1000;
export const MAP_H = 880;
const LON0 = 129.95;
const LAT0 = 34.05;
const SCALE = 800;

export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON0) * SCALE, (LAT0 - lat) * SCALE];
}

const toPath = (pts: [number, number][], close = false) =>
  pts
    .map(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + (close ? " Z" : "");

// 福岡県のおおまかな輪郭（経度, 緯度）
const OUTLINE: [number, number][] = [
  [130.02, 33.6], [130.08, 33.66], [130.14, 33.65], [130.2, 33.62], [130.29, 33.61],
  [130.35, 33.63], [130.39, 33.67], [130.36, 33.7], [130.43, 33.72], [130.48, 33.75],
  [130.5, 33.82], [130.57, 33.88], [130.66, 33.91], [130.74, 33.93], [130.82, 33.91],
  [130.88, 33.95], [130.95, 33.97], [131.0, 33.93], [130.98, 33.85], [130.96, 33.78],
  [131.02, 33.72], [131.08, 33.66], [131.18, 33.61], [131.12, 33.55], [131.03, 33.5],
  [130.94, 33.46], [130.86, 33.4], [130.89, 33.3], [130.86, 33.2], [130.8, 33.12],
  [130.7, 33.1], [130.62, 33.08], [130.56, 33.04], [130.5, 32.98], [130.43, 32.99],
  [130.41, 33.06], [130.38, 33.12], [130.35, 33.17], [130.38, 33.24], [130.43, 33.3],
  [130.42, 33.37], [130.36, 33.42], [130.28, 33.44], [130.2, 33.46], [130.14, 33.5],
  [130.07, 33.53],
];
export const OUTLINE_PATH = toPath(OUTLINE, true);

// 川（地図に描く主要河川）
export const RIVERS: { id: string; ja: string; en: string; d: string; label: [number, number] }[] = [
  {
    id: "chikugo",
    ja: "筑後川",
    en: "Chikugo River",
    d: toPath([[130.9, 33.34], [130.8, 33.36], [130.7, 33.38], [130.62, 33.36], [130.55, 33.33], [130.5, 33.33], [130.46, 33.3], [130.42, 33.24], [130.38, 33.18]]),
    label: [130.64, 33.39],
  },
  {
    id: "yabe",
    ja: "矢部川",
    en: "Yabe River",
    d: toPath([[130.82, 33.17], [130.74, 33.19], [130.66, 33.2], [130.58, 33.19], [130.5, 33.17], [130.44, 33.14], [130.39, 33.13]]),
    label: [130.75, 33.17],
  },
  {
    id: "onga",
    ja: "遠賀川",
    en: "Onga River",
    d: toPath([[130.73, 33.52], [130.7, 33.58], [130.69, 33.64], [130.7, 33.72], [130.68, 33.8], [130.66, 33.88]]),
    label: [130.72, 33.76],
  },
  {
    id: "naka",
    ja: "那珂川",
    en: "Naka River",
    d: toPath([[130.44, 33.45], [130.43, 33.5], [130.41, 33.55], [130.4, 33.6]]),
    label: [130.39, 33.5],
  },
];

// 山（▲ を描く）
export const MOUNTAINS: { ja: string; en: string; lon: number; lat: number; size: number }[] = [
  { ja: "英彦山", en: "Mt. Hiko", lon: 130.93, lat: 33.47, size: 1.3 },
  { ja: "脊振山", en: "Mt. Sefuri", lon: 130.36, lat: 33.44, size: 1.15 },
  { ja: "宝満山", en: "Mt. Homan", lon: 130.58, lat: 33.54, size: 0.9 },
  { ja: "耳納連山", en: "Minou Range", lon: 130.66, lat: 33.28, size: 1 },
  { ja: "福智山", en: "Mt. Fukuchi", lon: 130.79, lat: 33.76, size: 0.95 },
  { ja: "釈迦岳", en: "Mt. Shaka", lon: 130.84, lat: 33.18, size: 1.1 },
  { ja: "犬鳴山", en: "Mt. Inunaki", lon: 130.56, lat: 33.7, size: 0.8 },
];

// 海域ラベル
export const SEAS: { ja: string; en: string; lon: number; lat: number; rotate?: number }[] = [
  { ja: "玄界灘", en: "GENKAI SEA", lon: 130.2, lat: 33.88 },
  { ja: "周防灘", en: "SUO-NADA", lon: 131.12, lat: 33.8, rotate: 62 },
  { ja: "有明海", en: "ARIAKE SEA", lon: 130.15, lat: 33.1 },
];

// ---------------- 移動グラフ ----------------
// car: 車の所要分 / transit: 公共交通の所要分 / fare: 公共交通の運賃（円）
export interface Edge {
  a: string;
  b: string;
  car: number;
  transit: number;
  fare: number;
  /** 公共交通の主な手段 */
  line: { ja: string; en: string };
}

export const EDGES: Edge[] = [
  { a: "fukuoka", b: "itoshima", car: 35, transit: 35, fare: 590, line: { ja: "JR筑肥線", en: "JR Chikuhi Line" } },
  { a: "fukuoka", b: "munakata", car: 45, transit: 40, fare: 570, line: { ja: "JR鹿児島本線", en: "JR Kagoshima Line" } },
  { a: "munakata", b: "kitakyushu", car: 40, transit: 35, fare: 750, line: { ja: "JR鹿児島本線", en: "JR Kagoshima Line" } },
  { a: "kitakyushu", b: "yukuhashi", car: 35, transit: 30, fare: 570, line: { ja: "JR日豊本線", en: "JR Nippo Line" } },
  { a: "fukuoka", b: "dazaifu", car: 30, transit: 30, fare: 420, line: { ja: "西鉄太宰府線", en: "Nishitetsu Dazaifu Line" } },
  { a: "fukuoka", b: "kurume", car: 45, transit: 40, fare: 650, line: { ja: "西鉄天神大牟田線", en: "Nishitetsu Tenjin-Omuta Line" } },
  { a: "dazaifu", b: "kurume", car: 35, transit: 45, fare: 560, line: { ja: "西鉄天神大牟田線", en: "Nishitetsu Line" } },
  { a: "fukuoka", b: "iizuka", car: 45, transit: 50, fare: 840, line: { ja: "JR篠栗線", en: "JR Sasaguri Line" } },
  { a: "iizuka", b: "tagawa", car: 30, transit: 40, fare: 600, line: { ja: "JR後藤寺線", en: "JR Gotoji Line" } },
  { a: "iizuka", b: "kitakyushu", car: 50, transit: 55, fare: 950, line: { ja: "JR筑豊本線", en: "JR Chikuho Line" } },
  { a: "dazaifu", b: "asakura", car: 35, transit: 60, fare: 700, line: { ja: "甘木鉄道・バス", en: "Amagi Railway + bus" } },
  { a: "asakura", b: "kurume", car: 35, transit: 50, fare: 700, line: { ja: "JR久大本線", en: "JR Kyudai Line" } },
  { a: "kurume", b: "hirokawa", car: 15, transit: 25, fare: 360, line: { ja: "路線バス", en: "Local bus" } },
  { a: "hirokawa", b: "yame", car: 20, transit: 45, fare: 540, line: { ja: "堀川バス", en: "Horikawa Bus" } },
  { a: "kurume", b: "yanagawa", car: 35, transit: 40, fare: 470, line: { ja: "西鉄天神大牟田線", en: "Nishitetsu Line" } },
  { a: "yanagawa", b: "omuta", car: 30, transit: 25, fare: 400, line: { ja: "西鉄天神大牟田線", en: "Nishitetsu Line" } },
  { a: "yanagawa", b: "yame", car: 35, transit: 60, fare: 700, line: { ja: "路線バス", en: "Local bus" } },
  { a: "tagawa", b: "yukuhashi", car: 40, transit: 50, fare: 700, line: { ja: "平成筑豊鉄道", en: "Heisei Chikuho Railway" } },
];

/** 地図に描く道（ゾーン間の旅路） */
export const ROUTES: [string, string][] = EDGES.map((e) => [e.a, e.b]);

export const edgeBetween = (a: string, b: string) => EDGES.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));
