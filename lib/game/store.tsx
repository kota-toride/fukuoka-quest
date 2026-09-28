"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Lang, Quest } from "@/lib/types";
import { SEED_QUESTS, SPONSOR_EVENT } from "@/lib/data/quests";
import { REWARDS } from "@/lib/data/rewards";
import { ZONES } from "@/lib/data/regions";
import { applyExp, explorationRate } from "./rules";
import type { RoutePlan } from "./route";

// ============================================================
// プレイヤー状態（デモではブラウザの localStorage に保存）
// 本番では Supabase 等のDBに置き換える想定。
// ============================================================

export interface Redemption {
  rewardId: string;
  code: string;
  at: number;
}

export interface JournalEntry {
  questId: string;
  at: number;
}

/** 進行中の冒険（ROUTE → SIDE QUEST → メインQUEST） */
export interface Adventure {
  questId: string;
  plan: RoutePlan;
  /** 選んだSIDE QUEST（ルート順） */
  sideIds: string[];
  /** この冒険でCLEARしたQUEST */
  done: string[];
  startedAt: number;
}

export interface PlayerState {
  name: string;
  level: number;
  exp: number;
  points: number;
  /** デモ用：これまでにCLEARしたQUEST数のベース（過去の冒険） */
  baseClearCount: number;
  clearedQuestIds: string[];
  /** 発見済みの市町村数（60中） */
  discoveredMunicipalities: number;
  /** 地図上で発見済みのゾーン */
  discoveredZones: string[];
  titles: string[];
  activeTitle: string;
  redemptions: Redemption[];
  customQuests: Quest[];
  /** 発見済みの HIDDEN QUEST */
  revealedHidden: string[];
  /** 冒険記録 */
  journal: JournalEntry[];
  adventure: Adventure | null;
}

// デモの初期値：LEVEL 07 / 23 AREAS（38%）/ 31 CLEAR。
// SIDE QUEST（+300）→ 八女茶（+800）で LEVEL UP、380PT → 530PT で八女茶がアンロックできる設計。
export const INITIAL_PLAYER: PlayerState = {
  name: "KOTA",
  level: 7,
  exp: 4920,
  points: 380,
  baseClearCount: 31,
  clearedQuestIds: [],
  discoveredMunicipalities: 23,
  discoveredZones: ["fukuoka", "itoshima", "dazaifu", "munakata", "kitakyushu", "iizuka", "yanagawa"],
  titles: ["first-step", "food-culture", "genkai-explorer"],
  activeTitle: "food-culture",
  redemptions: [],
  customQuests: [],
  revealedHidden: [],
  journal: [],
  adventure: null,
};

export interface ClearResult {
  quest: Quest;
  expGained: number;
  pointsGained: number;
  levelBefore: number;
  levelAfter: number;
  expAfter: number;
  newTitles: string[];
  explorationBefore: number;
  explorationAfter: number;
  areasBefore: number;
  areasAfter: number;
  pointsAfter: number;
  newZone: string | null;
}

export interface Announcement {
  id: string;
  quest: Quest;
}

interface GameContextValue {
  player: PlayerState;
  hydrated: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
  quests: Quest[];
  clearCount: number;
  exploration: number;
  completeQuest: (quest: Quest) => ClearResult;
  redeem: (rewardId: string) => Redemption | null;
  publishQuest: (quest: Quest) => Quest;
  setActiveTitle: (id: string) => void;
  revealHidden: (id: string) => void;
  isRevealed: (q: Quest) => boolean;
  resetDemo: () => void;
  startAdventure: (plan: RoutePlan, sideIds: string[]) => void;
  markAdventureDone: (questId: string) => void;
  endAdventure: () => void;
  announcement: Announcement | null;
  dismissAnnouncement: () => void;
  /** デモ用の時計（"HH:mm"）。null なら実時刻 */
  demoClock: string | null;
  setDemoClock: (t: string | null) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const STORAGE_KEY = "fukuoka-quest:player:v2";
const LANG_KEY = "fukuoka-quest:lang";
const CLOCK_KEY = "fukuoka-quest:demo-clock";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLangState] = useState<Lang>("ja");
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [demoClock, setDemoClockState] = useState<string | null>(null);
  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // localStorage から復元（SSRとのズレを避けるためマウント後に読む）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 外部ストレージからの一度きりの復元
      if (raw) setPlayer({ ...INITIAL_PLAYER, ...JSON.parse(raw) });
      const l = localStorage.getItem(LANG_KEY);
      if (l === "en" || l === "ja") setLangState(l);
      const c = localStorage.getItem(CLOCK_KEY);
      if (c) setDemoClockState(c);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch {}
  }, [player, hydrated]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
  }, []);

  const setDemoClock = useCallback((t: string | null) => {
    setDemoClockState(t);
    try {
      if (t) localStorage.setItem(CLOCK_KEY, t);
      else localStorage.removeItem(CLOCK_KEY);
    } catch {}
  }, []);

  // AI GAME MASTER が同名のQUESTを生成した場合は、シード側を置き換える
  const quests = useMemo(() => {
    const custom = player.customQuests.map((q) => {
      const seed = SEED_QUESTS.find((s) => s.title.ja === q.title.ja);
      return seed ? { ...q, id: seed.id } : q;
    });
    const titles = new Set(custom.map((q) => q.title.ja));
    return [...custom, ...SEED_QUESTS.filter((q) => !titles.has(q.title.ja))];
  }, [player.customQuests]);
  const clearCount = player.baseClearCount + player.clearedQuestIds.length;
  const exploration = explorationRate(player.discoveredMunicipalities);

  const completeQuest = useCallback((quest: Quest): ClearResult => {
    const p = playerRef.current;
    const alreadyCleared = p.clearedQuestIds.includes(quest.id);
    const explorationBefore = explorationRate(p.discoveredMunicipalities);

    const { level, exp } = applyExp(p.level, p.exp, quest.exp);
    const clearedQuestIds = alreadyCleared ? p.clearedQuestIds : [...p.clearedQuestIds, quest.id];
    const newZone = p.discoveredZones.includes(quest.region) ? null : quest.region;
    const discoveredZones = newZone ? [...p.discoveredZones, newZone] : p.discoveredZones;
    const discoveredMunicipalities = p.discoveredMunicipalities + (newZone ? 1 : 0);

    // 称号判定
    const newTitles: string[] = [];
    const grant = (id?: string) => {
      if (id && !p.titles.includes(id) && !newTitles.includes(id)) newTitles.push(id);
    };
    grant(quest.titleReward);
    const allQuests = [...p.customQuests, ...SEED_QUESTS];
    const clearedQuests = allQuests.filter((q) => clearedQuestIds.includes(q.id));
    const eventCleared = SPONSOR_EVENT.questIds.filter((id) => clearedQuestIds.includes(id)).length;
    if (eventCleared >= SPONSOR_EVENT.goal) grant(SPONSOR_EVENT.titleReward);
    if (clearedQuests.filter((q) => q.isHidden).length >= 3) grant("hidden-seeker");
    if (clearedQuests.filter((q) => q.isSide).length >= 2) grant("side-walker");
    const chikugo = ZONES.filter((z) => z.province === "CHIKUGO" && discoveredZones.includes(z.id)).length;
    if (chikugo >= 3) grant("chikugo-knower");

    const next: PlayerState = {
      ...p,
      level,
      exp,
      points: p.points + quest.points,
      clearedQuestIds,
      discoveredZones,
      discoveredMunicipalities,
      titles: [...p.titles, ...newTitles],
      activeTitle: newTitles[0] ?? p.activeTitle,
      journal: [{ questId: quest.id, at: Date.now() }, ...p.journal],
    };
    playerRef.current = next;
    setPlayer(next);

    return {
      quest,
      expGained: quest.exp,
      pointsGained: quest.points,
      levelBefore: p.level,
      levelAfter: level,
      expAfter: exp,
      newTitles,
      explorationBefore,
      explorationAfter: explorationRate(discoveredMunicipalities),
      areasBefore: p.discoveredMunicipalities,
      areasAfter: discoveredMunicipalities,
      pointsAfter: next.points,
      newZone,
    };
  }, []);

  const startAdventure = useCallback((plan: RoutePlan, sideIds: string[]) => {
    setPlayer((p) => ({ ...p, adventure: { questId: plan.questId, plan, sideIds, done: [], startedAt: Date.now() } }));
  }, []);
  const markAdventureDone = useCallback((questId: string) => {
    setPlayer((p) => {
      if (!p.adventure || p.adventure.done.includes(questId)) return p;
      const next = { ...p, adventure: { ...p.adventure, done: [...p.adventure.done, questId] } };
      playerRef.current = next;
      return next;
    });
  }, []);
  const endAdventure = useCallback(() => setPlayer((p) => ({ ...p, adventure: null })), []);

  const redeem = useCallback((rewardId: string): Redemption | null => {
    const p = playerRef.current;
    const item = REWARDS.find((r) => r.id === rewardId);
    if (!item || p.points < item.points) return null;
    const code = `FQ-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const r: Redemption = { rewardId, code, at: Date.now() };
    const next = { ...p, points: p.points - item.points, redemptions: [r, ...p.redemptions] };
    playerRef.current = next;
    setPlayer(next);
    return r;
  }, []);

  const publishQuest = useCallback((generated: Quest) => {
    // 同名のシードQUESTがあれば、そのIDを引き継いで置き換える（既存のリンク・CLEAR記録を壊さない）
    const seed = SEED_QUESTS.find((q) => q.title.ja === generated.title.ja);
    const quest = seed ? { ...generated, id: seed.id, place: generated.place ?? seed.place } : generated;
    setPlayer((p) => ({ ...p, customQuests: [quest, ...p.customQuests.filter((q) => q.id !== quest.id && q.title.ja !== quest.title.ja)] }));
    setAnnouncement({ id: `${quest.id}-${Date.now()}`, quest });
    return quest;
  }, []);

  const setActiveTitle = useCallback((id: string) => setPlayer((p) => ({ ...p, activeTitle: id })), []);
  const revealHidden = useCallback(
    (id: string) => setPlayer((p) => (p.revealedHidden.includes(id) ? p : { ...p, revealedHidden: [...p.revealedHidden, id] })),
    [],
  );
  const isRevealed = useCallback(
    (q: Quest) => !q.isHidden || player.revealedHidden.includes(q.id) || player.discoveredZones.includes(q.region) || player.clearedQuestIds.includes(q.id),
    [player.revealedHidden, player.discoveredZones, player.clearedQuestIds],
  );
  const resetDemo = useCallback(() => setPlayer(INITIAL_PLAYER), []);
  const dismissAnnouncement = useCallback(() => setAnnouncement(null), []);

  const value: GameContextValue = {
    player,
    hydrated,
    lang,
    setLang,
    quests,
    clearCount,
    exploration,
    completeQuest,
    redeem,
    publishQuest,
    setActiveTitle,
    revealHidden,
    isRevealed,
    resetDemo,
    startAdventure,
    markAdventureDone,
    endAdventure,
    announcement,
    dismissAnnouncement,
    demoClock,
    setDemoClock,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

/** ja/en の LocalizedText を現在の言語で取り出す */
export function useT() {
  const { lang } = useGame();
  return useCallback(<T extends { ja: string; en: string }>(t: T) => t[lang], [lang]);
}
