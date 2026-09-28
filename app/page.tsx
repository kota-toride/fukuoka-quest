"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowDown, Car, TrainFront, Signpost, Feather, Store, Sprout, Compass as CompassIcon } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { useAssets } from "@/lib/assets";
import { LogoMark } from "@/components/AppChrome";
import { QuestRow } from "@/components/QuestCard";
import { WorldMap } from "@/components/WorldMap";
import { Scene, SCENES, SCENE_ORDER } from "@/components/Scene";
import { Compass } from "@/components/hud";
import { basicOptions, PREFERENCES } from "@/lib/game/route";
import { formatMinutes } from "@/lib/game/rules";
import { TOTAL_MUNICIPALITIES } from "@/lib/data/regions";

const HERO_IMAGES = ["/images/hero/hero-1.jpg", "/images/hero/hero-2.jpg", "/images/hero/hero-3.jpg", "/images/hero/hero-4.jpg", "/images/hero/hero-5.jpg", "/images/hero/hero-6.jpg", "/images/hero/hero-7.jpg"];

const FLOW = [
  { en: "FIND", ja: "QUESTを見つける" },
  { en: "PLAN", ja: "AIが冒険ルートを提案", isNew: true },
  { en: "GO", ja: "現地へ向かう" },
  { en: "DISCOVER", ja: "途中でSIDE QUEST" },
  { en: "PLAY", ja: "体験する" },
  { en: "CLEAR", ja: "朱印が押される" },
  { en: "LEVEL UP", ja: "EXPが貯まる" },
  { en: "REWARD", ja: "福岡の特産品" },
];

export default function Home() {
  const { lang, setLang, quests, isRevealed } = useGame();
  const { has } = useAssets();
  const heroVideo = has("/videos/hero-fukuoka.mp4") ? "/videos/hero-fukuoka.mp4" : undefined;
  const heroImages = HERO_IMAGES.filter((p) => has(p));
  const [cut, setCut] = useState(0);

  useEffect(() => {
    if (heroVideo) return;
    const id = setInterval(() => setCut((c) => c + 1), 4600);
    return () => clearInterval(id);
  }, [heroVideo]);

  const sceneId = SCENE_ORDER[cut % SCENE_ORDER.length];
  const scene = SCENES[sceneId];
  const liveCount = quests.filter((q) => q.isDynamic).length;
  const board = ["hakata-night", "yame-tea", "genkai-catch"].map((id) => quests.find((q) => q.id === id)!).filter(Boolean);
  const yame = basicOptions("yame")!;
  const hiddenCount = quests.filter((q) => q.isHidden && !isRevealed(q)).length;

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative flex h-[100dvh] min-h-[640px] flex-col overflow-hidden bg-paper-2">
        <div className="absolute inset-0">
          {heroVideo ? (
            <video className="h-full w-full object-cover" src={heroVideo} autoPlay muted loop playsInline poster={heroImages[0]} />
          ) : heroImages.length ? (
            <img key={cut} src={heroImages[cut % heroImages.length]} alt="" className="h-full w-full object-cover anim-fade-in anim-slow-pan" />
          ) : (
            SCENE_ORDER.map((id, i) => (
              <div key={id} className="absolute inset-0 transition-opacity duration-[1400ms]" style={{ opacity: i === cut % SCENE_ORDER.length ? 1 : 0 }}>
                <Scene id={id} animate className="h-full w-full" />
              </div>
            ))
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,48,73,.35)_0%,transparent_22%,transparent_70%,rgba(28,48,73,.55)_100%)]" />
        </div>

        {/* top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-5 md:px-10">
          <div className="flex items-center gap-2.5 text-paper">
            <LogoMark size={28} light />
            <span className="font-mono text-[10px] font-medium tracking-[0.35em]">REAL WORLD RPG · FUKUOKA PREF.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/quests" className="hidden items-center gap-2 bg-paper/90 px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] text-ink sm:flex">
              <span className="h-2 w-2 rounded-full bg-shu" />
              {lang === "ja" ? `いま福岡で ${liveCount} 件の限定QUESTが発生中` : `${liveCount} LIMITED QUESTS NOW`}
            </Link>
            <button onClick={() => setLang(lang === "ja" ? "en" : "ja")} className="bg-paper/90 px-2 py-1.5 font-mono text-[10px] font-semibold tracking-widest text-ink">
              {lang === "ja" ? "EN" : "JA"}
            </button>
          </div>
        </div>

        {/* 表紙のカルトゥーシュ */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-5">
          <div className="paper anim-unfold relative w-full max-w-xl px-6 py-9 text-center md:px-12 md:py-12">
            <div className="pointer-events-none absolute inset-2.5 border border-ink/70" />
            <div className="pointer-events-none absolute inset-4 border border-ink/25" />
            <div className="relative">
              <div className="label">FUKUOKA PREFECTURE · {TOTAL_MUNICIPALITIES} AREAS · ∞ QUESTS</div>
              <h1 className="display mt-4 text-[15vw] font-extrabold leading-[0.88] tracking-[0.02em] sm:text-7xl md:text-[5.6rem]">
                FUKUOKA
                <br />
                <span className="text-forest">QUEST</span>
              </h1>
              <div className="mx-auto mt-5 flex max-w-xs items-center gap-3">
                <span className="h-px flex-1 bg-ink/40" />
                <Compass size={26} className="text-ink" animate />
                <span className="h-px flex-1 bg-ink/40" />
              </div>
              <p className="mt-5 font-mincho text-xl font-bold leading-relaxed tracking-[0.12em] md:text-2xl">
                <span className="inline-block">福岡県を、</span>
                <span className="inline-block">現実世界のRPGに。</span>
              </p>
              <p className="mt-2 font-mincho text-[15px] tracking-[0.2em] text-muted">
                <span className="inline-block">観光するのではなく、</span>
                <span className="inline-block">冒険する。</span>
              </p>
              <Link href="/map" className="btn-primary mt-8 px-9 py-4 text-sm md:text-base">
                <CompassIcon className="h-5 w-5" /> START ADVENTURE
              </Link>
            </div>
          </div>
        </div>

        {/* シーンのキャプション */}
        <div className="relative z-10 flex items-end justify-between gap-4 px-5 pb-5 text-paper md:px-10">
          <div key={sceneId} className="anim-fade-in font-mono text-[10px] tracking-[0.25em]">
            <div className="opacity-70">
              FIELD {String((cut % SCENE_ORDER.length) + 1).padStart(2, "0")} / {String(SCENE_ORDER.length).padStart(2, "0")} · {scene.coord}
            </div>
            <div className="mt-1 text-sm font-semibold tracking-[0.2em]">
              {scene.en} <span className="font-mincho tracking-[0.1em]">— {scene.ja}</span>
            </div>
          </div>
          <a href="#game" className="flex flex-col items-center gap-1 font-mono text-[10px] tracking-[0.3em] opacity-80 hover:opacity-100">
            SCROLL <ArrowDown className="h-4 w-4 anim-drift" />
          </a>
        </div>
      </section>

      {/* ================= THE GAME ================= */}
      <section id="game" className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
        <SectionLabel n="01" t="THE GAME" />
        <div className="mt-5 grid gap-10 md:grid-cols-[1.1fr_1fr]">
          <h2 className="font-mincho text-4xl font-bold leading-tight md:text-6xl">
            検索しない。
            <br />
            <span className="text-forest">冒険する。</span>
          </h2>
          <div className="space-y-4 font-mincho text-[17px] leading-loose text-ink-2">
            <p>FUKUOKA QUESTは観光地の一覧ではありません。</p>
            <p>福岡県全体がひとつのゲームフィールド。</p>
            <p>QUESTを見つけ、ルートを選び、現地へ向かい、体験した瞬間にCLEAR。</p>
            <p>経験値が貯まり、レベルが上がり、福岡の特産品などが報酬になります。</p>
          </div>
        </div>

        {/* QUEST FLOW：点線の旅路 */}
        <div className="mt-16">
          <div className="label">QUEST FLOW</div>
          <ol className="relative mt-6 grid grid-cols-1 gap-0 md:grid-cols-8">
            <div className="absolute bottom-6 left-[19px] top-6 w-0 border-l-2 border-dashed border-ink/40 md:bottom-auto md:left-6 md:right-6 md:top-[19px] md:h-0 md:w-auto md:border-l-0 md:border-t-2" />
            {FLOW.map((s, i) => (
              <li key={s.en} className="relative flex items-center gap-4 py-2.5 anim-fade-up md:flex-col md:items-start md:gap-3 md:py-0" style={{ animationDelay: `${i * 90}ms` }}>
                <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-mono text-xs font-bold ${s.isNew ? "border-shu bg-shu text-paper" : "border-ink bg-paper"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.18em]">
                    {s.en}
                    {s.isNew && <span className="tag !px-1.5 !py-0 text-shu">NEW</span>}
                  </div>
                  <div className="mt-0.5 font-mincho text-[13px] text-muted">{s.ja}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= WORLD MAP ================= */}
      <section className="border-y border-ink/80 bg-paper-2">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-[1fr_1.35fr] md:py-28">
          <div>
            <SectionLabel n="02" t="WORLD MAP" />
            <h2 className="mt-5 font-mincho text-3xl font-bold leading-snug md:text-5xl">
              福岡県全体が、
              <br />
              ひとつの冒険の舞台。
            </h2>
            <p className="mt-5 font-mincho leading-loose text-ink-2">海、山、川、茶畑、港、屋台。60の市町村に、まだ誰もQUESTにしていない物語が眠っている。地図を開き、霧に包まれたエリアを発見していこう。</p>
            <dl className="mt-8 grid grid-cols-3 border-y border-ink/80">
              {[
                [String(TOTAL_MUNICIPALITIES), "AREAS"],
                [String(quests.filter((q) => !q.isSide).length), "QUESTS"],
                [String(hiddenCount), "HIDDEN"],
              ].map(([v, l], i) => (
                <div key={l} className={`py-4 ${i ? "border-l border-ink/30 pl-4" : ""}`}>
                  <dt className="label">{l}</dt>
                  <dd className="display text-4xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/map" className="btn-ghost mt-8 px-6 py-3 text-xs">
              WORLD MAPを開く <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="map-frame anim-map-open bg-paper">
            <WorldMap interactive={false} className="aspect-[1000/880] w-full" />
          </div>
        </div>
      </section>

      {/* ================= QUEST BOARD ================= */}
      <section className="bg-wood bg-[image:var(--grain)] py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-5">
          <div className="text-paper">
            <SectionLabel n="03" t="QUEST BOARD" light />
            <h2 className="mt-4 font-mincho text-3xl font-bold md:text-4xl">いま、福岡で発生している依頼。</h2>
          </div>
          <div className="paper pin relative mt-10 px-5 pb-6 pt-8 md:px-10" style={{ rotate: "-0.6deg" }}>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="display text-2xl font-semibold tracking-[0.06em]">QUEST BOARD</div>
                <div className="label mt-1">TODAY&apos;S ADVENTURES</div>
              </div>
              <span className="stamp-rect">{lang === "ja" ? "本日掲示" : "POSTED TODAY"}</span>
            </div>
            <div className="mt-5">
              {board.map((q, i) => (
                <QuestRow key={q.id} quest={q} index={i} />
              ))}
              <div className="rule" />
            </div>
            <div className="mt-6 flex justify-end">
              <Link href="/quests" className="btn-ghost px-5 py-2.5 text-xs">
                QUEST BOARDへ <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AI ADVENTURE ROUTE ================= */}
      <section className="forest-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
          <div>
            <SectionLabel n="04" t="AI ADVENTURE ROUTE" light />
            <h2 className="mt-5 font-mincho text-3xl font-bold leading-snug md:text-5xl">
              行き方まで、
              <br />
              冒険になる。
            </h2>
            <p className="mt-5 font-mincho leading-loose text-paper/80">
              QUESTを始めると、AI GAME MASTERが目的地までの「冒険ルート」を提案する。最短経路だけではない。途中の町にSIDE QUESTを見つけ、寄り道するかどうかはあなたが決める。移動そのものが、冒険になる。
            </p>
            <div className="mt-8">
              <div className="font-mincho text-lg">どんな冒険をしますか？</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {PREFERENCES.map((p) => (
                  <span key={p.id} className="border border-paper/40 px-3 py-1.5 text-[13px]">
                    {p.glyph} {p.ja}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="paper relative self-start p-5 text-ink md:p-7" style={{ rotate: "0.8deg" }}>
            <div className="flex items-baseline justify-between">
              <div className="display text-xl font-semibold tracking-[0.06em]">ADVENTURE ROUTE</div>
              <span className="label">AI GAME MASTER</span>
            </div>
            <div className="mt-1 font-mincho text-lg font-bold">八女茶の秘密を探れ</div>
            <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
              <span className="text-muted">現在地</span>
              <span className="font-semibold">福岡市（博多駅）</span>
              <span className="text-muted">目的地</span>
              <span className="font-semibold">八女市</span>
            </div>
            <div className="rule mt-4" />
            <RouteLine icon={<Car className="h-4 w-4" />} label="RECOMMENDED ROUTE" sub="車" minutes={yame.car.minutes} />
            <div className="rule-dashed" />
            <RouteLine icon={<TrainFront className="h-4 w-4" />} label="PUBLIC TRANSPORT" sub="電車・バス" minutes={yame.transit.minutes} />
            <div className="rule" />
            <div className="mt-4 border-2 border-forest bg-forest/5 p-4">
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.25em] text-forest">
                <Signpost className="h-4 w-4" /> SIDE QUEST FOUND
              </div>
              <div className="mt-1.5 font-mincho text-lg font-bold">久留米の味を解明せよ</div>
              <div className="mt-1 text-[13px] text-muted">あなたの八女へのルート上に、新しいQUESTがあります。</div>
              <div className="mt-2 flex gap-4 font-mono text-xs font-semibold">
                <span>+300 EXP</span>
                <span className="text-muted">追加時間 約15分</span>
              </div>
            </div>
            <Link href="/quests/yame-tea" className="btn-primary mt-5 w-full py-3 text-xs">
              この冒険を始める <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= AI GAME MASTER ================= */}
      <section className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <SectionLabel n="05" t="AI GAME MASTER" />
        <h2 className="mt-5 font-mincho text-3xl font-bold leading-snug md:text-5xl">
          福岡で起きていることを、
          <br />
          <span className="text-forest">AIがQUESTに変える。</span>
        </h2>
        <div className="mt-12 space-y-6">
          {[
            {
              icon: Sprout,
              who: "八女の茶農家",
              signal: "「今日、茶畑を見学できます」",
              kind: "HIDDEN QUEST",
              color: "#5a3f6b",
              title: "八女茶の秘密を探れ",
              meta: "10:00 — 16:00 · +800 EXP · +100 PT",
            },
            {
              icon: Store,
              who: "博多の飲食店",
              signal: "17:00〜19:00 限定メニュー",
              kind: "LIMITED QUEST",
              color: "#b3432f",
              title: "博多の夜を攻略せよ",
              meta: "17:00 — 19:00 · +500 EXP · +50 PT",
            },
          ].map((r, i) => (
            <div key={r.title} className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr] anim-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="paper-flat flex items-center gap-4 p-5">
                <r.icon className="h-6 w-6 shrink-0 text-earth" strokeWidth={1.5} />
                <div>
                  <div className="label">REAL WORLD SIGNAL</div>
                  <div className="mt-1 font-mincho font-bold">{r.who}</div>
                  <div className="font-mincho text-muted">{r.signal}</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 font-mono text-[10px] font-semibold tracking-[0.25em] text-ink-2 md:flex-col">
                <Feather className="h-5 w-5 text-forest" strokeWidth={1.5} />
                GAME MASTER
                <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
              </div>
              <div className="paper relative p-5" style={{ borderTop: `4px solid ${r.color}` }}>
                <div className="font-mono text-[10px] font-bold tracking-[0.25em]" style={{ color: r.color }}>
                  NEW QUEST GENERATED · {r.kind}
                </div>
                <div className="mt-1 font-mincho text-xl font-bold">「{r.title}」</div>
                <div className="mt-1 font-mono text-xs text-ink-2">{r.meta}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
          プレイヤーに見えるのは「限定QUESTが発生した」というゲーム体験だけ。店舗や生産者の内部事情は、GAME MASTERの判断にだけ使われ、プレイヤー画面には表示されません。
        </p>
        <Link href="/game-master" className="btn-ghost mt-8 px-6 py-3 text-xs">
          AI GAME MASTERを開く <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ================= PLAYER WORLD / REGION WORLD ================= */}
      <section className="border-y border-ink/80 bg-paper-2 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <SectionLabel n="06" t="ONE QUEST, TWO WORLDS" />
          <h2 className="mt-5 font-mincho text-3xl font-bold md:text-4xl">プレイヤーにはゲームとして。地域には経済として。</h2>
          <div className="mt-12 grid items-stretch gap-5 md:grid-cols-[1fr_auto_1fr]">
            <div className="paper p-6">
              <div className="label !text-forest">PLAYER WORLD</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["QUEST", "EXP", "LEVEL", "POINT", "REWARD", "ADVENTURE", "DISCOVERY"].map((w) => (
                  <span key={w} className="border border-ink/70 px-3 py-1.5 font-mono text-xs font-semibold tracking-[0.18em]">
                    {w}
                  </span>
                ))}
              </div>
              <p className="mt-5 font-mincho text-sm leading-relaxed text-muted">「面白そう」「限定だ」「EXPが欲しい」— プレイヤーはゲームを楽しむだけ。</p>
            </div>
            <div className="grid place-items-center">
              <div className="stamp h-28 w-28 text-sm" style={{ rotate: "-8deg" }}>
                <div>
                  <div className="text-[9px]">CONNECTED BY</div>
                  <div className="font-display text-2xl font-extrabold">QUEST</div>
                </div>
              </div>
            </div>
            <div className="paper p-6">
              <div className="label !text-earth">REGION WORLD</div>
              <ol className="mt-4 space-y-1.5 font-mincho">
                {["新しい人が訪れる", "地域を知る", "店舗を利用する", "地域資源が発見される", "地域内を回遊する"].map((t, i, a) => (
                  <li key={t}>
                    <div className="font-bold">{t}</div>
                    {i < a.length - 1 && <div className="pl-2 font-mono text-xs text-dim">↓</div>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINALE ================= */}
      <section className="ink-surface relative overflow-hidden px-5 py-28 text-center md:py-36">
        <div className="contours absolute inset-0 opacity-40 invert" />
        <div className="relative mx-auto max-w-3xl">
          <p className="font-mincho text-xl leading-loose text-paper/75 md:text-2xl">福岡には観光資源がないのではない。</p>
          <p className="mt-3 font-mincho text-3xl font-bold leading-snug md:text-5xl">
            <span className="inline-block">まだQUESTに</span>
            <span className="inline-block">なっていないだけだ。</span>
          </p>
          <div className="mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-3 font-mono text-[11px] font-semibold tracking-[0.2em]">
            {["REAL WORLD", "AI", "QUEST", "ADVENTURE", "PEOPLE", "REGION"].map((w, i, a) => (
              <span key={w} className="flex items-center gap-2">
                <span className={`border px-3 py-1.5 ${w === "QUEST" ? "border-shu bg-shu text-paper" : "border-paper/50"}`}>{w}</span>
                {i < a.length - 1 && <ArrowRight className="h-3.5 w-3.5 opacity-60" />}
              </span>
            ))}
          </div>
          <p className="mt-10 font-mincho text-paper/75">AIが、福岡で起きていることをQUESTに変える。ユーザーはゲームとして冒険する。地域には人の流れが生まれる。</p>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link href="/map" className="btn-shu px-8 py-3.5 text-sm">
              <CompassIcon className="h-4 w-4" /> START ADVENTURE
            </Link>
            <Link href="/vision" className="btn-ghost-light px-6 py-3.5 text-xs">
              VISION <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/80 px-5 py-8 text-center font-mono text-[10px] tracking-[0.3em] text-muted">© FUKUOKA QUEST — HACKATHON PROTOTYPE · MMXXVI</footer>
    </div>
  );
}

function SectionLabel({ n, t, light = false }: { n: string; t: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-[11px] font-semibold tracking-[0.3em] ${light ? "text-paper/80" : "text-ink-2"}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-full border ${light ? "border-paper/60" : "border-ink"}`}>{n}</span>
      {t}
    </div>
  );
}

function RouteLine({ icon, label, sub, minutes }: { icon: React.ReactNode; label: string; sub: string; minutes: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3.5">
      <div>
        <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-ink-2">{label}</div>
        <div className="mt-1 flex items-center gap-2 font-mincho text-lg font-bold">
          {icon} {sub} 約{formatMinutes(minutes)}
        </div>
      </div>
      <div className="text-right font-mono text-xs font-semibold">
        <div>+800 EXP</div>
        <div className="text-brass">+100 PT</div>
      </div>
    </div>
  );
}
