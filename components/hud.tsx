"use client";

import { useEffect, useState } from "react";
import { blockBar, expToNext } from "@/lib/game/rules";
import { useGame } from "@/lib/game/store";
import { TIER_COLOR, titleById } from "@/lib/data/titles";

/** 30秒ごとに更新される現在時刻（SSR時は null）。DEMO CLOCK が設定されていればその時刻を返す */
export function useNow(intervalMs = 30_000) {
  const { demoClock } = useGame();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      if (demoClock) {
        const [h, m] = demoClock.split(":").map(Number);
        d.setHours(h, m, 0, 0);
      }
      setNow(d);
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, demoClock]);
  return now;
}

/** 経験値バー：インクで塗られていく目盛り付きのバー */
export function ExpBar({ level, exp, className = "", thick = false, light = false }: { level: number; exp: number; className?: string; thick?: boolean; light?: boolean }) {
  const pct = Math.min(100, (exp / expToNext(level)) * 100);
  return (
    <div className={`relative w-full overflow-hidden ${thick ? "h-3" : "h-1.5"} ${light ? "bg-paper/15" : "bg-ink/10"} ${className}`}>
      <div className={`h-full transition-[width] duration-1000 ease-out ${light ? "bg-brass-2" : "bg-forest"}`} style={{ width: `${pct}%` }} />
      {thick &&
        Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={`absolute top-0 h-full w-px ${light ? "bg-navy/60" : "bg-card/80"}`} style={{ left: `${(i + 1) * 10}%` }} />
        ))}
    </div>
  );
}

/** ████████░░░░░░ 形式の探索バー */
export function BlockBar({ pct, width = 14, className = "" }: { pct: number; width?: number; className?: string }) {
  const s = blockBar(pct, width);
  const n = s.indexOf("░") === -1 ? s.length : s.indexOf("░");
  return (
    <span className={`font-mono tracking-[0.05em] ${className}`} aria-label={`${pct}%`}>
      <span className="text-forest">{s.slice(0, n)}</span>
      <span className="text-ink/20">{s.slice(n)}</span>
    </span>
  );
}

/** レベル：真鍮の方位盤のような丸いメダル */
export function LevelBadge({ level, size = 44, light = false }: { level: number; size?: number; light?: boolean }) {
  const c = light ? "#e9d8a8" : "#1e2a37";
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="24" cy="24" r="22.5" fill="none" stroke={c} strokeWidth="1.2" />
        <circle cx="24" cy="24" r="19" fill="none" stroke={c} strokeOpacity=".35" strokeWidth="1" strokeDasharray="1.5 2.4" />
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1="24" y1="1.5" x2="24" y2="5" stroke={c} strokeWidth="1.4" transform={`rotate(${a} 24 24)`} />
        ))}
      </svg>
      <div className="relative text-center leading-none" style={{ color: c }}>
        <div className="font-mono text-[7px] tracking-[0.2em] opacity-70">LV</div>
        <div className="font-display font-semibold" style={{ fontSize: size * 0.36 }}>
          {String(level).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

export function TitleChip({ id, className = "" }: { id: string; className?: string }) {
  const { lang } = useGame();
  const t = titleById(id);
  if (!t) return null;
  const c = TIER_COLOR[t.tier];
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mincho text-[12px] font-bold ${className}`} style={{ borderColor: `${c}88`, color: c }}>
      「{t[lang]}」
    </span>
  );
}

/** 称号の印章（朱印・真鍮印） */
export function Emblem({ tier, size = 64, locked = false, label }: { tier: "BRONZE" | "SILVER" | "GOLD" | "MYTHIC"; size?: number; locked?: boolean; label?: string }) {
  const c = locked ? "#b9b1a0" : TIER_COLOR[tier];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="29" fill="none" stroke={c} strokeWidth="2.4" strokeDasharray={locked ? "3 3" : undefined} />
      <circle cx="32" cy="32" r="23.5" fill="none" stroke={c} strokeWidth="1" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1="32" y1="5.5" x2="32" y2="8" stroke={c} strokeWidth="1" opacity=".6" transform={`rotate(${i * 15} 32 32)`} />
      ))}
      {label ? (
        <text x="32" y="37" textAnchor="middle" fontSize="15" fontFamily="var(--ff-mincho)" fontWeight="800" fill={c}>
          {label}
        </text>
      ) : (
        <path d="M32 16 L35 28 L47 32 L35 36 L32 48 L29 36 L17 32 L29 28 Z" fill={c} opacity={locked ? 0.5 : 0.9} />
      )}
    </svg>
  );
}

/** 方位磁針 */
export function Compass({ size = 64, className = "", animate = false }: { size?: number; className?: string; animate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} aria-hidden>
      <circle cx="40" cy="40" r="37" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="40" cy="40" r="31" fill="none" stroke="currentColor" strokeWidth=".8" strokeDasharray="1.5 3" />
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={i} x1="40" y1="3" x2="40" y2={i % 4 === 0 ? 10 : 7} stroke="currentColor" strokeWidth={i % 4 === 0 ? 1.5 : 0.8} transform={`rotate(${i * 22.5} 40 40)`} />
      ))}
      <g className={animate ? "anim-needle" : ""}>
        <path d="M40 12 L45 40 L40 68 L35 40 Z" fill="currentColor" opacity=".2" />
        <path d="M40 12 L45 40 L35 40 Z" fill="#b3432f" />
        <path d="M40 68 L45 40 L35 40 Z" fill="currentColor" />
      </g>
      <circle cx="40" cy="40" r="2.5" fill="#f2ead9" stroke="currentColor" />
    </svg>
  );
}
