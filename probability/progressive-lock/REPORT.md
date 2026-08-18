# 段階固定 4→4 — paired-seed pilot

状態: **PROPOSED / 実験結果**

同じ seed **2026081804** の 120 deals を、`free` / `lock8_flop` / `lock4_4` の3条件へ同時に通した。production scorer と既存5方針を再利用し、固定処理には未来の +4 を渡していない。

| 条件 | 最終完成 | 固定後悔 | split pot | 私牌由来平均 | 共通core衝突(pair) |
|---|---:|---:|---:|---:|---:|
| free | 98.6111% | 0% | 28.3333% | 4.3708 | — |
| lock8_flop | 46.5278% | 52.0833% | 29.1667% | 4.1042 | 97.4444% |
| lock4_4 | 58.6111% | 40% | 30.8333% | 4.0972 | 95.3333% |

## 追加指標

- **free**: winner route {"flush":14.1667,"seven_pairs":57.5,"sequence":21.25,"triplet":7.0833}; route pivot —; equity leader change 15→19 / 19→23 = 50% / 66.6667%
- **lock8_flop**: winner route {"seven_pairs":58.3333,"sequence":21.6667,"triplet":9.1667,"incomplete":8.3333,"flush":2.5}; route pivot 59.6491%; equity leader change 15→19 / 19→23 = 16.6667% / 33.3333%
- **lock4_4**: winner route {"seven_pairs":53.3333,"sequence":27.0833,"triplet":13.75,"incomplete":2.5,"flush":3.3333}; route pivot 64.1304%; equity leader change 15→19 / 19→23 = 16.6667% / 50%

## 読み方

- **固定後悔**は、同一dealで free なら完成するのに、その固定条件では完成不能になったplayer-state率。
- **共通core衝突**は、2席が固定した「共通由来」の牌型に1枚以上のmultiset overlapがあるplayer-pair率。
- **route pivot**は、勝者の初回固定方針と最終完成ルートが異なる率。
- **equity movement** は 6 deals × 8 fair runouts の方向性指標。sampleが小さいため採用判断には使わない。

## 判定

この結果はルール採用ではない。次はdeal数とequity sampleを増やし、固定UI playtestと合わせて判断する。
