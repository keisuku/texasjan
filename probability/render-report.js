#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const input = path.resolve(process.argv[2] || path.join(__dirname, "results.json"));
const output = path.resolve(process.argv[3] || path.join(__dirname, "REPORT.md"));
const data = JSON.parse(fs.readFileSync(input, "utf8"));

function tableRow(r) {
  const c = r.streets.map(s => s.completionPct.toFixed(1) + "%").join(" → ");
  return `| ${r.label} | ${c} | ${r.river.splitPotPct.toFixed(1)}% | ${r.river.commonBoardCompletePct.toFixed(1)}% | ${r.streets.at(-1).averagePrivateRequired.toFixed(2)} |`;
}

const b = data.results.find(r => r.id.startsWith("baseline_"));
const bands = b.equity.streets.map((s, i) => {
  const d = s.nextStreetCompletionDraw;
  if (!d) return "";
  return `| ${s.commonTiles} → ${b.equity.streets[i + 1].commonTiles} | ${d.states} | ${d.meanPct.toFixed(1)}% | ${d.medianPct.toFixed(1)}% | ${d.bandSharePct.around8.toFixed(1)}% | ${d.bandSharePct.around16.toFixed(1)}% | ${d.bandSharePct.around24.toFixed(1)}% | ${d.bandSharePct.around33.toFixed(1)}% | ${d.bandSharePct.around50.toFixed(1)}% | ${d.bandSharePct.above60.toFixed(1)}% |`;
}).filter(Boolean).join("\n");

const md = `# Probability Lab — seeded baseline benchmark

Generated from \`probability/results.json\` with seed **${data.seed}**. This is a reproducible pilot benchmark, not a production rule change.

## Executive finding

The current 136-tile / 15 + 4 + 4 + 4 / private-8 / free-14 baseline produces a strong reveal arc early, but the river is saturated: **${b.streets.at(-1).completionPct.toFixed(1)}%** of player states can construct a complete hand, the communal board alone can construct one in **${b.river.commonBoardCompletePct.toFixed(1)}%** of deals, and the simulated showdown splits in **${b.river.splitPotPct.toFixed(1)}%** of deals. The correct next move is a one-factor cadence test, not a rule rewrite.

## Experiment matrix

| Candidate | Completion by street | Split pot | Common-only complete | Avg. private tiles strictly required at river |
|---|---|---:|---:|---:|
${data.results.map(tableRow).join("\n")}

## Current baseline detail

| Street common total | Completion | Mean feasible route classes | Multi-route | Mean private required | Mean private attributed | Selected hand sourceable from common |
|---:|---:|---:|---:|---:|---:|---:|
${b.streets.map(s => `| ${s.commonTiles} | ${s.completionPct.toFixed(1)}% | ${s.averageRouteClasses.toFixed(2)} | ${s.multiRoutePct.toFixed(1)}% | ${s.averagePrivateRequired.toFixed(2)} | ${s.averagePrivateAttributed.toFixed(2)} | ${s.selectedHandCommunalSourcePossiblePct.toFixed(1)}% |`).join("\n")}

- Equity leader changes after each reveal: ${b.equity.equityLeaderChangePct.map(x => x.toFixed(1) + "%").join(" → ")}.
- Mean top-player equity by street: ${b.equity.streets.map(s => s.meanTopEquityPct.toFixed(1) + "%").join(" → ")}.
- Mean equity dispersion (six-player standard deviation): ${b.equity.streets.map(s => s.meanEquityStdDev.toFixed(3)).join(" → ")}.
- Effective early decision proxy: ${b.equity.effectiveEarlyDecisionPct.toFixed(1)}% (equity 8–50%, at least two distinct mode recommendations, and a private tile can contribute).
- Structural early-choice proxy across all baseline deals: ${b.effectiveEarlyDecisionProxyPct.toFixed(1)}% (same recommendation/private criteria, without the equity filter).
- Private tiles create completion where the communal board alone cannot in ${b.river.playerCompletionCreatedByPrivatePct.toFixed(1)}% of final player states.
- The total-mode recommendation beats the best communal-only comparison in ${b.river.totalRecommendationBeatsCommonOnlyPct.toFixed(1)}% of final player states.
- Winner route share: ${Object.entries(b.river.winnerRouteShare).map(([k, v]) => `${k} ${v.toFixed(1)}%`).join(", ")}.

## Emotional draw bands (baseline)

Each incomplete player-state is rolled forward ${b.equity.rolloutsPerStreet} times. The table reports the chance to become complete on the *next* reveal, then bins state-level chances around the intended emotional bands. These bands are observed, never forced.

| Reveal | States | Mean | Median | ~8% | ~16% | ~24% | ~31–35% | ~50% | >60% |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${bands}

## Metric definitions

- **Completion:** at least one legal 14-tile standard or seven-pairs construction exists in private + currently revealed communal tiles.
- **Split pot:** two or more players share the exact production showdown comparison score. All six remain live; betting/folds are deliberately excluded.
- **Private required:** minimum private source tiles necessary for the selected 14-tile multiset. **Private attributed** is the maximum private-source attribution, matching the UI's private-first source selection.
- **Leader change:** the highest Monte Carlo runout equity seat differs after the reveal.
- **Route diversity:** feasible completed hands span sequence, triplet, flush, and seven-pairs macro routes.
- **Effective early decision:** a proxy requiring 8–50% runout equity, at least two distinct mode recommendations (including incomplete fallback recommendations), and a private tile that can contribute.
- **Common-only complete** asks whether *some* completed hand exists on the communal board. **Selected hand sourceable from common** asks whether the mode-selected hand can be attributed entirely to communal copies. They intentionally answer different questions.

## Evaluator fidelity and bias

- Every completed 14-tile candidate is scored by the real \`mahjong-score.js\` engine, including yaku/han/fu/points and the production comparison key.
- Candidate construction adapts the production \`solveFlexible\` search and its 450,000-node ceiling. It adds explicit private-use constraints for matrix rows.
- User play is modeled as the top \`total\` recommendation; five opponents use the production sequence/flush/triplet/pairs/total modes.
- Incomplete hands use the production lightweight meld/pair/dora fallback. It is not exact shanten and must not be interpreted as exact mahjong equity.
- No betting, folding, opponent modeling, or personalized future tiles are simulated. Future communal tiles are fair samples without replacement.
- Equity and draw-band estimates use ${b.equity.sampleDeals} deals × ${b.equity.rolloutsPerStreet} rollouts per street, so they are directional; completion and split metrics use ${b.deals.toLocaleString()} baseline deals.

## Interpretation

1. **The problem is not simply private-8.** Reducing private tiles while leaving 27 communal tiles does not remove river saturation and can increase shared-score ties.
2. **Communal-only power is the central warning.** A high common-board completion rate means hidden information can cease to matter even when the chosen hand visually contains private tiles.
3. **The 15 + 3 + 1 + 1 row is the cleanest next probe.** It changes only reveal cadence and final communal density, preserves the current 136-tile wall and private-8 fantasy, and leaves measurable river uncertainty.
4. **Private minimums alone are weak levers.** They alter attribution more than the underlying common-board strength when players may use overlapping copies.

## Recommended next experiment

Run a higher-powered paired-seed A/B test of **15 + 4 + 1 + 1 vs. 15 + 3 + 1 + 1**, both at 136 tiles, private-8, and free selection. This isolates whether the first dramatic +4 can be preserved while two single-tile late reveals restore river survival and reduce common-board dominance.

## Reproduction

\`\`\`bash
node probability/test.js
node probability/simulate.js --config probability/config.json --out probability/results.json
node probability/render-report.js probability/results.json probability/REPORT.md
\`\`\`
`;

fs.writeFileSync(output, md);
console.log(`wrote ${output}`);
