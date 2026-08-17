# MAHJONG HOLD'EM

麻雀 × ポーカーの製品開発リポジトリ。現在の `index.html` は高速ルール・数学・入力UX検証機です。最終製品の描画基盤ではありません。

製品版の制作原則・Unity / サーバー / アセット方針は、最初に **[`PRODUCTION_NORTH_STAR.md`](PRODUCTION_NORTH_STAR.md)** を読んでください。

## Control Room

**新しいセッションは [`PROJECT_STATE.md`](PROJECT_STATE.md) → [`CURRENT_TASK.md`](CURRENT_TASK.md) → [`DECISIONS.md`](DECISIONS.md) の順に読みます。**

[`orchestration/index.html`](orchestration/index.html) は、親のChatGPT Workと4つの専門レーンを起動する管制盤です。各カードから起動プロンプトをコピーし、ChatGPT Work / Codexへ貼り付けて開始できます。長い会話ログではなく、GitHubの短い状態ファイル・成果物・PRを正典にします。

## 2026-08-14 Codex / ChatGPT Work 完全引き継ぎ（アーカイブ）

過去の詳細経緯が必要な場合だけ [`CODEX_START_HERE.md`](CODEX_START_HERE.md) と `docs/handoff/` を参照してください。通常の新規セッションでは上記3ファイルと担当レーンのプロンプトだけで開始します。エージェント向けの必須読書順と禁止事項は [`AGENTS.md`](AGENTS.md) が正典です。

- 最新Clean Master：`art/clean-masters/`
- 旧V2・18画面：`art/visual-archive/v2/`
- スマホ選別HTML：`visual-exploration/index.html`
- 完全引き継ぎ：`docs/handoff/MASTER_HANDOFF_2026-08-14.md`

- 941 × 1672 のデザイン解像度。完成見本は `claude-handoff/visual/golden-target.webp`
- `index.html?calib=1` で完成見本を半透明で重ねた位置合わせモードになります
- タイトル → ロビー → 6人マッチング → 対局 → ショーダウン → 結果 → 再戦まで一周できます
- 各ストリートで6席の手番が巡り、CHECK / CALL / RAISE / FOLD / ALL-INが解決されてから次の+4を公開します
- `index.html?screen=game` のように `title` `lobby` `match` `game` `result` `cosmetics` `shop` を直接開けます

## 画像生成AIの方へ

**→ [`ASSET_BRIEF.md`](ASSET_BRIEF.md) を読んでください。** 冒頭の「★ round 4」が最新の依頼です。

牌面はCC0資産（`assets/tiles/`）でルール検証できます。製品版の牌本体・球体牌・マテリアルはGolden Visual承認後に専用制作します。

| ファイル | 内容 |
|---|---|
| [`ASSET_BRIEF.md`](ASSET_BRIEF.md) | 発注書。最初にこれ |
| [`art/art-bible.md`](art/art-bible.md) | 色・寸法・光源の実測値。必ず守る |
| [`assets/ui/MANIFEST.json`](assets/ui/MANIFEST.json) | 作るべき素材の一覧（機械可読） |
| [`art/specs/`](art/specs/) | 素材1点ごとの詳細仕様 |
| [`art/verify.html`](art/verify.html) | 納品素材（PNG）の自動検査。ブラウザで開く |
| [`art/ui-geometry.md`](art/ui-geometry.md) | **round 3**: UIフレームの共有幾何。角丸比・縁の5層・光源 |
| [`art/specs/ui-frames.md`](art/specs/ui-frames.md) | **round 3**: SVGフレーム7点の仕様 |
| [`art/verify-ui.html`](art/verify-ui.html) | **round 3**: SVGの幾何を自動判定 |
| [`mahjong-score.js`](mahjong-score.js) | 役・翻・符・評価点・13枚待ちを判定する独立エンジン |
| [`betting-engine.js`](betting-engine.js) | 手番、CALL差額、レイズ再巡回、FOLD、ALL-INを扱う描画非依存エンジン |
| [`betting-ai.js`](betting-ai.js) | 手牌寄与とポットオッズからBOTのCHECK / CALL / RAISE / FOLDを決める純粋ロジック |

`assets/ui/` の素材とCSSフォールバックはHTML検証版用です。製品素材はGolden Visualから分解し、Unity Prefab / 9-slice / material / VFX / Addressablesとして管理します。

## 開発

`claude-handoff/START_HERE.md` に元の引き継ぎ仕様、`CLAUDE.md` に作業上の制約があります。
