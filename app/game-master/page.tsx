"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, EyeOff, Feather, Fish, Loader2, Pin, ScrollText, ShieldCheck, Sprout, Store, Zap } from "lucide-react";
import type { DynamicInput, GenerateResponse, GeneratedQuest, Quest, ResourceInput } from "@/lib/types";
import { useGame } from "@/lib/game/store";
import { ZONES } from "@/lib/data/regions";
import { CATEGORY, KIND } from "@/lib/ui/category";
import { Stars } from "@/components/QuestCard";
import { Media } from "@/components/Media";

type Mode = "resource" | "dynamic";

/** デモ用の REAL WORLD SIGNAL（ワンタップで入力できる） */
const SIGNALS: { mode: Mode; icon: typeof Sprout; who: string; say: string; resource?: ResourceInput; dynamic?: DynamicInput }[] = [
  {
    mode: "resource",
    icon: Sprout,
    who: "八女の茶農家",
    say: "今日、茶畑を見学できます",
    resource: { region: "八女", resource: "茶畑", experience: "茶畑見学", hours: "10:00〜16:00", audience: "観光客・学生", feature: "生産者が直接説明する・観光ガイド未掲載" },
  },
  {
    mode: "dynamic",
    icon: Store,
    who: "博多の飲食店",
    say: "17:00〜19:00 限定メニュー",
    dynamic: { businessName: "博多○○食堂", region: "博多", startAt: "17:00", endAt: "19:00", item: "博多明太炙り", quantity: 20, exp: 500, points: 50, internalReason: "idle_time", note: "" },
  },
  {
    mode: "resource",
    icon: Fish,
    who: "糸島の漁港",
    say: "今朝の水揚げを見せられます",
    resource: { region: "糸島", resource: "玄界灘の朝獲れ魚", experience: "水揚げ見学", hours: "07:00〜10:00", audience: "誰でも", feature: "漁師が直接説明する" },
  },
];

const ANALYZE = {
  resource: ["REAL WORLD SIGNAL を受信…", "地域と資源を読み解いています…", "物語性・希少性を評価中…", "難易度とEXPを算出中…", "依頼書を書いています（JA / EN）…"],
  dynamic: ["店舗からの SIGNAL を受信…", "時間窓を解析中…", "プレイヤー向けの言葉に変換中…", "内部事情をフィルタリング中…", "LIMITED QUEST の依頼書を書いています…"],
};

export default function GameMasterPage() {
  const { lang } = useGame();
  const [mode, setMode] = useState<Mode>("resource");
  const [engine, setEngine] = useState<"ai" | "demo" | null>(null);
  const [preset, setPreset] = useState<{ r?: ResourceInput; d?: DynamicInput; n: number }>({ r: SIGNALS[0].resource, n: 0 });

  useEffect(() => {
    fetch("/api/game-master")
      .then((r) => r.json())
      .then((d) => setEngine(d.mode))
      .catch(() => setEngine("demo"));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label flex items-center gap-2">
            <Feather className="h-3.5 w-3.5" /> AI GAME MASTER
          </div>
          <h1 className="mt-2 font-mincho text-3xl font-bold leading-snug md:text-4xl">{lang === "ja" ? "福岡で起きていることを、QUESTに変える。" : "Turn what happens in Fukuoka into quests."}</h1>
          <p className="mt-1 text-sm text-muted">{lang === "ja" ? "地域・店舗・生産者から届いた情報を、AIが冒険の依頼書に書き換え、QUEST BOARDに掲示する。" : "Signals from locals become quest requests posted on the board."}</p>
        </div>
        {engine && <span className="stamp-rect !text-ink-2">{engine === "ai" ? "AI LIVE · CLAUDE" : "DEMO MODE"}</span>}
      </div>

      {/* REAL WORLD SIGNAL */}
      <section className="mt-8">
        <div className="label">REAL WORLD SIGNAL — {lang === "ja" ? "いま届いている地域の声" : "INCOMING"}</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {SIGNALS.map((s, i) => (
            <button
              key={s.who}
              onClick={() => {
                setMode(s.mode);
                setPreset({ r: s.resource, d: s.dynamic, n: Date.now() });
              }}
              className="paper-flat group flex items-center gap-3 p-4 text-left transition hover:border-ink"
            >
              <s.icon className="h-6 w-6 shrink-0 text-earth" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <div className="font-mincho font-bold">{s.who}</div>
                <div className="font-mincho text-sm text-muted">「{s.say}」</div>
              </div>
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted group-hover:text-ink">{i === 1 ? "DYNAMIC" : "QUEST"} →</span>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-8 inline-grid grid-cols-2 border border-ink">
        {(
          [
            { id: "resource", icon: Sprout, ja: "地域資源 → QUEST", en: "RESOURCE → QUEST" },
            { id: "dynamic", icon: Zap, ja: "店舗 → DYNAMIC QUEST", en: "STORE → DYNAMIC" },
          ] as const
        ).map((t) => (
          <button key={t.id} onClick={() => setMode(t.id)} className={`flex items-center justify-center gap-2 px-5 py-3 font-mono text-[11px] font-semibold tracking-[0.12em] transition ${mode === t.id ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}>
            <t.icon className="h-4 w-4" /> {t[lang]}
          </button>
        ))}
      </div>

      {mode === "resource" ? <ResourceForge key={`r-${preset.n}`} initial={preset.r ?? SIGNALS[0].resource!} /> : <DynamicForge key={`d-${preset.n}`} initial={preset.d ?? SIGNALS[1].dynamic!} />}
    </div>
  );
}

// ============================================================
// 地域資源 → QUEST
// ============================================================
function ResourceForge({ initial }: { initial: ResourceInput }) {
  const [input, setInput] = useState<ResourceInput>(initial);
  const gen = useGenerate();
  const set = (k: keyof ResourceInput) => (e: React.ChangeEvent<HTMLInputElement>) => setInput({ ...input, [k]: e.target.value });

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.25fr] [&>*]:min-w-0">
      <form
        className="paper space-y-4 self-start p-5"
        onSubmit={(e) => {
          e.preventDefault();
          gen.run({ mode: "resource", input });
        }}
      >
        <div className="label">REGION DATA — {"地域・事業者の入力"}</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="地域" value={input.region} onChange={set("region")} />
          <Field label="資源" value={input.resource} onChange={set("resource")} />
        </div>
        <Field label="体験内容" value={input.experience} onChange={set("experience")} />
        <Field label="時間" value={input.hours} onChange={set("hours")} />
        <Field label="開催条件・特徴" value={input.feature} onChange={set("feature")} />
        <Field label="対象" value={input.audience} onChange={set("audience")} />
        <button type="submit" disabled={gen.loading} className="btn-primary w-full py-3.5 text-sm">
          {gen.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Feather className="h-4 w-4" />} GENERATE QUEST
        </button>
      </form>

      <div id="gm-result" className="scroll-mt-20">
        {gen.loading && <Analyzing lines={ANALYZE.resource} />}
        {!gen.loading && !gen.result && <Idle />}
        {!gen.loading && gen.result && <ResultCard res={gen.result} kind="resource" region={input.region} signal={`${input.region}：${input.resource}（${input.experience}）`} />}
      </div>
    </div>
  );
}

// ============================================================
// 店舗 → DYNAMIC QUEST
// ============================================================
function DynamicForge({ initial }: { initial: DynamicInput }) {
  const [input, setInput] = useState<DynamicInput>(initial);
  const gen = useGenerate();
  const set = (k: keyof DynamicInput, num = false) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setInput({ ...input, [k]: num ? Number(e.target.value) : e.target.value });

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.25fr] [&>*]:min-w-0">
      <form
        className="paper space-y-4 self-start p-5"
        onSubmit={(e) => {
          e.preventDefault();
          gen.run({ mode: "dynamic", input });
        }}
      >
        <div className="label flex items-center gap-2">
          <Store className="h-3.5 w-3.5" /> STORE CONSOLE — 事業者用
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="店舗" value={input.businessName} onChange={set("businessName")} />
          <Field label="エリア" value={input.region} onChange={set("region")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="開始" type="time" value={input.startAt} onChange={set("startAt")} />
          <Field label="終了" type="time" value={input.endAt} onChange={set("endAt")} />
        </div>
        <Field label="限定メニュー" value={input.item} onChange={set("item")} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="提供可能数" type="number" value={input.quantity} onChange={set("quantity", true)} />
          <Field label="EXP" type="number" value={input.exp} onChange={set("exp", true)} />
          <Field label="POINT" type="number" value={input.points} onChange={set("points", true)} />
        </div>

        <div className="border border-dashed border-shu/60 bg-shu/[0.04] p-3">
          <label className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-shu">
            <EyeOff className="h-3.5 w-3.5" /> 掲載の目的（プレイヤーには非表示）
          </label>
          <select value={input.internalReason} onChange={set("internalReason")} className="mt-2 w-full border border-ink/30 bg-card px-3 py-2 text-sm outline-none focus:border-ink">
            <option value="idle_time">来店の少ない時間帯に来てほしい</option>
            <option value="surplus">当日提供できる商品を今日中に届けたい</option>
            <option value="new_menu">新メニューを知ってほしい</option>
            <option value="event">イベントに合わせたい</option>
          </select>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">この欄はAIの判断にのみ使われ、プレイヤー画面には一切表示されません。</p>
        </div>

        <button type="submit" disabled={gen.loading} className="btn-shu w-full py-3.5 text-sm">
          {gen.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} GENERATE LIMITED QUEST
        </button>
      </form>

      <div id="gm-result" className="scroll-mt-20">
        {gen.loading && <Analyzing lines={ANALYZE.dynamic} />}
        {!gen.loading && !gen.result && <Idle dynamic />}
        {!gen.loading && gen.result && <ResultCard res={gen.result} kind="dynamic" region={input.region} dynamic={input} signal={`${input.region}の飲食店：${input.startAt}〜${input.endAt} 限定メニュー`} />}
      </div>
    </div>
  );
}

// ============================================================
// 共通
// ============================================================
function useGenerate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const run = async (body: unknown) => {
    setLoading(true);
    setResult(null);
    if (window.innerWidth < 1024) setTimeout(() => document.getElementById("gm-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    const minDelay = new Promise((r) => setTimeout(r, 2200));
    try {
      const [res] = await Promise.all([fetch("/api/game-master", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()), minDelay]);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };
  return { loading, result, run };
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-muted">{label}</span>
      <input {...props} className="mt-1 w-full border-b-[1.5px] border-ink/40 bg-transparent px-1 py-2 font-mincho text-[15px] outline-none transition focus:border-ink" />
    </label>
  );
}

function Idle({ dynamic }: { dynamic?: boolean }) {
  return (
    <div className="grid h-full min-h-[420px] place-items-center border-2 border-dashed border-ink/25 p-8 text-center">
      <div>
        <Feather className="mx-auto h-10 w-10 text-ink/40" strokeWidth={1.2} />
        <p className="mt-4 font-mono text-[11px] tracking-[0.3em] text-muted">AWAITING SIGNAL</p>
        <p className="mt-2 font-mincho text-sm text-muted">{dynamic ? "店舗の情報から、今だけのQUESTが発生する。" : "地域の資源を入力すると、AIが冒険の依頼書に変える。"}</p>
      </div>
    </div>
  );
}

function Analyzing({ lines }: { lines: string[] }) {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setN((x) => Math.min(lines.length, x + 1)), 400);
    return () => clearInterval(id);
  }, [lines.length]);
  return (
    <div className="paper min-h-[420px] p-6">
      <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.25em] text-forest">
        <Loader2 className="h-4 w-4 animate-spin" /> GAME MASTER {"が依頼書を書いています"}
      </div>
      <div className="mt-6 space-y-2.5 font-mincho">
        {lines.slice(0, n).map((l, i) => (
          <div key={i} className={`anim-fade-in ${i === n - 1 ? "text-ink" : "text-muted"}`}>
            {i < n - 1 ? "✓ " : "— "}
            {l}
          </div>
        ))}
      </div>
      <div className="mt-10 h-1 bg-ink/10">
        <div className="h-full bg-forest transition-[width] duration-300" style={{ width: `${(n / lines.length) * 100}%` }} />
      </div>
    </div>
  );
}

function matchZone(region: string) {
  const r = region.replace(/[市町村区]$/, "");
  return ZONES.find((z) => z.ja.includes(r) || r.includes(z.ja.split("・")[0]))?.id ?? "fukuoka";
}

function toQuest(g: GeneratedQuest, source: "ai" | "demo", region: string, dynamic?: DynamicInput): Quest {
  const zone = matchZone(region);
  const isDyn = !!dynamic;
  return {
    id: `gm-${Date.now().toString(36)}`,
    title: g.title,
    tagline: g.tagline,
    description: g.story,
    region: zone,
    category: g.category,
    kind: g.kind,
    difficulty: g.difficulty,
    exp: g.exp,
    points: g.points,
    duration: g.duration,
    startAt: isDyn ? dynamic!.startAt : g.recommendedTime.match(/\d{1,2}:\d{2}/)?.[0],
    endAt: isDyn ? dynamic!.endAt : g.recommendedTime.match(/\d{1,2}:\d{2}.*?(\d{1,2}:\d{2})/)?.[1],
    reward: g.reward,
    objectives: g.objectives,
    image: isDyn ? "/images/quests/hakata-night.jpg" : zone === "yame" ? "/images/quests/yame-tea.jpg" : undefined,
    video: isDyn ? "/videos/quest-dynamic.mp4" : zone === "yame" ? "/videos/quest-yame.mp4" : undefined,
    isHidden: g.kind === "HIDDEN",
    isDynamic: isDyn,
    slots: dynamic?.quantity,
    travelMinutes: zone === "fukuoka" ? 10 : 45,
    cost: 0,
    generatedBy: source,
    createdAt: Date.now(),
    inventory: dynamic?.quantity,
  };
}

function ResultCard({ res, kind, region, dynamic, signal }: { res: GenerateResponse; kind: Mode; region: string; dynamic?: DynamicInput; signal: string }) {
  const { lang, publishQuest } = useGame();
  const [published, setPublished] = useState<Quest | null>(null);
  const [spawn, setSpawn] = useState(false);
  const q = res.quest;
  const cat = CATEGORY[q.category];
  const k = KIND[q.kind];
  const color = kind === "dynamic" ? "#b3432f" : k.color;

  const publish = () => {
    const quest = toQuest(q, res.source, region, dynamic);
    if (kind === "dynamic") {
      setPublished(quest);
      setSpawn(true);
    } else setPublished(publishQuest(quest));
  };

  return (
    <div className="space-y-4">
      {/* SIGNAL → GM → QUEST */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-ink-2">
        <span className="border border-ink/40 px-2 py-1">REAL WORLD SIGNAL · {signal}</span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span className="border border-ink/40 px-2 py-1">AI GAME MASTER</span>
        <ArrowRight className="h-3.5 w-3.5" />
        <span className="px-2 py-1 text-paper" style={{ background: color }}>
          NEW QUEST GENERATED
        </span>
      </div>

      {kind === "dynamic" && dynamic && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-dashed border-shu/60 p-4">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-shu">
              <EyeOff className="h-3.5 w-3.5" /> 事業者だけが見る情報
            </div>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              <li>店舗：{dynamic.businessName}</li>
              <li>提供可能数：{dynamic.quantity}食</li>
              <li>目的：{{ idle_time: "来店の少ない時間帯の集客", surplus: "当日商品の提供", new_menu: "新メニュー認知", event: "イベント連動" }[dynamic.internalReason]}</li>
            </ul>
          </div>
          <div className="border border-forest/60 bg-forest/[0.04] p-4">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-forest">
              <ShieldCheck className="h-3.5 w-3.5" /> プレイヤーが見る情報
            </div>
            <p className="mt-2 text-xs text-muted">「限定QUESTが発生した」というゲーム体験だけ。内部事情はすべて除外済み。</p>
          </div>
        </div>
      )}

      {/* 生成された依頼書 */}
      <div className="paper pin anim-unfold relative overflow-hidden" style={{ borderTop: `5px solid ${color}` }}>
        <Media scene={cat.scene} seed={q.title.ja} tint={cat.color} image={kind === "dynamic" ? "/images/quests/hakata-night.jpg" : undefined} className="h-36 border-b border-ink/40">
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="tag bg-card" style={{ color }}>
              {kind === "dynamic" ? "LIMITED QUEST" : q.kind === "STANDARD" ? "QUEST" : `${k.label} QUEST`}
            </span>
            <span className="tag bg-card text-ink-2">{res.source === "ai" ? "GENERATED BY AI" : "DEMO GENERATED"}</span>
          </div>
        </Media>
        <div className="p-5">
          <h2 className="font-mincho text-3xl font-bold leading-tight">「{q.title[lang]}」</h2>
          <p className="mt-1 font-display italic text-ink-2">{q.title[lang === "ja" ? "en" : "ja"]}</p>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y-[1.5px] border-ink py-4 sm:grid-cols-4">
            <KV label="CATEGORY" value={<span style={{ color: cat.color }}>{cat.label}</span>} />
            <KV label="DIFFICULTY" value={<Stars n={q.difficulty} />} />
            <KV label="EXP" value={`+${q.exp}`} />
            <KV label="POINT" value={<span className="text-brass">+{q.points}</span>} />
            <KV label={lang === "ja" ? "所要時間" : "DURATION"} value={`${lang === "ja" ? "約" : "~"}${q.duration}${lang === "ja" ? "分" : " min"}`} />
            <KV label={lang === "ja" ? "推奨時間" : "BEST TIME"} value={q.recommendedTime} />
            <KV label="REWARD" value={q.reward[lang]} wide />
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div>
              <div className="label">QUEST STORY — 日本語</div>
              <p className="mt-2 whitespace-pre-line font-mincho text-[15px] leading-relaxed">{q.story.ja}</p>
            </div>
            <div>
              <div className="label">QUEST STORY — ENGLISH</div>
              <p className="mt-2 whitespace-pre-line font-display text-[15px] italic leading-relaxed text-ink-2">{q.story.en}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted">
            {lang === "ja" ? "称号" : "Title"}：<span className="font-mincho font-bold text-shu">「{q.titleReward[lang]}」</span>
          </div>

          {!published ? (
            <button onClick={publish} className={`${kind === "dynamic" ? "btn-shu" : "btn-primary"} mt-5 w-full py-3.5 text-sm`}>
              <Pin className="h-4 w-4" /> {kind === "dynamic" ? "今すぐQUESTを発生させる" : "QUEST BOARDに掲示する"}
            </button>
          ) : (
            <Link href={`/quests/${published.id}`} className="btn-ghost mt-5 w-full py-3 text-xs">
              <ScrollText className="h-4 w-4" /> {lang === "ja" ? "掲示された依頼書を見る" : "VIEW POSTED QUEST"} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <details className="paper-flat p-4 text-sm" open>
        <summary className="cursor-pointer font-mono text-[10px] font-bold tracking-[0.25em] text-ink-2">GAME MASTER LOG（事業者向け）</summary>
        <ul className="mt-3 space-y-1.5 font-mono text-xs text-muted">
          {res.reasoning.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span>›</span>
              {r}
            </li>
          ))}
        </ul>
      </details>

      {spawn && published && (
        <DynamicSpawn
          quest={published}
          signal={signal}
          onDone={() => {
            setSpawn(false);
            setPublished(publishQuest(published));
          }}
        />
      )}
    </div>
  );
}

function KV({ label, value, wide }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="font-mono text-[9px] font-semibold tracking-[0.2em] text-muted">{label}</div>
      <div className="mt-0.5 font-mincho text-sm font-bold">{value}</div>
    </div>
  );
}

/** Dynamic QUEST 発生演出：REAL WORLD SIGNAL → GAME MASTER → LIMITED QUEST（紙が掲示される） */
function DynamicSpawn({ quest, signal, onDone }: { quest: Quest; signal: string; onDone: () => void }) {
  const { lang } = useGame();
  const [step, setStep] = useState(0);
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };
  useEffect(() => {
    const ts = [setTimeout(() => setStep(1), 900), setTimeout(() => setStep(2), 1900)];
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-navy/90 p-4 anim-fade-in">
      <div className="w-full max-w-md text-center">
        <div className="paper-flat anim-fade-up p-4">
          <div className="label">REAL WORLD SIGNAL</div>
          <div className="mt-1 font-mincho font-bold">{signal}</div>
        </div>
        {step >= 1 && (
          <div className="anim-fade-up py-4 font-mono text-[10px] font-semibold tracking-[0.3em] text-paper/80">
            <ArrowDown className="mx-auto mb-1 h-4 w-4" />
            <Feather className="mx-auto h-6 w-6 text-brass-2" strokeWidth={1.4} />
            AI GAME MASTER
            <ArrowDown className="mx-auto mt-1 h-4 w-4" />
          </div>
        )}
        {step >= 2 && (
          <div className="paper pin anim-unfold relative p-6" style={{ borderTop: "5px solid #b3432f" }}>
            <div className="font-mono text-[11px] font-bold tracking-[0.3em] text-shu">⚡ LIMITED QUEST</div>
            <div className="mt-2 font-mincho text-3xl font-bold">{quest.title[lang]}</div>
            <div className="mt-2 font-mono text-sm">
              {quest.startAt} — {quest.endAt} · <b>+{quest.exp} EXP</b> · <b className="text-brass">+{quest.points} PT</b>
            </div>
            <div className="mt-2 font-mincho text-sm text-muted">{lang === "ja" ? "このQUESTは、今だけ発生している。" : "This quest exists only right now."}</div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/quests" onClick={finish} className="btn-shu px-6 py-3 text-xs">
                <ScrollText className="h-4 w-4" /> QUEST BOARD
              </Link>
              <button onClick={finish} className="btn-ghost px-5 py-3 text-xs">
                {lang === "ja" ? "閉じる" : "CLOSE"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
