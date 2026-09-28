"use client";

import { useId } from "react";
import type { SceneId } from "@/lib/ui/category";

// ============================================================
// 福岡の風景イラスト（写真・動画が無いときのビジュアル）
// 旅行ポスターのような、落ち着いた色面のイラストで「実在の福岡」を描く。
// ============================================================

export const SCENES: Record<SceneId, { ja: string; en: string; place: string; coord: string }> = {
  sea: { ja: "玄界灘", en: "GENKAI SEA", place: "糸島・二見ヶ浦", coord: "33.64°N 130.20°E" },
  tea: { ja: "八女の茶畑", en: "YAME TEA FIELDS", place: "八女中央大茶園", coord: "33.21°N 130.56°E" },
  yatai: { ja: "中洲の屋台", en: "NAKASU YATAI", place: "福岡市・那珂川沿い", coord: "33.59°N 130.40°E" },
  mountain: { ja: "英彦山", en: "MT. HIKO", place: "添田町・英彦山", coord: "33.47°N 130.93°E" },
  canal: { ja: "柳川の水路", en: "YANAGAWA CANALS", place: "柳川市・掘割", coord: "33.16°N 130.41°E" },
  shrine: { ja: "太宰府", en: "DAZAIFU", place: "太宰府天満宮", coord: "33.52°N 130.53°E" },
  port: { ja: "門司港", en: "MOJIKO", place: "北九州市・関門海峡", coord: "33.95°N 130.96°E" },
};

export const SCENE_ORDER: SceneId[] = ["sea", "tea", "yatai", "mountain", "canal", "shrine", "port"];

export function Scene({ id, className = "", animate = false }: { id: SceneId; className?: string; animate?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const k = (s: string) => `${s}-${uid}`;
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={`${className}`} aria-hidden>
      <g className={animate ? "anim-slow-pan" : ""} style={{ transformOrigin: "50% 60%" }}>
        {id === "sea" && <Sea k={k} />}
        {id === "tea" && <Tea k={k} />}
        {id === "yatai" && <Yatai k={k} />}
        {id === "mountain" && <MountainScene k={k} />}
        {id === "canal" && <Canal k={k} />}
        {id === "shrine" && <Shrine k={k} />}
        {id === "port" && <Port k={k} />}
      </g>
    </svg>
  );
}

type K = { k: (s: string) => string };

const Birds = ({ x, y, s = 1, c = "#1e2a37" }: { x: number; y: number; s?: number; c?: string }) => (
  <g stroke={c} strokeWidth={2.2 * s} fill="none" strokeLinecap="round" opacity=".55">
    <path d={`M${x} ${y} q ${9 * s} ${-8 * s} ${18 * s} 0 q ${9 * s} ${-8 * s} ${18 * s} 0`} />
    <path d={`M${x + 50 * s} ${y + 22 * s} q ${7 * s} ${-6 * s} ${14 * s} 0 q ${7 * s} ${-6 * s} ${14 * s} 0`} />
    <path d={`M${x + 26 * s} ${y + 46 * s} q ${6 * s} ${-5 * s} ${12 * s} 0 q ${6 * s} ${-5 * s} ${12 * s} 0`} />
  </g>
);

// ---------------- 玄界灘・二見ヶ浦 ----------------
function Sea({ k }: K) {
  return (
    <>
      <defs>
        <linearGradient id={k("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe6d2" />
          <stop offset=".7" stopColor="#ecd3ab" />
          <stop offset="1" stopColor="#e3b98d" />
        </linearGradient>
        <linearGradient id={k("sea")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4d7f8c" />
          <stop offset="1" stopColor="#23485a" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${k("sky")})`} />
      <circle cx="1060" cy="540" r="78" fill="#d88a52" opacity=".85" />
      <path d="M0 560 L180 548 L320 552 L420 540 L520 556 L1600 556 L1600 580 L0 580Z" fill="#7d9a9a" opacity=".55" />
      <rect y="556" width="1600" height="344" fill={`url(#${k("sea")})`} />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={1000 + ((i * 37) % 90) - 30} y={580 + i * 16} width={140 - i * 8} height="3" fill="#f0c08c" opacity={0.7 - i * 0.05} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d={`M${(i * 173) % 1500} ${610 + i * 18} q 30 -8 60 0 t 60 0`} stroke="#e9dfc9" strokeOpacity=".28" strokeWidth="2" fill="none" />
      ))}
      {/* 夫婦岩 */}
      <path d="M600 640 C 610 520 660 470 720 468 C 790 470 820 540 830 640 Z" fill="#26363c" />
      <path d="M880 640 C 885 580 915 552 950 552 C 990 556 1005 600 1010 640 Z" fill="#2c3d44" />
      <path d="M700 478 Q 830 540 948 556" stroke="#f2ead9" strokeWidth="7" fill="none" />
      <path d="M700 488 Q 830 550 948 566" stroke="#f2ead9" strokeWidth="2.5" fill="none" opacity=".7" />
      <rect x="560" y="636" width="500" height="10" fill="#e9dfc9" opacity=".25" />
      {/* 浜と白い鳥居 */}
      <path d="M0 760 C 200 700 380 720 520 780 L 520 900 L 0 900 Z" fill="#e6d6b2" />
      <path d="M0 800 C 180 760 360 770 520 820" stroke="#cbb88f" strokeWidth="2" fill="none" />
      <g fill="#f7f1e3" stroke="#b9a782" strokeWidth="2">
        <rect x="236" y="612" width="14" height="150" />
        <rect x="336" y="612" width="14" height="150" />
        <path d="M210 604 Q 293 590 376 604 L 380 616 Q 293 604 206 616 Z" />
        <rect x="224" y="634" width="138" height="10" />
      </g>
      <Birds x={380} y={300} s={1.2} />
    </>
  );
}

// ---------------- 八女の茶畑 ----------------
function Tea({ k }: K) {
  const rows = Array.from({ length: 14 });
  return (
    <>
      <defs>
        <linearGradient id={k("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef0e2" />
          <stop offset="1" stopColor="#f3ead6" />
        </linearGradient>
        <clipPath id={k("hill1")}>
          <path d="M0 560 C 300 470 620 500 900 560 C 1150 610 1400 560 1600 520 L1600 900 L0 900Z" />
        </clipPath>
        <clipPath id={k("hill2")}>
          <path d="M0 720 C 400 640 800 660 1100 720 C 1300 760 1480 740 1600 700 L1600 900 L0 900Z" />
        </clipPath>
      </defs>
      <rect width="1600" height="900" fill={`url(#${k("sky")})`} />
      <circle cx="1240" cy="220" r="60" fill="#e8c98a" opacity=".6" />
      <path d="M0 470 C 200 380 380 400 560 440 C 760 380 980 360 1200 430 C 1380 400 1500 420 1600 440 L1600 620 L0 620Z" fill="#a9b595" />
      <path d="M0 520 C 260 450 520 470 760 500 C 1000 440 1300 460 1600 480 L1600 640 L0 640Z" fill="#8a9e76" />
      <rect y="0" width="1600" height="900" fill="#fff" opacity="0" />
      {/* 茶畑の畝（奥） */}
      <path d="M0 560 C 300 470 620 500 900 560 C 1150 610 1400 560 1600 520 L1600 900 L0 900Z" fill="#6f8b3e" />
      <g clipPath={`url(#${k("hill1")})`}>
        {rows.map((_, i) => (
          <path key={i} d={`M-40 ${540 + i * 26} C 300 ${452 + i * 27} 620 ${482 + i * 27} 900 ${542 + i * 27} C 1150 ${592 + i * 27} 1400 ${542 + i * 27} 1640 ${502 + i * 27}`} stroke="#4f6b2c" strokeWidth="11" strokeLinecap="round" fill="none" opacity=".75" />
        ))}
      </g>
      {/* 茶畑の畝（手前） */}
      <path d="M0 720 C 400 640 800 660 1100 720 C 1300 760 1480 740 1600 700 L1600 900 L0 900Z" fill="#5c7a33" />
      <g clipPath={`url(#${k("hill2")})`}>
        {rows.map((_, i) => (
          <path key={i} d={`M-40 ${700 + i * 34} C 400 ${622 + i * 36} 800 ${642 + i * 36} 1100 ${702 + i * 36} C 1300 ${742 + i * 36} 1480 ${722 + i * 36} 1640 ${682 + i * 36}`} stroke="#3e5722" strokeWidth="18" strokeLinecap="round" fill="none" opacity=".8" />
        ))}
      </g>
      {/* 防霜ファン */}
      {[330, 520, 760, 1010, 1270].map((x, i) => {
        const y = [540, 500, 520, 575, 548][i];
        return (
          <g key={x} stroke="#3a3a30" strokeWidth="3">
            <line x1={x} y1={y} x2={x} y2={y - 90} />
            <ellipse cx={x + 8} cy={y - 94} rx="5" ry="16" fill="#3a3a30" />
          </g>
        );
      })}
      {/* 茶工場と木 */}
      <g>
        <rect x="1330" y="480" width="120" height="60" fill="#e9dfc9" />
        <path d="M1318 484 L1390 440 L1462 484 Z" fill="#4a4036" />
        <rect x="1372" y="506" width="18" height="34" fill="#4a4036" />
      </g>
      <g>
        <rect x="178" y="520" width="12" height="70" fill="#4a3a2a" />
        <circle cx="184" cy="496" r="48" fill="#3f5a2e" />
        <circle cx="152" cy="516" r="30" fill="#3f5a2e" />
        <circle cx="218" cy="512" r="32" fill="#46633a" />
      </g>
      <Birds x={620} y={200} />
    </>
  );
}

// ---------------- 中洲の屋台 ----------------
function Yatai({ k }: K) {
  const bldgs = [
    [0, 330, 120], [110, 280, 90], [190, 360, 70], [250, 240, 110], [350, 310, 80], [420, 200, 120], [530, 290, 90], [610, 350, 60],
    [660, 260, 100], [750, 320, 80], [820, 230, 130], [940, 300, 90], [1020, 270, 110], [1120, 340, 70], [1180, 250, 120], [1290, 310, 90],
    [1370, 220, 110], [1470, 300, 130],
  ];
  return (
    <>
      <defs>
        <linearGradient id={k("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c3049" />
          <stop offset=".55" stopColor="#3d3f5a" />
          <stop offset=".85" stopColor="#a9694a" />
          <stop offset="1" stopColor="#c98a5a" />
        </linearGradient>
        <linearGradient id={k("river")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#223750" />
          <stop offset="1" stopColor="#101c2c" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${k("sky")})`} />
      <circle cx="1320" cy="170" r="42" fill="#efe4cc" opacity=".9" />
      {bldgs.map(([x, top, w], i) => (
        <g key={i}>
          <rect x={x} y={top + 160} width={w} height={600 - top} fill={i % 2 ? "#172638" : "#1b2c40"} />
          {Array.from({ length: Math.floor((440 - top) / 34) }).map((_, r) =>
            Array.from({ length: Math.floor(w / 26) }).map((_, c) =>
              (r * 7 + c * 3 + i) % 4 === 0 ? <rect key={`${r}-${c}`} x={x + 8 + c * 26} y={top + 176 + r * 34} width="10" height="14" fill="#e8c27a" opacity=".75" /> : null,
            ),
          )}
        </g>
      ))}
      {/* 川と映り込み */}
      <rect y="640" width="1600" height="260" fill={`url(#${k("river")})`} />
      {[140, 300, 470, 640, 810, 980, 1150, 1320, 1480].map((x, i) => (
        <rect key={x} x={x} y={660 + (i % 3) * 8} width="6" height={120 + (i % 4) * 30} fill="#d0583a" opacity=".3" />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M${(i * 211) % 1500} ${690 + i * 16} h 90`} stroke="#e8c27a" strokeOpacity=".22" strokeWidth="2" />
      ))}
      {/* 川沿いの道 */}
      <rect y="620" width="1600" height="24" fill="#2b2a33" />
      {/* 屋台 */}
      {[120, 420, 720, 1020, 1320].map((x) => (
        <g key={x}>
          <rect x={x} y="540" width="190" height="82" fill="#3a2e28" />
          <rect x={x - 8} y="520" width="206" height="24" fill="#2a211c" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={x + 6 + i * 30} y="546" width="26" height="40" fill="#8a2f24" />
          ))}
          <rect x={x + 10} y="596" width="170" height="8" fill="#e8c27a" opacity=".6" />
          <circle cx={x + 18} cy="560" r="15" fill="#d0583a" />
          <circle cx={x + 172} cy="560" r="15" fill="#d0583a" />
          <rect x={x + 12} y="548" width="12" height="3" fill="#2a211c" />
          <rect x={x + 166} y="548" width="12" height="3" fill="#2a211c" />
        </g>
      ))}
    </>
  );
}

// ---------------- 英彦山 ----------------
function MountainScene({ k }: K) {
  return (
    <>
      <defs>
        <linearGradient id={k("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6e3d4" />
          <stop offset="1" stopColor="#efe8d6" />
        </linearGradient>
        <linearGradient id={k("mist")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2ead9" stopOpacity="0" />
          <stop offset=".5" stopColor="#f2ead9" stopOpacity=".8" />
          <stop offset="1" stopColor="#f2ead9" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${k("sky")})`} />
      <circle cx="420" cy="220" r="52" fill="#e3c58f" opacity=".55" />
      <path d="M0 470 L180 380 L300 430 L520 300 L680 400 L820 350 L1000 420 L1180 330 L1360 410 L1600 360 L1600 900 L0 900Z" fill="#b9bfa9" />
      <rect y="400" width="1600" height="120" fill={`url(#${k("mist")})`} />
      <path d="M0 560 L140 500 L330 540 L560 420 L740 520 L940 470 L1100 380 L1260 480 L1440 450 L1600 500 L1600 900 L0 900Z" fill="#8b9c82" />
      <rect y="520" width="1600" height="110" fill={`url(#${k("mist")})`} />
      <path d="M0 660 L220 590 L420 640 L640 560 L860 650 L1080 600 L1300 660 L1600 610 L1600 900 L0 900Z" fill="#587260" />
      <path d="M0 780 L260 700 L520 760 L760 690 L1000 770 L1280 720 L1600 780 L1600 900 L0 900Z" fill="#2e4a3b" />
      {/* 山頂の社 */}
      <g transform="translate(1100 380)">
        <rect x="-3" y="-34" width="6" height="34" fill="#3a2e28" />
        <rect x="26" y="-34" width="6" height="34" fill="#3a2e28" />
        <rect x="-10" y="-40" width="50" height="6" fill="#3a2e28" />
      </g>
      {/* 石段 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={760 - i * 4} y={700 + i * 18} width={70 + i * 8} height="6" fill="#c9bea3" opacity=".7" />
      ))}
      {/* 杉 */}
      {[80, 150, 1380, 1460, 1530].map((x, i) => (
        <path key={x} d={`M${x} ${820 - (i % 2) * 30} l -28 70 h 56 Z M${x} ${780 - (i % 2) * 30} l -22 60 h 44 Z`} fill="#1f3a2d" />
      ))}
      <Birds x={900} y={240} />
    </>
  );
}

// ---------------- 柳川の水路 ----------------
function Canal({ k }: K) {
  return (
    <>
      <defs>
        <linearGradient id={k("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#edf0e6" />
          <stop offset="1" stopColor="#f2ead9" />
        </linearGradient>
        <linearGradient id={k("water")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f9696" />
          <stop offset="1" stopColor="#3f6b70" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${k("sky")})`} />
      {/* 白壁の蔵 */}
      {[860, 1060, 1260].map((x, i) => (
        <g key={x}>
          <rect x={x} y={420 + i * 6} width="170" height="170" fill="#efe7d6" />
          <path d={`M${x - 16} ${426 + i * 6} L${x + 85} ${370 + i * 6} L${x + 186} ${426 + i * 6} Z`} fill="#3d3a36" />
          <rect x={x} y={540 + i * 6} width="170" height="50" fill="#4a4a48" />
          {Array.from({ length: 6 }).map((_, j) => (
            <path key={j} d={`M${x + 8 + j * 28} ${548 + i * 6} l 12 12 l -12 12 l -12 -12 Z`} fill="none" stroke="#efe7d6" strokeWidth="2" opacity=".7" />
          ))}
          <rect x={x + 70} y={460 + i * 6} width="26" height="30" fill="#3d3a36" />
        </g>
      ))}
      {/* 石垣 */}
      <rect y="590" width="1600" height="40" fill="#b9ab8c" />
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={i * 56 + (i % 2) * 20} y={596 + (i % 2) * 16} width="48" height="14" fill="#a3957a" />
      ))}
      <rect y="630" width="1600" height="270" fill={`url(#${k("water")})`} />
      {Array.from({ length: 14 }).map((_, i) => (
        <path key={i} d={`M${(i * 157) % 1500} ${660 + i * 16} q 40 -6 80 0`} stroke="#e9dfc9" strokeOpacity=".3" strokeWidth="2" fill="none" />
      ))}
      {/* どんこ舟 */}
      <g transform="translate(560 720)">
        <path d="M-260 0 Q 0 40 260 0 L 240 22 Q 0 56 -240 22 Z" fill="#3a2a1f" />
        <path d="M-200 0 Q 0 24 200 0" stroke="#6b4a2f" strokeWidth="4" fill="none" />
        <g transform="translate(170 -10)">
          <rect x="-6" y="-80" width="12" height="70" fill="#2e3b48" />
          <path d="M-32 -82 L0 -104 L32 -82 Z" fill="#c9b27a" />
          <line x1="20" y1="-70" x2="120" y2="90" stroke="#5e422c" strokeWidth="4" />
        </g>
        {[-150, -90, -30].map((x) => (
          <g key={x}>
            <circle cx={x} cy="-22" r="12" fill="#2e3b48" />
            <rect x={x - 12} y="-12" width="24" height="16" fill="#8a5a3b" />
          </g>
        ))}
      </g>
      {/* 柳 */}
      {[120, 360].map((x) => (
        <g key={x}>
          <path d={`M${x} 640 C ${x - 6} 520 ${x + 10} 420 ${x + 30} 330`} stroke="#4a3a2a" strokeWidth="14" fill="none" />
          {Array.from({ length: 22 }).map((_, i) => {
            const sx = x - 120 + i * 14;
            const sy = 300 + Math.abs(11 - i) * 8;
            return <path key={i} d={`M${sx} ${sy} C ${sx - 10} ${sy + 80} ${sx + 6} ${sy + 170} ${sx - 4} ${sy + 250}`} stroke="#5f7d3f" strokeWidth="4" fill="none" opacity=".85" />;
          })}
          <ellipse cx={x + 20} cy="320" rx="150" ry="60" fill="#6f8b3e" opacity=".85" />
        </g>
      ))}
    </>
  );
}

// ---------------- 太宰府 ----------------
function Shrine({ k }: K) {
  return (
    <>
      <defs>
        <linearGradient id={k("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3eadb" />
          <stop offset="1" stopColor="#efe0c6" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${k("sky")})`} />
      <path d="M0 520 C 300 460 600 480 900 500 C 1200 470 1400 480 1600 500 L1600 900 L0 900Z" fill="#b8b99a" opacity=".6" />
      {/* 楼門・本殿 */}
      <g transform="translate(800 470)">
        <path d="M-360 -40 Q -180 -130 0 -140 Q 180 -130 360 -40 L 330 -24 Q 170 -96 0 -104 Q -170 -96 -330 -24 Z" fill="#3a3632" />
        <path d="M-300 -24 L 300 -24 L 280 0 L -280 0 Z" fill="#2c2926" />
        <rect x="-280" y="0" width="560" height="190" fill="#efe4cc" />
        {[-250, -150, -50, 50, 150, 250].map((x) => (
          <rect key={x} x={x - 9} y="0" width="18" height="190" fill="#b3432f" />
        ))}
        <rect x="-280" y="40" width="560" height="10" fill="#b3432f" />
        <rect x="-60" y="70" width="120" height="120" fill="#3a3632" opacity=".85" />
        <path d="M-120 -140 Q 0 -200 120 -140 L 100 -130 Q 0 -176 -100 -130 Z" fill="#3a3632" />
        <circle cx="0" cy="-60" r="14" fill="#a8823a" />
      </g>
      {/* 参道 */}
      <path d="M660 900 L 740 660 L 860 660 L 940 900 Z" fill="#d8c9a8" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={680 - i * 2} y1={700 + i * 26} x2={920 + i * 2} y2={700 + i * 26} stroke="#c2b28e" strokeWidth="2" />
      ))}
      <rect y="660" width="1600" height="16" fill="#cdbd98" opacity=".5" />
      {/* 石灯籠 */}
      {[500, 1100].map((x) => (
        <g key={x} fill="#8e8a7c">
          <rect x={x - 10} y="600" width="20" height="70" />
          <rect x={x - 30} y="585" width="60" height="18" />
          <rect x={x - 22} y="560" width="44" height="26" />
          <path d={`M${x - 40} 562 L${x} 530 L${x + 40} 562 Z`} />
        </g>
      ))}
      {/* 梅の枝 */}
      <g>
        <path d="M-20 120 C 120 140 220 200 300 300 M150 160 C 190 110 240 90 300 90 M220 240 C 280 230 330 250 380 290" stroke="#3a2a24" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M1620 180 C 1480 200 1390 250 1330 340 M1450 220 C 1420 170 1380 150 1330 150" stroke="#3a2a24" strokeWidth="9" fill="none" strokeLinecap="round" />
        {[
          [80, 128], [140, 146], [200, 190], [250, 240], [290, 290], [180, 130], [250, 96], [300, 92], [330, 262], [370, 284], [120, 140], [230, 212],
          [1500, 196], [1440, 222], [1390, 260], [1350, 320], [1420, 180], [1370, 152], [1336, 150],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={i % 3 ? 11 : 14} fill={i % 2 ? "#e2a3a6" : "#d57f8a"} />
            <circle cx={x} cy={y} r="3" fill="#a8823a" />
          </g>
        ))}
      </g>
    </>
  );
}

// ---------------- 門司港 ----------------
function Port({ k }: K) {
  return (
    <>
      <defs>
        <linearGradient id={k("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6e4d8" />
          <stop offset="1" stopColor="#efe4cf" />
        </linearGradient>
        <linearGradient id={k("sea")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b8791" />
          <stop offset="1" stopColor="#2f5663" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${k("sky")})`} />
      {/* 対岸の山 */}
      <path d="M0 470 C 200 420 360 430 520 460 C 700 400 900 410 1100 450 C 1300 420 1460 430 1600 450 L1600 560 L0 560Z" fill="#9aa89c" opacity=".7" />
      {/* 関門橋 */}
      <g stroke="#5d6b73" fill="none">
        <line x1="760" y1="300" x2="760" y2="520" strokeWidth="10" />
        <line x1="1240" y1="300" x2="1240" y2="520" strokeWidth="10" />
        <path d="M420 470 Q 590 330 760 300 Q 1000 470 1240 300 Q 1400 330 1600 450" strokeWidth="4" />
        <line x1="420" y1="480" x2="1600" y2="480" strokeWidth="8" />
        {Array.from({ length: 22 }).map((_, i) => {
          const x = 780 + i * 20;
          const t = (x - 760) / 480;
          const y = 300 + 170 * (1 - Math.pow(2 * t - 1, 2));
          return <line key={i} x1={x} y1={y} x2={x} y2="480" strokeWidth="1.5" opacity=".6" />;
        })}
      </g>
      <rect y="520" width="1600" height="380" fill={`url(#${k("sea")})`} />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={`M${(i * 190) % 1500} ${560 + i * 20} q 30 -6 60 0`} stroke="#e9dfc9" strokeOpacity=".3" strokeWidth="2" fill="none" />
      ))}
      {/* 駅舎（レトロ建築） */}
      <g transform="translate(0 0)">
        <rect x="80" y="420" width="460" height="200" fill="#d9b48c" />
        <path d="M60 424 L 170 360 L 450 360 L 560 424 Z" fill="#3c4a5a" />
        <rect x="250" y="320" width="120" height="100" fill="#d9b48c" />
        <path d="M240 324 L 310 280 L 380 324 Z" fill="#3c4a5a" />
        <circle cx="310" cy="360" r="18" fill="#f2ead9" stroke="#3c4a5a" strokeWidth="3" />
        <line x1="310" y1="360" x2="310" y2="348" stroke="#3c4a5a" strokeWidth="2" />
        <line x1="310" y1="360" x2="319" y2="364" stroke="#3c4a5a" strokeWidth="2" />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={104 + i * 62} y="456" width="30" height="56" fill="#3c4a5a" opacity=".8" />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={104 + i * 62} y="540" width="30" height="80" fill="#3c4a5a" opacity=".8" />
        ))}
        <rect x="60" y="620" width="520" height="14" fill="#8e8a7c" />
      </g>
      {/* 船 */}
      <g transform="translate(1080 650)">
        <path d="M-180 0 L 180 0 L 150 50 L -160 50 Z" fill="#2a3a4a" />
        <rect x="-110" y="-44" width="150" height="44" fill="#f2ead9" />
        <rect x="-80" y="-74" width="80" height="30" fill="#f2ead9" />
        <rect x="-20" y="-110" width="18" height="36" fill="#b3432f" />
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={i} x={-100 + i * 28} y="-32" width="14" height="10" fill="#2a3a4a" />
        ))}
      </g>
      <Birds x={1300} y={200} />
    </>
  );
}
