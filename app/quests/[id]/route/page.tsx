"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Car, Check, Feather, Footprints, Loader2, MapPin, Plus, RotateCcw, Signpost, TrainFront, X } from "lucide-react";
import type { Quest } from "@/lib/types";
import { useGame } from "@/lib/game/store";
import { HOME_POINT, zoneById } from "@/lib/data/regions";
import { basicOptions, planRoute, PREFERENCES, type RoutePlan, type RoutePreference } from "@/lib/game/route";
import { formatMinutes } from "@/lib/game/rules";
import { WorldMap } from "@/components/WorldMap";
import { QuestMedia } from "@/components/QuestCard";

type Narration = { ja: string[]; en: string[]; source: "ai" | "demo" };

const THINKING = {
  ja: ["地図を広げています…", "目的地までの道を検討中…", "あなたの冒険スタイルを反映中…", "ルート上のQUESTを探しています…"],
  en: ["Unfolding the map…", "Weighing the roads…", "Fitting your style…", "Searching for quests on the way…"],
};

export default function RoutePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { quests, lang, player, hydrated, startAdventure } = useGame();
  const quest = quests.find((q) => q.id === id);
  const [pref, setPref] = useState<RoutePreference | null>(null);
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [narr, setNarr] = useState<Narration | null>(null);
  const [loading, setLoading] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  const [found, setFound] = useState<Quest | null>(null);

  const byId = (qid: string) => quests.find((q) => q.id === qid);

  const generate = async (p: RoutePreference) => {
    if (!quest) return;
    setPref(p);
    setLoading(true);
    setPlan(null);
    setNarr(null);
    setFound(null);
    const pl = planRoute(quest, p, quests, player.clearedQuestIds);
    const sides = pl.sides.map((s) => ({ id: s.questId, title: byId(s.questId)!.title, exp: s.exp, detour: s.detour, zone: s.zone }));
    const minDelay = new Promise((r) => setTimeout(r, 1800));
    let n: Narration;
    try {
      const [res] = await Promise.all([
        fetch("/api/route", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: pl, destTitle: quest.title, sides }) }).then((r) => r.json()),
        minDelay,
      ]);
      n = res;
    } catch {
      await minDelay;
      const { narrateDemo } = await import("@/lib/game/route");
      n = { ...narrateDemo({ plan: pl, destTitle: quest.title, sides }), source: "demo" };
    }
    setPlan(pl);
    setNarr(n);
    setChosen(pl.recommended);
    setLoading(false);
    // ルート上のSIDE QUESTを「発見」させる（効率の良いものを優先）
    const best = [...pl.sides].filter((s) => !pl.recommended.includes(s.questId)).sort((a, b) => b.exp / b.detour - a.exp / a.detour)[0] ?? pl.sides[0];
    if (best) setTimeout(() => setFound(byId(best.questId) ?? null), 1700);
  };

  if (!quest) {
    return (
      <div className="py-24 text-center font-mincho text-muted">
        {hydrated ? (lang === "ja" ? "この依頼書は見つからない。" : "Quest not found.") : "…"}
        {hydrated && (
          <div className="mt-6">
            <Link href="/quests" className="btn-ghost px-5 py-2.5 text-xs">
              QUEST BOARD
            </Link>
          </div>
        )}
      </div>
    );
  }

  const zone = zoneById(quest.region)!;
  const opts = basicOptions(quest.region);
  const toggle = (qid: string) => setChosen((c) => (c.includes(qid) ? c.filter((x) => x !== qid) : [...c, qid]));
  const sideQuests = plan ? plan.sides.map((s) => byId(s.questId)!).filter(Boolean) : [];
  const chosenStops = plan ? plan.sides.filter((s) => chosen.includes(s.questId)) : [];
  const totalMin = plan ? plan.travelMinutes + chosenStops.reduce((t, s) => t + s.detour, 0) : 0;
  const totalExp = quest.exp + chosenStops.reduce((t, s) => t + s.exp, 0);
  const totalPt = quest.points + chosenStops.reduce((t, s) => t + s.points, 0);

  const depart = () => {
    if (!plan) return;
    startAdventure(plan, plan.sides.filter((s) => chosen.includes(s.questId)).map((s) => s.questId));
    router.push("/adventure");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <Link href={`/quests/${quest.id}`} className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-ink-2 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> {lang === "ja" ? "依頼書に戻る" : "BACK TO QUEST"}
      </Link>

      {/* ヘッダー */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label flex items-center gap-2">
            <Feather className="h-3.5 w-3.5" /> AI GAME MASTER
          </div>
          <h1 className="display mt-1 text-4xl font-semibold tracking-[0.04em] md:text-5xl">ADVENTURE ROUTE</h1>
          <p className="mt-1 font-mincho text-xl font-bold">{quest.title[lang]}</p>
        </div>
        <div className="paper-flat grid grid-cols-[auto_auto_auto] items-center gap-x-4 px-5 py-3 font-mono text-xs">
          <div>
            <div className="label">{lang === "ja" ? "現在地" : "FROM"}</div>
            <div className="mt-0.5 font-mincho text-base font-bold">{lang === "ja" ? `福岡市（${HOME_POINT.ja}）` : `Fukuoka (${HOME_POINT.en})`}</div>
          </div>
          <span className="text-lg">→</span>
          <div>
            <div className="label">{lang === "ja" ? "目的地" : "TO"}</div>
            <div className="mt-0.5 font-mincho text-base font-bold">{zone[lang]}</div>
          </div>
        </div>
      </div>

      {/* 基本の2案 */}
      {opts && (
        <div className="paper mt-6 grid md:grid-cols-2">
          <BasicOption icon={<Car className="h-5 w-5" />} label="RECOMMENDED ROUTE" mode={lang === "ja" ? "車" : "Car"} minutes={opts.car.minutes} cost={opts.car.cost} quest={quest} lang={lang} />
          <BasicOption icon={<TrainFront className="h-5 w-5" />} label="PUBLIC TRANSPORT" mode={lang === "ja" ? "電車・バス" : "Train & bus"} minutes={opts.transit.minutes} cost={opts.transit.cost} quest={quest} lang={lang} border />
        </div>
      )}

      {/* 冒険スタイル */}
      <section className="mt-10">
        <h2 className="font-mincho text-2xl font-bold md:text-3xl">{lang === "ja" ? "どんな冒険をしますか？" : "What kind of adventure?"}</h2>
        <p className="mt-1 text-sm text-muted">{lang === "ja" ? "選んだスタイルに合わせて、AI GAME MASTERが冒険ルートを組み立てます。" : "The Game Master builds a route for your style."}</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {PREFERENCES.map((p) => {
            const on = pref === p.id;
            return (
              <button
                key={p.id}
                onClick={() => generate(p.id)}
                disabled={loading}
                className={`flex flex-col items-start border p-3 text-left transition disabled:opacity-60 ${on ? "border-ink bg-ink text-paper" : "border-ink/30 bg-card hover:border-ink"}`}
              >
                <span className="text-2xl">{p.glyph}</span>
                <span className="mt-2 font-mincho text-sm font-bold leading-tight">{lang === "ja" ? p.ja : p.en}</span>
                <span className={`mt-1 text-[11px] ${on ? "text-paper/70" : "text-muted"}`}>{p.hint[lang]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 結果 */}
      {(loading || plan) && (
        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr] [&>*]:min-w-0">
          <div>
            <div className="map-frame bg-paper">
              <WorldMap
                interactive={false}
                showQuests={false}
                route={plan?.path}
                routeStops={sideQuests.map((q) => ({ quest: q, chosen: chosen.includes(q.id) }))}
                className="aspect-[1000/880] w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading || !plan || !narr ? (
              <Thinking lang={lang} />
            ) : (
              <>
                <div className="paper anim-page-turn p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="label">{PREFERENCES.find((p) => p.id === plan.preference)?.glyph} {lang === "ja" ? "提案ルート" : "PROPOSED ROUTE"}</div>
                      <div className="mt-1 font-mincho text-xl font-bold">{plan.title[lang]}</div>
                    </div>
                    <span className="stamp-rect shrink-0 !text-ink-2">{narr.source === "ai" ? "AI" : "DEMO"}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 border-y-[1.5px] border-ink">
                    <KV label={lang === "ja" ? "移動" : "TRAVEL"} value={formatMinutes(plan.travelMinutes, lang)} sub={plan.mode === "car" ? (lang === "ja" ? "車" : "car") : plan.mode === "walk" ? (lang === "ja" ? "徒歩" : "walk") : lang === "ja" ? "公共交通" : "transit"} />
                    <KV label={lang === "ja" ? "費用目安" : "COST"} value={plan.cost ? `¥${plan.cost.toLocaleString()}` : lang === "ja" ? "無料" : "Free"} border />
                    <KV label="SIDE QUEST" value={`${plan.sides.length}`} sub={lang === "ja" ? "件 発見" : "found"} border />
                  </div>

                  {/* 行程 */}
                  <ol className="mt-4 space-y-0">
                    <Stop label={lang === "ja" ? `現在地 — ${HOME_POINT.ja}` : `Start — ${HOME_POINT.en}`} start />
                    {plan.legs.map((l, i) => {
                      const stops = plan.sides.filter((s) => s.zone === l.to && chosen.includes(s.questId));
                      const last = i === plan.legs.length - 1;
                      return (
                        <li key={i}>
                          <div className="ml-[7px] border-l-2 border-dashed border-ink/40 py-1.5 pl-5 font-mono text-[11px] text-muted">
                            {formatMinutes(l.minutes, lang)}
                            {l.line && ` · ${l.line[lang]}`}
                          </div>
                          {!(plan.path.length === 1) && <Stop label={zoneById(l.to)![lang]} end={last} />}
                          {stops.map((s) => (
                            <div key={s.questId} className="ml-[7px] border-l-2 border-dashed border-ink/40 py-1 pl-5">
                              <span className="inline-flex items-center gap-1.5 border border-forest bg-forest/5 px-2 py-0.5 font-mincho text-[13px] font-bold text-forest">
                                <Signpost className="h-3.5 w-3.5" /> {byId(s.questId)?.title[lang]}
                                <span className="font-mono text-[10px] font-normal">+{s.detour}{lang === "ja" ? "分" : "m"}</span>
                              </span>
                            </div>
                          ))}
                        </li>
                      );
                    })}
                    {plan.path.length === 1 && <Stop label={quest.place?.[lang] ?? zone[lang]} end />}
                  </ol>
                </div>

                {/* GMの語り */}
                <div className="ink-surface relative p-5">
                  <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em] text-brass-2">
                    <Feather className="h-3.5 w-3.5" /> GAME MASTER
                  </div>
                  <div className="mt-3 space-y-1.5 font-mincho text-[15px] leading-relaxed">
                    {narr[lang].map((l, i) => (
                      <p key={i} className="anim-fade-up" style={{ animationDelay: `${i * 380}ms` }}>
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* SIDE QUEST 一覧 */}
      {plan && !loading && (
        <section className="mt-10">
          <div className="label flex items-center gap-2 !text-forest">
            <Signpost className="h-3.5 w-3.5" /> SIDE QUEST — {lang === "ja" ? "ルート上の寄り道" : "DETOURS ON YOUR ROUTE"}
          </div>
          {sideQuests.length === 0 ? (
            <p className="mt-3 font-mincho text-sm text-muted">{lang === "ja" ? "このルート上には、まだSIDE QUESTが見つかっていない。" : "No side quests on this route yet."}</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {sideQuests.map((q) => {
                const s = plan.sides.find((x) => x.questId === q.id)!;
                const on = chosen.includes(q.id);
                return (
                  <div key={q.id} className={`paper relative flex flex-col p-4 transition ${on ? "outline-2 outline-forest" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-forest">
                        {zoneById(q.region)?.[lang]} · {lang === "ja" ? "ルート上" : "ON ROUTE"}
                      </span>
                      {plan.recommended.includes(q.id) && <span className="tag !text-brass">GM PICK</span>}
                    </div>
                    <div className="mt-2 font-mincho text-lg font-bold">{q.title[lang]}</div>
                    <p className="mt-1 line-clamp-2 text-[13px] text-muted">{q.tagline[lang]}</p>
                    <div className="mt-3 flex gap-4 font-mono text-xs">
                      <span className="font-bold">+{q.exp} EXP</span>
                      <span className="text-brass">+{q.points} PT</span>
                      <span className="ml-auto text-muted">
                        {lang === "ja" ? "追加" : "+"}
                        {s.detour}
                        {lang === "ja" ? "分" : " min"}
                      </span>
                    </div>
                    <button onClick={() => toggle(q.id)} className={`mt-4 py-2.5 text-xs ${on ? "btn-primary" : "btn-ghost"}`}>
                      {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {on ? (lang === "ja" ? "寄り道する" : "DETOUR ADDED") : lang === "ja" ? "寄り道に追加" : "ADD DETOUR"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 出発 */}
          <div className="paper mt-8 flex flex-col gap-5 p-5 md:flex-row md:items-center md:p-6">
            <div className="grid flex-1 grid-cols-3">
              <KV label={lang === "ja" ? "所要時間（移動＋寄り道）" : "TIME"} value={formatMinutes(totalMin, lang)} />
              <KV label={lang === "ja" ? "獲得予定 EXP" : "EXP"} value={`+${totalExp.toLocaleString()}`} border />
              <KV label={lang === "ja" ? "獲得予定 PT" : "PT"} value={`+${totalPt}`} border />
            </div>
            <div className="flex flex-col gap-2 md:w-72">
              <button onClick={depart} className="btn-primary py-4 text-sm">
                <Footprints className="h-5 w-5" /> {lang === "ja" ? "この冒険ルートで出発" : "SET OUT"}
              </button>
              <button onClick={() => generate(plan.preference)} className="flex items-center justify-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-muted hover:text-ink">
                <RotateCcw className="h-3 w-3" /> {lang === "ja" ? "ルートを作り直す" : "REGENERATE"}
              </button>
            </div>
          </div>
          <p className="mt-3 text-center font-mincho text-xs text-muted">{lang === "ja" ? "寄り道は提案です。どのQUESTに寄るかは、あなたが決めてください。" : "Detours are suggestions. You decide."}</p>
        </section>
      )}

      {found && plan && <SideFound quest={found} detour={plan.sides.find((s) => s.questId === found.id)?.detour ?? 15} destZone={zone[lang]} added={chosen.includes(found.id)} onAdd={() => { if (!chosen.includes(found.id)) toggle(found.id); setFound(null); }} onClose={() => setFound(null)} />}
    </div>
  );
}

function BasicOption({ icon, label, mode, minutes, cost, quest, lang, border }: { icon: React.ReactNode; label: string; mode: string; minutes: number; cost: number; quest: Quest; lang: "ja" | "en"; border?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 p-5 ${border ? "border-t border-ink/25 md:border-l md:border-t-0" : ""}`}>
      <div>
        <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-ink-2">{label}</div>
        <div className="mt-1 flex items-center gap-2 font-mincho text-xl font-bold">
          {icon} {mode} {lang === "ja" ? "約" : "~"}
          {formatMinutes(minutes, lang)}
        </div>
        <div className="font-mono text-[11px] text-muted">{cost ? `¥${cost.toLocaleString()}` : ""}</div>
      </div>
      <div className="shrink-0 whitespace-nowrap text-right font-mono text-sm font-semibold">
        <div>+{quest.exp} EXP</div>
        <div className="text-brass">+{quest.points} PT</div>
      </div>
    </div>
  );
}

function KV({ label, value, sub, border }: { label: string; value: string; sub?: string; border?: boolean }) {
  return (
    <div className={`py-3 ${border ? "border-l border-ink/25 pl-3" : ""}`}>
      <div className="font-mono text-[9px] tracking-[0.18em] text-muted">{label}</div>
      <div className="display text-2xl font-semibold">{value}</div>
      {sub && <div className="font-mono text-[10px] text-muted">{sub}</div>}
    </div>
  );
}

function Stop({ label, start, end }: { label: string; start?: boolean; end?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${start ? "border-shu bg-shu" : end ? "border-ink bg-ink" : "border-ink bg-card"}`} />
      <span className={`font-mincho text-[15px] ${end || start ? "font-bold" : ""}`}>
        {end && <MapPin className="mr-1 inline h-4 w-4 text-shu" />}
        {label}
      </span>
    </div>
  );
}

function Thinking({ lang }: { lang: "ja" | "en" }) {
  const lines = THINKING[lang];
  const [n, setN] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setN((x) => Math.min(lines.length, x + 1)), 420);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <div className="paper p-6">
      <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em] text-forest">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> GAME MASTER {lang === "ja" ? "がルートを考えています" : "IS PLANNING"}
      </div>
      <div className="mt-5 space-y-2 font-mincho">
        {lines.slice(0, n).map((l, i) => (
          <div key={i} className={`anim-fade-in ${i === n - 1 ? "text-ink" : "text-muted"}`}>
            {i < n - 1 ? "✓ " : "— "}
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/** SIDE QUEST FOUND — ルート上に新しいQUESTが見つかった */
function SideFound({ quest, detour, destZone, added, onAdd, onClose }: { quest: Quest; detour: number; destZone: string; added: boolean; onAdd: () => void; onClose: () => void }) {
  const { lang } = useGame();
  const [open, setOpen] = useState(false);
  const story = useMemo(() => quest.description[lang], [quest, lang]);
  return (
    <div className="fixed inset-x-3 bottom-24 z-[65] mx-auto max-w-md md:bottom-8">
      <div className="paper anim-unfold relative overflow-hidden border-2 border-forest">
        <button onClick={onClose} className="absolute right-3 top-3 z-10 text-muted hover:text-ink" aria-label="close">
          <X className="h-4 w-4" />
        </button>
        {open && <QuestMedia quest={quest} className="h-32 border-b border-ink/40" />}
        <div className="p-5">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.3em] text-forest">
            <Signpost className="h-4 w-4" /> SIDE QUEST FOUND
          </div>
          <div className="mt-2 font-mincho text-2xl font-bold">{quest.title[lang]}</div>
          <p className="mt-1 font-mincho text-sm text-muted">{lang === "ja" ? `あなたの${destZone}へのルート上に、新しいQUESTがあります。` : `A new quest lies on your route to ${destZone}.`}</p>
          {open && <p className="mt-3 whitespace-pre-line border-l-2 border-forest/50 pl-3 font-mincho text-sm leading-relaxed">{story}</p>}
          <div className="mt-3 flex gap-5 font-mono text-sm">
            <span className="font-bold">+{quest.exp} EXP</span>
            <span className="text-muted">
              {lang === "ja" ? "追加時間 約" : "+"}
              {detour}
              {lang === "ja" ? "分" : " min"}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {!open ? (
              <button onClick={() => setOpen(true)} className="btn-ghost py-2.5 text-[11px]">
                {lang === "ja" ? "SIDE QUESTを見る" : "VIEW"}
              </button>
            ) : (
              <button onClick={onClose} className="btn-ghost py-2.5 text-[11px]">
                {lang === "ja" ? "今回は寄らない" : "NOT THIS TIME"}
              </button>
            )}
            <button onClick={onAdd} className="btn-primary py-2.5 text-[11px]">
              {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {lang === "ja" ? "寄り道する" : "DETOUR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
