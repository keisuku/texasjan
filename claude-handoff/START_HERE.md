# MAHJONG HOLD'EM — Claude Opus 5 handoff

## ゴール

`visual/golden-target.webp` の見た目を保ったまま、現在のゲームロジックを本物の前景UIとして実装する。

最初の受け入れ条件は一つだけ。

> 共通牌または私牌をタップすると、その牌が最下部の「MY FINAL HAND 13 + TSUMO」に表示され、元の牌は薄くなる。最終手牌をタップすると選択が解除され、元の牌へ戻る。

## 絶対にしないこと

- 牌のドラッグ・自由移動を実装しない。
- Golden Visual全体を一枚画像として置き、その上に透明ボタンだけを重ねない。
- 14枚到達時に古い牌を自動で入れ替えない。
- +4公開時に選択済み手牌をリセットしない。
- 背景やキャラクターをAIで再生成し直さない。
- 大きな配置、比率、方向性を独断で変更しない。

## 最短の実装方針

1. `visual/arena-with-characters.webp` を固定背景として941×1672のデザイン座標で全面表示する。
2. POT、席パネル、共通牌、私牌、最終14枚、ボタンだけをHTML/CSS/JSの前景UIとして配置する。
3. 麻雀牌は `source/current-playable-reference.html` 内の `pinSVG`、`souSVG`、`faceHTML`、`.tile` CSSを再利用する。
4. クリック選択は単一の `selectedTiles` 配列で管理し、描画時に元牌と最終手牌を同期する。
5. 見た目は `visual/golden-target.webp`、状態変化は `visual/state-*.webp` を基準にする。

## 必須ロジック

```js
function selectSourceTile(source, index, tileId) {
  if (selectedTiles.length >= 14) return showLimitMessage();
  if (selectedTiles.some(x => x.source === source && x.index === index)) return;
  selectedTiles.push({ source, index, tileId });
  renderSourceTiles();
  renderFinalHand();
}

function removeFinalTile(selectedIndex) {
  selectedTiles.splice(selectedIndex, 1);
  renderSourceTiles();
  renderFinalHand();
}
```

- `source` は `common` または `private`。
- 同じ種類の牌でも物理牌ごとに `index` を持つ。
- 元牌の選択状態は `.used` で薄くし、チェックを付ける。
- 最終手牌は常に左から13枠＋右端TSUMO枠。
- 選択順ではなく麻雀の標準順で並べる。右端だけツモ牌として分離可能にする。
- 14枚未満なら空枠を表示する。
- 14枚なら追加選択を拒否し、先に最終手牌から1枚外すよう表示する。

## ゲーム進行

- 136牌：34種×4枚。
- 最初に共通牌15枚を公開。
- その後は `+4 I`、`+4 II`、`+4 III` の各4枚。
- 私牌は8枚。
- 選択可能枚数は共通牌と私牌を合わせて最大14枚。共通牌だけ14枚も許可。
- 公開牌追加時に `selectedTiles` を保持する。
- おすすめ、クリア、FOLD、CALL、RAISEは既存ロジックを再利用してよい。

## アセットの役割

- `arena-with-characters.webp`：現在の固定レイアウト用。キャラクターはここに含める。現段階で個別アニメーションは不要。
- `arena-clean.webp`：将来キャラクターを別レイヤー化するときの背景。
- `golden-target.webp`：最終見本。ゲーム画面として直接使用しない。
- `state-normal/recommend/tsumo.webp`：状態別の視覚基準。
- `traditional-tile-reference.jpeg`：牌面の意匠基準。
- `sample-9pin.png`：Golden Visualから切り出した牌品質の参考。
- `current-playable-reference.html`：牌描画・山・選択・おすすめ・ベットロジックの参照元。レイアウトをそのまま採用する必要はない。

## 最初の提出物

一画面だけでよい。以下が同時に成立した段階で人間へ確認を求める。

1. 背景とキャラクターがGolden Visualと同じ位置・大きさ。
2. 共通15枚が5×3。
3. 私牌8枚が一列。
4. 最終14枚が最下部で端から端まで一列。
5. 任意の元牌をタップすると最終手牌へ追加される。
6. 選択中の元牌が薄くなる。
7. 最終手牌をタップすると解除される。
8. ドラッグ操作は存在しない。

この8項目を満たすまでは、演出・PixiJS移行・牌の物理アニメーション・キャラクターアニメーションへ進まないこと。
