# Claude Code 作業キュー

最終更新: 2026-08-19

Claude Codeには、大量の新規画面制作ではなく、**短い再現 → 小さい修正 → 明確な検証**で効果が高い仕事だけを任せる。

## 開始前に読むもの

1. `PROJECT_STATE.md`
2. `CURRENT_TASK.md`
3. `DECISIONS.md`
4. `TODAY_GOAL.md`
5. このファイル
6. 担当箇所に関係するファイルだけ

古い引き継ぎや全アーカイブは先に読まない。必要になったときだけ参照する。

## READY — いま1件だけ着手

### CC-01: ローカルChromium回帰検査

- 目的: ブラウザでのみ発生する壊れ方を、今日のmainで検出する。
- 時間上限: 調査30分。修正を含め最大60分。
- 実行: `bash tests/run-regression.sh`
- 対象: acceptance / hands / motion / skins / flow / mobile / scoring / visual-events。
- 修正条件: 自分のローカルで再現でき、原因を説明できる失敗だけ。
- 完了条件:
  - 実行結果をPR本文へ貼る。
  - 1不具合1コミット。
  - ゲームルールや得点を変更していない。
  - Draft PRで止める。mainへ自動マージしない。
- ブランチ: `claude/regression-2026-08-19`

貼り付け用:

```text
keisuku/texasjan の最新mainで CC-01 を実施してください。PROJECT_STATE.md → CURRENT_TASK.md → DECISIONS.md → TODAY_GOAL.md → CLAUDE_CODE_QUEUE.md → tests/README.md の順に読み、bash tests/run-regression.sh を実行してください。ローカルで再現でき、原因を説明できる失敗だけを修正します。ゲームルール、得点、固定4→2、公開15＋4＋4＋4は変更禁止です。1不具合1コミット、branchは claude/regression-2026-08-19、Draft PRで実行結果・原因・修正・未確認事項を残し、mainへはマージしないでください。
```

## NEXT — CC-01後に、1件ずつ

### CC-02: ベット状態機械の境界点検

- 対象: `betting-engine.js`、`betting-ai.js`、`tests/betting.html`。
- 見る点: 時計回り、FOLD/ALL-IN席のskip、途中RAISE後の再巡回、ショートALL-IN、点棒保存。
- 成果: 既存挙動を説明する追加テストを優先。仕様変更は提案だけにして実装しない。
- 時間上限: 45分。
- ブランチ: `claude/betting-boundaries-2026-08-19`

### CC-03: 390px操作性・日本語表示の点検

- 対象: title → lobby → match → game → result → cosmetics → gacha。
- 見る点: 横溢れ、文字重複、44px未満の主要操作、画面外操作、可視英語、disabledの誤操作。
- 成果: スクリーンショットと再現手順。修正はCSS/DOMの小差分だけ。
- 禁止: 新規画像生成、全面レイアウト変更、Golden Visualの差し替え。
- 時間上限: 45分。
- ブランチ: `claude/mobile-japanese-audit-2026-08-19`

### CC-04: 得点エンジンの性質テスト追加

- 対象: `mahjong-score.js`、`tests/scoring.html`。
- 見る点: 牌順入れ替え不変、入力を破壊しない、既知役、境界翻符、無効枚数。
- 成果: 反例が出る最小テスト。既存の役定義を推測で変更しない。
- 時間上限: 45分。
- ブランチ: `claude/scoring-properties-2026-08-19`

## Claude Codeに任せないもの

- Golden Visualの採否、新規キャラクター、画面全体の美術判断。
- ルールの採用判断、配当、確率バランスの最終決定。
- 50画面生成、フレームワーク移行、大規模リファクタ。
- 未確認の生成画像追加、CSSだけで作る安い代替素材。
- 複数課題をまとめた巨大PR。

## PR本文の最小テンプレート

```markdown
## 対象
CC-0X:

## 再現
- 実行コマンド:
- 失敗したテスト:
- 再現環境:

## 原因

## 変更

## 検証

## 触っていないもの
- ゲームルール
- 得点仕様
- Golden Visual

## 未確認
```
