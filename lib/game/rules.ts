import { TOTAL_MUNICIPALITIES } from "@/lib/data/regions";

/** Lv L → L+1 に必要なEXP（Lv7 → 6,000） */
export const expToNext = (level: number) => 1000 * Math.max(1, level - 1);

/** EXPを加算し、レベルアップを解決する */
export function applyExp(level: number, exp: number, gained: number) {
  let lv = level;
  let cur = exp + gained;
  while (cur >= expToNext(lv)) {
    cur -= expToNext(lv);
    lv += 1;
  }
  return { level: lv, exp: cur };
}

/**
 * 福岡探索率 = 発見したエリア数 / 60（福岡県の市町村数）
 * 「どれだけ実際に福岡を歩いたか」をそのまま表す。
 */
export function explorationRate(discoveredAreas: number) {
  return Math.min(100, Math.floor((discoveredAreas / TOTAL_MUNICIPALITIES) * 100));
}

// ---------------- 時間窓 ----------------

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

export type WindowStatus =
  | { state: "always" }
  | { state: "live"; minutesLeft: number }
  | { state: "upcoming"; minutesUntil: number }
  | { state: "closed" };

export function windowStatus(startAt: string | undefined, endAt: string | undefined, now: Date): WindowStatus {
  if (!startAt || !endAt) return { state: "always" };
  const n = now.getHours() * 60 + now.getMinutes();
  const s = toMin(startAt);
  const e = toMin(endAt);
  if (n >= s && n < e) return { state: "live", minutesLeft: e - n };
  if (n < s) return { state: "upcoming", minutesUntil: s - n };
  return { state: "closed" };
}

export const formatMinutes = (m: number, lang: "ja" | "en" = "ja") => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (lang === "en") return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
  return h > 0 ? (mm ? `${h}時間${mm}分` : `${h}時間`) : `${mm}分`;
};

/** ████████░░░░░░ 形式の進捗バー（テキスト） */
export const blockBar = (pct: number, width = 14) => {
  const n = Math.round((pct / 100) * width);
  return "█".repeat(n) + "░".repeat(Math.max(0, width - n));
};
