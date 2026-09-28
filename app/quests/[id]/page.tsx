"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Compass as CompassIcon, Footprints, Gift, MapPin } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { zoneById } from "@/lib/data/regions";
import { titleById } from "@/lib/data/titles";
import { formatMinutes } from "@/lib/game/rules";
import { basicOptions } from "@/lib/game/route";
import { CATEGORY, kindOf } from "@/lib/ui/category";
import { KindTag, QuestMedia, Stars, TimeWindow } from "@/components/QuestCard";
import { WorldMap } from "@/components/WorldMap";
import { SCENES } from "@/components/Scene";
import { sceneFor } from "@/lib/ui/category";

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { quests, lang, player, hydrated, revealHidden } = useGame();
  const quest = quests.find((q) => q.id === id);

  // 依頼書を直接開いた場合も「発見済み」にする
  useEffect(() => {
    if (quest?.isHidden) revealHidden(quest.id);
  }, [quest, revealHidden]);

  if (!quest) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-mincho text-muted">{hydrated ? (lang === "ja" ? "この依頼書は見つからない。" : "Quest not found.") : "…"}</p>
        <Link href="/quests" className="btn-ghost mt-6 px-5 py-2.5 text-xs">
          QUEST BOARD
        </Link>
      </div>
    );
  }

  const zone = zoneById(quest.region);
  const cleared = player.clearedQuestIds.includes(quest.id);
  const title = quest.titleReward ? titleById(quest.titleReward) : undefined;
  const cat = CATEGORY[quest.category];
  const k = kindOf(quest);
  const onThis = player.adventure?.questId === quest.id || player.adventure?.sideIds.includes(quest.id);
  const opts = basicOptions(quest.region);
  const no = String(quests.indexOf(quest) + 1).padStart(3, "0");
  const scene = SCENES[sceneFor(quest)];

  const start = () => router.push(onThis ? "/adventure" : `/quests/${quest.id}/route`);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-6">
      <Link href="/quests" className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-ink-2 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> QUEST BOARD
      </Link>

      <article className="paper anim-unfold relative mt-4 overflow-hidden">
        {/* 写真 */}
        <QuestMedia quest={quest} useVideo kenBurns className="h-[34vh] min-h-[240px] border-b border-ink/80 md:h-[44vh]">
          <div className="absolute bottom-3 left-3 bg-card/90 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-ink-2">
            PHOTO — {quest.place ? quest.place[lang] : scene.place} · {scene.coord}
          </div>
          {cleared && (
            <div className="absolute right-6 top-6">
              <span className="stamp anim-stamp h-24 w-24 bg-card/50 text-xs" style={{ "--stamp-rot": "-14deg" } as React.CSSProperties}>
                <span>
                  QUEST
                  <br />
                  CLEAR
                </span>
              </span>
            </div>
          )}
        </QuestMedia>

        <div className="grid gap-0 md:grid-cols-[1.45fr_1fr]">
          {/* 依頼の本文 */}
          <div className="p-6 md:border-r md:border-ink/20 md:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <KindTag quest={quest} solid />
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted">QUEST No.{no}</span>
            </div>
            <h1 className="mt-4 font-mincho text-3xl font-bold leading-tight md:text-[2.6rem]">{quest.title[lang]}</h1>
            <p className="mt-2 font-display text-lg italic text-ink-2">{quest.title[lang === "ja" ? "en" : "ja"]}</p>

            <div className="rule mt-6" />
            <div className="label mt-5">QUEST STORY — {lang === "ja" ? "依頼の内容" : "THE REQUEST"}</div>
            <p className="mt-4 whitespace-pre-line font-mincho text-[17px] leading-[2.1]">
              {quest.description[lang]}
            </p>

            <div className="label mt-8">OBJECTIVES — {lang === "ja" ? "達成条件" : "TO CLEAR"}</div>
            <ol className="mt-3">
              {quest.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-3 border-b border-dashed border-ink/25 py-2.5 text-[15px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border border-ink/60 font-mono text-[10px]">{i + 1}</span>
                  {o[lang]}
                </li>
              ))}
            </ol>

            {quest.isHidden && (
              <p className="mt-6 border-l-2 border-[#5a3f6b] pl-3 font-mincho text-sm text-muted">
                {lang === "ja" ? "HIDDEN QUEST — 観光ガイドには載っていない、この土地だけの物語。" : "HIDDEN QUEST — a local story no guidebook tells."}
              </p>
            )}
            {quest.sponsor && (
              <div className="mt-6 font-mono text-[10px] tracking-[0.25em] text-muted">
                {quest.sponsor.label ?? "SUPPORTED BY"} · <span className="text-ink">{quest.sponsor.name}</span>
              </div>
            )}
          </div>

          {/* 依頼の仕様 */}
          <aside className="bg-paper-2/60 p-6 md:p-8">
            <div className="grid grid-cols-2 border-y-[1.5px] border-ink">
              <div className="py-3">
                <div className="label">EXP</div>
                <div className="display text-4xl font-semibold">+{quest.exp.toLocaleString()}</div>
              </div>
              <div className="border-l border-ink/25 py-3 pl-4">
                <div className="label">QUEST POINT</div>
                <div className="display text-4xl font-semibold text-brass">+{quest.points}</div>
              </div>
            </div>
            <dl className="mt-2 text-sm">
              <Info label="CATEGORY">
                <span style={{ color: cat.color }} className="font-mono text-xs font-semibold tracking-[0.18em]">
                  {cat.label}
                </span>
                <span className="ml-2 text-muted">{cat.ja}</span>
              </Info>
              <Info label="LOCATION">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {zone?.[lang]}
                </span>
                {quest.place && <div className="text-xs text-muted">{quest.place[lang]}</div>}
              </Info>
              <Info label="DIFFICULTY">
                <Stars n={quest.difficulty} size={13} />
              </Info>
              <Info label={lang === "ja" ? "所要時間" : "DURATION"}>
                {lang === "ja" ? "約" : "~"}
                {formatMinutes(quest.duration, lang)}
              </Info>
              <Info label={lang === "ja" ? "開催時間" : "OPEN"}>{quest.startAt ? <TimeWindow quest={quest} /> : <span className="text-muted">{lang === "ja" ? "いつでも" : "Anytime"}</span>}</Info>
              <Info label={lang === "ja" ? "費用" : "COST"}>{quest.cost === 0 ? (lang === "ja" ? "無料" : "Free") : `¥${quest.cost.toLocaleString()}〜`}</Info>
              {quest.slots && <Info label={lang === "ja" ? "枠" : "SLOTS"}>{lang === "ja" ? `本日 ${quest.slots} 名まで` : `${quest.slots} today`}</Info>}
            </dl>

            <div className="mt-5 border border-ink/80 bg-card p-4">
              <div className="label flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5" /> REWARD — {lang === "ja" ? "報酬" : ""}
              </div>
              <div className="mt-1.5 font-mincho font-bold">{quest.reward[lang]}</div>
              {title && (
                <div className="mt-1 text-xs text-muted">
                  {lang === "ja" ? "称号" : "Title"}：<span className="font-mincho font-bold text-shu">「{title[lang]}」</span>
                </div>
              )}
            </div>

            {/* 地図 */}
            <div className="mt-5">
              <div className="label">MAP — {lang === "ja" ? "現在地から" : "FROM YOU"}</div>
              <div className="map-frame mt-2 bg-paper">
                <WorldMap interactive={false} labels={false} showQuests={false} route={opts ? opts.car.path : [quest.region]} className="aspect-[1000/880] w-full" />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] tracking-[0.15em] text-ink-2">
                <span>{lang === "ja" ? "博多駅" : "HAKATA"} → {zone?.[lang]}</span>
                <span>
                  {opts ? (lang === "ja" ? `車で約${formatMinutes(opts.car.minutes)}` : `~${formatMinutes(opts.car.minutes, "en")} by car`) : lang === "ja" ? `約${quest.travelMinutes}分` : `~${quest.travelMinutes} min`}
                </span>
              </div>
            </div>

            <button onClick={start} className="btn-primary mt-6 w-full py-4 text-sm">
              {onThis ? <Footprints className="h-5 w-5" /> : <CompassIcon className="h-5 w-5" />}
              {onThis ? (lang === "ja" ? "冒険を続ける" : "CONTINUE") : cleared ? (lang === "ja" ? "もう一度挑む" : "PLAY AGAIN") : "QUEST START"}
            </button>
            <p className="mt-2 text-center font-mincho text-xs text-muted">{lang === "ja" ? "STARTすると、AI GAME MASTERが冒険ルートを提案します。" : "The AI Game Master will propose an adventure route."}</p>
            <div className="mt-1 text-center font-mono text-[9px] tracking-[0.2em]" style={{ color: k.color }}>
              {k.label}
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[92px_1fr] items-baseline gap-3 border-b border-dashed border-ink/25 py-2.5">
      <dt className="font-mono text-[10px] tracking-[0.2em] text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
