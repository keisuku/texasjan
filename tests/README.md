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
| `visual-events.html` | 実データ連動のALL-IN表示と、勝利時だけ有効になる局所演出 |
| `progressive-lock.html` | プリフロップ固定なし→4枚固定→追加2枚固定→固定を増やさない＋4→最後の＋4→最終14枚の独立操作モック |
| `visual-shell.js` | タイトル、ロビー、モード選択、装飾品、ガチャが評価済みGolden Visualへ接続され、主要操作が残っていること |
| `cosmetic-catalog.js` | ガチャ排出物が実プレビュー素材を持ち、未完成の色見本が排出・装飾品一覧へ混入しないこと |

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

`betting.html` は描画非依存のベッティング状態機械を検査します。通常の一巡、途中レイズによる手番の戻り、全員フォールド、ショートオールインを対象にします。

`node tests/simulate-betting.js 100000` は固定seedで10万局のBOTベッティングを再現し、ストリート別POT分布、行動数、点棒保存違反をJSON出力します。
採用中の基準値は `betting-baseline.json` に保存しています。これは賭けテンポの回帰基準で、役・エクイティの完成基準ではありません。

`node tests/visual-shell.js` はブラウザを使わず、仮設Golden Visualの5画面、参照画像、主要導線を検査します。

`node tests/cosmetic-catalog.js` は、完成済み装飾品だけがガチャへ入り、各報酬のプレビュー素材が実在することを検査します。

Chromium で自動実行する場合:

```
chrome --headless --allow-file-access-from-files --virtual-time-budget=90000 \
  --dump-dom tests/acceptance.html | grep -oE '(PASS|FAIL)  [^<]{5,}'
```

主要ブラウザ検査・静的検査・構文検査をまとめて実行する場合:

```bash
bash tests/run-regression.sh
```

Chromeを自動検出できない環境では、`BROWSER_BIN=/path/to/chrome bash tests/run-regression.sh` と指定します。終了コード0が全PASS、1がテスト失敗、2がブラウザ未検出です。

## Playwrightによる実時間の一括検証

```bash
node tests/run-browser-regression.cjs --output /tmp/mahjong-qa --screenshots
```

既存の10検査（上記8種＋`betting`＋`progressive-lock`）を、検査ごとに保存状態を分離して実行します。仮想時間を使わず、終了マーカー、失敗行、未捕捉例外、クラッシュ、タイムアウトを確認します。部分的なPASSだけでは合格にしません。

PlaywrightとChromiumを事前に用意してください。ローカルの`playwright`パッケージを優先し、`CODEX_PRIMARY_RUNTIME_NODE_MODULES`があればそこも参照します。既存Chromeは`BROWSER_BIN=/path/to/chrome`で指定できます。このスクリプトがソフトウェアを自動取得することはありません。

- `--output`: 各検査の全文と`regression.json`を保存。
- `--screenshots`: 対局・結果を390×844、941×1672で保存。`--output`必須。
- `--tests acceptance,flow`: 対象を限定。
- `--timeout 120000`: 一つの読み込み／終了待ちの上限（ミリ秒）。
- `--root /path/to/source`: 別のソーススナップショットを検証。
- `--static-only`: ブラウザを起動せず、既存のNode静的検査と構文検査だけを実行。

終了コードは0＝指定検査合格、1＝検査失敗、2＝設定・起動などにより完了できなかった状態です。

## Nodeだけでのゲーム進行検証

```bash
node tests/game-integration.cjs
```

実際の`index.html`と外部スクリプトをNodeのVMへ読み込み、画面遷移のイベントハンドラー、固定牌、おすすめ、30局の進行、点棒保存、決着の二重実行防止を検証します。再開版では同一配牌の練習、ランク・集計の分離、通常対局への復帰、ガイドの開閉、フォールド後の進行も検査します。比較元は`node tests/game-integration.cjs /path/to/source`で指定できます。

**これはブラウザ検証ではありません。** `tests/helpers/game-vm.cjs`の限定的なDOM代替を使い、通常は描画を無効化します。一つのスモーク検査では実際の`renderCore()`を実行し、牌要素の数、進行文言、操作ボタンの無効状態、結果の支払表示まで確認します。CSS、画面寸法、素材表示、アニメーション、実ブラウザのイベント挙動は保証しません。描画の完成判定には上のブラウザ検査と実画像確認が必要です。
