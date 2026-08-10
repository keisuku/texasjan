# ChatGPT asset production report

生成日: 2026-08-10  
対象: `assets/ui/MANIFEST.json` の全15点

## 制作方法

- OpenAI built-in image generation を各素材1点ずつ使用
- `golden-target.webp`、`sample-9pin.png`、`traditional-tile-reference.jpeg` を用途別の参照画像として使用
- 通常素材は均一な `#FF00FF` 背景で生成し、OpenAI imagegen skill の `remove_chroma_key.py` で透過化
- FX 2点は純黒背景で再生成し、輝度をアルファへ変換して色かぶりを除去
- ImageMagick Lanczos で MANIFEST の指定寸法へ校正
- 全素材で左上約315°の光源、文字・ロゴなしを統一

## 最終プロンプト仕様

全プロンプト共通:

> Create one production-ready reusable 2D game UI sprite. Match the supplied commercial fantasy casino-game reference. Use upper-left light at about 315 degrees. Draw only the requested object; no text, digits, logo, label, watermark, scenery, external cast shadow, or extra object. Keep the center of every 9-slice asset quiet and stretch-safe. Use a perfectly uniform chroma-key background and never use the key color in the object.

素材別の最終指示:

| ID | 最終プロンプトの固有要件 |
|---|---|
| `tile-body-flat` | 260×292比率。無地の象牙牌。上端 `#FFFDF1`、牌面 `#E1D1C2`、下端11%を `#735F4D → #594D41 → #1A1410` の多段面取り。 |
| `tile-body-upright` | 248×460比率。flatと同材質の正面向き無地牌。下端面取り6–8%。 |
| `tile-back-flat` | flatと同一牌体。紺 `#2C4D8C → #17325F → #0C2145` の落ち込み面、中央に `#ECD28A` の金菱形。 |
| `frame-gold-plate` | 560×268比率。明金外リム、濃茶の多層縁、平坦なクリーム内面。中央は数字用に無装飾。 |
| `frame-gold-ribbon` | 640×112比率。黒緑の地、細い金縁、左右端の菱形フィニアル。中央無装飾。 |
| `frame-seat-plate` | 320×96比率。`#092016` の地に控えめな細い金枠。 |
| `frame-group` | 500×664比率。暗緑の縦長枠、2×2牌領域、下部ラベル帯。 |
| `btn-fold` | 864×660比率。上 `#B82915`、下 `#580C01`、上下に厚い金リム。 |
| `btn-call` | 880×660比率。最上部 `#64CFFF` のガラス反射、`#0D7CE0 → #012B6A`、明るい下リム。 |
| `btn-raise` | 908×660比率。`#FED4A0 → #F09A33 → #8A4B0F`、明るい金リム。 |
| `dial` | 792×792比率。濃紺円盤、厚い多層金環、上下左右の方位飾り、中央無装飾。 |
| `chip-stack` | 240×320比率。赤白チップ6–10枚の少し不揃いな積層。 |
| `chip-single` | 128×128比率。やや俯瞰、回転に耐えるほぼ正円の赤白チップ。 |
| `fx-glow` | 純黒地。完全な円形の白芯→`#FFE49A`→黒への連続放射グロー。輝度をアルファへ変換。 |
| `fx-sparkle` | 純黒地。白芯と淡金の縦横四芒星。輝度をアルファへ変換。 |

## 検査結果

- 15/15点が MANIFEST 指定寸法と一致
- 15/15点が RGBA PNG
- 全素材の四隅に透明画素あり
- `tile-body-flat`: 上端輝度239 / 本体189–215 / 面取り177→16
- `tile-body-upright`: 上端輝度244 / 本体203–217 / 面取り203→15
- 牌2点は `art/verify.html` の明暗ゲートを満たす

一覧画像: `art/generated-assets-contact-sheet.webp`
