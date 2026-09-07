# 再開版の検証結果 — 2026-09-07

対象: `build/holdem-restart-20260907`。分岐元: main `af4765c3a376e55d6f978a38483e5f5c87b0fc0f`。

## 確認結果

| 検査 | 結果 |
|---|---|
| `tests/visual-shell.js` | PASS |
| `tests/cosmetic-catalog.js` | PASS |
| `tests/betting-integrity.js` | PASS |
| `tests/hand-strategy.js` | PASS |
| `tests/play-session.js` | PASS |
| `tests/game-integration.cjs` | PASS |
| `syntax:betting-engine.js` | PASS |
| `syntax:betting-ai.js` | PASS |
| `syntax:mahjong-score.js` | PASS |
| `syntax:skins/manifest.js` | PASS |
| `syntax:pot-settlement.js` | PASS |
| `syntax:hand-strategy.js` | PASS |
| `syntax:play-session.js` | PASS |
| `syntax:play-experience.js` | PASS |

- ベット・精算: 22条件。固定seed2,000局で点数保存、オールイン、フォールド、同点を確認。
- 手牌探索: 実採点エンジンを用いる独立全列挙との8条件照合、固定seed120局、固定牌・コピー数・探索上限を確認。
- ゲーム接続: Nodeの9検査群で、実コードの30局進行・イベント・実DOM書き込みを確認。
- 配牌再現: 同じ牌山・席順・開始持ち点、ランク・通常集計からの練習分離、通常対局への復帰。
- 静的出力: 103ファイル、約14.8MB。ローカル参照の解決と構文を確認。

## 基準版との比較

Node接続検査で、基準版は未決着の再開で総点数が28,150→26,516へ減ること、共通23枚の段階で決着できること、決着後の牌を変更できることを確認した。再開版ではそれぞれ修正を検証した。

## 検証できていない範囲

実ブラウザのURL制約により、acceptance / hands / motion / skins / flow / mobile / scoring / visual-events / betting / progressive-lockの**ブラウザ実行は完了していない**。Nodeで検証した状態遷移とDOM要素は、CSS配置・素材表示・アニメーション・Safariの実機挙動の保証ではない。

`tests/run-browser-regression.cjs` に、実ブラウザ10種の検査、例外・タイムアウト検出、390×844と941×1672の撮影手順を追加した。後続環境で実行してから見た目の完成を判断する。

## 実行コマンド

```bash
node tests/run-browser-regression.cjs --static-only --output /tmp/texasjan-node-qa
node tests/run-browser-regression.cjs --output /tmp/texasjan-browser-qa --screenshots
```

上段はNodeの論理・構文検査のみ。下段はPlaywrightとChromiumがある環境で実行する。検証が省略された状態を全PASSとして記録しない。

## 確認版と保存先

- [本人用確認版](https://texasjan-restart.keisuk03.chatgpt.site)
- [実装PR #48](https://github.com/keisuku/texasjan/pull/48)（draft・main未反映）

確認版は実装コミット `9a16e6c941655672fd63fb99201cbdb40f93f12b` と同一のゲームソースを使用。2026-09-07に本人用配信の成功を確認した。以後のPR変更は文書のリンク追記のみ。
