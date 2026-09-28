"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BookOpen, Coins, Footprints, Gift, Map as MapIcon, ScrollText, Feather, X } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ExpBar, LevelBadge } from "./hud";

const NAV = [
  { href: "/map", label: "MAP", ja: "地図", icon: MapIcon },
  { href: "/quests", label: "QUESTS", ja: "依頼", icon: ScrollText },
  { href: "/game-master", label: "GAME MASTER", ja: "GM", icon: Feather },
  { href: "/rewards", label: "REWARD", ja: "報酬", icon: Gift },
  { href: "/profile", label: "RECORD", ja: "記録", icon: BookOpen },
];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = pathname === "/" || pathname === "/vision";

  return (
    <>
      {!immersive && <TopBar />}
      <main className={immersive ? "" : "pb-24 md:pb-12"}>{children}</main>
      {!immersive && <BottomNav />}
      <NewQuestToast />
    </>
  );
}

function TopBar() {
  const { player, lang, setLang } = useGame();
  const pathname = usePathname();
  const adventuring = !!player.adventure && !pathname.startsWith("/adventure");
  return (
    <header className="sticky top-0 z-40 border-b border-ink/80 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <LogoMark />
          <span className="hidden font-display text-[15px] font-semibold tracking-[0.2em] sm:inline">FUKUOKA QUEST</span>
        </Link>

        <nav className="ml-4 hidden items-center md:flex">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`relative px-3 py-2 font-mono text-[11px] font-medium tracking-[0.2em] transition ${active ? "text-ink" : "text-muted hover:text-ink"}`}>
                {n.label}
                {active && <span className="absolute inset-x-3 -bottom-[13px] h-[3px] bg-shu" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {adventuring && (
            <Link href="/adventure" className="hidden items-center gap-1.5 border border-shu px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] text-shu sm:flex">
              <Footprints className="h-3.5 w-3.5" /> {lang === "ja" ? "冒険中" : "ON QUEST"}
            </Link>
          )}
          <Link href="/profile" className="flex items-center gap-2">
            <LevelBadge level={player.level} size={36} />
            <div className="w-20 sm:w-28">
              <div className="flex items-baseline justify-between font-mono text-[9px] tracking-[0.15em] text-muted">
                <span>{player.name}</span>
                <span>EXP</span>
              </div>
              <ExpBar level={player.level} exp={player.exp} className="mt-1" />
            </div>
          </Link>
          <Link href="/rewards" className="flex items-center gap-1.5 border border-ink/70 px-2.5 py-1.5">
            <Coins className="h-3.5 w-3.5 text-brass" />
            <span className="font-mono text-sm font-semibold tabular-nums">{player.points.toLocaleString()}</span>
            <span className="hidden font-mono text-[9px] tracking-widest text-muted sm:inline">PT</span>
          </Link>
          <button onClick={() => setLang(lang === "ja" ? "en" : "ja")} className="border border-line px-2 py-1.5 font-mono text-[10px] font-semibold tracking-widest text-muted hover:text-ink" aria-label="Switch language">
            {lang === "ja" ? "EN" : "JA"}
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const { lang, player } = useGame();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/80 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
      <div className="grid grid-cols-5">
        {NAV.map((n) => {
          const active = pathname.startsWith(n.href);
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} className="relative flex flex-col items-center gap-1 py-2.5">
              {active && <span className="absolute top-0 h-[3px] w-8 bg-shu" />}
              <Icon className={`h-5 w-5 ${active ? "text-ink" : "text-muted"}`} strokeWidth={1.6} />
              <span className={`font-mono text-[9px] font-medium tracking-[0.12em] ${active ? "text-ink" : "text-dim"}`}>{lang === "ja" ? n.ja : n.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
      {player.adventure && !pathname.startsWith("/adventure") && (
        <Link href="/adventure" className="absolute -top-11 right-3 flex items-center gap-1.5 bg-shu px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.18em] text-paper shadow-lg">
          <Footprints className="h-3.5 w-3.5" /> {lang === "ja" ? "冒険に戻る" : "RESUME"}
        </Link>
      )}
    </nav>
  );
}

/** AI GAME MASTER が QUEST を掲示したときに出る「新しい依頼書」 */
function NewQuestToast() {
  const { announcement, dismissAnnouncement, lang } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (!announcement) return;
    const t = setTimeout(dismissAnnouncement, 9000);
    return () => clearTimeout(t);
  }, [announcement, dismissAnnouncement]);

  if (!announcement) return null;
  const q = announcement.quest;
  return (
    <div key={announcement.id} className="fixed inset-x-3 top-20 z-[60] mx-auto max-w-sm md:left-auto md:right-6">
      <div className="paper tape anim-slide-in relative p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-shu">{lang === "ja" ? "NEW QUEST — 依頼が掲示された" : "NEW QUEST POSTED"}</div>
            <div className="mt-1 truncate font-mincho text-lg font-bold">{q.title[lang]}</div>
            <div className="mt-0.5 font-mono text-xs text-ink-2">
              {q.startAt && q.endAt ? `${q.startAt} — ${q.endAt} · ` : ""}+{q.exp} EXP · +{q.points} PT
            </div>
            <button
              onClick={() => {
                dismissAnnouncement();
                router.push(`/quests/${q.id}`);
              }}
              className="mt-3 font-mono text-[11px] font-bold tracking-[0.22em] text-forest underline-offset-4 hover:underline"
            >
              {lang === "ja" ? "依頼書を見る →" : "VIEW QUEST →"}
            </button>
          </div>
          <button onClick={dismissAnnouncement} className="text-muted hover:text-ink" aria-label="close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** ロゴ：方位盤と道しるべ */
export function LogoMark({ size = 30, light = false }: { size?: number; light?: boolean }) {
  const c = light ? "#f2ead9" : "#1e2a37";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="14.5" fill="none" stroke={c} strokeWidth="1.3" />
      <circle cx="16" cy="16" r="11" fill="none" stroke={c} strokeOpacity=".4" strokeWidth=".8" strokeDasharray="1 2" />
      <path d="M16 3.5 L19 16 L16 28.5 L13 16 Z" fill={c} opacity=".18" />
      <path d="M16 3.5 L19 16 L13 16 Z" fill="#b3432f" />
      <path d="M16 28.5 L19 16 L13 16 Z" fill={c} />
      <circle cx="16" cy="16" r="1.6" fill={light ? "#1c3049" : "#f2ead9"} />
    </svg>
  );
}
