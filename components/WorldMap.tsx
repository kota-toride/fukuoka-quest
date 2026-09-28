"use client";

import { useMemo } from "react";
import type { Quest } from "@/lib/types";
import { HOME_POINT, MAP_H, MAP_W, MOUNTAINS, OUTLINE_PATH, RIVERS, ROUTES, SEAS, ZONES, project, zoneById } from "@/lib/data/regions";
import { useGame } from "@/lib/game/store";

export interface ZoneStats {
  total: number;
  cleared: number;
  hidden: number;
  live: number;
  side: number;
}

export function useZoneStats(quests: Quest[], clearedIds: string[]) {
  return useMemo(() => {
    const m: Record<string, ZoneStats> = {};
    for (const z of ZONES) m[z.id] = { total: 0, cleared: 0, hidden: 0, live: 0, side: 0 };
    for (const q of quests) {
      const s = m[q.region];
      if (!s) continue;
      s.total++;
      if (clearedIds.includes(q.id)) s.cleared++;
      if (q.isHidden) s.hidden++;
      if (q.isDynamic) s.live++;
      if (q.isSide) s.side++;
    }
    return m;
  }, [quests, clearedIds]);
}

/** ラベルを置く向き（重なり回避） */
const LABEL_SIDE: Record<string, "below" | "left" | "right" | "above"> = {
  hirokawa: "right",
  kurume: "left",
  dazaifu: "right",
  munakata: "right",
  iizuka: "right",
  tagawa: "below",
  yame: "below",
  fukuoka: "left",
};

/** QUESTの地図上の位置（経緯度があればそれ、無ければゾーン中心） */
export function questPoint(q: Quest): [number, number] {
  if (q.latitude && q.longitude) return project(q.longitude, q.latitude);
  const z = zoneById(q.region)!;
  return project(z.lon, z.lat);
}

const zonePoint = (id: string): [number, number] => {
  const z = zoneById(id)!;
  return project(z.lon, z.lat);
};

export function WorldMap({
  selected,
  onSelect,
  className = "",
  interactive = true,
  route,
  routeStops = [],
  showQuests = true,
  labels = true,
  animateRoute = true,
}: {
  selected?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  interactive?: boolean;
  /** 冒険ルート（ゾーンIDの列） */
  route?: string[];
  /** ルート上に描くSIDE QUEST */
  routeStops?: { quest: Quest; chosen: boolean }[];
  showQuests?: boolean;
  labels?: boolean;
  animateRoute?: boolean;
}) {
  const { quests, player, lang, isRevealed } = useGame();
  const home = project(HOME_POINT.lon, HOME_POINT.lat);

  // ゾーンごとの未CLEARのQUESTマーカー
  const markers = useMemo(() => {
    const byZone: Record<string, Quest[]> = {};
    for (const q of quests) {
      if (q.isSide || player.clearedQuestIds.includes(q.id)) continue;
      (byZone[q.region] ??= []).push(q);
    }
    return byZone;
  }, [quests, player.clearedQuestIds]);

  const routeD = useMemo(() => {
    if (!route || route.length === 0) return null;
    const pts: [number, number][] = [home, ...route.slice(route[0] === "fukuoka" ? 1 : 0).map(zonePoint)];
    if (route.length === 1) pts.push(zonePoint(route[0]));
    // ゆるやかな曲線でつなぐ
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2 + (y1 - y0) * 0.12;
      const my = (y0 + y1) / 2 - (x1 - x0) * 0.12;
      d += ` Q${mx.toFixed(1)},${my.toFixed(1)} ${x1},${y1}`;
    }
    return d;
  }, [route, home]);

  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden ${className}`}>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="relative h-full w-full" role="img" aria-label="Fukuoka world map">
        <defs>
          <pattern id="wm-waves" width="22" height="10" patternUnits="userSpaceOnUse">
            <path d="M0 6 q 5.5 -4 11 0 t 11 0" fill="none" stroke="#3c6f80" strokeOpacity=".16" strokeWidth=".9" />
          </pattern>
          <pattern id="wm-fog" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <line x1="0" y1="0" x2="0" y2="7" stroke="#6b675c" strokeOpacity=".5" strokeWidth="1.2" />
          </pattern>
          <radialGradient id="wm-fog-mask">
            <stop offset=".55" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id="wm-rough">
            <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="4" />
          </filter>
        </defs>

        {/* 海 */}
        <rect width={MAP_W} height={MAP_H} fill="#dfe2d3" />
        <rect width={MAP_W} height={MAP_H} fill="url(#wm-waves)" />

        {/* 経緯線 */}
        <g stroke="#1e2a37" strokeOpacity=".1" strokeDasharray="2 6">
          {[130.0, 130.25, 130.5, 130.75, 131.0].map((lon) => {
            const [x] = project(lon, 34);
            return <line key={lon} x1={x} y1="0" x2={x} y2={MAP_H} />;
          })}
          {[33.0, 33.25, 33.5, 33.75, 34.0].map((lat) => {
            const [, y] = project(130, lat);
            return <line key={lat} x1="0" y1={y} x2={MAP_W} y2={y} />;
          })}
        </g>
        <g fontFamily="var(--ff-mono)" fontSize="9" fill="#1e2a37" fillOpacity=".4" letterSpacing="1">
          {[130.25, 130.5, 130.75, 131.0].map((lon) => {
            const [x] = project(lon, 34);
            return (
              <text key={lon} x={x + 4} y={MAP_H - 10}>
                {Math.floor(lon)}°{String(Math.round((lon % 1) * 60)).padStart(2, "0")}′E
              </text>
            );
          })}
          {[33.25, 33.5, 33.75].map((lat) => {
            const [, y] = project(130, lat);
            return (
              <text key={lat} x={MAP_W - 70} y={y - 4}>
                {Math.floor(lat)}°{String(Math.round((lat % 1) * 60)).padStart(2, "0")}′N
              </text>
            );
          })}
        </g>

        {/* 海域名 */}
        <g fontFamily="var(--ff-display)" fontStyle="italic" fill="#3c6f80" fillOpacity=".7">
          {SEAS.map((s) => {
            const [x, y] = project(s.lon, s.lat);
            return (
              <g key={s.en} transform={`translate(${x} ${y}) rotate(${s.rotate ?? 0})`}>
                <text textAnchor="middle" fontSize="20" letterSpacing="6">
                  {s.en}
                </text>
                <text y="22" textAnchor="middle" fontSize="13" fontFamily="var(--ff-mincho)" fontStyle="normal" letterSpacing="4">
                  {s.ja}
                </text>
              </g>
            );
          })}
        </g>

        {/* 島 */}
        <g fill="#efe6cf" stroke="#1e2a37" strokeWidth="1" strokeOpacity=".6">
          {[
            [130.43, 33.9, 14, 6],
            [130.3, 33.665, 9, 5],
            [130.31, 33.628, 7, 4],
            [130.13, 33.66, 6, 3],
          ].map(([lon, lat, rx, ry], i) => {
            const [x, y] = project(lon, lat);
            return <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} />;
          })}
        </g>

        {/* 陸地（水線 → 塗り → 海岸線） */}
        <g filter="url(#wm-rough)">
          {[34, 22, 12].map((w, i) => (
            <path key={w} d={OUTLINE_PATH} fill="none" stroke="#3c6f80" strokeOpacity={0.05 + i * 0.05} strokeWidth={w} strokeLinejoin="round" />
          ))}
          <path d={OUTLINE_PATH} fill="#f1e8d2" />
          <path d={OUTLINE_PATH} fill="none" stroke="#1e2a37" strokeWidth="1.8" strokeLinejoin="round" />
        </g>

        {/* 川 */}
        <g>
          {RIVERS.map((r) => {
            const [lx, ly] = project(r.label[0], r.label[1]);
            return (
              <g key={r.id}>
                <path d={r.d} fill="none" stroke="#5b8b98" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                {labels && (
                  <text x={lx} y={ly} fontSize="11" fontFamily="var(--ff-mincho)" fill="#3c6f80" textAnchor="middle" letterSpacing="2">
                    {lang === "ja" ? r.ja : r.en}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* 山 */}
        <g>
          {MOUNTAINS.map((m) => {
            const [x, y] = project(m.lon, m.lat);
            const s = m.size;
            return (
              <g key={m.en} transform={`translate(${x} ${y}) scale(${s})`}>
                {[
                  [-14, 4, 0.8],
                  [0, 0, 1],
                  [14, 5, 0.75],
                ].map(([dx, dy, k], i) => (
                  <g key={i} transform={`translate(${dx} ${dy}) scale(${k})`}>
                    <path d="M-12 8 L0 -12 L12 8" fill="#e6dac0" stroke="#5e422c" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="M0 -12 L3 -4 M0 -12 L6 2 M0 -12 L8 6" stroke="#5e422c" strokeWidth=".8" opacity=".7" />
                  </g>
                ))}
                {labels && (
                  <text y="24" textAnchor="middle" fontSize={10 / s} fontFamily="var(--ff-mincho)" fill="#5e422c" letterSpacing="1">
                    {lang === "ja" ? m.ja : m.en}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* 道 */}
        {ROUTES.map(([a, b]) => {
          const [x1, y1] = zonePoint(a);
          const [x2, y2] = zonePoint(b);
          const known = player.discoveredZones.includes(a) && player.discoveredZones.includes(b);
          return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e2a37" strokeOpacity={known ? 0.35 : 0.16} strokeWidth="1.2" strokeDasharray="3 5" />;
        })}

        {/* 未踏の霧（斜線のハッチ） */}
        {ZONES.map((z) => {
          const [x, y] = zonePoint(z.id);
          const discovered = player.discoveredZones.includes(z.id);
          return (
            <g key={`fog-${z.id}`} style={{ opacity: discovered ? 0 : 1, transition: "opacity 1.4s ease" }} pointerEvents="none">
              <circle cx={x} cy={y} r="54" fill="#e6dcc2" opacity=".75" />
              <circle cx={x} cy={y} r="54" fill="url(#wm-fog)" />
              <circle cx={x} cy={y} r="54" fill="none" stroke="#6b675c" strokeOpacity=".35" strokeDasharray="2 4" />
            </g>
          );
        })}

        {/* 冒険ルート */}
        {routeD && (
          <g pointerEvents="none">
            <path d={routeD} fill="none" stroke="#f2ead9" strokeWidth="8" strokeLinecap="round" opacity=".9" />
            <path
              key={routeD}
              d={routeD}
              fill="none"
              stroke="#b3432f"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="1400"
              style={animateRoute ? ({ "--len": 1400, animation: "draw 1.8s ease-out both" } as React.CSSProperties) : undefined}
            />
            <path d={routeD} fill="none" stroke="#f2ead9" strokeWidth="1.2" strokeDasharray="4 10" opacity=".9" />
          </g>
        )}

        {/* ゾーン */}
        {ZONES.map((z) => {
          const [x, y] = zonePoint(z.id);
          const discovered = player.discoveredZones.includes(z.id);
          const isSel = selected === z.id;
          const side = LABEL_SIDE[z.id] ?? "below";
          const qs = showQuests ? (markers[z.id] ?? []).slice(0, 3) : [];
          const lx = side === "left" ? -16 : side === "right" ? 16 : 0;
          const ly = side === "below" ? 30 : side === "above" ? -30 : 5;
          const anchor = side === "left" ? "end" : side === "right" ? "start" : "middle";
          return (
            <g
              key={z.id}
              transform={`translate(${x} ${y})`}
              onClick={interactive ? () => onSelect?.(z.id) : undefined}
              style={{ cursor: interactive ? "pointer" : "default" }}
              role={interactive ? "button" : undefined}
              aria-label={z[lang]}
            >
              {interactive && <circle r="34" fill="transparent" />}
              {isSel && <circle r="22" fill="none" stroke="#b3432f" strokeWidth="1.5" strokeDasharray="3 3" />}
              {discovered ? (
                <>
                  <circle r="9" fill="#f1e8d2" stroke="#1e2a37" strokeWidth="1.6" />
                  <circle r="4.2" fill="#1e2a37" />
                </>
              ) : (
                <>
                  <circle r="9" fill="#f1e8d2" stroke="#6b675c" strokeWidth="1.3" strokeDasharray="2.5 2" />
                  <text y="4" textAnchor="middle" fontSize="11" fontFamily="var(--ff-mono)" fontWeight="600" fill="#6b675c">
                    ?
                  </text>
                </>
              )}
              {/* QUESTマーカー */}
              {qs.map((q, i) => {
                const mx = (i - (qs.length - 1) / 2) * 17;
                const my = side === "above" ? 22 : -24;
                const hidden = q.isHidden && !isRevealed(q);
                const color = q.isHidden ? "#5a3f6b" : q.isDynamic ? "#b3432f" : "#2e4a3b";
                return (
                  <g key={q.id} transform={`translate(${mx} ${my})`}>
                    <line x1="0" y1="7" x2="0" y2="13" stroke={color} strokeWidth="1.2" />
                    {hidden ? (
                      <>
                        <circle r="7.5" fill="#f8f3e7" stroke={color} strokeWidth="1.6" />
                        <text y="3.5" textAnchor="middle" fontSize="10" fontFamily="var(--ff-mono)" fontWeight="700" fill={color}>
                          ?
                        </text>
                      </>
                    ) : (
                      <rect x="-5.5" y="-5.5" width="11" height="11" transform="rotate(45)" fill={color} stroke="#f8f3e7" strokeWidth="1.4" />
                    )}
                  </g>
                );
              })}
              {labels && (
                <g transform={`translate(${lx} ${ly})`}>
                  <text textAnchor={anchor} fontSize="16" fontFamily="var(--ff-mincho)" fontWeight="700" fill={discovered ? "#1e2a37" : "#8a8474"} stroke="#f1e8d2" strokeWidth="4" paintOrder="stroke">
                    {z[lang]}
                  </text>
                  <text y="14" textAnchor={anchor} fontSize="9" fontFamily="var(--ff-mono)" letterSpacing="1.5" fill={discovered ? "#2e4a3b" : "#8a8474"} stroke="#f1e8d2" strokeWidth="3" paintOrder="stroke">
                    {discovered ? "DISCOVERED" : "UNEXPLORED"}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ルート上のSIDE QUEST */}
        {routeStops.map(({ quest, chosen }, i) => {
          const [x, y] = questPoint(quest);
          const ox = quest.latitude ? 0 : 26;
          const oy = quest.latitude ? 0 : -8;
          return (
            <g key={quest.id} transform={`translate(${x + ox} ${y + oy})`} className="anim-discover" style={{ animationDelay: `${1.2 + i * 0.25}s` }}>
              <rect x="-9" y="-9" width="18" height="18" rx="2" fill={chosen ? "#2e4a3b" : "#f8f3e7"} stroke="#2e4a3b" strokeWidth="1.8" />
              <path d="M-4 1 L0 -4 L4 1 M0 -4 V5" stroke={chosen ? "#f2ead9" : "#2e4a3b"} strokeWidth="1.8" fill="none" />
            </g>
          );
        })}

        {/* 目的地の旗 */}
        {route && route.length > 0 && (
          <g transform={`translate(${zonePoint(route[route.length - 1])[0]} ${zonePoint(route[route.length - 1])[1]})`} pointerEvents="none">
            <line x1="0" y1="-6" x2="0" y2="-40" stroke="#1e2a37" strokeWidth="2" />
            <path d="M0 -40 L22 -33 L0 -26 Z" fill="#b3432f" />
          </g>
        )}

        {/* 現在地 */}
        <g transform={`translate(${home[0]} ${home[1]})`} pointerEvents="none">
          <circle r="10" fill="none" stroke="#b3432f" strokeWidth="1.5" style={{ transformBox: "fill-box", transformOrigin: "center", animation: "ripple 2.6s ease-out infinite" }} />
          <circle r="6" fill="#b3432f" stroke="#f8f3e7" strokeWidth="2" />
          {labels && (
            <g transform="translate(14 -14)">
              <rect x="-2" y="-12" width={lang === "ja" ? 58 : 84} height="17" fill="#b3432f" />
              <text x="4" fontSize="10" fontFamily="var(--ff-mono)" fontWeight="600" fill="#f8f3e7" letterSpacing="1.5">
                {lang === "ja" ? "現在地" : "YOU ARE HERE"}
              </text>
            </g>
          )}
        </g>

        {/* カルトゥーシュ（地図の題箋） */}
        {labels && (
          <g transform="translate(30 30)">
            <rect width="220" height="78" fill="#f8f3e7" stroke="#1e2a37" strokeWidth="1.4" />
            <rect x="5" y="5" width="210" height="68" fill="none" stroke="#1e2a37" strokeOpacity=".4" />
            <text x="110" y="30" textAnchor="middle" fontSize="16" fontFamily="var(--ff-display)" fontWeight="600" letterSpacing="3" fill="#1e2a37">
              FUKUOKA
            </text>
            <text x="110" y="48" textAnchor="middle" fontSize="10" fontFamily="var(--ff-mono)" letterSpacing="4" fill="#1e2a37">
              WORLD MAP
            </text>
            <text x="110" y="64" textAnchor="middle" fontSize="10" fontFamily="var(--ff-mincho)" letterSpacing="3" fill="#6b675c">
              福岡県 冒険地図
            </text>
          </g>
        )}

        {/* 方位図と縮尺 */}
        <g transform="translate(880 700)" opacity=".85">
          <circle r="46" fill="none" stroke="#1e2a37" strokeWidth="1" />
          <circle r="38" fill="none" stroke="#1e2a37" strokeOpacity=".4" strokeDasharray="1.5 3" />
          <path d="M0 -44 L7 0 L0 44 L-7 0 Z" fill="#1e2a37" fillOpacity=".15" stroke="#1e2a37" strokeWidth="1" />
          <path d="M0 -44 L7 0 L-7 0 Z" fill="#b3432f" />
          <path d="M-44 0 L0 6 L44 0 L0 -6 Z" fill="none" stroke="#1e2a37" strokeWidth="1" />
          <text y="-52" textAnchor="middle" fontSize="12" fontFamily="var(--ff-display)" fontWeight="600" fill="#1e2a37">
            N
          </text>
        </g>
        <g transform="translate(790 800)" fontFamily="var(--ff-mono)" fontSize="9" fill="#1e2a37">
          <rect width="40" height="5" fill="#1e2a37" />
          <rect x="40" width="40" height="5" fill="none" stroke="#1e2a37" />
          <rect x="80" width="40" height="5" fill="#1e2a37" />
          <text y="18">0</text>
          <text x="108" y="18">15km</text>
        </g>
      </svg>
    </div>
  );
}
