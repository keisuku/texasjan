# MAHJONG HOLD'EM

麻雀 × ポーカーのブラウザゲーム。`index.html` を開けば動きます。

## Control Room

**新しいセッションは [`PROJECT_STATE.md`](PROJECT_STATE.md) → [`CURRENT_TASK.md`](CURRENT_TASK.md) → [`DECISIONS.md`](DECISIONS.md) の順に読みます。**

[`orchestration/index.html`](orchestration/index.html) は、親のChatGPT Workと4つの専門レーンを起動する管制盤です。各カードから起動プロンプトをコピーし、ChatGPT Work / Codexへ貼り付けて開始できます。長い会話ログではなく、GitHubの短い状態ファイル・成果物・PRを正典にします。

## 2026-08-14 Codex / ChatGPT Work 引き継ぎ

**新しい作業セッションは、最初に [`CODEX_START_HERE.md`](CODEX_START_HERE.md) を読んでください。**

最新の高評価ビジュアル、50方向探索計画、ゲーム仕様の現行仮説、Codex移行方針、過去の重要フィードバックを `docs/handoff/` に保存しています。エージェント向けの必須読書順と禁止事項は [`AGENTS.md`](AGENTS.md) が正典です。

- 最新Clean Master：`art/clean-masters/`
- 旧V2・18画面：`art/visual-archive/v2/`
- スマホ選別HTML：`visual-exploration/index.html`
- 完全引き継ぎ：`docs/handoff/MASTER_HANDOFF_2026-08-14.md`

- 941 × 1672 のデザイン解像度。完成見本は `claude-handoff/visual/golden-target.webp`
- `index.html?calib=1` で完成見本を半透明で重ねた位置合わせモードになります
- タイトル → ロビー → 6人マッチング → 対局 → ショーダウン → 結果 → 再戦まで一周できます
- `index.html?screen=game` のように `title` `lobby` `match` `game` `result` `cosmetics` `shop` を直接開けます

## 画像生成AIの方へ

**→ [`ASSET_BRIEF.md`](ASSET_BRIEF.md) を読んでください。** 冒頭の「★ round 4」が最新の依頼です。

牌面はCC0の正規資産（`assets/tiles/`）で完了済みです。**牌の作業は不要**です。

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

素材は `assets/ui/` に置きます。**無ければCSSのフォールバックで動き、置かれた瞬間に差し替わる**ので、
1点ずつ納品して構いません。

## 開発

`claude-handoff/START_HERE.md` に元の引き継ぎ仕様、`CLAUDE.md` に作業上の制約があります。

