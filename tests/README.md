# 自動テスト

ブラウザで開くだけで走ります。サーバー不要（`file://` で可）。

| ファイル | 内容 |
|---|---|
| `acceptance.html` | START_HERE.md の受け入れ条件8項目。26アサーション |
| `hands.html` | 30局を連続で回し、点棒の保存・毎局の決着・マイナス無し・例外無しを検証 |
| `motion.html` | アニメーションの終状態。transform や半透明が残らないこと、ゴーストとチップが後片付けされること |

`motion.html` はアニメーションを `finish()` で強制完了させて終状態だけを見ます。
ヘッドレスの仮想時間ではアニメーションが進まないため、経過を待つ方式は使えません。

静止画のスクリーンショットを撮るときは `index.html?still=1` を使ってください。
全ての animation / transition が無効になり、描画が決定的になります。

Chromium で自動実行する場合:

```
chrome --headless --allow-file-access-from-files --virtual-time-budget=90000 \
  --dump-dom tests/acceptance.html | grep -oE '(PASS|FAIL)  [^<]{5,}'
```
