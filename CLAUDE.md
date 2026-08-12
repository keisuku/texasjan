# MAHJONG HOLD'EM — Claude Code bootstrap

## 恒久的な制作規約

作業前に必ずルートの `PRODUCTION_NORTH_STAR.md` を全文読んでください。大きな配置・割合・技術基盤を変える前に人間の承認を取り、CSS/SVGの仮部品を積み重ねて商用品質へ近づいたと判断してはいけません。Golden Visualを先に承認し、そこから素材・技術・実装へ逆算することが最優先です。

最初に `claude-handoff/START_HERE.md` と `claude-handoff/ASSET_MANIFEST.json` を全文読んでください。

## 現在の位置づけと最優先課題

`index.html` は高速ルール・数学・入力UX検証機です。牌選択、14枚上限、役・待ち判定、6人のベッティング一巡は実装済みです。HTMLへCSS製の装飾を足して製品画へ近づけようとしないでください。

次の大方向は人間の承認待ちです。承認後に `PRODUCTION_NORTH_STAR.md` の GV-0（製品相当の構図3案）から開始し、Golden Visualを承認してからUnity 6.3 LTSの縦切りへ分解します。承認前にUnity移行や大規模な配置変更を独断で始めないでください。

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
