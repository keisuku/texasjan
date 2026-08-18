#!/usr/bin/env node
"use strict";

const assert = require("assert");
const { chooseLocks, counts, dealOne, mulberry32, run } = require("./simulate.js");

const cfg = { seed: 77, deals: 2, equitySampleDeals: 0, equityRollouts: 2, solverNodeCap: 120000 };
const deal = dealOne(cfg, mulberry32(cfg.seed));

const a = chooseLocks(deal.privates[0], deal.streets[0], deal.dora, [], 4, "pairs", cfg.solverNodeCap);
const alteredFuture = deal.streets[0].concat([0, 0, 0, 0]);
const b = chooseLocks(deal.privates[0], alteredFuture.slice(0, 15), deal.dora, [], 4, "pairs", cfg.solverNodeCap);
assert.deepStrictEqual(a.locked, b.locked, "first lock must not depend on future +4");
assert.strictEqual(a.locked.length, 4);

const second = chooseLocks(deal.privates[0], deal.streets[1], deal.dora, a.locked, 4, "pairs", cfg.solverNodeCap);
assert.strictEqual(second.locked.length, 8);
const visible = counts(deal.privates[0].concat(deal.streets[1]));
const fixed = counts(second.locked.map(x => x.type));
for (let t = 0; t < 34; t++) assert(fixed[t] <= visible[t], "locked copies must be visible");

const fourThenTwo = chooseLocks(deal.privates[0], deal.streets[1], deal.dora, a.locked, 2, "pairs", cfg.solverNodeCap);
assert.strictEqual(fourThenTwo.locked.length, 6, "4→2 must finish with six locked tiles");
const changedRiver = deal.streets[1].concat([33, 33, 33, 33]);
const fourThenTwoAgain = chooseLocks(deal.privates[0], changedRiver.slice(0, 19), deal.dora, a.locked, 2, "pairs", cfg.solverNodeCap);
assert.deepStrictEqual(fourThenTwo.locked, fourThenTwoAgain.locked, "second lock must not depend on future +4");

const first = run(cfg), again = run(cfg);
assert.deepStrictEqual(first, again, "same seed must be deterministic");
assert.strictEqual(first.metrics.free.lockRegretPct, 0);
assert.strictEqual(Object.keys(first.metrics).join(","), "free,lock8_flop,lock4_4,lock4_2");

console.log("progressive-lock tests: ok");
