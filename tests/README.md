# 自動テスト

ブラウザで開くだけで走ります。サーバー不要（`file://` で可）。

| ファイル | 内容 |
|---|---|
| `acceptance.html` | START_HERE.md の受け入れ条件8項目。26アサーション |
| `hands.html` | 30局を連続で回し、点棒の保存・毎局の決着・マイナス無し・例外無しを検証 |
| `motion.html` | アニメーションの終状態。transform や半透明が残らないこと、ゴーストとチップが後片付けされること |
| `skins.html` | スキンの切り替え、局進行、ガチャと装備の連携 |
| `flow.html` | タイトル → ロビー → マッチング → 対局 → 結果 → ロビーの製品フロー |
| `mobile.html` | 390px実機幅で主要5画面が溢れず、操作が画面内に収まること |
| `scoring.html` | 平和・七対子・四暗刻・国士、翻符点数、13枚の待ちHUDと発光 |

`motion.html` はアニメーションを `finish()` で強制完了させて終状態だけを見ます。
ヘッドレスの仮想時間ではアニメーションが進まないため、経過を待つ方式は使えません。

静止画のスクリーンショットを撮るときは `index.html?still=1` を使ってください。
全ての animation / transition が無効になり、描画が決定的になります。

## URLパラメータ

| パラメータ | 効果 |
|---|---|
| `?still=1` | 全てのアニメーションを無効化。スクリーンショット用 |
| `?screen=game` | 起動する画面を指定（`title` `lobby` `cosmetics` `shop` `game`）。既定は `title` |
| `?skin=frame:sharp,arena:empty` | 保存せずに一時的なスキンを当てる。撮り比べ用 |
| `?calib=1` | Golden Visual を半透明で重ねる |

Chromium で自動実行する場合:

```
chrome --headless --allow-file-access-from-files --virtual-time-budget=90000 \
  --dump-dom tests/acceptance.html | grep -oE '(PASS|FAIL)  [^<]{5,}'
```
