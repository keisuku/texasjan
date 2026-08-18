# 段階固定 4→4 / 4→2 — paired-seed pilot

状態: **PROPOSED / 実験結果**

同じ seed **2026081804** の 500 deals を、`free` / `lock8_flop` / `lock4_4` / `lock4_2` の4条件へ同時に通した。production scorer と既存5方針を再利用し、固定処理には未来の +4 を渡していない。

| 条件 | 最終完成 | 固定後悔 | split pot | 私牌由来平均 | 共通core衝突(pair) |
|---|---:|---:|---:|---:|---:|
| free | 97.8667% | 0% | 29.8% | 4.4283 | — |
| lock8_flop | 44.8333% | 53.0333% | 27% | 4.1187 | 96.7733% |
| lock4_4 | 55.8% | 42.0667% | 31.4% | 4.1267 | 95.4667% |
| lock4_2 | 63.7667% | 34.1% | 32.2% | 4.1443 | 87.6267% |

## 追加指標

- **free**: winner route {"flush":12.1667,"seven_pairs":60.2,"sequence":19.3333,"triplet":8.3}; route pivot —; equity leader change 15→19 / 19→23 = 50% / 66.6667%
- **lock8_flop**: winner route {"seven_pairs":54,"sequence":25.8,"triplet":10.4,"incomplete":7.2,"flush":2.6}; route pivot 56.392%; equity leader change 15→19 / 19→23 = 16.6667% / 33.3333%
- **lock4_4**: winner route {"seven_pairs":54,"sequence":25.2,"triplet":12.8,"incomplete":4.6,"flush":3.4}; route pivot 64.8825%; equity leader change 15→19 / 19→23 = 16.6667% / 50%
- **lock4_2**: winner route {"flush":5.4667,"seven_pairs":54.8,"sequence":23.8333,"triplet":12.9,"incomplete":3}; route pivot 67.1835%; equity leader change 15→19 / 19→23 = 66.6667% / 50%

## 読み方

- **固定後悔**は、同一dealで free なら完成するのに、その固定条件では完成不能になったplayer-state率。
- **共通core衝突**は、2席が固定した「共通由来」の牌型に1枚以上のmultiset overlapがあるplayer-pair率。
- **route pivot**は、勝者の初回固定方針と最終完成ルートが異なる率。
- **equity movement** は 6 deals × 8 fair runouts の方向性指標。sampleが小さいため採用判断には使わない。

## 判定

この結果はルール採用ではない。4→2は4→4より完成率と固定後悔を改善したが初期合格帯には未達。次は固定UI playtestとlock picker調整を先に行い、その後にdeal数とequity sampleを増やす。
