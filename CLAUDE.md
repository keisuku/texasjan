# MAHJONG HOLD'EM — Claude Code bootstrap

最初に `claude-handoff/START_HERE.md` と `claude-handoff/ASSET_MANIFEST.json` を全文読んでください。

## 現在の最優先課題

既存の `index.html` を基礎に、次の一操作をGolden Visualの見た目で成立させること。

> 共通牌または私牌をタップすると、同じ牌が最下部の最終14枚へ追加され、元牌は薄くなる。最終手牌をタップすると解除される。

## 重要な禁止事項

- 牌をドラッグさせない。
- 牌を自由移動させない。
- `sprite-lab.html` を実装の基礎にしない。これは不要なドラッグ検証であり、破棄した実験である。
- Golden Visualを一枚画像として表示し、透明ボタンだけを重ねる実装にしない。
- 14枚到達時に古い牌を自動交換しない。
- +4公開時に選択済み手牌をリセットしない。
- 大きな配置・割合・方向性を独断で変更しない。必要ならコードを書く前に説明し、承認を求める。

## 視覚基準

- 完成見本：`claude-handoff/visual/golden-target.webp`
- 最初の実装背景：`claude-handoff/visual/arena-with-characters.webp`
- 将来の分離用背景：`assets/golden-arena-backplate-v1.webp`
- 状態見本：`claude-handoff/visual/state-*.webp`
- 牌の描画とゲームロジック：ルートの `index.html`

最初は `claude-handoff/START_HERE.md` の受け入れ条件8項目だけを完成させ、941×1672のスクリーンショットをGolden Visualと比較して人間へ確認を求めてください。
