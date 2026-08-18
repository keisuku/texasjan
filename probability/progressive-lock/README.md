# Progressive lock paired-seed simulation

Status: **PROPOSED experiment.** This directory does not change production gameplay.

It compares three conditions on the exact same seeded deals:

- `free`: final 14 chosen freely from private 8 + communal 15 + 4 + 4.
- `lock8_flop`: lock 8 after communal 15 is visible.
- `lock4_4`: lock 4 after communal 15, then 4 more after communal 19.

## Reproduce

```bash
node probability/progressive-lock/test.js
node probability/progressive-lock/simulate.js \
  --config probability/progressive-lock/config.json \
  --out probability/progressive-lock/sample-results.json \
  --report probability/progressive-lock/REPORT.md
```

Fast smoke run:

```bash
node probability/progressive-lock/simulate.js --quick \
  --out /tmp/progressive-lock.json \
  --report /tmp/progressive-lock.md
```

## Fidelity

- Completed hands use the repository's real `mahjong-score.js` scorer.
- Candidate generation and the `total / sequence / flush / triplet / pairs` ranks are copied from `probability/simulate.js` at base commit `bc9213b2945bc209a27031674ff9e9e295f21490`.
- The only solver addition is a mandatory locked-tile multiset.
- One deal is generated once, then all three variants evaluate it. There is no variant-specific deal RNG.
- `chooseLocks()` accepts no wall or future-reveal argument. The test locks this invariant.

## Metric cautions

- `averagePrivateAttributed` is the maximum feasible private-source attribution, matching the existing benchmark convention.
- `sharedCoreCollisionPairPct` counts player pairs whose common-origin locked multisets overlap by at least one tile type.
- Equity movement is a small directional Monte Carlo sample, not an adoption-grade estimate.
- Betting and folding are excluded; all six seats reach showdown.
