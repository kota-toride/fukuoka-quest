"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Clock, Eye, Flag, LayoutGrid, List, MapPin, Search, Signpost, X } from "lucide-react";
import type { Quest } from "@/lib/types";
import { useGame } from "@/lib/game/store";
import { SPONSOR_EVENT } from "@/lib/data/quests";
import { zoneById } from "@/lib/data/regions";
import { windowStatus } from "@/lib/game/rules";
import { QuestCard, QuestRow } from "@/components/QuestCard";
import { useNow } from "@/components/hud";

type FilterId = "now" | "60" | "500" | "FOOD" | "FARM" | "CULTURE" | "ADVENTURE" | "HIDDEN" | "LIMITED";

const FILTERS: { id: FilterId; ja: string; en: string }[] = [
  { id: "now", ja: "今から行ける", en: "Go now" },
  { id: "60", ja: "1時間以内", en: "≤ 1 hour" },
  { id: "500", ja: "500円以下", en: "≤ ¥500" },
  { id: "LIMITED", ja: "LIMITED", en: "LIMITED" },
  { id: "HIDDEN", ja: "HIDDEN", en: "HIDDEN" },
  { id: "FOOD", ja: "FOOD", en: "FOOD" },
  { id: "FARM", ja: "FARM", en: "FARM" },
  { id: "CULTURE", ja: "CULTURE", en: "CULTURE" },
  { id: "ADVENTURE", ja: "ADVENTURE", en: "ADVENTURE" },
];

export function QuestBoard() {
  const { quests, lang, player, isRevealed, demoClock, setDemoClock } = useGame();
  const params = useSearchParams();
  const router = useRouter();
  const region = params.get("region");
  const [active, setActive] = useState<FilterId[]>([]);
  const [view, setView] = useState<"board" | "list">("board");
  const now = useNow();

  const toggle = (id: FilterId) => setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const filtered = useMemo(() => {
    return quests.filter((q) => {
      if (region && q.region !== region) return false;
      for (const f of active) {
        if (f === "now") {
          const s = now ? windowStatus(q.startAt, q.endAt, now) : { state: "always" };
          if (s.state !== "always" && s.state !== "live") return false;
        }
        if (f === "60" && q.travelMinutes > 60) return false;
        if (f === "500" && q.cost > 500) return false;
        if (f === "HIDDEN" && !q.isHidden) return false;
        if (f === "LIMITED" && q.kind !== "LIMITED" && q.kind !== "TIME" && q.kind !== "DAILY") return false;
        if ((f === "FOOD" || f === "FARM" || f === "CULTURE" || f === "ADVENTURE") && q.category !== f) return false;
      }
      return true;
    });
  }, [quests, region, active, now]);

  const main = filtered.filter((q) => !q.isSide);
  const sides = filtered.filter((q) => q.isSide);
  const sealed = main.filter((q) => q.isHidden && !isRevealed(q));
  const open = main.filter((q) => !sealed.includes(q));
  const newest = open.filter((q) => q.generatedBy && q.generatedBy !== "seed");
  const today = open.filter((q) => !newest.includes(q) && (q.isDynamic || q.isHidden || q.kind === "TIME"));
  const rest = open.filter((q) => !newest.includes(q) && !today.includes(q));
  const eventDone = SPONSOR_EVENT.questIds.filter((id) => player.clearedQuestIds.includes(id)).length;
  const clock = now ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` : "--:--";

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label">ADVENTURER&apos;S</div>
          <h1 className="display mt-1 text-4xl font-semibold tracking-[0.04em] md:text-5xl">QUEST BOARD</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.18em] text-ink-2">
            <span>TODAY&apos;S ADVENTURES</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {lang === "ja" ? "現在地：博多駅" : "HAKATA STN"}
            </span>
            <span>{clock}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {region && (
            <button onClick={() => router.push("/quests")} className="flex items-center gap-2 border border-ink bg-ink px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-paper">
              {zoneById(region)?.[lang]} <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setDemoClock(demoClock ? null : "17:30")}
            className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] ${demoClock ? "border-shu text-shu" : "border-line text-muted hover:text-ink"}`}
            title="デモ用に時刻を 17:30 に固定"
          >
            <Clock className="h-3.5 w-3.5" /> {demoClock ? `DEMO ${demoClock}` : "DEMO CLOCK"}
          </button>
          <div className="flex border border-ink">
            {(
              [
                ["board", LayoutGrid],
                ["list", List],
              ] as const
            ).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} className={`px-2.5 py-1.5 ${view === v ? "bg-ink text-paper" : "text-ink"}`} aria-label={v}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* フィルター（紙のタブ） */}
      <div className="no-scrollbar -mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => {
          const on = active.includes(f.id);
          return (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              className={`shrink-0 border px-3 py-1.5 font-mono text-[11px] font-medium tracking-[0.12em] transition ${on ? "border-ink bg-ink text-paper" : "border-ink/30 bg-card text-ink-2 hover:border-ink"}`}
            >
              {f[lang]}
            </button>
          );
        })}
      </div>

      {view === "list" ? (
        <div className="paper mt-6 px-5 pb-6 pt-6 md:px-10">
          <div className="display text-2xl font-semibold">TODAY&apos;S ADVENTURES</div>
          <div className="mt-4">
            {[...newest, ...today, ...sealed, ...rest].map((q, i) =>
              sealed.includes(q) ? <SealedRow key={q.id} quest={q} /> : <QuestRow key={q.id} quest={q} index={i} />,
            )}
            <div className="rule" />
          </div>
        </div>
      ) : (
        <div className="mt-6 border-[10px] border-wood bg-[#c9a979] bg-[image:var(--grain)] px-4 pb-10 pt-8 shadow-[inset_0_0_40px_rgba(60,40,20,.35)] md:px-8">
          {/* スポンサーイベントの告知 */}
          {!region && (
            <Link href="/quests?region=yame" className="paper tape relative mx-auto mb-10 flex max-w-2xl flex-wrap items-center gap-4 p-4" style={{ rotate: "0.4deg" }}>
              <Flag className="h-7 w-7 shrink-0 text-brass" strokeWidth={1.4} />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-brass">EVENT · ~{SPONSOR_EVENT.endsAt}</div>
                <div className="font-mincho text-lg font-bold">{SPONSOR_EVENT.title[lang]}</div>
                <div className="text-xs text-muted">
                  {SPONSOR_EVENT.mission[lang]} → {SPONSOR_EVENT.reward[lang]}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: SPONSOR_EVENT.goal }).map((_, i) => (
                  <span key={i} className={`h-3.5 w-3.5 rounded-full border-2 ${i < eventDone ? "border-shu bg-shu" : "border-ink/40"}`} />
                ))}
                <span className="ml-1 font-mono text-sm font-bold">
                  {Math.min(eventDone, SPONSOR_EVENT.goal)}/{SPONSOR_EVENT.goal}
                </span>
              </div>
            </Link>
          )}

          {newest.length > 0 && (
            <BoardSection title="NEW — AI GAME MASTER" color="#a8823a">
              {newest.map((q, i) => (
                <QuestCard key={q.id} quest={q} index={i} />
              ))}
            </BoardSection>
          )}

          {(today.length > 0 || sealed.length > 0) && (
            <BoardSection title={lang === "ja" ? "TODAY — 今日の依頼" : "TODAY"} color="#b3432f">
              {today.map((q, i) => (
                <QuestCard key={q.id} quest={q} index={i} />
              ))}
              {sealed.map((q, i) => (
                <SealedNote key={q.id} quest={q} index={i} />
              ))}
            </BoardSection>
          )}

          {rest.length > 0 && (
            <BoardSection title={lang === "ja" ? "ALL QUESTS — 常設の依頼" : "ALL QUESTS"} color="#1e2a37">
              {rest.map((q, i) => (
                <QuestCard key={q.id} quest={q} index={i + 2} />
              ))}
            </BoardSection>
          )}

          {main.length === 0 && <p className="py-20 text-center font-mincho text-paper">{lang === "ja" ? "条件に合う依頼は、いまは掲示されていない。" : "No quests match right now."}</p>}
        </div>
      )}

      {sides.length > 0 && (
        <section className="mt-12">
          <div className="label flex items-center gap-2 !text-forest">
            <Signpost className="h-3.5 w-3.5" /> SIDE QUEST — {lang === "ja" ? "寄り道の依頼" : "DETOURS"}
          </div>
          <p className="mt-1 font-mincho text-sm text-muted">{lang === "ja" ? "SIDE QUESTは、冒険ルートの途中で見つかる。AIがあなたのルート上に提案します。" : "Side quests surface along your adventure route."}</p>
          <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
            {sides.map((q, i) => (
              <QuestRow key={q.id} quest={q} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BoardSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <section className="mb-12 last:mb-0">
      <div className="mb-7 inline-block bg-card px-3 py-1 font-mono text-[11px] font-bold tracking-[0.25em] shadow-sm" style={{ color, rotate: "-1deg" }}>
        {title}
      </div>
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

/** 封じられた依頼書（HIDDEN QUEST）— 開封すると中身が現れる */
function SealedNote({ quest, index }: { quest: Quest; index: number }) {
  const { revealHidden, lang } = useGame();
  const [opening, setOpening] = useState(false);
  const zone = zoneById(quest.region);
  return (
    <button
      onClick={() => {
        setOpening(true);
        setTimeout(() => revealHidden(quest.id), 900);
      }}
      className={`paper pin group relative flex min-h-[300px] flex-col items-center justify-center p-6 text-center transition hover:-translate-y-1 ${opening ? "anim-unfold" : ""}`}
      style={{ rotate: `${[1.2, -0.9, 0.6][index % 3]}deg` }}
    >
      <div className="absolute inset-3 border border-dashed border-[#5a3f6b]/50" />
      <div className="absolute left-1/2 top-1/2 h-px w-[80%] -translate-x-1/2 bg-ink/10" />
      <Eye className="relative h-8 w-8 text-[#5a3f6b]" strokeWidth={1.3} />
      <div className="relative mt-3 font-mono text-[11px] font-bold tracking-[0.3em] text-[#5a3f6b]">HIDDEN QUEST</div>
      <div className="relative mt-2 font-mincho text-2xl font-bold tracking-[0.3em] text-ink-2">？？？？？</div>
      <div className="relative mt-2 font-mono text-xs tracking-[0.15em] text-ink-2">
        {zone?.en.split(" /")[0].toUpperCase()} · +{quest.exp} EXP · +{quest.points} PT
      </div>
      <div className="relative mt-5 flex items-center gap-1.5 border border-[#5a3f6b] px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-[#5a3f6b] group-hover:bg-[#5a3f6b] group-hover:text-paper">
        <Search className="h-3.5 w-3.5" /> {opening ? (lang === "ja" ? "開封中…" : "OPENING…") : lang === "ja" ? "依頼書を開く" : "OPEN"}
      </div>
    </button>
  );
}

function SealedRow({ quest }: { quest: Quest }) {
  const { revealHidden, lang } = useGame();
  const zone = zoneById(quest.region);
  return (
    <button onClick={() => revealHidden(quest.id)} className="grid w-full grid-cols-[110px_1fr_auto] items-center gap-4 border-t-[1.5px] border-ink py-4 text-left">
      <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-[#5a3f6b]">HIDDEN</span>
      <div>
        <div className="font-mincho text-xl font-bold tracking-[0.3em] text-ink-2">？？？？？</div>
        <div className="font-mono text-xs text-ink-2">{zone?.en.split(" /")[0].toUpperCase()} · {lang === "ja" ? "タップで開封" : "TAP TO OPEN"}</div>
      </div>
      <div className="text-right font-mono">
        <div className="text-base font-bold">+{quest.exp} EXP</div>
        <div className="text-sm font-semibold text-brass">+{quest.points} PT</div>
      </div>
    </button>
  );
}
