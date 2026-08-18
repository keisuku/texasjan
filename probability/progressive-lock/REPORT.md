# 固定4→2・公開4→4→4 — paired-seed pilot

状態: **WORKING BASELINE / 実験結果**

同じ seed **2026081804** の 500 deals を、`free` / `lock8_flop` / `lock4_4` / `lock4_2` の4条件へ同時に通した。共通牌は15＋4＋4＋4＝27枚。production scorer と既存5方針を再利用し、固定処理には未来の +4 を渡していない。

| 条件 | 最終完成 | 固定後悔 | split pot | 私牌由来平均 | 共通core衝突(pair) |
|---|---:|---:|---:|---:|---:|
| free | 100% | 0% | 19.6% | 4.1813 | — |
| lock8_flop | 55.4667% | 44.5333% | 22% | 4.0557 | 96.7733% |
| lock4_4 | 64.9333% | 35.0667% | 25.2% | 3.9877 | 95.4667% |
| lock4_2 | 76.3% | 23.7% | 23.4% | 4.002 | 87.6267% |

## 23枚版との差（lock4_2）

| 公開 | 最終完成 | 固定後悔 | split pot |
|---|---:|---:|---:|
| 15＋4＋4＝23枚 | 63.7667% | 34.1% | 32.2% |
| 15＋4＋4＋4＝27枚 | 76.3% | 23.7% | 23.4% |

27枚化で完成率は **+12.5333pt**、固定後悔は **-10.4pt**、split potは **-8.8pt**。同じ固定6枚でも、最後の4枚が救済と勝敗分離の両方に効いている。

## 追加指標

- **free**: winner route {"flush":26.2,"seven_pairs":46.4,"triplet":14.9,"sequence":12.5}; route pivot —; equity leader change 15→19 / 19→23 / 23→27 = 50% / 50% / 16.6667%
- **lock8_flop**: winner route {"seven_pairs":49.8,"sequence":25.2,"triplet":15.8,"incomplete":3,"flush":6.2}; route pivot 57.6169%; equity leader change 15→19 / 19→23 / 23→27 = 50% / 50% / 33.3333%
- **lock4_4**: winner route {"seven_pairs":47,"sequence":21.7667,"triplet":21.3667,"incomplete":3,"flush":6.8667}; route pivot 63.925%; equity leader change 15→19 / 19→23 / 23→27 = 50% / 66.6667% / 33.3333%
- **lock4_2**: winner route {"flush":11.0667,"seven_pairs":46.4,"sequence":18.8333,"triplet":21.9,"incomplete":1.8}; route pivot 65.9884%; equity leader change 15→19 / 19→23 / 23→27 = 33.3333% / 33.3333% / 33.3333%

## 読み方

- **固定後悔**は、同一dealで free なら完成するのに、その固定条件では完成不能になったplayer-state率。
- **共通core衝突**は、2席が固定した「共通由来」の牌型に1枚以上のmultiset overlapがあるplayer-pair率。
- **route pivot**は、勝者の初回固定方針と最終完成ルートが異なる率。
- **equity movement** は 6 deals × 8 fair runouts の方向性指標。sampleが小さいため採用判断には使わない。

## 判定

人間の操作感では固定4→2を維持し、追加公開を4→4→4へ戻す方向を作業基準とする。完成76.3%は初期合格帯75–92%へ入った。固定後悔23.7%は目標20%以下に少し届かないため、本番採用前に追加playtestを続ける。
