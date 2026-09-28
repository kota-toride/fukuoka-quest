import type { LocalizedText, Quest } from "@/lib/types";
import { EDGES, HOME_ZONE, ZONES, edgeBetween, zoneById } from "@/lib/data/regions";

// ============================================================
// AI ADVENTURE ROUTE — ルート計算エンジン
// 「最短経路」を出すだけではなく、冒険のスタイルに応じて
// 経由地とSIDE QUEST（寄り道）を組み立てる。
// 所要時間・運賃はここで決定的に計算し、AIは「語り」だけを担当する。
// ============================================================

export type RoutePreference = "fastest" | "cheap" | "quests" | "scenic" | "gourmet" | "exp" | "transit";
export type TravelMode = "car" | "transit" | "walk";

export const PREFERENCES: { id: RoutePreference; glyph: string; ja: string; en: string; hint: LocalizedText }[] = [
  { id: "fastest", glyph: "⚡", ja: "最短でCLEAR", en: "Clear fastest", hint: { ja: "まっすぐ目的地へ", en: "Straight to the goal" } },
  { id: "cheap", glyph: "💰", ja: "なるべく安く", en: "Keep it cheap", hint: { ja: "運賃をおさえる", en: "Lowest fare" } },
  { id: "quests", glyph: "🗺️", ja: "QUESTをたくさん回る", en: "Hit many quests", hint: { ja: "経由地も冒険に", en: "Make stops part of it" } },
  { id: "scenic", glyph: "🌿", ja: "景色を楽しむ", en: "Enjoy the view", hint: { ja: "水辺や山あいを抜ける", en: "Through water & hills" } },
  { id: "gourmet", glyph: "🍜", ja: "ご当地グルメを巡る", en: "Local food trail", hint: { ja: "途中の味に寄る", en: "Taste along the way" } },
  { id: "exp", glyph: "🏆", ja: "EXPを最大化", en: "Maximize EXP", hint: { ja: "寄り道をすべて回収", en: "Collect every detour" } },
  { id: "transit", glyph: "🚌", ja: "公共交通で冒険", en: "By public transit", hint: { ja: "電車とバスで旅する", en: "By train and bus" } },
];

export interface RouteLeg {
  from: string;
  to: string;
  minutes: number;
  line?: LocalizedText;
}

export interface SideStop {
  questId: string;
  zone: string;
  detour: number;
  exp: number;
  points: number;
}

export interface RoutePlan {
  preference: RoutePreference;
  questId: string;
  mode: TravelMode;
  path: string[];
  legs: RouteLeg[];
  travelMinutes: number;
  cost: number;
  via?: string;
  title: LocalizedText;
  /** ルート上で見つかったSIDE QUEST（ルート順） */
  sides: SideStop[];
  /** このスタイルでGMがおすすめする寄り道 */
  recommended: string[];
}

type Weight = "car" | "transit" | "fare";

/** ダイクストラ法で最短経路を求める */
export function shortestPath(from: string, to: string, weight: Weight): { path: string[]; cost: number } {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | undefined> = {};
  const left = new Set(ZONES.map((z) => z.id));
  for (const z of ZONES) dist[z.id] = Infinity;
  dist[from] = 0;
  while (left.size) {
    let u: string | null = null;
    for (const id of left) if (u === null || dist[id] < dist[u]) u = id;
    if (u === null || dist[u] === Infinity) break;
    left.delete(u);
    if (u === to) break;
    for (const e of EDGES) {
      const v = e.a === u ? e.b : e.b === u ? e.a : null;
      if (!v || !left.has(v)) continue;
      const alt = dist[u] + e[weight];
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }
  const path: string[] = [];
  let cur: string | undefined = to;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }
  return path[0] === from ? { path, cost: dist[to] } : { path: [from, to], cost: Infinity };
}

function legsOf(path: string[], mode: "car" | "transit"): RouteLeg[] {
  const legs: RouteLeg[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const e = edgeBetween(path[i], path[i + 1]);
    legs.push({ from: path[i], to: path[i + 1], minutes: e ? e[mode] : 30, line: mode === "transit" ? e?.line : undefined });
  }
  return legs;
}

const fareOf = (path: string[]) => path.slice(1).reduce((s, z, i) => s + (edgeBetween(path[i], z)?.fare ?? 0), 0);
/** 車：ガソリン＋高速の目安 */
const carCostOf = (minutes: number) => Math.round((minutes * 26) / 100) * 100;

const joinPaths = (a: string[], b: string[]) => [...a, ...b.slice(1)];

/** 基本の2案（車 / 公共交通）— ROUTE画面の最初に出す */
export function basicOptions(dest: string) {
  if (dest === HOME_ZONE) return null;
  const car = shortestPath(HOME_ZONE, dest, "car");
  const tr = shortestPath(HOME_ZONE, dest, "transit");
  return {
    car: { minutes: car.cost, cost: carCostOf(car.cost), path: car.path },
    transit: { minutes: tr.cost, cost: fareOf(tr.path), path: tr.path },
  };
}

export function planRoute(quest: Quest, pref: RoutePreference, all: Quest[], cleared: string[]): RoutePlan {
  const dest = quest.region;
  const isSideOpen = (q: Quest) => q.isSide && q.id !== quest.id && !cleared.includes(q.id);
  const sidesIn = (zones: string[]) =>
    zones.flatMap((z) =>
      all
        .filter((q) => isSideOpen(q) && q.region === z)
        .map<SideStop>((q) => ({ questId: q.id, zone: z, detour: q.detourMinutes ?? 20, exp: q.exp, points: q.points })),
    );

  // 同じエリア内（例：博多駅 → 中洲）は徒歩・地下鉄
  if (dest === HOME_ZONE) {
    const m = quest.travelMinutes;
    const sides = sidesIn([HOME_ZONE]);
    return {
      preference: pref,
      questId: quest.id,
      mode: m <= 15 ? "walk" : "transit",
      path: [HOME_ZONE],
      legs: [{ from: HOME_ZONE, to: HOME_ZONE, minutes: m, line: m <= 15 ? { ja: "徒歩", en: "On foot" } : { ja: "福岡市地下鉄", en: "Fukuoka Subway" } }],
      travelMinutes: m,
      cost: m <= 15 ? 0 : 260,
      title: { ja: "街を歩いて向かう", en: "Walk through the city" },
      sides,
      recommended: [],
    };
  }

  const mode: "car" | "transit" = pref === "cheap" || pref === "transit" ? "transit" : "car";
  const base = shortestPath(HOME_ZONE, dest, pref === "cheap" ? "fare" : mode);
  let path = base.path;
  let via: string | undefined;

  // 経由地を選ぶ（QUEST・景色・グルメ・EXP）
  if (pref === "quests" || pref === "scenic" || pref === "gourmet" || pref === "exp") {
    const baseMin = shortestPath(HOME_ZONE, dest, "car").cost;
    const limit = pref === "scenic" ? 50 : 45;
    let best: { zone: string; score: number; path: string[] } | null = null;
    for (const z of ZONES) {
      if (path.includes(z.id)) continue;
      const a = shortestPath(HOME_ZONE, z.id, "car");
      const b = shortestPath(z.id, dest, "car");
      const extra = a.cost + b.cost - baseMin;
      if (!isFinite(extra) || extra > limit) continue;
      const joined = joinPaths(a.path, b.path);
      if (new Set(joined).size !== joined.length) continue; // 行って戻るだけの経由は除外
      const s = sidesIn([z.id]);
      const food = s.filter((x) => all.find((q) => q.id === x.questId)?.category === "FOOD").length;
      const exp = s.reduce((t, x) => t + x.exp, 0);
      const score =
        pref === "scenic" ? (z.scenic ? 100 - extra : -1) : pref === "gourmet" ? (food ? food * 100 - extra : -1) : pref === "exp" ? (exp ? exp / Math.max(10, extra) : -1) : s.length ? s.length * 100 - extra : -1;
      if (score > 0 && (!best || score > best.score)) best = { zone: z.id, score, path: joined };
    }
    if (best) {
      path = best.path;
      via = best.zone;
    }
  }

  const legs = legsOf(path, mode);
  const travelMinutes = legs.reduce((s, l) => s + l.minutes, 0);
  const cost = mode === "transit" ? fareOf(path) : carCostOf(travelMinutes);
  const sides = sidesIn(path);
  const byId = (id: string) => all.find((q) => q.id === id);

  const recommended = sides
    .filter((s) => {
      const q = byId(s.questId);
      switch (pref) {
        case "fastest":
          return false;
        case "cheap":
          return (q?.cost ?? 0) === 0;
        case "scenic":
          return q?.category === "DISCOVERY" || !!zoneById(s.zone)?.scenic;
        case "gourmet":
          return q?.category === "FOOD";
        case "transit":
          return s.detour <= 15;
        default:
          return true;
      }
    })
    .map((s) => s.questId);

  const viaZone = via ? zoneById(via) : undefined;
  const title: LocalizedText = (() => {
    switch (pref) {
      case "fastest":
        return { ja: "最短でCLEARするルート", en: "The fastest route to clear" };
      case "cheap":
        return { ja: "運賃をおさえる公共交通ルート", en: "The low-fare transit route" };
      case "transit":
        return { ja: "電車とバスで旅するルート", en: "The train-and-bus route" };
      case "scenic":
        return viaZone ? { ja: `${viaZone.ja}を抜ける景色のルート`, en: `A scenic route through ${viaZone.en}` } : { ja: "景色のルート", en: "A scenic route" };
      case "gourmet":
        return { ja: "ご当地の味をつなぐルート", en: "A route of local flavors" };
      case "exp":
        return { ja: "EXPを最大化するルート", en: "The max-EXP route" };
      default:
        return viaZone ? { ja: `${viaZone.ja}を経由してQUESTを回るルート`, en: `Via ${viaZone.en}, collecting quests` } : { ja: "QUESTを回るルート", en: "The quest-hunting route" };
    }
  })();

  return { preference: pref, questId: quest.id, mode, path, legs, travelMinutes, cost, via, title, sides, recommended };
}

// ---------------- GAME MASTER の語り（DEMO） ----------------

export interface NarrateInput {
  plan: RoutePlan;
  destTitle: LocalizedText;
  sides: { id: string; title: LocalizedText; exp: number; detour: number; zone: string }[];
}

const modeJa = { car: "車", transit: "公共交通", walk: "徒歩" } as const;
const modeEn = { car: "by car", transit: "by public transit", walk: "on foot" } as const;
const fmtJa = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}時間${m % 60 ? `${m % 60}分` : ""}` : `${m}分`);
const fmtEn = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m} min`);

/** APIキーが無いときの「GAME MASTERの提案文」— 命令ではなく提案の口調 */
export function narrateDemo({ plan, destTitle, sides }: NarrateInput): { ja: string[]; en: string[] } {
  const dest = zoneById(plan.path[plan.path.length - 1])!;
  const via = plan.via ? zoneById(plan.via) : undefined;
  const best = [...sides].sort((a, b) => b.exp / b.detour - a.exp / a.detour)[0];
  const rec = sides.filter((s) => plan.recommended.includes(s.id));
  const recExp = rec.reduce((t, s) => t + s.exp, 0);
  const recMin = rec.reduce((t, s) => t + s.detour, 0);

  const ja: string[] = [];
  const en: string[] = [];
  ja.push(`${dest.ja}の「${destTitle.ja}」まで、${modeJa[plan.mode]}で約${fmtJa(plan.travelMinutes)}。`);
  en.push(`"${destTitle.en}" in ${dest.en} is about ${fmtEn(plan.travelMinutes)} ${modeEn[plan.mode]}.`);
  if (via) {
    ja.push(`${via.ja}（${via.epithet.ja}）を経由する道を選びました。`);
    en.push(`I chose a road through ${via.en} — ${via.epithet.en.toLowerCase()}.`);
  }
  if (sides.length) {
    ja.push(`このルート上に、${sides.length}つのSIDE QUESTを見つけました。`);
    en.push(`I found ${sides.length} side quest${sides.length > 1 ? "s" : ""} along this route.`);
    if (rec.length) {
      ja.push(`あなたの冒険スタイルなら、${rec.length}つ寄れば合計${recMin}分で+${recExp} EXP。`);
      en.push(`For your style, ${rec.length} stop${rec.length > 1 ? "s" : ""} add ${recMin} min for +${recExp} EXP.`);
    } else if (best) {
      ja.push(`「${best.title.ja}」なら、${best.detour}分の寄り道で+${best.exp} EXP獲得できます。`);
      en.push(`"${best.title.en}" is a ${best.detour}-min detour for +${best.exp} EXP.`);
    }
    ja.push("寄り道するかどうかは、あなたが決めてください。");
    en.push("Whether to take a detour is entirely up to you.");
  } else {
    ja.push("このルート上には、まだSIDE QUESTが見つかっていません。");
    en.push("No side quests have surfaced on this route yet.");
  }
  return { ja, en };
}
