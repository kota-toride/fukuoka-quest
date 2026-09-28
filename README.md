# FUKUOKA QUEST

**福岡県を、現実世界のRPGに。** — 観光するのではなく、冒険する。

福岡で起きていること（店・農家・漁業・文化・今日だけの出来事）を AI GAME MASTER が QUEST に変換し、
プレイヤーが実際に動くことで地域経済まで動かすサービスのハッカソン用MVP。

## 起動

```bash
npm install
npm run dev        # http://localhost:3000
```

APIキー無しで全機能が **DEMO MODE** で動きます。Claude で実際に生成する場合は `.env.local` に：

```
ANTHROPIC_API_KEY=sk-ant-...
# 会場のネットが不安定なときは 1 にすると、キーがあってもDEMO MODEに固定
FQ_DEMO_MODE=
```

## 5分デモの流れ

| # | 画面 | 操作 |
|---|------|------|
| 1 | `/` HERO | 映像 → 「START ADVENTURE」 |
| 2 | `/map` WORLD MAP | 八女（未探索・HIDDEN 2）を見せる |
| 3 | `/quests` NOW QUEST | 右上 **DEMO CLOCK** を ON（17:30に固定 → 17–19時のLIMITEDがLIVE表示になる） |
| 4 | HIDDEN QUEST | 「？？？？？（八女 +800）」をタップ → SCANNING → DISCOVERED |
| 5 | `/quests/yame-tea` | STORY → QUEST START → CHECK-IN（GPS演出）→ QUEST CLEAR |
| 6 | QUEST COMPLETE | +800 EXP → +100 PT → LEVEL UP 12→13 → 称号「八女茶ハンター」→ 探索率 27→29% |
| 7 | `/rewards` | 八女茶 500PT と交換 → 引換コード |
| 8 | `/game-master` 地域資源 | 初期値のまま「QUESTを生成」→「八女茶の秘密を探れ」★★ / 800EXP / 100PT |
| 9 | `/game-master` 店舗 | 「DYNAMIC QUESTを生成」→ 事業者の裏事情とプレイヤー表示の分離を見せる → 「今すぐQUESTを出現させる」 |
| 10 | NEW QUEST 演出 | → QUEST BOARD に NEW QUEST として出現、全画面に通知 |
| 11 | `/vision` | クロージング（← → キー / クリックで送る） |

デモをやり直すときは `/profile` 最下部の **RESET DEMO DATA**。

## 構成

```
app/
  page.tsx               HERO + コンセプト
  map/                   WORLD MAP（SVGのオリジナル世界地図）
  quests/                QUEST BOARD（NOW / HIDDEN / LIMITED / スポンサーイベント）
  quests/[id]/           QUEST詳細 → 進行中 → COMPLETE演出
  rewards/               REWARD SHOP
  profile/               レベル・探索率・称号
  game-master/           AI GAME MASTER（地域資源 / 店舗Dynamic）
  vision/                ピッチ用スライド
  api/game-master/       生成API（Claude or DEMO）
lib/
  types.ts               Quest 型（将来拡張: lat/lng, businessId, inventory, weather, crowd）
  data/                  シードQUEST・地域・報酬・称号
  game/                  レベル/探索率ルール、プレイヤー状態（localStorage）
  ai/                    provider（切替）/ anthropic / demo / sanitize（裏事情ワード除去）
```

### 「裏事情をプレイヤーに見せない」仕組み

- 店舗入力の `internalReason`（来店の少ない時間帯・当日商品など）はAIの判断にだけ使い、`Quest` 型には入らない
- AI出力は `lib/ai/sanitize.ts` で「空席・廃棄・余剰・在庫…」等を検査し、含まれていれば安全な文面に差し替え

## 画像・動画の置き場所

ファイルを置くだけで自動的に使われます（無ければグラデーション＋等高線アートにフォールバック）。
本番ビルド（`npm run build`）は素材一覧をビルド時に読むので、素材を追加したら再ビルドしてください。

| パス | 用途 | 推奨サイズ |
|------|------|------------|
| `public/videos/hero-fukuoka.mp4` | HERO動画（5–10秒・ループ） | 1920×1080, H.264, 〜8MB, 音声なし |
| `public/videos/quest-yame.mp4` | 八女茶QUEST 背景（10–15秒） | 1920×1080 |
| `public/videos/quest-dynamic.mp4` | Dynamic QUEST 出現演出（店舗→夜→街） | 1920×1080 |
| `public/images/hero/hero-1.jpg` 〜 `hero-7.jpg` | 動画が無い時のHEROスライド（街/海/茶畑/川/食/人/夜） | 1920×1080 |
| `public/images/quests/{id}.jpg` | QUESTカード・詳細の背景 | 1600×1000 |
| `public/images/items/{id}.png` | 報酬アイテム | 800×600（透過PNG推奨） |
| `public/images/ui/map-texture.jpg` | WORLD MAPの質感テクスチャ | 2000×1760 |
| `public/images/ui/quest-complete.jpg` | COMPLETE演出の背景 | 1920×1080 |
| `public/images/characters/avatar.png` | プロフィールのアバター | 512×512 |
