"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, Loader2, Search, Signpost } from "lucide-react";
import type { Quest } from "@/lib/types";
import { useGame } from "@/lib/game/store";
import { PROVINCES, TOTAL_MUNICIPALITIES, zoneById } from "@/lib/data/regions";
import { WorldMap, useZoneStats } from "@/components/WorldMap";
import { KindTag } from "@/components/QuestCard";
import { BlockBar } from "@/components/hud";

export default function MapPage() {
  const { quests, player, lang, exploration } = useGame();
  const [selected, setSelected] = useState<string | null>("yame");
  const stats = useZoneStats(quests, player.clearedQuestIds);
  const zone = selected ? zoneById(selected) : null;
  const zoneQuests = zone ? quests.filter((q) => q.region === zone.id && !q.isSide) : [];
  const zoneSides = zone ? quests.filter((q) => q.region === zone.id && q.isSide) : [];
  const s = zone ? stats[zone.id] : null;
  const discovered = zone ? player.discoveredZones.includes(zone.id) : false;
  const adv = player.adventure;
  const advSides = adv ? quests.filter((q) => adv.sideIds.includes(q.id)) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="label">WORLD MAP</div>
          <h1 className="display mt-1 text-4xl font-semibold tracking-[0.04em] md:text-5xl">FUKUOKA</h1>
          <p className="mt-1 font-mincho text-sm text-muted">{lang === "ja" ? "福岡県全体が、ひとつの冒険の舞台。霧のエリアを発見しよう。" : "The whole prefecture is one field. Clear the fog."}</p>
        </div>
        <div className="paper-flat px-5 py-3">
          <div className="label !text-forest">FUKUOKA EXPLORATION</div>
          <div className="mt-1 flex items-baseline gap-3">
            <BlockBar pct={exploration} className="text-lg" />
            <span className="display text-3xl font-semibold text-forest">{exploration}%</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted">
            {player.discoveredMunicipalities} / {TOTAL_MUNICIPALITIES} AREAS DISCOVERED
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr] [&>*]:min-w-0">
        <div>
          <div className="map-frame anim-map-open bg-paper">
            <WorldMap selected={selected} onSelect={setSelected} route={adv?.plan.path} routeStops={advSides.map((q) => ({ quest: q, chosen: true }))} className="aspect-[1000/880] w-full" />
          </div>
          <Legend lang={lang} />
        </div>

        {zone && s && (
          <aside key={zone.id} className="paper anim-page-turn flex flex-col self-start p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold tracking-[0.25em]" style={{ color: PROVINCES[zone.province].color }}>
                {PROVINCES[zone.province][lang]}
              </span>
              {discovered ? <span className="stamp-rect !text-forest">DISCOVERED</span> : <span className="stamp-rect !text-muted">UNEXPLORED</span>}
            </div>
            <h2 className="mt-3 font-mincho text-3xl font-bold">{zone[lang]}</h2>
            <p className="font-mincho text-sm italic text-earth">— {zone.epithet[lang]}</p>
            <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-dim">
              {zone.lat.toFixed(2)}°N {zone.lon.toFixed(2)}°E
            </div>

            <div className="mt-5 grid grid-cols-3 border-y border-ink/80">
              <Mini label="QUEST" value={s.total - s.side} />
              <Mini label="HIDDEN" value={s.hidden} border />
              <Mini label="SIDE" value={s.side} border />
            </div>

            <div className="mt-5 flex-1 space-y-2.5">
              {zoneQuests.length === 0 && <p className="py-6 text-center font-mincho text-sm text-dim">{lang === "ja" ? "このエリアのQUESTは、まだ眠っている。" : "Quests here are still asleep."}</p>}
              {zoneQuests.map((q) => (q.isHidden ? <HiddenEntry key={q.id} quest={q} /> : <QuestEntry key={q.id} quest={q} />))}
              {zoneSides.length > 0 && (
                <div className="pt-3">
                  <div className="label flex items-center gap-1.5 !text-forest">
                    <Signpost className="h-3.5 w-3.5" /> SIDE QUEST
                  </div>
                  <p className="mt-1 text-xs text-muted">{lang === "ja" ? "このエリアを通る冒険ルート上に出現する寄り道QUEST。" : "Detours that appear on routes passing through here."}</p>
                  <div className="mt-2 space-y-2">
                    {zoneSides.map((q) => (
                      <QuestEntry key={q.id} quest={q} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href={`/quests?region=${zone.id}`} className="btn-primary mt-6 py-3 text-xs">
              {lang === "ja" ? `${zone.ja}の依頼を見る` : `QUESTS IN ${zone.en.toUpperCase()}`} <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}

function QuestEntry({ quest }: { quest: Quest }) {
  const { lang, player } = useGame();
  const cleared = player.clearedQuestIds.includes(quest.id);
  return (
    <Link href={`/quests/${quest.id}`} className="group flex items-center gap-3 border border-ink/25 bg-card px-3 py-2.5 transition hover:border-ink">
      <KindTag quest={quest} />
      <span className="min-w-0 flex-1 truncate font-mincho text-sm font-bold group-hover:text-forest">{quest.title[lang]}</span>
      {cleared ? <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-shu">CLEAR</span> : <span className="font-mono text-xs font-semibold">+{quest.exp}</span>}
    </Link>
  );
}

/** HIDDEN QUEST：封じられた依頼書を調べると、中身が現れる */
function HiddenEntry({ quest }: { quest: Quest }) {
  const { lang, isRevealed, revealHidden } = useGame();
  const [busy, setBusy] = useState(false);
  if (isRevealed(quest)) {
    return (
      <div className="anim-unfold">
        <div className="mb-1 font-mono text-[10px] font-bold tracking-[0.25em] text-[#5a3f6b]">◆ HIDDEN QUEST FOUND</div>
        <QuestEntry quest={quest} />
      </div>
    );
  }
  return (
    <button
      onClick={() => {
        setBusy(true);
        setTimeout(() => revealHidden(quest.id), 900);
      }}
      className="group relative flex w-full items-center gap-3 border border-dashed border-[#5a3f6b]/60 bg-[#5a3f6b]/[0.04] px-3 py-3 text-left transition hover:bg-[#5a3f6b]/[0.08]"
    >
      <Eye className="h-4 w-4 shrink-0 text-[#5a3f6b]" />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#5a3f6b]">HIDDEN QUEST</div>
        <div className="font-mincho text-sm font-bold tracking-[0.3em] text-ink-2">？？？？？？</div>
      </div>
      <span className="font-mono text-xs font-semibold">+{quest.exp}</span>
      <span className="flex items-center gap-1 border border-[#5a3f6b] px-2 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#5a3f6b]">
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
        {busy ? (lang === "ja" ? "調査中" : "…") : lang === "ja" ? "調べる" : "INVESTIGATE"}
      </span>
    </button>
  );
}

function Mini({ label, value, border }: { label: string; value: string | number; border?: boolean }) {
  return (
    <div className={`py-3 text-center ${border ? "border-l border-ink/25" : ""}`}>
      <div className="display text-2xl font-semibold">{value}</div>
      <div className="font-mono text-[9px] tracking-[0.25em] text-muted">{label}</div>
    </div>
  );
}

function Legend({ lang }: { lang: "ja" | "en" }) {
  const items: [React.ReactNode, string][] = [
    [<span key="q" className="inline-block h-2.5 w-2.5 rotate-45 bg-forest" />, "QUEST"],
    [<span key="l" className="inline-block h-2.5 w-2.5 rotate-45 bg-shu" />, "LIMITED"],
    [<span key="h" className="grid h-3.5 w-3.5 place-items-center rounded-full border border-[#5a3f6b] font-mono text-[8px] font-bold text-[#5a3f6b]">?</span>, "HIDDEN QUEST"],
    [<span key="s" className="inline-block h-3 w-3 border-[1.5px] border-forest" />, "SIDE QUEST"],
    [<span key="d" className="grid h-3.5 w-3.5 place-items-center rounded-full border-[1.5px] border-ink"><span className="h-1.5 w-1.5 rounded-full bg-ink" /></span>, lang === "ja" ? "発見済み" : "DISCOVERED"],
    [<span key="u" className="inline-block h-3.5 w-3.5 rounded-full border border-dashed border-muted bg-[repeating-linear-gradient(40deg,#9a938255_0_1px,transparent_1px_4px)]" />, lang === "ja" ? "未踏" : "UNEXPLORED"],
    [<span key="r" className="inline-block h-0 w-5 border-t-[3px] border-shu" />, "ROUTE"],
    [<span key="y" className="inline-block h-3 w-3 rounded-full border-2 border-card bg-shu shadow-[0_0_0_1px_#b3432f]" />, lang === "ja" ? "現在地" : "YOU"],
  ];
  return (
    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
      {items.map(([icon, l]) => (
        <span key={l} className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-ink-2">
          {icon}
          {l}
        </span>
      ))}
    </div>
  );
}
