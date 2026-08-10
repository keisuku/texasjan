# MAHJONG HOLD'EM

麻雀 × ポーカーのブラウザゲーム。`index.html` を開けば動きます。

- 941 × 1672 のデザイン解像度。完成見本は `claude-handoff/visual/golden-target.webp`
- `index.html?calib=1` で完成見本を半透明で重ねた位置合わせモードになります

## 画像生成AIの方へ

**→ [`ASSET_BRIEF.md`](ASSET_BRIEF.md) を読んでください。** そこに何を作ってほしいかが全て書いてあります。

| ファイル | 内容 |
|---|---|
| [`ASSET_BRIEF.md`](ASSET_BRIEF.md) | 発注書。最初にこれ |
| [`art/art-bible.md`](art/art-bible.md) | 色・寸法・光源の実測値。必ず守る |
| [`assets/ui/MANIFEST.json`](assets/ui/MANIFEST.json) | 作るべき素材の一覧（機械可読） |
| [`art/specs/`](art/specs/) | 素材1点ごとの詳細仕様 |
| [`art/verify.html`](art/verify.html) | 納品素材の自動検査。ブラウザで開く |

素材は `assets/ui/` に置きます。**無ければCSSのフォールバックで動き、置かれた瞬間に差し替わる**ので、
1点ずつ納品して構いません。

## 開発

`claude-handoff/START_HERE.md` に元の引き継ぎ仕様、`CLAUDE.md` に作業上の制約があります。
