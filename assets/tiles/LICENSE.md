# 牌面ベクター資産の出典

このディレクトリの SVG は **[FluffyStuff/riichi-mahjong-tiles](https://github.com/FluffyStuff/riichi-mahjong-tiles)** の `Regular/` から取得したものです。

- ライセンス: **CC0 1.0 Universal（パブリックドメイン）**
- <https://github.com/FluffyStuff/riichi-mahjong-tiles/blob/master/LICENSE.md>
- CC0 のため帰属表示の義務はありませんが、資産の出所を追えるよう記録しています
- 商用利用・改変・再配布いずれも自由です

## 内訳（40点）

| 種別 | ファイル |
|---|---|
| 萬子 | `Man1`–`Man9` |
| 筒子 | `Pin1`–`Pin9` |
| 索子 | `Sou1`–`Sou9` |
| 風牌 | `Ton`(東) `Nan`(南) `Shaa`(西) `Pei`(北) |
| 三元牌 | `Haku`(白) `Hatsu`(發) `Chun`(中) |
| 赤ドラ | `Man5-Dora` `Pin5-Dora` `Sou5-Dora`（未使用。将来用に保持） |
| 牌体 | `Front` `Back` `Blank`（未使用。牌体は `assets/ui/tile-body-*.png` を使用中） |

## なぜ自作をやめたか

以前は `index.html` 内で筒子を `<circle>` の並び、索子を角丸長方形で自作していました。
麻雀牌の意匠は標準化されたもので、萬字の筆形・筒の輪の三層構造・索の節・一索の鳥は
自作で再現すべきものではありません。正規の資産に置き換えました。
