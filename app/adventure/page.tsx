"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, Check, Crosshair, Flag, Footprints, Gift, Loader2, MapPin, Signpost, X } from "lucide-react";
import type { Quest } from "@/lib/types";
import { useGame, type ClearResult } from "@/lib/game/store";
import { HOME_POINT, zoneById } from "@/lib/data/regions";
import { formatMinutes } from "@/lib/game/rules";
import { WorldMap } from "@/components/WorldMap";
import { QuestMedia } from "@/components/QuestCard";
import { QuestComplete } from "@/components/QuestComplete";

export default function AdventurePage() {
  const { player, quests, lang, completeQuest, markAdventureDone, endAdventure, hydrated } = useGame();
  const router = useRouter();
  const [result, setResult] = useState<{ r: ClearResult; last: boolean } | null>(null);
  const adv = player.adventure;

  if (!adv) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-mincho text-muted">{hydrated ? (lang === "ja" ? "いま進行中の冒険はありません。" : "No adventure in progress.") : "…"}</p>
        <Link href="/quests" className="btn-primary mt-6 px-6 py-3 text-xs">
          QUEST BOARD
        </Link>
      </div>
    );
  }

  const main = quests.find((q) => q.id === adv.questId)!;
  const stops: Quest[] = [...adv.sideIds.map((id) => quests.find((q) => q.id === id)!).filter(Boolean), main];
  const currentIdx = stops.findIndex((q) => !adv.done.includes(q.id));
  const current = currentIdx >= 0 ? stops[currentIdx] : null;
  const zone = zoneById(main.region)!;
  const gained = stops.filter((q) => adv.done.includes(q.id));

  const clear = (q: Quest) => {
    const r = completeQuest(q);
    markAdventureDone(q.id);
    setResult({ r, last: q.id === main.id });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.3em] text-shu">
            <Footprints className="h-4 w-4" /> ON ADVENTURE
          </div>
          <h1 className="mt-1 font-mincho text-3xl font-bold md:text-4xl">{main.title[lang]}</h1>
          <p className="mt-1 font-mono text-xs tracking-[0.15em] text-ink-2">
            {lang === "ja" ? HOME_POINT.ja : HOME_POINT.en} → {zone[lang]} · {adv.plan.title[lang]}
          </p>
        </div>
        {/* 進捗の朱印欄 */}
        <div className="flex items-center gap-2">
          {stops.map((q, i) => {
            const done = adv.done.includes(q.id);
            return (
              <div key={q.id} className={`grid h-12 w-12 place-items-center rounded-full border-2 text-center ${done ? "border-shu text-shu" : i === currentIdx ? "border-ink text-ink" : "border-dashed border-ink/30 text-ink/30"}`} title={q.title[lang]}>
                {done ? <span className="font-mono text-[8px] font-bold leading-tight tracking-[0.1em]">CLEAR</span> : q.isSide ? <Signpost className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="map-frame bg-paper">
            <WorldMap interactive={false} showQuests={false} route={adv.plan.path} routeStops={stops.filter((q) => q.isSide).map((q) => ({ quest: q, chosen: !adv.done.includes(q.id) }))} className="aspect-[1000/880] w-full" />
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 font-mono text-[11px] tracking-[0.12em] text-ink-2">
            <span>
              {lang === "ja" ? "移動" : "TRAVEL"} {formatMinutes(adv.plan.travelMinutes, lang)} · {adv.plan.mode === "car" ? (lang === "ja" ? "車" : "car") : adv.plan.mode === "walk" ? (lang === "ja" ? "徒歩" : "walk") : lang === "ja" ? "公共交通" : "transit"}
            </span>
            <span>
              {lang === "ja" ? "この冒険で獲得" : "EARNED"}：<b className="text-ink">+{gained.reduce((t, q) => t + q.exp, 0)} EXP</b> · <b className="text-brass">+{gained.reduce((t, q) => t + q.points, 0)} PT</b>
            </span>
          </div>
        </div>

        {/* 行程 */}
        <ol className="space-y-4">
          <li className="flex items-center gap-3 font-mincho text-sm text-muted">
            <span className="h-4 w-4 rounded-full border-2 border-shu bg-shu" /> {lang === "ja" ? `出発 — ${HOME_POINT.ja}` : `Start — ${HOME_POINT.en}`}
          </li>
          {stops.map((q, i) => {
            const done = adv.done.includes(q.id);
            const isCur = i === currentIdx;
            return (
              <li key={q.id}>
                {isCur ? (
                  <ActiveStop quest={q} onClear={() => clear(q)} />
                ) : (
                  <div className={`paper-flat flex items-center gap-4 p-4 ${done ? "" : "opacity-60"}`}>
                    <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-2">{q.isSide ? "SIDE" : "MAIN"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mincho font-bold">{q.title[lang]}</div>
                      <div className="font-mono text-[11px] text-muted">
                        {zoneById(q.region)?.[lang]} · +{q.exp} EXP
                      </div>
                    </div>
                    {done ? (
                      <span className="stamp h-12 w-12 text-[8px]" style={{ rotate: "-12deg" }}>
                        CLEAR
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] tracking-[0.2em] text-dim">{lang === "ja" ? "この先" : "AHEAD"}</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {!current && (
            <li className="paper anim-unfold p-6 text-center">
              <div className="display text-3xl font-extrabold tracking-[0.06em] text-forest">ADVENTURE COMPLETE</div>
              <p className="mt-2 font-mincho text-muted">{lang === "ja" ? "この冒険は、冒険記録に刻まれた。" : "This journey is now in your record."}</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => {
                    endAdventure();
                    router.push("/rewards");
                  }}
                  className="btn-shu py-3 text-xs"
                >
                  <Gift className="h-4 w-4" /> REWARD CABINET
                </button>
                <button
                  onClick={() => {
                    endAdventure();
                    router.push("/profile");
                  }}
                  className="btn-ghost py-3 text-xs"
                >
                  <BookOpen className="h-4 w-4" /> ADVENTURER RECORD
                </button>
              </div>
            </li>
          )}
          {current && (
            <li className="text-center">
              <button
                onClick={() => {
                  endAdventure();
                  router.push(`/quests/${main.id}`);
                }}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-muted hover:text-ink"
              >
                <X className="h-3 w-3" /> {lang === "ja" ? "冒険を中断する" : "ABANDON"}
              </button>
            </li>
          )}
        </ol>
      </div>

      {result && (
        <QuestComplete
          key={result.r.quest.id}
          result={result.r}
          actions={
            result.last ? (
              <>
                <button
                  onClick={() => {
                    endAdventure();
                    router.push("/rewards");
                  }}
                  className="btn-shu py-3.5 text-sm"
                >
                  <Gift className="h-4 w-4" /> REWARD CABINET
                </button>
                <button
                  onClick={() => {
                    endAdventure();
                    router.push("/profile");
                  }}
                  className="btn-ghost-light py-3 text-xs"
                >
                  <BookOpen className="h-4 w-4" /> ADVENTURER RECORD
                </button>
              </>
            ) : (
              <button onClick={() => setResult(null)} className="btn-primary py-3.5 text-sm">
                <Footprints className="h-4 w-4" /> {lang === "ja" ? `次の目的地へ — ${current?.title.ja ?? ""}` : `ONWARD — ${current?.title.en ?? ""}`}
              </button>
            )
          }
        />
      )}
    </div>
  );
}

/** 進行中の地点：到着 → 達成条件 → CLEAR */
function ActiveStop({ quest, onClear }: { quest: Quest; onClear: () => void }) {
  const { lang } = useGame();
  const [done, setDone] = useState<number[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const all = done.length === quest.objectives.length;
  const check = (i: number) => {
    setBusy(i);
    setTimeout(
      () => {
        setDone((d) => (d.includes(i) ? d : [...d, i]));
        setBusy(null);
      },
      i === 0 ? 1100 : 600,
    );
  };
  return (
    <div className="paper anim-page-turn overflow-hidden border-2 border-ink">
      <QuestMedia quest={quest} kenBurns className="h-40 border-b border-ink/60">
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="tag bg-card" style={{ color: quest.isSide ? "#2e4a3b" : "#b3432f" }}>
            {quest.isSide ? "SIDE QUEST" : "MAIN QUEST"}
          </span>
          <span className="tag bg-ink !text-paper">NOW</span>
        </div>
      </QuestMedia>
      <div className="p-5">
        <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.15em] text-ink-2">
          <MapPin className="h-3.5 w-3.5 text-shu" /> {zoneById(quest.region)?.[lang]}
          {quest.place && ` · ${quest.place[lang]}`}
        </div>
        <div className="mt-1 font-mincho text-2xl font-bold">{quest.title[lang]}</div>
        <p className="mt-2 whitespace-pre-line font-mincho text-sm leading-relaxed text-ink-2">{quest.description[lang]}</p>

        <div className="label mt-5">OBJECTIVES {done.length}/{quest.objectives.length}</div>
        <div className="mt-2 space-y-2">
          {quest.objectives.map((o, i) => {
            const ok = done.includes(i);
            const locked = i > 0 && !done.includes(i - 1);
            return (
              <div key={i} className={`flex items-center gap-3 border px-3 py-2.5 ${ok ? "border-forest bg-forest/5" : "border-ink/25"} ${locked ? "opacity-50" : ""}`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center border ${ok ? "border-forest bg-forest text-paper" : "border-ink/50"}`}>{ok ? <Check className="h-3.5 w-3.5" /> : <span className="font-mono text-[10px]">{i + 1}</span>}</span>
                <span className={`flex-1 text-sm ${ok ? "text-muted line-through decoration-forest/50" : ""}`}>{o[lang]}</span>
                {!ok && (
                  <button disabled={locked || busy === i} onClick={() => check(i)} className="flex shrink-0 items-center gap-1 border border-ink px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.15em] disabled:opacity-40">
                    {busy === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}
                    {busy === i ? (i === 0 ? "GPS…" : "…") : i === 0 ? (lang === "ja" ? "到着" : "CHECK-IN") : lang === "ja" ? "達成" : "DONE"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={onClear} disabled={!all} className="btn-shu mt-5 w-full py-4 text-sm">
          QUEST CLEAR
        </button>
        {!all && (
          <button onClick={() => setDone(quest.objectives.map((_, i) => i))} className="mt-2 w-full py-1.5 font-mono text-[9px] tracking-[0.3em] text-dim hover:text-muted">
            DEMO: SKIP OBJECTIVES
          </button>
        )}
      </div>
    </div>
  );
}
