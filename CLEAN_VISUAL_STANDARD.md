# MAHJONG HOLD'EM — Clean Visual Standard

## North Star

豪華さは描き込み量ではなく、構図・余白・材質差・主役の明確さで作る。

## Density hierarchy

- 主役（顔、牌、POT、主要ボタン）だけ高密度
- 補助UIは中密度
- 背景は低密度かつソフトフォーカス
- 画面全域を同じ解像感で描き込まない

## Permanent limits

- 背景情報量は旧V2比40〜60%減
- 一画面の主要素材は原則3種類以内：象牙、翡翠、真鍮
- 主要アクセント光は1色、ターン表示のみシアン
- 装飾線は意味のある境界だけ
- 金色は階層強調と報酬に限定
- 光輪、渦、リボン、粒子、紙吹雪を常用しない
- 彫金、フィリグリー、微細パターンを背景へ敷き詰めない
- 全面シャープネス、全面反射、全面Bloomを禁止

## Production layering

1. 背景：軽い一枚絵。文字・ボタン・人物なし
2. キャラクター：透過立ち絵。輪郭と顔を最優先
3. 牌・卓・チップ：独立アセット
4. UI：文字、数字、ボタン、ゲージは実装側で描画
5. 演出：局所的かつ短時間。情報を隠さない

## Acceptance test

- 1秒で主役が分かる
- 25%縮小でもPOT、最終14枚、主要ボタンが読める
- 背景をぼかしても画面の価値が落ちない
- 装飾を30%消すと、むしろ高級に見える
- スクリーンショットではなく実装可能なレイヤーへ分解できる

## Clean Masters

- Lobby: `art/clean-masters/clean-master-lobby.webp`
- Gacha: `art/clean-masters/clean-master-gacha.webp`
- Match: `art/clean-masters/clean-master-match.webp`
