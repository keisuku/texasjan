# Visual Exploration Gallery

## 全ボタン品質選定

`button-lab.html` は、現行の薄いCSSボタンを廃止するための専用比較画面です。実PNG／SVGアセット3系統を同じ文言・同じ操作階層・同じ状態差で比較し、「この方向を採用／良い部分だけ使う／今回は使わない」を日本語で保存します。

この比較で明示承認された系統だけを本番全画面へ展開します。

Open `index.html` in a browser. It is optimized for a portrait phone but works on desktop.

Features:

- Clean Masters first;
- full V2 18-screen archive;
- KEEP / MIX / DROP;
- 1–5 score;
- free notes;
- filter and verdict summary;
- localStorage persistence;
- Japanese text and JSON export.

The image files live under `art/clean-masters/` and `art/visual-archive/v2/` so the gallery contains no base64 duplicates.

The current 21 references are only the seed. After macro-direction approval, extend the gallery to the 5 × 10 plan in `docs/handoff/ROADMAP_50_DIRECTIONS.md`.
