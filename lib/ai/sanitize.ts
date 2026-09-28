import type { GeneratedQuest } from "@/lib/types";

// プレイヤーに見せてはいけない「裏事情」ワード。
// AIの出力にこれらが混ざった場合、そのフィールドはデモ生成の安全な文面に差し替える。
export const FORBIDDEN_FOR_PLAYERS = [
  "空席", "暇", "閑散", "ガラガラ", "客が少な", "廃棄", "余剰", "余り", "売れ残", "食品ロス",
  "フードロス", "在庫処分", "在庫", "助けて", "協力して", "救って", "赤字",
  "empty seats", "slow hours", "idle", "surplus", "leftover", "waste", "food loss", "unsold", "clearance",
];

const hasForbidden = (s: string) => {
  const lower = s.toLowerCase();
  return FORBIDDEN_FOR_PLAYERS.some((w) => lower.includes(w.toLowerCase()));
};

/** プレイヤー向けテキストをチェックし、NGワードを含むフィールドを fallback で置換 */
export function sanitizeForPlayers(q: GeneratedQuest, fallback: GeneratedQuest): { quest: GeneratedQuest; replaced: string[] } {
  const replaced: string[] = [];
  const out: GeneratedQuest = { ...q };
  (["title", "tagline", "story", "reward", "titleReward"] as const).forEach((k) => {
    if (hasForbidden(q[k].ja) || hasForbidden(q[k].en)) {
      out[k] = fallback[k];
      replaced.push(k);
    }
  });
  if (q.objectives.some((o) => hasForbidden(o.ja) || hasForbidden(o.en))) {
    out.objectives = fallback.objectives;
    replaced.push("objectives");
  }
  return { quest: out, replaced };
}
