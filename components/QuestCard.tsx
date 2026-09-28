"use client";

import Link from "next/link";
import { Clock, MapPin, Timer } from "lucide-react";
import type { Quest } from "@/lib/types";
import { CATEGORY, kindOf, placeLabel, sceneFor } from "@/lib/ui/category";
import { zoneById } from "@/lib/data/regions";
import { formatMinutes, windowStatus } from "@/lib/game/rules";
import { useGame } from "@/lib/game/store";
import { Media } from "./Media";
import { useNow } from "./hud";

export function QuestMedia({ quest, className = "", useVideo = false, kenBurns = false, children }: { quest: Quest; className?: string; useVideo?: boolean; kenBurns?: boolean; children?: React.ReactNode }) {
  return (
    <Media video={useVideo ? quest.video : undefined} image={quest.image} scene={sceneFor(quest)} seed={quest.id} tint={CATEGORY[quest.category].color} className={className} kenBurns={kenBurns} alt={quest.title.ja}>
      {children}
    </Media>
  );
}

/** 依頼書の種別ラベル（LIMITED / HIDDEN / SIDE QUEST …） */
export function KindTag({ quest, className = "", solid = false }: { quest: Quest; className?: string; solid?: boolean }) {
  const k = kindOf(quest);
  const Icon = k.icon;
  return (
    <span className={`tag ${className}`} style={solid ? { color: "#f2ead9", background: k.color, borderColor: k.color } : { color: k.color }}>
      <Icon className="h-3 w-3" strokeWidth={2.2} />
      {k.label}
    </span>
  );
}

export function CategoryTag({ quest }: { quest: Quest }) {
  const c = CATEGORY[quest.category];
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-[0.2em]" style={{ color: c.color }}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

/** 難易度：◆◆◇◇◇ */
export function Stars({ n, size = 11 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-[3px]" aria-label={`difficulty ${n} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`inline-block rotate-45 border ${i < n ? "border-ink bg-ink" : "border-ink/30"}`} style={{ width: size * 0.62, height: size * 0.62 }} />
      ))}
    </span>
  );
}

export function TimeWindow({ quest, compact = false }: { quest: Quest; compact?: boolean }) {
  const now = useNow();
  const { lang } = useGame();
  if (!quest.startAt || !quest.endAt) return null;
  const s = now && quest.isDynamic ? windowStatus(quest.startAt, quest.endAt, now) : null;
  const live = s?.state === "live";
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-wider ${live ? "text-shu" : "text-ink-2"}`}>
      {live ? <span className="inline-block h-2 w-2 rounded-full bg-shu" /> : <Clock className="h-3.5 w-3.5" />}
      {quest.startAt} — {quest.endAt}
      {!compact && s?.state === "live" && (
        <span className="text-shu">
          · {lang === "ja" ? "残り" : ""}
          {formatMinutes(s.minutesLeft, lang)}
          {lang === "en" ? " left" : ""}
        </span>
      )}
      {!compact && s?.state === "upcoming" && (
        <span>
          · {lang === "ja" ? "あと" : "in "}
          {formatMinutes(s.minutesUntil, lang)}
          {lang === "ja" ? "で発生" : ""}
        </span>
      )}
      {!compact && s?.state === "closed" && <span className="text-dim">· {lang === "ja" ? "本日終了" : "closed today"}</span>}
    </span>
  );
}

/** 依頼書カード（QUEST BOARD にピン留めされる紙） */
export function QuestCard({ quest, index = 0, tilt = true }: { quest: Quest; index?: number; tilt?: boolean }) {
  const { lang, player } = useGame();
  const zone = zoneById(quest.region);
  const cleared = player.clearedQuestIds.includes(quest.id);
  const isNew = quest.generatedBy && quest.generatedBy !== "seed";
  const rot = tilt ? [-1.2, 0.8, -0.4, 1.1, -0.8, 0.5][index % 6] : 0;

  return (
    <Link
      href={`/quests/${quest.id}`}
      className="group paper pin relative flex flex-col p-3 transition duration-300 hover:-translate-y-1 hover:rotate-0 anim-fade-up"
      style={{ animationDelay: `${index * 70}ms`, rotate: `${rot}deg` }}
    >
      <QuestMedia quest={quest} className="aspect-[16/10] border border-line">
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <KindTag quest={quest} solid />
          {isNew && <span className="tag bg-card" style={{ color: "#a8823a" }}>NEW</span>}
        </div>
        {cleared && (
          <div className="absolute right-3 top-3">
            <span className="stamp h-16 w-16 bg-card/40 text-[10px]" style={{ rotate: "-14deg" }}>
              CLEAR
            </span>
          </div>
        )}
      </QuestMedia>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-ink-2">{placeLabel(zone?.en, quest)}</span>
          <Stars n={quest.difficulty} />
        </div>
        <h3 className="mt-1.5 font-mincho text-lg font-bold leading-snug tracking-wide group-hover:text-forest">{quest.title[lang]}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">{quest.tagline[lang]}</p>
        <div className="rule-dashed mt-3" />
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-ink-2">
          {quest.startAt ? (
            <TimeWindow quest={quest} compact />
          ) : (
            <span className="inline-flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              {formatMinutes(quest.duration, lang)}
            </span>
          )}
          <span className="ml-auto font-semibold text-ink">+{quest.exp.toLocaleString()} EXP</span>
          <span className="font-semibold text-brass">+{quest.points} PT</span>
        </div>
      </div>
    </Link>
  );
}

/** 掲示板の一行（━━ で区切られたリスト） */
export function QuestRow({ quest, index = 0 }: { quest: Quest; index?: number }) {
  const { lang, player } = useGame();
  const zone = zoneById(quest.region);
  const cleared = player.clearedQuestIds.includes(quest.id);
  const k = kindOf(quest);
  return (
    <Link href={`/quests/${quest.id}`} className="group relative grid grid-cols-[1fr_auto] items-center gap-4 border-t-[1.5px] border-ink py-4 anim-fade-up md:grid-cols-[110px_1fr_auto]" style={{ animationDelay: `${index * 60}ms` }}>
      <span className="font-mono text-[11px] font-bold tracking-[0.25em] md:self-start md:pt-1.5" style={{ color: k.color }}>
        {k.label}
      </span>
      <div className="col-span-2 min-w-0 md:col-span-1">
        <div className="font-mincho text-xl font-bold group-hover:text-forest md:text-2xl">{quest.title[lang]}</div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tracking-wider text-ink-2">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {placeLabel(zone?.en, quest)}
          </span>
          {quest.startAt ? <TimeWindow quest={quest} compact /> : <span>{formatMinutes(quest.duration, lang)}</span>}
        </div>
      </div>
      <div className="col-start-2 row-start-1 text-right font-mono md:col-start-3">
        <div className="text-base font-bold text-ink">+{quest.exp} EXP</div>
        <div className="text-sm font-semibold text-brass">+{quest.points} PT</div>
      </div>
      {cleared && (
        <span className="stamp absolute right-28 top-2 h-14 w-14 text-[9px]" style={{ rotate: "-12deg" }}>
          CLEAR
        </span>
      )}
    </Link>
  );
}
