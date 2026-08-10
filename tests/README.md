# 自動テスト

ブラウザで開くだけで走ります。サーバー不要（`file://` で可）。

| ファイル | 内容 |
|---|---|
| `acceptance.html` | START_HERE.md の受け入れ条件8項目。26アサーション |
| `hands.html` | 30局を連続で回し、点棒の保存・毎局の決着・マイナス無し・例外無しを検証 |

Chromium で自動実行する場合:

```
chrome --headless --allow-file-access-from-files --virtual-time-budget=90000 \
  --dump-dom tests/acceptance.html | grep -oE '(PASS|FAIL)  [^<]{5,}'
```
