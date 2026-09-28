"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { expToNext } from "@/lib/game/rules";
import { PROVINCES, TOTAL_MUNICIPALITIES, ZONES, zoneById } from "@/lib/data/regions";
import { TITLES } from "@/lib/data/titles";
import { BlockBar, Emblem, ExpBar, LevelBadge } from "@/components/hud";
import { WorldMap } from "@/components/WorldMap";

export default function ProfilePage() {
  const { player, lang, clearCount, exploration, quests, setActiveTitle, resetDemo } = useGame();
  const pct = Math.round((player.exp / expToNext(player.level)) * 100);
  const owned = TITLES.filter((t) => player.titles.includes(t.id));
  const locked = TITLES.filter((t) => !player.titles.includes(t.id));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <div className="label">ADVENTURER RECORD</div>
      <h1 className="display mt-1 text-4xl font-semibold tracking-[0.04em] md:text-5xl">{lang === "ja" ? "冒険記録" : "The Record"}</h1>

      {/* 見開きの記録帳 */}
      <div className="mt-6 grid overflow-hidden border-[1.5px] border-ink bg-card bg-[image:var(--grain)] shadow-[0_20px_50px_-30px_rgba(60,45,20,.6)] lg:grid-cols-2">
        {/* 左ページ */}
        <section className="relative p-6 md:p-9 lg:border-r lg:border-ink/30">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-8 bg-gradient-to-l from-ink/[0.06] to-transparent lg:block" />
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-[1.5px] border-ink bg-paper-2 font-display text-4xl font-semibold">{player.name[0]}</div>
            <div>
              <div className="label">ADVENTURER</div>
              <div className="display text-3xl font-semibold tracking-[0.1em]">{player.name}</div>
              {player.activeTitle && (
                <div className="mt-1 font-mincho text-sm font-bold text-shu">「{TITLES.find((t) => t.id === player.activeTitle)?.[lang]}」</div>
              )}
            </div>
          </div>

          <div className="rule mt-7" />
          <div className="flex items-center gap-5 py-5">
            <LevelBadge level={player.level} size={72} />
            <div className="flex-1">
              <div className="label">LEVEL {String(player.level).padStart(2, "0")}</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-mono text-xs font-semibold tracking-[0.25em]">EXP</span>
                <span className="font-mono text-sm tabular-nums">
                  {player.exp.toLocaleString()} / {expToNext(player.level).toLocaleString()} <span className="ml-1 text-muted">{pct}%</span>
                </span>
              </div>
              <ExpBar level={player.level} exp={player.exp} thick className="mt-2" />
            </div>
          </div>
          <div className="rule" />

          <div className="py-5">
            <div className="label !text-forest">FUKUOKA EXPLORATION</div>
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <BlockBar pct={exploration} width={16} className="text-xl" />
              <span className="display text-4xl font-semibold text-forest">{exploration}%</span>
            </div>
            <div className="mt-1 font-mono text-[11px] tracking-[0.2em] text-ink-2">
              {player.discoveredMunicipalities} / {TOTAL_MUNICIPALITIES} AREAS
            </div>
          </div>
          <div className="rule" />

          <dl className="grid grid-cols-3 py-5">
            <Stat label="QUEST CLEAR" value={clearCount} />
            <Stat label="QUEST POINT" value={player.points.toLocaleString()} border />
            <Stat label="TITLES" value={`${player.titles.length}`} border />
          </dl>
          <div className="rule" />

          {/* 地方ごとの踏破 */}
          <div className="mt-5 space-y-3">
            {(Object.keys(PROVINCES) as (keyof typeof PROVINCES)[]).map((p) => {
              const zones = ZONES.filter((z) => z.province === p);
              return (
                <div key={p} className="grid grid-cols-[88px_1fr] items-baseline gap-3">
                  <span className="font-mincho text-sm font-bold" style={{ color: PROVINCES[p].color }}>
                    {PROVINCES[p][lang]}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {zones.map((z) => {
                      const ok = player.discoveredZones.includes(z.id);
                      return (
                        <span key={z.id} className={`px-1.5 py-0.5 text-[11px] ${ok ? "border border-ink/60" : "border border-dashed border-ink/25 text-dim"}`}>
                          {ok ? z[lang] : "？？？"}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 右ページ */}
        <section className="p-6 md:p-9">
          <div className="label">TITLES — {lang === "ja" ? "称号" : ""}</div>
          <div className="mt-4 space-y-2.5">
            {owned.map((t) => {
              const active = player.activeTitle === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTitle(t.id)} className={`flex w-full items-center gap-4 border px-3 py-2 text-left transition ${active ? "border-ink" : "border-transparent hover:border-ink/30"}`}>
                  <Emblem tier={t.tier} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="font-mincho text-lg font-bold">「{t[lang]}」</div>
                    <div className="text-[11px] text-muted">{t.hint[lang]}</div>
                  </div>
                  {active && <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-shu">EQUIPPED</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {locked.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5 border border-dashed border-ink/25 px-2 py-1 text-[11px] text-dim" title={t.hint[lang]}>
                <Emblem tier={t.tier} size={18} locked /> {t.hint[lang]}
              </span>
            ))}
          </div>

          <div className="rule mt-7" />
          <div className="label mt-5">JOURNAL — {lang === "ja" ? "冒険の記録" : "LOG"}</div>
          <div className="mt-3">
            {player.journal.length === 0 && (
              <p className="py-4 font-mincho text-sm text-muted">{lang === "ja" ? `これまでの冒険 ${player.baseClearCount} 件。次の記録は、あなたの次のQUESTから。` : `${player.baseClearCount} past adventures. Your next entry starts with your next quest.`}</p>
            )}
            {player.journal.map((j, i) => {
              const q = quests.find((x) => x.id === j.questId);
              if (!q) return null;
              const d = new Date(j.at);
              return (
                <Link key={`${j.questId}-${j.at}`} href={`/quests/${q.id}`} className="flex items-center gap-3 border-b border-dashed border-ink/25 py-3 anim-page-turn" style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="w-12 shrink-0 font-mono text-[10px] text-muted">
                    {d.getMonth() + 1}/{d.getDate()}
                    <br />
                    {String(d.getHours()).padStart(2, "0")}:{String(d.getMinutes()).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mincho font-bold">{q.title[lang]}</div>
                    <div className="font-mono text-[10px] tracking-[0.15em] text-muted">
                      {q.isSide ? "SIDE · " : ""}
                      {zoneById(q.region)?.[lang]}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold">+{q.exp}</span>
                  <span className="stamp h-10 w-10 shrink-0 text-[7px]" style={{ rotate: `${-14 + (i % 3) * 8}deg` }}>
                    CLEAR
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 border border-ink/40 bg-paper">
            <WorldMap interactive={false} labels={false} showQuests={false} className="aspect-[1000/880] w-full" />
          </div>
        </section>
      </div>

      <div className="mt-10 flex justify-center">
        <button onClick={resetDemo} className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-muted hover:text-ink">
          <RotateCcw className="h-3.5 w-3.5" /> RESET DEMO DATA
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, border }: { label: string; value: string | number; border?: boolean }) {
  return (
    <div className={border ? "border-l border-ink/25 pl-4" : ""}>
      <dt className="font-mono text-[9px] tracking-[0.2em] text-muted">{label}</dt>
      <dd className="display text-3xl font-semibold">{value}</dd>
    </div>
  );
}
