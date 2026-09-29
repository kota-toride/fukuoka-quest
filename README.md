# FUKUOKA QUEST

**福岡県を、現実世界のRPGに。** — 観光するのではなく、冒険する。

福岡で起きていること（飲食店の限定メニュー、茶農家の見学、今朝の水揚げ、天気、工房の体験…）を **AI GAME MASTER** が QUEST に変換し、
プレイヤーは冒険として現地へ向かう。移動の途中では AI が **SIDE QUEST（寄り道）** を提案し、移動そのものが冒険になる。

> 福岡には観光資源がないのではない。まだQUESTになっていないだけだ。

- **公開URL**：https://fukuoka-quest.vercel.app/
- FukuokAI Hackathon 提出用プロトタイプ

## できること

| 機能 | 内容 |
|---|---|
| WORLD MAP | 福岡県を冒険地図として表示。未踏エリアは霧、HIDDEN QUEST を「調べる」と発見できる |
| QUEST BOARD | 今日発生している依頼（LIMITED / HIDDEN / DAILY…）を掲示板形式で表示 |
| QUEST DETAIL | 依頼書：ストーリー・場所・難易度・EXP・POINT・所要時間・開催時間・報酬・地図 |
| **AI ADVENTURE ROUTE** | 7つの冒険スタイル（最短 / 最安 / QUEST最大 / 景色 / グルメ / EXP最大 / 公共交通）から、経由地と寄り道を含むルートを提案 |
| **SIDE QUEST** | ルート上のQUESTを「SIDE QUEST FOUND」として提示。寄るかどうかはプレイヤーが選ぶ |
| QUEST COMPLETE | 朱印の演出 → EXP / POINT → LEVEL UP → 称号 → 福岡探索率の更新 |
| ADVENTURER RECORD | レベル・探索率（発見エリア / 60市町村）・称号・冒険の記録 |
| REWARD CABINET | 冒険で得たPOINTで福岡の特産品をアンロック |
| **AI GAME MASTER** | 地域・資源・体験・時間を入力 → QUESTを生成（日英）→ 掲示板に追加 |
| **Dynamic QUEST** | 店舗の時間限定情報から LIMITED QUEST を発生させる |

### 「裏事情をプレイヤーに見せない」設計

- 店舗が入力する掲載目的（来店の少ない時間帯・当日の商品など）はAIの判断にだけ使い、プレイヤー向けの `Quest` 型には含めない
- AIの出力は `lib/ai/sanitize.ts` で「空席・廃棄・余剰・在庫…」などを検査し、含まれていれば安全な文面に差し替える

## デモの流れ（約5分）

1. `/` HERO → **START ADVENTURE**
2. `/map` 八女を選択 →「調べる」→ HIDDEN QUEST「八女茶の秘密を探れ」を発見
3. 依頼書 → **QUEST START**
4. ADVENTURE ROUTE で「最短でCLEAR」→ **SIDE QUEST FOUND「久留米の味を解明せよ +300 EXP / 追加15分」** → 寄り道する → 出発
5. 寄り道をCLEAR（探索率 38% → 40%）→ 八女茶をCLEAR（**LEVEL UP 07 → 08**、称号「八女茶探索者」「筑後を知る者」）
6. REWARD CABINET で 530 PT → 八女茶をアンロック
7. `/game-master` で「八女の茶農家」→ GENERATE → QUEST BOARD に掲示
8. 「博多の飲食店」→ LIMITED QUEST「博多の夜を攻略せよ」を発生

やり直すときは `/profile` 最下部の **RESET DEMO DATA**。達成条件は「DEMO: SKIP OBJECTIVES」で省略でき、現地チェックインはボタン操作で代替しています。

## 起動

```bash
npm install
npm run dev        # http://localhost:3000
```

APIキーが無くても全機能が **DEMO MODE**（ルールベース生成）で動きます。Claude で実際に生成する場合は `.env.local` に：

```
ANTHROPIC_API_KEY=sk-ant-...
# 会場のネットが不安定なときは 1 にすると、キーがあってもDEMO MODEに固定
FQ_DEMO_MODE=
```

## AIの使い方

| 用途 | エンドポイント | 内容 |
|---|---|---|
| QUEST生成 | `POST /api/game-master` | 地域資源・店舗情報から、タイトル・ストーリー（日英）・カテゴリ・難易度・EXP・報酬を構造化出力で生成 |
| ルートの語り | `POST /api/route` | ルートエンジンが計算した所要時間・経由地・SIDE QUESTをもとに、命令ではなく「提案」の口調で案内文を生成 |

- 所要時間・運賃・寄り道は `lib/game/route.ts` のルートエンジンが決定的に計算し（ダイクストラ法＋冒険スタイル別の経由地選定）、AIは「語り」だけを担当
- モデルは Claude（`@anthropic-ai/sdk`、structured outputs）。失敗・拒否時は DEMO MODE に自動フォールバック

## 技術構成

- Next.js 16（App Router）/ React 19 / TypeScript / Tailwind CSS v4
- Anthropic Claude API（`@anthropic-ai/sdk` + zod）
- プレイヤー状態はブラウザの localStorage（本番ではDBに置き換える想定）
- Vercel にデプロイ

```
app/
  page.tsx                   HERO・コンセプト
  map/                       WORLD MAP
  quests/                    QUEST BOARD
  quests/[id]/               QUEST DETAIL（依頼書）
  quests/[id]/route/         AI ADVENTURE ROUTE・SIDE QUEST
  adventure/                 冒険の進行 → QUEST COMPLETE
  rewards/                   REWARD CABINET
  profile/                   ADVENTURER RECORD
  game-master/               AI GAME MASTER（地域資源 / Dynamic QUEST）
  vision/                    クロージング用スライド
  api/game-master/           QUEST生成API（Claude or DEMO）
  api/route/                 ルート案内文API（Claude or DEMO）
components/
  WorldMap.tsx               SVGの冒険地図（地形・霧・ルート描画）
  Scene.tsx                  福岡の風景イラスト（写真が無いときの表示）
  QuestComplete.tsx          朱印のCOMPLETE演出
lib/
  data/                      シードQUEST・地域・移動グラフ・報酬・称号
  game/                      レベル・探索率ルール、ルートエンジン、プレイヤー状態
  ai/                        provider / anthropic / route-narrator / demo / sanitize
```

## 画像・動画の差し替え

`public/` にファイルを置くと自動で使われます（無い場合は福岡の風景イラストを表示）。追加後は再ビルドしてください。

| パス | 用途 |
|------|------|
| `public/videos/hero-fukuoka.mp4` | HERO動画 |
| `public/images/hero/hero-1.jpg` 〜 `hero-7.jpg` | HEROのスライド写真 |
| `public/images/quests/{id}.jpg` | QUESTの写真 |
| `public/images/items/{id}.png` | 報酬アイテム |

## 注意

- QUEST・店舗・所要時間・報酬はすべてデモ用のデータです。実在の事業者との提携や導入実績はありません。
- 地図は冒険地図としての概略図で、測量図ではありません。
