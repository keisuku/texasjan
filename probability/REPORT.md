# Probability Lab — seeded baseline benchmark

Generated from `probability/results.json` with seed **2026081603**. This is a reproducible pilot benchmark, not a production rule change.

## Executive finding

The current 136-tile / 15 + 4 + 4 + 4 / private-8 / free-14 baseline produces a strong reveal arc early, but the river is saturated: **100.0%** of player states can construct a complete hand, the communal board alone can construct one in **63.5%** of deals, and the simulated showdown splits in **16.8%** of deals. The correct next move is a one-factor cadence test, not a rule rewrite.

## Experiment matrix

| Candidate | Completion by street | Split pot | Common-only complete | Avg. private tiles strictly required at river |
|---|---|---:|---:|---:|
| Current baseline | 15.8% → 65.4% → 97.4% → 100.0% | 16.8% | 63.5% | 3.34 |
| Private 6 only | 4.7% → 36.3% → 87.2% → 99.9% | 25.8% | 63.0% | 2.63 |
| Private 4 only | 0.9% → 16.3% → 65.6% → 98.3% | 41.2% | 65.6% | 1.85 |
| 15 + 3 + 1 + 1 cadence only | 15.8% → 49.5% → 64.4% → 76.4% | 34.6% | 1.8% | 4.11 |
| Require at least 1 private | 15.5% → 63.6% → 97.7% → 100.0% | 18.4% | 63.2% | 3.36 |
| Require at least 2 private | 14.3% → 63.0% → 97.2% → 100.0% | 19.2% | 62.8% | 3.38 |

## Current baseline detail

| Street common total | Completion | Mean feasible route classes | Multi-route | Mean private required | Mean private attributed | Selected hand sourceable from common |
|---:|---:|---:|---:|---:|---:|---:|
| 15 | 15.8% | 0.16 | 0.5% | 5.01 | 5.21 | 0.0% |
| 19 | 65.4% | 0.78 | 11.7% | 4.22 | 4.69 | 0.1% |
| 23 | 97.4% | 1.65 | 56.3% | 3.72 | 4.44 | 0.3% |
| 27 | 100.0% | 2.33 | 91.9% | 3.34 | 4.19 | 1.0% |

- Equity leader changes after each reveal: 33.3% → 33.3% → 50.0%.
- Mean top-player equity by street: 41.6% → 44.4% → 56.9% → 94.4%.
- Mean equity dispersion (six-player standard deviation): 0.142 → 0.151 → 0.206 → 0.355.
- Effective early decision proxy: 48.6% (equity 8–50%, at least two distinct mode recommendations, and a private tile can contribute).
- Structural early-choice proxy across all baseline deals: 87.7% (same recommendation/private criteria, without the equity filter).
- Private tiles create completion where the communal board alone cannot in 36.5% of final player states.
- The total-mode recommendation beats the best communal-only comparison in 77.2% of final player states.
- Winner route share: sequence 14.8%, seven_pairs 45.0%, triplet 14.7%, flush 25.6%.

## Emotional draw bands (baseline)

Each incomplete player-state is rolled forward 24 times. The table reports the chance to become complete on the *next* reveal, then bins state-level chances around the intended emotional bands. These bands are observed, never forced.

| Reveal | States | Mean | Median | ~8% | ~16% | ~24% | ~31–35% | ~50% | >60% |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 15 → 19 | 56 | 65.2% | 70.8% | 7.1% | 0.0% | 5.4% | 7.1% | 10.7% | 69.6% |
| 19 → 23 | 23 | 95.7% | 100.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% |

## Metric definitions

- **Completion:** at least one legal 14-tile standard or seven-pairs construction exists in private + currently revealed communal tiles.
- **Split pot:** two or more players share the exact production showdown comparison score. All six remain live; betting/folds are deliberately excluded.
- **Private required:** minimum private source tiles necessary for the selected 14-tile multiset. **Private attributed** is the maximum private-source attribution, matching the UI's private-first source selection.
- **Leader change:** the highest Monte Carlo runout equity seat differs after the reveal.
- **Route diversity:** feasible completed hands span sequence, triplet, flush, and seven-pairs macro routes.
- **Effective early decision:** a proxy requiring 8–50% runout equity, at least two distinct mode recommendations (including incomplete fallback recommendations), and a private tile that can contribute.
- **Common-only complete** asks whether *some* completed hand exists on the communal board. **Selected hand sourceable from common** asks whether the mode-selected hand can be attributed entirely to communal copies. They intentionally answer different questions.

## Evaluator fidelity and bias

- Every completed 14-tile candidate is scored by the real `mahjong-score.js` engine, including yaku/han/fu/points and the production comparison key.
- Candidate construction adapts the production `solveFlexible` search and its 450,000-node ceiling. It adds explicit private-use constraints for matrix rows.
- User play is modeled as the top `total` recommendation; five opponents use the production sequence/flush/triplet/pairs/total modes.
- Incomplete hands use the production lightweight meld/pair/dora fallback. It is not exact shanten and must not be interpreted as exact mahjong equity.
- No betting, folding, opponent modeling, or personalized future tiles are simulated. Future communal tiles are fair samples without replacement.
- Equity and draw-band estimates use 12 deals × 24 rollouts per street, so they are directional; completion and split metrics use 2,000 baseline deals.

## Interpretation

1. **The problem is not simply private-8.** Reducing private tiles while leaving 27 communal tiles does not remove river saturation and can increase shared-score ties.
2. **Communal-only power is the central warning.** A high common-board completion rate means hidden information can cease to matter even when the chosen hand visually contains private tiles.
3. **The 15 + 3 + 1 + 1 row is the cleanest next probe.** It changes only reveal cadence and final communal density, preserves the current 136-tile wall and private-8 fantasy, and leaves measurable river uncertainty.
4. **Private minimums alone are weak levers.** They alter attribution more than the underlying common-board strength when players may use overlapping copies.

## Recommended next experiment

Run a higher-powered paired-seed A/B test of **15 + 4 + 1 + 1 vs. 15 + 3 + 1 + 1**, both at 136 tiles, private-8, and free selection. This isolates whether the first dramatic +4 can be preserved while two single-tile late reveals restore river survival and reduce common-board dominance.

## Reproduction

```bash
node probability/test.js
node probability/simulate.js --config probability/config.json --out probability/results.json
node probability/render-report.js probability/results.json probability/REPORT.md
```
