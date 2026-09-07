#!/usr/bin/env node
"use strict";

const assert = require("assert");
const strategy = require("../hand-strategy.js");
const {MahjongScore} = require("../mahjong-score.js");

function counts(ids) {const c = new Array(34).fill(0); for (const id of ids) c[id]++; return c;}
function legal(ids, pool, locked, length) {
  assert.strictEqual(ids.length, length);
  const got = counts(ids), available = counts(pool), required = counts(locked);
  for (let t = 0; t < 34; t++) {
    assert(got[t] <= available[t], "Unavailable copy " + t);
    assert(got[t] >= required[t], "Dropped mandatory copy " + t);
  }
}
function seedRandom(seed) {
  let state = seed >>> 0;
  return function () {state = Math.imul(1664525, state) + 1013904223 >>> 0; return state / 4294967296;};
}
function deal(random) {
  const wall = Array.from({length: 136}, (_, i) => Math.floor(i / 4));
  for (let i = wall.length - 1; i > 0; i--) {
    const at = Math.floor(random() * (i + 1)); [wall[i], wall[at]] = [wall[at], wall[i]];
  }
  return wall;
}

// The old bot fallback discarded weak mandatory honor tiles entirely.
const fallbackOptions = {hand: [33, 33, 27, 0, 1, 2, 3, 4],
  common: [0, 1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 10, 11], locked: [33, 33, 27], dora: 5};
const frozenInput = JSON.stringify(fallbackOptions);
const fallback = strategy.fallback(fallbackOptions);
legal(fallback, fallbackOptions.hand.concat(fallbackOptions.common), fallbackOptions.locked, 14);
assert.strictEqual(JSON.stringify(fallbackOptions), frozenInput, "Helpers must not mutate inputs");

// Existing copies consume target-hand capacity. Four pool copies must not
// become four locks if the selected complete hand contains only three.
const targetHand = [0, 0, 0, 1, 2, 3, 9, 10, 11, 18, 19, 20, 27, 27];
const lockOptions = {hand: [0, 0, 0, 0, 1, 2, 3, 27],
  common: [9, 10, 11, 18, 19, 20, 27], locked: [0, 0, 1, 2], targetHand, count: 6, dora: 0};
const locks = strategy.chooseLocks(lockOptions);
legal(locks, targetHand, lockOptions.locked, 6);
assert.deepStrictEqual(locks.slice(0, 4), lockOptions.locked);
assert(counts(locks)[0] <= 3, "Do not add more copies than the recommended hand has");
assert.throws(() => strategy.fallback({hand: [1, 2], locked: [33]}), /locked tile/);
assert.throws(() => strategy.fallback({hand: [1, 1, 1, 1, 1]}), /four physical copies/);
assert.throws(() => strategy.chooseLocks({...lockOptions, targetHand: targetHand.filter(t => t !== 0)}), /cannot contain/);
assert.throws(() => strategy.fallback({...fallbackOptions, limit: 2}), /Selection limit/);

// Seven mandatory pair types scattered across a 13-pair pool cannot be found
// by taking a sliding/cyclic window. Three physical copies are never seven pairs.
const pairTypes = [0, 2, 4, 6, 8, 9, 11, 13, 15, 17, 18, 20, 22];
const pairPool = pairTypes.flatMap(t => [t, t]);
const pairLocks = [0, 6, 11, 17, 20, 22];
const pairResult = strategy.solve({hand: pairPool.slice(0, 8), common: pairPool.slice(8), locked: pairLocks, mode: "pairs"});
assert.strictEqual(pairResult.searchComplete, true);
assert.strictEqual(pairResult.total, 7);
assert.strictEqual(pairResult.family, "seven_pairs");
legal(strategy.expand(pairResult.hand), pairPool, pairLocks, 14);
assert(MahjongScore.evaluate(strategy.expand(pairResult.hand), 22).yakuNames.includes("七対子"));
const triplePairPool = pairPool.concat([0]);
const impossiblePairs = strategy.solve({hand: triplePairPool.slice(0, 8), common: triplePairPool.slice(8), locked: [0, 0, 0]});
assert.strictEqual(impossiblePairs.hand, null, "Three locked copies preclude seven pairs in this sequence-free pool");

const orphans = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33, 33];
const orphanResult = strategy.solve({hand: orphans.slice(0, 8), common: orphans.slice(8), locked: [0, 33, 33]});
assert.strictEqual(orphanResult.family, "thirteen_orphans");
assert(MahjongScore.evaluate(strategy.expand(orphanResult.hand), 33).yakuNames.includes("国士無双"));
const standardResult = strategy.solve({hand: targetHand.slice(0, 8), common: targetHand.slice(8), locked: [0, 0, 0, 1, 27, 27]});
assert(standardResult.hand);
assert(MahjongScore.evaluate(strategy.expand(standardResult.hand), 27).complete);
legal(strategy.expand(standardResult.hand), targetHand, [0, 0, 0, 1, 27, 27], 14);

const capped = strategy.solve({hand: pairPool.slice(0, 8), common: pairPool.slice(8), nodeLimit: 1});
assert.strictEqual(capped.truncated, true);
assert.strictEqual(capped.searchComplete, false);
assert(capped.nodes <= 1);
const noCompletion = strategy.solve({hand: [0, 2, 4, 6, 8, 9, 11, 13], common: [15, 17, 18, 20, 22, 24]});
assert.strictEqual(noCompletion.hand, null);
assert.strictEqual(noCompletion.searchComplete, true);

// Independent oracle: enumerate every legal 14-tile submultiset in smaller
// pools and ask the production scorer, without using this solver's groups.
function oracle(pool, locked) {
  const available = counts(pool), required = counts(locked), ids = [], keys = new Set();
  function select(t, left) {
    if (t === 34) {
      if (!left && MahjongScore.evaluate(ids, ids[13]).complete) keys.add(counts(ids).join(""));
      return;
    }
    for (let n = required[t]; n <= Math.min(available[t], left); n++) {
      for (let i = 0; i < n; i++) ids.push(t);
      select(t + 1, left - n);
      ids.length -= n;
    }
  }
  select(0, 14); return keys;
}
const oraclePools = [
  targetHand.concat([3, 4, 5, 27]),
  [0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 4, 1, 2, 3, 5],
  pairPool.slice(0, 18),
  orphans.concat([0, 8, 9, 17])
];
for (const pool of oraclePools) {
  for (const locked of [[], pool.slice(0, 4)]) {
    const expected = oracle(pool, locked), options = {hand: pool.slice(0, 8), common: pool.slice(8), locked};
    const found = strategy.solve(options);
    assert.strictEqual(found.searchComplete, true);
    assert.strictEqual(found.total, expected.size, "All scorer-complete submultisets must be enumerated");
    for (let cursor = 0; cursor < found.total; cursor++) {
      const item = strategy.solve({...options, cursor});
      assert(expected.delete(item.hand.join("")), "Unique legal candidate at each cursor");
    }
    assert.strictEqual(expected.size, 0);
  }
}

// Seeded whole-deal construction preserves the 4 -> 2 contract at both lock
// streets, including failed final completion. Future/other-seat data cannot
// affect recommendations because those fields are never consumed.
const random = seedRandom(20260907);
let completed = 0, fallbackCount = 0, maximumNodes = 0;
for (let n = 0; n < 120; n++) {
  const wall = deal(random), hand = wall.slice(0, 8), fullCommon = wall.slice(48, 75);
  let locked = [];
  for (const [reveal, count] of [[15, 4], [19, 6]]) {
    const options = {hand, common: fullCommon.slice(0, reveal), locked, dora: wall[100], mode: ["total", "pairs", "triplet", "sequence", "flush"][n % 5]};
    const found = strategy.solve(options);
    const target = found.hand ? strategy.expand(found.hand) : strategy.fallback(options);
    locked = strategy.chooseLocks({...options, targetHand: target, count});
    legal(locked, hand.concat(options.common), options.locked, count);
  }
  const options = {hand, common: fullCommon, locked, dora: wall[100]};
  const found = strategy.solve(options);
  maximumNodes = Math.max(maximumNodes, found.nodes);
  assert(found.nodes <= found.nodeLimit);
  const selected = found.hand ? strategy.expand(found.hand) : strategy.fallback(options);
  legal(selected, hand.concat(fullCommon), locked, 14);
  if (found.hand) {assert(MahjongScore.evaluate(selected, selected[13]).complete); completed++;}
  else fallbackCount++;
  if (n < 3) assert.deepStrictEqual(strategy.solve({...options, wall: wall.slice().reverse(), opponents: [[33, 33]]}), found);
}
assert(completed > 0 && fallbackCount > 0, "Exercise both complete and fallback final hands");
console.log("PASS hand-strategy: mandatory copies, target multiplicity, special shapes, bounded search, 120 seeded deals", {completed, fallbackCount, maximumNodes});
