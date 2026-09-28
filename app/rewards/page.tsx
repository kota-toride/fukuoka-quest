"use client";

import { useState } from "react";
import { Coins, Handshake, Lock, X } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { REWARDS, RARITY_STYLE, type RewardItem } from "@/lib/data/rewards";
import { zoneById } from "@/lib/data/regions";
import { Media } from "@/components/Media";
import { useAssets } from "@/lib/assets";

export default function RewardsPage() {
  const { player, lang } = useGame();
  const [pick, setPick] = useState<RewardItem | null>(null);
  const owned = (id: string) => player.redemptions.some((r) => r.rewardId === id);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label">REWARD</div>
          <h1 className="display mt-1 text-4xl font-semibold tracking-[0.04em] md:text-5xl">CABINET</h1>
          <p className="mt-2 max-w-xl font-mincho text-ink-2">
            {lang === "ja" ? "あなたの冒険で獲得したQUEST POINTを使って、福岡の特産品を手に入れよう。" : "Spend the Quest Points your adventures earned on Fukuoka's specialties."}
          </p>
        </div>
        <div className="paper-flat px-5 py-3">
          <div className="label">QUEST POINT</div>
          <div className="flex items-center gap-2 font-display text-4xl font-semibold tabular-nums">
            <Coins className="h-6 w-6 text-brass" /> {player.points.toLocaleString()}
          </div>
          <div className="font-mono text-[10px] tracking-[0.15em] text-muted">{lang === "ja" ? "冒険で獲得したポイント" : "earned by adventuring"}</div>
        </div>
      </div>

      {/* 木の棚 */}
      <div className="mt-8 border-[12px] border-wood bg-[#7a5a3c] bg-[image:var(--grain)] p-3 shadow-[inset_0_0_50px_rgba(0,0,0,.35)] md:p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REWARDS.map((r, i) => {
            const rs = RARITY_STYLE[r.rarity];
            const can = player.points >= r.points;
            const got = owned(r.id);
            return (
              <button
                key={r.id}
                onClick={() => setPick(r)}
                className="group relative flex flex-col bg-card bg-[image:var(--grain)] text-left shadow-[inset_0_-6px_0_rgba(0,0,0,.08)] transition hover:-translate-y-0.5 anim-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <Media image={r.image} seed={`item-${r.id}`} tint={rs.color} className="aspect-[4/3] border-b border-ink/30">
                  <div className="absolute inset-0 grid place-items-center">
                    <ItemGlyph item={r} dim={!can && !got} />
                  </div>
                  {got && (
                    <span className="stamp anim-stamp absolute right-4 top-4 h-20 w-20 text-[10px]" style={{ "--stamp-rot": "-12deg" } as React.CSSProperties}>
                      <span>
                        UN
                        <br />
                        LOCKED
                      </span>
                    </span>
                  )}
                  {!can && !got && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 bg-ink px-2 py-1 font-mono text-[10px] tracking-[0.15em] text-paper">
                      <Lock className="h-3 w-3" /> {lang === "ja" ? `あと ${(r.points - player.points).toLocaleString()} PT` : `${(r.points - player.points).toLocaleString()} PT TO GO`}
                    </span>
                  )}
                  <span className="absolute left-3 top-3 tag bg-card" style={{ color: rs.color }}>
                    {rs.label}
                  </span>
                </Media>
                <div className="flex flex-1 flex-col p-4">
                  <div className="font-mono text-[10px] tracking-[0.2em] text-muted">
                    {zoneById(r.region)?.[lang]} · {r.kind === "EXPERIENCE" ? "EXPERIENCE" : "ITEM"}
                  </div>
                  <div className="mt-1 font-mincho text-lg font-bold">{r.name[lang]}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{r.description[lang]}</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="font-display text-2xl font-semibold">
                      {r.points.toLocaleString()} <span className="font-mono text-xs text-muted">PT</span>
                    </span>
                    <span className={`px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] ${got ? "text-shu" : can ? "bg-forest text-paper" : "border border-ink/30 text-dim"}`}>
                      {got ? (lang === "ja" ? "獲得済み" : "OWNED") : can ? "UNLOCK" : "LOCKED"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <section className="paper-flat mt-10 flex flex-col gap-4 p-6 md:flex-row md:items-center">
        <Handshake className="h-9 w-9 shrink-0 text-earth" strokeWidth={1.3} />
        <div>
          <div className="label">HOW REWARDS WORK</div>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">
            {lang === "ja"
              ? "報酬は運営が買い付けるのではなく、地元企業・JA・漁業関係団体・観光事業者・自治体などが、地域PRとして提供します。お金で買うのではなく、冒険によって手に入れるもの。"
              : "Rewards are provided by local companies, JA, fisheries, tourism operators and municipalities. You don't buy them — you earn them by adventuring."}
          </p>
        </div>
      </section>

      {pick && <UnlockModal item={pick} onClose={() => setPick(null)} />}
    </div>
  );
}

function ItemGlyph({ item, dim }: { item: RewardItem; dim?: boolean }) {
  const { has } = useAssets();
  if (has(item.image)) return null;
  return <span className={`text-7xl drop-shadow-[0_8px_14px_rgba(60,45,20,.25)] ${dim ? "opacity-40 grayscale" : "anim-drift"}`}>{item.glyph}</span>;
}

function UnlockModal({ item, onClose }: { item: RewardItem; onClose: () => void }) {
  const { redeem, player, lang } = useGame();
  const existing = player.redemptions.find((r) => r.rewardId === item.id);
  const [code, setCode] = useState<string | null>(null);
  const rs = RARITY_STYLE[item.rarity];
  const can = player.points >= item.points;
  const shown = code ?? null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-navy/80 p-4 anim-fade-in" onClick={onClose}>
      <div className="paper anim-unfold relative w-full max-w-sm p-7 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="pointer-events-none absolute inset-2.5 border border-ink/30" />
        <button onClick={onClose} className="absolute right-4 top-4 z-10 text-muted hover:text-ink" aria-label="close">
          <X className="h-4 w-4" />
        </button>
        {!shown ? (
          <div className="relative">
            <div className="text-7xl">{item.glyph}</div>
            <div className="mt-3 font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: rs.color }}>
              {rs.label}
            </div>
            <div className="mt-1 font-mincho text-xl font-bold">{item.name[lang]}</div>
            <div className="mt-1 font-mono text-[10px] tracking-[0.15em] text-muted">PROVIDED BY · {item.provider}</div>
            {existing && <p className="mt-4 font-mincho text-sm text-shu">{lang === "ja" ? `獲得済み（引換コード ${existing.code}）` : `Owned (${existing.code})`}</p>}
            <div className="mt-5 flex items-center justify-center gap-3 font-mono text-sm">
              <span className="text-muted">{player.points.toLocaleString()}</span>
              <span className="text-dim">→</span>
              <span className={can ? "font-semibold" : "text-shu"}>{(player.points - item.points).toLocaleString()} PT</span>
            </div>
            <button onClick={() => setCode(redeem(item.id)?.code ?? null)} disabled={!can} className="btn-primary mt-6 w-full py-3.5 text-sm">
              {can ? (lang === "ja" ? `${item.points.toLocaleString()} PTでアンロック` : `UNLOCK FOR ${item.points.toLocaleString()} PT`) : lang === "ja" ? "QUEST POINTが足りない" : "NOT ENOUGH PT"}
            </button>
            {!can && <p className="mt-2 font-mincho text-xs text-muted">{lang === "ja" ? "QUESTをCLEARしてポイントを集めよう。" : "Clear quests to earn more."}</p>}
          </div>
        ) : (
          <div className="relative">
            <div className="relative mx-auto grid h-36 w-36 place-items-center">
              <div className="absolute inset-0 grid place-items-center text-7xl opacity-90">{item.glyph}</div>
              <span className="stamp anim-stamp absolute h-36 w-36 text-sm" style={{ "--stamp-rot": "-12deg" } as React.CSSProperties}>
                <span>
                  REWARD
                  <br />
                  <span className="font-display text-base font-extrabold">UNLOCKED</span>
                </span>
              </span>
            </div>
            <div className="mt-4 font-mincho text-lg font-bold">{item.name[lang]}</div>
            <div className="mx-auto mt-5 max-w-[240px] border border-dashed border-ink p-3">
              <div className="label">{lang === "ja" ? "引換コード" : "VOUCHER"}</div>
              <div className="mt-1 font-mono text-lg font-bold tracking-[0.2em]">{shown}</div>
            </div>
            <p className="mt-3 text-xs text-dim">{lang === "ja" ? "デモのため実際の発送は行われません。" : "Demo only — nothing will be shipped."}</p>
            <button onClick={onClose} className="btn-ghost mt-5 w-full py-2.5 text-xs">
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
