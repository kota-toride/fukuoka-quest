import {
  Compass,
  Fish,
  Flame,
  Landmark,
  Map as MapIcon,
  Mountain,
  Sprout,
  Users,
  UtensilsCrossed,
  Zap,
  CloudRain,
  Clock,
  Eye,
  Flag,
  Sparkles,
  Signpost,
  type LucideIcon,
} from "lucide-react";
import type { Quest, QuestCategory, QuestKind } from "@/lib/types";

/** scene: 写真が無いときに使うイラスト（components/Scene.tsx） */
export type SceneId = "sea" | "tea" | "yatai" | "mountain" | "canal" | "shrine" | "port";

export const CATEGORY: Record<QuestCategory, { label: string; ja: string; color: string; icon: LucideIcon; scene: SceneId }> = {
  FOOD: { label: "FOOD", ja: "食", color: "#a1522f", icon: UtensilsCrossed, scene: "yatai" },
  FARM: { label: "FARM", ja: "農", color: "#4f6b2c", icon: Sprout, scene: "tea" },
  FISH: { label: "FISH", ja: "漁", color: "#2f6476", icon: Fish, scene: "sea" },
  CULTURE: { label: "CULTURE", ja: "文化", color: "#8a3d4a", icon: Landmark, scene: "shrine" },
  PEOPLE: { label: "PEOPLE", ja: "人", color: "#7a5a2a", icon: Users, scene: "port" },
  DISCOVERY: { label: "DISCOVERY", ja: "発見", color: "#2e4a3b", icon: MapIcon, scene: "canal" },
  ADVENTURE: { label: "ADVENTURE", ja: "冒険", color: "#3d4a5c", icon: Mountain, scene: "mountain" },
  LIMITED: { label: "LIMITED", ja: "限定", color: "#b3432f", icon: Zap, scene: "yatai" },
  DAILY: { label: "DAILY", ja: "今日だけ", color: "#b3432f", icon: Flame, scene: "sea" },
};

export const KIND: Record<QuestKind, { label: string; ja: string; color: string; icon: LucideIcon }> = {
  STANDARD: { label: "QUEST", ja: "依頼", color: "#1e2a37", icon: Compass },
  LIMITED: { label: "LIMITED", ja: "時間限定", color: "#b3432f", icon: Zap },
  DAILY: { label: "DAILY", ja: "今日だけ", color: "#b3432f", icon: Flame },
  HIDDEN: { label: "HIDDEN", ja: "隠しQUEST", color: "#5a3f6b", icon: Eye },
  RAINY: { label: "RAINY", ja: "雨の日", color: "#3c6f80", icon: CloudRain },
  TIME: { label: "TIME", ja: "時間帯", color: "#8b5e3c", icon: Clock },
  SPONSOR: { label: "EVENT", ja: "イベント", color: "#a8823a", icon: Flag },
};

export const SIDE_KIND = { label: "SIDE QUEST", ja: "寄り道", color: "#2e4a3b", icon: Signpost };

/** 依頼書に貼る種別ラベル（SIDE は KIND より優先） */
export const kindOf = (q: Quest) => (q.isSide ? SIDE_KIND : KIND[q.kind]);

/** 場所のラベル：例）HAKATA / FOOD */
export const placeLabel = (zoneEn: string | undefined, q: Quest) => `${(zoneEn ?? q.region).split(" /")[0].toUpperCase()} / ${CATEGORY[q.category].label}`;

export const NewIcon = Sparkles;

const REGION_SCENE: Record<string, SceneId> = {
  fukuoka: "yatai",
  itoshima: "sea",
  munakata: "sea",
  yame: "tea",
  hirokawa: "tea",
  yanagawa: "canal",
  dazaifu: "shrine",
  kitakyushu: "port",
  tagawa: "mountain",
};

/** QUESTに使う風景：地域の風景を優先し、無ければカテゴリで選ぶ */
export const sceneFor = (q: Quest): SceneId => (q.category === "DISCOVERY" ? "canal" : REGION_SCENE[q.region] ?? CATEGORY[q.category].scene);
