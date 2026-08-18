# 段階固定4→4 操作モック

状態: **PROPOSED / 独立実験**  
本番`index.html`の採点・ベッティング・画面構造は変更しない。

## 目的

同じ卓・同じ牌資産のまま、次の5状態を実際に触って比較する。

1. プリフロップ: 私牌8枚、固定なし
2. フロップ: 私牌8＋共通15から4枚固定
3. ターン: ＋4公開後、未固定の全牌からさらに4枚固定
4. リバー: ＋4公開後、固定8＋自由6で最終14枚
5. ショーダウン: 全員の最終14枚と元の私牌8枚を一人ずつ確認

## 開き方

`index.html`を直接開く。上部の5状態を押すと、各状態へ即時移動できる。

```text
experiments/progressive-lock/index.html?stage=preflop
experiments/progressive-lock/index.html?stage=flop
experiments/progressive-lock/index.html?stage=turn
experiments/progressive-lock/index.html?stage=river
experiments/progressive-lock/index.html?stage=showdown
```

## 操作

- 牌をタップして選択／解除する。ドラッグなし。
- 4枚到達後に「この4枚で進む」。
- ターンでは最初の4枚を変更できない。
- リバーでは固定8枚へ自由な6枚を加える。
- 他家には牌面を見せず、固定枚数だけを背面牌で示す想定。
- 決着後は順位をタップし、同じ大きな領域で一人ずつ最終14枚と元の私牌8枚を読む。

## 意図的に未実装

- production scorerとの接続
- AIの4枚選択
- 実ベット状態機械との接続
- 固定ルールの採用判断

これらは確率比較後に本番へ接続する。
