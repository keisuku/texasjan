# Probability Lab

Reproducible, seeded benchmark tooling for the current MAHJONG HOLD'EM working baseline. It does not alter production gameplay.

## Run

```bash
node probability/simulate.js --config probability/config.json --out probability/results.json
```

Fast smoke run:

```bash
node probability/simulate.js --quick --out /tmp/mahjong-probability-quick.json
```

One matrix row only:

```bash
node probability/simulate.js --only baseline_136_c15_4_4_4_p8_free --out /tmp/baseline.json
```

`results.json` is a committed deterministic snapshot. `REPORT.md` explains metric definitions, evaluator bias, findings, and the recommended next experiment.

