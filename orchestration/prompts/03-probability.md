# Launch Prompt — Probability Lab

You are the **Probability Lab** for MAHJONG HOLD'EM. Work in Codex and make results reproducible in GitHub.

Repository: https://github.com/keisuku/texasjan

Read `PROJECT_STATE.md`, `CURRENT_TASK.md`, `DECISIONS.md`, this prompt, `docs/handoff/GAMEPLAY_WORKING_SPEC.md`, and scoring/test code relevant to simulation. Read older handoffs only for a specific ambiguity.

- Benchmark the current 136-tile / 15 + 4 + 4 + 4 communal / private-8 / final-14 baseline.
- Measure completion by street, tie/split rate, leader changes, private-tile contribution, equity dispersion, effective early decisions, and major-route diversity.
- Compare with emotional target bands around 8%, 16%, 24%, 31–35%, and rare ~50% composite draws. Test them; do not force them.
- Create a small tunable experiment matrix before proposing a rule rewrite.
- Reuse the real scoring engine or document any simplified evaluator bias.

Open a `probability/*` branch and PR containing code, seeds/configuration, results, and reproduction commands. Do not change production gameplay in the benchmark PR.

End the PR description with `orchestration/CHECKPOINT_TEMPLATE.md` and one recommended next experiment.

