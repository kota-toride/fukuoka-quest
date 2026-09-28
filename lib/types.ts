// ============================================================
// FUKUOKA QUEST — domain model
// プレイヤーに見える「ゲームの世界」と、事業者側の「裏の事情」を
// 型レベルで分離している。PlayerQuest には内部情報を一切持たせない。
// ============================================================

export type QuestCategory =
  | "FOOD"
  | "FARM"
  | "FISH"
  | "CULTURE"
  | "PEOPLE"
  | "DISCOVERY"
  | "ADVENTURE"
  | "LIMITED"
  | "DAILY";

/** QUESTの発生タイプ（カードのラベル） */
export type QuestKind =
  | "STANDARD"
  | "LIMITED" // 時間・数量限定（Dynamic）
  | "DAILY" // 今日だけ
  | "HIDDEN" // 観光サイトに載っていない
  | "RAINY" // 天候トリガー
  | "TIME" // 時間帯トリガー
  | "SPONSOR"; // スポンサーQUEST

export type Lang = "ja" | "en";

export interface LocalizedText {
  ja: string;
  en: string;
}

export interface Sponsor {
  name: string;
  /** 例: "SUPPORTED BY" / "QUEST WEEK PARTNER" */
  label?: string;
}

export interface Objective {
  ja: string;
  en: string;
}

export interface Quest {
  id: string;
  title: LocalizedText;
  /** カードに出る短い一文 */
  tagline: LocalizedText;
  /** QUEST詳細のストーリー */
  description: LocalizedText;
  /** 地図上のゾーンID（regions.ts） */
  region: string;
  /** 具体的な場所名（LOCATION） */
  place?: LocalizedText;
  category: QuestCategory;
  kind: QuestKind;
  difficulty: 1 | 2 | 3 | 4 | 5;
  exp: number;
  points: number;
  /** 所要時間（分） */
  duration: number;
  /** "HH:mm"。Dynamic QUESTの時間窓。未指定なら終日 */
  startAt?: string;
  endAt?: string;
  /** 報酬（アイテム・体験・称号など） */
  reward: LocalizedText;
  /** クリアで獲得できる称号ID */
  titleReward?: string;
  objectives: Objective[];
  image?: string;
  video?: string;
  isHidden: boolean;
  isDynamic: boolean;
  sponsor?: Sponsor;
  /** 数量限定（プレイヤーには「残りわずか」等のゲーム表現でのみ見せる） */
  slots?: number;
  /** デモ用：現在地（博多駅）からの移動時間（分） */
  travelMinutes: number;
  /** 参加費用の目安（円） */
  cost: number;

  // ---- 将来拡張（MVPでは未使用） ----
  latitude?: number;
  longitude?: number;
  businessId?: string;
  inventory?: number;
  weatherCondition?: "rain" | "clear" | "any";
  crowdCondition?: "low" | "normal" | "high";

  /** 冒険ルートの途中で見つかる寄り道QUEST */
  isSide?: boolean;
  /** SIDE QUEST の追加所要時間（分） */
  detourMinutes?: number;

  /** AI GAME MASTER が生成した QUEST */
  generatedBy?: "ai" | "demo" | "seed";
  createdAt?: number;
}

// ---------------- AI GAME MASTER I/O ----------------

/** 地域資源 → QUEST */
export interface ResourceInput {
  region: string;
  resource: string;
  experience: string;
  hours: string;
  audience: string;
  feature: string;
}

/**
 * 店舗・事業者 → Dynamic QUEST
 * internalReason / quantity は事業者だけが見る情報。
 * プレイヤー向けテキストには絶対に出さない。
 */
export interface DynamicInput {
  businessName: string;
  region: string;
  startAt: string;
  endAt: string;
  item: string;
  quantity: number;
  exp: number;
  points: number;
  internalReason: "idle_time" | "surplus" | "new_menu" | "event";
  note?: string;
}

export type GenerateRequest =
  | { mode: "resource"; input: ResourceInput }
  | { mode: "dynamic"; input: DynamicInput };

export interface GeneratedQuest {
  title: LocalizedText;
  tagline: LocalizedText;
  story: LocalizedText;
  category: QuestCategory;
  kind: QuestKind;
  difficulty: 1 | 2 | 3 | 4 | 5;
  exp: number;
  points: number;
  duration: number;
  recommendedTime: string;
  reward: LocalizedText;
  objectives: Objective[];
  titleReward: LocalizedText;
}

export interface GenerateResponse {
  quest: GeneratedQuest;
  source: "ai" | "demo";
  /** AIがどう判断したか（事業者向けログ） */
  reasoning: string[];
}
