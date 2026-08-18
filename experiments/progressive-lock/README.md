# 固定4→2・公開4→4→4 比較操作モック

状態: **PROPOSED / 独立実験**  
本番`index.html`の採点・ベッティング・画面構造は変更しない。

## 目的

同じ卓・同じ牌資産のまま、固定 **4→2** と、比較用の固定 **4→4** を切り替えつつ、共通牌の追加公開はどちらも **4→4→4** として次の6状態を実際に触って比較する。

1. プリフロップ: 私牌8枚、固定なし
2. フロップ: 私牌8＋共通15から4枚固定
3. ターン: ＋4公開後、未固定の全牌からさらに2枚固定（比較用4→4では4枚）
4. 追加公開②: ＋4公開。固定は増やさず、情報変化だけでベットを判断
5. 追加公開③: ＋4公開後、固定6＋自由8で最終14枚（比較用4→4では固定8＋自由6）
6. ショーダウン: 全員の最終14枚と元の私牌8枚を一人ずつ確認

## 開き方

`index.html`を直接開く。上部のルール切替と6状態を押すと、比較対象と各状態へ即時移動できる。既定は4→2。

```text
experiments/progressive-lock/index.html?rule=4-2&stage=preflop
experiments/progressive-lock/index.html?rule=4-2&stage=flop
experiments/progressive-lock/index.html?rule=4-2&stage=turn
experiments/progressive-lock/index.html?rule=4-2&stage=turn2
experiments/progressive-lock/index.html?rule=4-2&stage=river
experiments/progressive-lock/index.html?rule=4-2&stage=showdown
experiments/progressive-lock/index.html?rule=4-4&stage=turn
```

## 操作

- 牌をタップして選択／解除する。ドラッグなし。
- 共通15枚で4枚到達後に「この4枚で進む」。
- ターンでは最初の4枚を変更せず、4→2では2枚を追加固定する。
- 2回目の＋4では固定を増やさず、情報変化とベット判断だけを行う。
- 3回目の＋4後、固定6枚へ自由な8枚を加える。
- 全員同時選択。追加2枚を選ぶ段階（stage 2）で他家の最初の固定4枚を背面と枚数だけ示し、全員の追加固定が完了した後（stage 3以降）に後の2枚だけをアバター横へ表向きで示す。44pxボタンから拡大できる。
- 決着後は順位をタップし、同じ大きな領域で一人ずつ最終14枚と元の私牌8枚を読む。

## 意図的に未実装

- production scorerとの接続
- AIの4枚選択
- 実ベット状態機械との接続
- 固定ルールの採用判断

これらは確率比較後に本番へ接続する。
