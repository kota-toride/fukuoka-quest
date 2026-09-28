"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Gift, MapPin, ScrollText } from "lucide-react";
import type { ClearResult } from "@/lib/game/store";
import { useGame } from "@/lib/game/store";
import { titleById } from "@/lib/data/titles";
import { TOTAL_MUNICIPALITIES, zoneById } from "@/lib/data/regions";
import { expToNext } from "@/lib/game/rules";
import { BlockBar, Emblem, LevelBadge } from "./hud";

/**
 * QUEST COMPLETE の演出。
 * 冒険記録の紙が開き → 朱印が押され → EXP / POINT → LEVEL UP → 称号 → 探索率 の順に記録されていく。
 */
export function QuestComplete({ result, actions }: { result: ClearResult; actions?: React.ReactNode }) {
  const { lang } = useGame();
  const leveled = result.levelAfter > result.levelBefore;
  const titles = result.newTitles.map(titleById).filter(Boolean);
  const zone = zoneById(result.quest.region);

  // フェーズの時刻（ms）
  const schedule = [0, 650, 1500, 2100, leveled ? 2800 : -1, titles.length ? 3700 : -1, 4500, 5300];
  const LAST = schedule.length - 1;
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = schedule.map((t, i) => (t >= 0 ? setTimeout(() => setPhase((p) => Math.max(p, i)), t) : null));
    return () => timers.forEach((t) => t && clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const skip = () => setPhase(LAST);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase >= 4) scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [phase]);

  const exp = useCountUp(result.expGained, phase >= 2);
  const pts = useCountUp(result.pointsGained, phase >= 3);
  const explore = useCountUp(result.explorationAfter, phase >= 6, result.explorationBefore);
  const date = new Date();
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div ref={scroller} className="fixed inset-0 z-[70] overflow-y-auto bg-navy/85 backdrop-blur-[2px] anim-fade-in" onClick={phase < LAST ? skip : undefined}>
      <div className="relative mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="paper anim-page-turn relative w-full px-6 pb-7 pt-8 text-center">
          <div className="absolute inset-3 border border-line" />
          <div className="relative">
            <div className="label">ADVENTURE RECORD · {dateStr}</div>
            <div className="mt-2 font-mincho text-xl font-bold leading-snug">{result.quest.title[lang]}</div>
            <div className="mt-1 flex items-center justify-center gap-1 font-mono text-[11px] tracking-[0.2em] text-muted">
              <MapPin className="h-3 w-3" /> {zone?.[lang]}
              {result.quest.place && ` · ${result.quest.place[lang]}`}
            </div>

            {/* 朱印 */}
            <div className="relative mx-auto mt-5 grid h-44 w-44 place-items-center">
              {phase >= 1 ? (
                <div className="stamp anim-stamp h-44 w-44" style={{ "--stamp-rot": "-10deg" } as React.CSSProperties}>
                  <div>
                    <div className="text-[10px] tracking-[0.3em]">FUKUOKA QUEST</div>
                    <div className="mt-1 font-display text-[23px] font-extrabold leading-[0.95] tracking-[0.02em]">
                      QUEST
                      <br />
                      COMPLETE
                    </div>
                    <div className="mt-1.5 text-[10px] tracking-[0.2em]">{dateStr}</div>
                  </div>
                </div>
              ) : (
                <div className="h-44 w-44 rounded-full border-2 border-dashed border-line" />
              )}
            </div>

            <div className="mt-6 space-y-2 text-left">
              {phase >= 2 && <Row label="EXP" value={`+${exp.toLocaleString()}`} big />}
              {phase >= 3 && <Row label="QUEST POINT" value={`+${pts.toLocaleString()}`} sub={`${lang === "ja" ? "所持" : "total"} ${result.pointsAfter.toLocaleString()} PT`} brass />}
            </div>

            {phase >= 4 && leveled && (
              <div className="mt-6 anim-fade-up">
                <div className="font-display text-3xl font-extrabold tracking-[0.12em] text-forest">LEVEL UP</div>
                <div className="mt-3 flex items-center justify-center gap-5">
                  <div className="opacity-40">
                    <LevelBadge level={result.levelBefore} size={52} />
                  </div>
                  <span className="font-mono text-xl text-ink-2">→</span>
                  <div className="anim-stamp" style={{ "--stamp-rot": "0deg" } as React.CSSProperties}>
                    <LevelBadge level={result.levelAfter} size={72} />
                  </div>
                </div>
                <div className="mx-auto mt-3 h-1.5 w-56 bg-ink/10">
                  <div className="h-full bg-forest transition-[width] duration-1000" style={{ width: `${(result.expAfter / expToNext(result.levelAfter)) * 100}%` }} />
                </div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-muted">
                  {result.expAfter.toLocaleString()} / {expToNext(result.levelAfter).toLocaleString()} EXP
                </div>
              </div>
            )}

            {phase >= 5 &&
              titles.map((t, i) => (
                <div key={t!.id} className="mt-5 flex items-center gap-4 border-y border-ink/80 py-3 text-left anim-fade-up" style={{ animationDelay: `${i * 350}ms` }}>
                  <Emblem tier={t!.tier} size={52} />
                  <div>
                    <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-shu">NEW TITLE</div>
                    <div className="font-mincho text-xl font-bold">「{t![lang]}」</div>
                  </div>
                </div>
              ))}

            {phase >= 6 && (
              <div className="mt-5 text-left anim-fade-up">
                <div className="flex items-baseline justify-between">
                  <span className="label !text-forest">FUKUOKA EXPLORATION</span>
                  <span className="font-display text-2xl font-semibold text-forest">
                    {explore}%
                    {result.explorationAfter > result.explorationBefore && <span className="ml-1.5 font-mono text-xs">+{result.explorationAfter - result.explorationBefore}</span>}
                  </span>
                </div>
                <BlockBar pct={explore} width={20} className="mt-1 block text-lg leading-none" />
                <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-muted">
                  {result.areasAfter} / {TOTAL_MUNICIPALITIES} AREAS DISCOVERED
                </div>
                {result.newZone && (
                  <div className="mt-3 flex items-center gap-2 border border-forest/40 bg-forest/5 px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.18em] text-forest">
                    ◆ NEW AREA — {zoneById(result.newZone)?.[lang]}
                  </div>
                )}
              </div>
            )}

            {phase >= 7 && (
              <div className="mt-5 font-mincho text-sm text-muted anim-fade-in">
                <BookOpen className="mr-1 inline h-4 w-4" />
                {lang === "ja" ? "冒険記録に追加されました。" : "Added to your adventure record."}
              </div>
            )}
          </div>
        </div>

        {phase >= LAST ? (
          <div className="mt-5 grid w-full gap-2.5 anim-fade-up" onClick={(e) => e.stopPropagation()}>
            {actions ?? (
              <>
                <Link href="/rewards" className="btn-shu py-3.5 text-sm">
                  <Gift className="h-4 w-4" /> REWARD CABINET
                </Link>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link href="/quests" className="btn-ghost-light py-3 text-xs">
                    <ScrollText className="h-4 w-4" /> QUEST BOARD
                  </Link>
                  <Link href="/profile" className="btn-ghost-light py-3 text-xs">
                    <BookOpen className="h-4 w-4" /> RECORD
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6 font-mono text-[10px] tracking-[0.3em] text-paper/60">TAP TO SKIP</div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, sub, big, brass }: { label: string; value: string; sub?: string; big?: boolean; brass?: boolean }) {
  return (
    <div className="flex items-end justify-between border-b border-dashed border-ink/30 pb-2 anim-fade-up">
      <div>
        <div className="font-mono text-[11px] font-semibold tracking-[0.3em] text-ink-2">{label}</div>
        {sub && <div className="font-mono text-[10px] tracking-[0.15em] text-muted">{sub}</div>}
      </div>
      <span className={`font-display font-semibold tabular-nums ${big ? "text-4xl" : "text-3xl"} ${brass ? "text-brass" : "text-ink"}`}>{value}</span>
    </div>
  );
}

export function useCountUp(target: number, start: boolean, from = 0, ms = 900) {
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, from, ms]);
  return v;
}
