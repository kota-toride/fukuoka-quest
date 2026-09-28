"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { LogoMark } from "@/components/AppChrome";
import { WorldMap } from "@/components/WorldMap";

// ハッカソンのクロージング用スライド（← → / クリックで進む）

type Slide = { key: string; render: () => React.ReactNode };

const Line = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <div className={`anim-fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

const SLIDES: Slide[] = [
  {
    key: "not-lacking",
    render: () => (
      <div className="text-center">
        <Line className="font-mincho text-2xl text-paper/70 md:text-4xl">福岡には観光資源がないのではない。</Line>
        <Line delay={900} className="mt-8 font-mincho text-4xl font-bold leading-tight md:text-6xl">
          <span className="inline-block text-brass-2">まだQUESTに</span>
          <span className="inline-block">
            <span className="text-brass-2">なっていない</span>だけだ。
          </span>
        </Line>
      </div>
    ),
  },
  {
    key: "resources",
    render: () => (
      <div className="font-mincho text-2xl leading-[2.2] md:text-4xl">
        <Line className="text-paper/70">福岡には、</Line>
        {["空いている時間、", "余っている商品、", "今日しかない体験、", "知られていない場所、", "地域の人しか知らない文化がある。"].map((t, i) => (
          <Line key={t} delay={400 + i * 450} className="font-bold">
            {t}
          </Line>
        ))}
      </div>
    ),
  },
  {
    key: "ai",
    render: () => (
      <div className="text-center">
        <Line className="font-hud text-sm font-bold tracking-[0.5em] text-brass-2">AI GAME MASTER</Line>
        <Line delay={400} className="mt-6 font-mincho text-4xl font-bold leading-tight md:text-6xl">
          <span className="inline-block">それらを、</span>
          <span className="inline-block text-brass-2">AIがQUESTに変える。</span>
        </Line>
      </div>
    ),
  },
  {
    key: "move",
    render: () => (
      <div className="font-mincho text-2xl leading-[2.2] md:text-4xl">
        <Line className="font-bold">人がQUESTを求めて移動する。</Line>
        {["店に行く。", "地域を歩く。", "特産品を知る。", "新しい地域を発見する。"].map((t, i) => (
          <Line key={t} delay={600 + i * 450} className="text-paper/70">
            {t}
          </Line>
        ))}
      </div>
    ),
  },
  {
    key: "model",
    render: () => (
      <div className="w-full max-w-4xl">
        <Line className="font-hud text-sm font-bold tracking-[0.5em] text-brass-2">BUSINESS MODEL</Line>
        <Line delay={200} className="mt-3 font-mincho text-3xl font-bold md:text-4xl">
          ユーザーにはゲームとして。地域には経済として。
        </Line>
        <div className="mt-10 grid gap-3 md:grid-cols-5">
          {[
            ["01", "店舗QUEST掲載料", "月額でQUESTを掲載"],
            ["02", "QUESTスポンサー", "企業がQUEST・報酬を提供"],
            ["03", "送客手数料", "QUEST経由の来店・購入"],
            ["04", "自治体・観光団体", "地域回遊促進システム"],
            ["05", "特産品タイアップ", "体験事業者・メーカー"],
          ].map(([n, t, d], i) => (
            <Line key={n} delay={400 + i * 150} className="border border-paper/25 p-4">
              <div className="font-hud text-xs text-paper/50">{n}</div>
              <div className="mt-2 font-mincho font-bold">{t}</div>
              <div className="mt-1 text-xs text-paper/70">{d}</div>
            </Line>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "future",
    render: () => (
      <div className="w-full max-w-4xl">
        <Line className="font-hud text-sm font-bold tracking-[0.5em] text-brass-2">NEXT</Line>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {[
            ["REALTIME", "天気・イベント・POS・在庫・交通データから、QUESTが自動で発生する"],
            ["MULTILINGUAL", "日本語・英語・韓国語・中国語。世界中の冒険者を福岡へ"],
            ["MOBILITY", "QUEST需要が高まった地域に、シャトルや周遊ルートを組み合わせる"],
            ["JAPAN QUEST", "最初はFUKUOKA。いずれ、日本全体を現実世界のRPGに"],
          ].map(([t, d], i) => (
            <Line key={t} delay={200 + i * 200} className="border border-paper/25 p-5">
              <div className="font-hud text-sm font-bold tracking-[0.3em] text-brass-2">{t}</div>
              <div className="mt-2 text-sm text-paper/70">{d}</div>
            </Line>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "final",
    render: () => (
      <div className="text-center">
        <Line className="font-mincho text-xl text-paper/70 md:text-3xl">「人を観光地に送る」のではなく、</Line>
        <Line delay={700} className="mt-6 font-mincho text-4xl font-bold leading-tight md:text-6xl">
          <span className="inline-block text-brass-2">「福岡そのものを</span>
          <span className="inline-block text-brass-2">ゲームにする」。</span>
        </Line>
        <Line delay={1600} className="mt-16 flex flex-col items-center gap-4">
          <LogoMark size={44} light />
          <div className="font-display text-3xl font-black tracking-[0.2em] text-brass-2">FUKUOKA QUEST</div>
          <div className="font-mincho tracking-[0.3em] text-paper/70">福岡県を、現実世界のRPGに。</div>
        </Line>
      </div>
    ),
  },
];

export default function VisionPage() {
  const [i, setI] = useState(0);
  const next = useCallback(() => setI((x) => Math.min(SLIDES.length - 1, x + 1)), []);
  const prev = useCallback(() => setI((x) => Math.max(0, x - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <div className="relative flex h-[100dvh] cursor-pointer flex-col overflow-hidden ink-surface" onClick={next}>
      <WorldMap interactive={false} className="pointer-events-none absolute inset-0 m-auto h-full max-w-5xl opacity-[0.1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,#1c3049_80%)]" />

      <div className="relative z-10 flex items-center justify-between px-5 pt-5" onClick={(e) => e.stopPropagation()}>
        <div className="font-hud text-[11px] tracking-[0.35em] text-paper/50">
          VISION · {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </div>
        <Link href="/" className="text-paper/70 hover:text-paper" aria-label="close">
          <X className="h-5 w-5" />
        </Link>
      </div>

      <div key={SLIDES[i].key} className="relative z-10 flex flex-1 items-center justify-center px-6">
        {SLIDES[i].render()}
      </div>

      <div className="relative z-10 flex items-center justify-center gap-4 pb-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={prev} className="text-paper/70 hover:text-paper" aria-label="previous">
          <ChevronLeft className="h-5 w-5" />
        </button>
        {SLIDES.map((s, n) => (
          <button key={s.key} onClick={() => setI(n)} className={`h-1 transition-all ${n === i ? "w-8 bg-shu" : "w-3 bg-white/20"}`} aria-label={`slide ${n + 1}`} />
        ))}
        <button onClick={next} className="text-paper/70 hover:text-paper" aria-label="next">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
