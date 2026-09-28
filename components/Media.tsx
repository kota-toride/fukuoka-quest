"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo } from "react";
import { useAssets } from "@/lib/assets";
import type { SceneId } from "@/lib/ui/category";
import { Scene } from "./Scene";

/**
 * video → image → 福岡の風景イラスト（Scene）→ 等高線アート の順でフォールバックするメディア。
 * /public に置かれたファイルだけが使われるので、素材が無くてもレイアウトは崩れない。
 */
export function Media({
  video,
  image,
  scene,
  seed = "fukuoka",
  tint = "#2e4a3b",
  className = "",
  kenBurns = false,
  alt = "",
  children,
}: {
  video?: string;
  image?: string;
  scene?: SceneId;
  seed?: string;
  tint?: string;
  className?: string;
  kenBurns?: boolean;
  alt?: string;
  children?: React.ReactNode;
}) {
  const { has } = useAssets();
  const v = has(video) ? video : undefined;
  const img = has(image) ? image : undefined;

  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden ${className}`}>
      {v ? (
        <video className="absolute inset-0 h-full w-full object-cover" src={v} poster={img} autoPlay muted loop playsInline preload="auto" />
      ) : img ? (
        <img src={img} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${kenBurns ? "anim-slow-pan" : ""}`} />
      ) : scene ? (
        <Scene id={scene} animate={kenBurns} className="absolute inset-0 h-full w-full" />
      ) : (
        <ContourArt seed={seed} tint={tint} />
      )}
      {children}
    </div>
  );
}

/** 等高線の地形図アート。seed ごとに形が変わる */
export function ContourArt({ seed, tint }: { seed: string; tint: string }) {
  const paths = useMemo(() => contourPaths(seed), [seed]);
  return (
    <div className="absolute inset-0 bg-paper-2">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={tint} strokeOpacity={0.12 + (i % 5) * 0.04} strokeWidth={i % 4 === 0 ? 1.1 : 0.6} />
        ))}
      </svg>
    </div>
  );
}

function contourPaths(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const rnd = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const cx = 150 + rnd() * 160;
  const cy = 90 + rnd() * 120;
  const lobes = 3 + Math.floor(rnd() * 3);
  const phase = rnd() * Math.PI * 2;
  const out: string[] = [];
  for (let ring = 1; ring <= 18; ring++) {
    const r = ring * 14;
    const pts: string[] = [];
    for (let a = 0; a <= 64; a++) {
      const t = (a / 64) * Math.PI * 2;
      const wobble = 1 + 0.18 * Math.sin(lobes * t + phase + ring * 0.25) + 0.07 * Math.sin(7 * t + ring);
      pts.push(`${(cx + Math.cos(t) * r * wobble * 1.3).toFixed(1)},${(cy + Math.sin(t) * r * wobble).toFixed(1)}`);
    }
    out.push(`M${pts.join(" L")}Z`);
  }
  return out;
}
