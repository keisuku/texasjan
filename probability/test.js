#!/usr/bin/env node
"use strict";

const assert = require("assert");
const path = require("path");
const { MahjongScore } = require(path.join(__dirname, "..", "mahjong-score.js"));

let hand = [0, 1, 2, 3, 4, 5, 15, 16, 17, 19, 20, 13, 13, 21];
let r = MahjongScore.evaluate(hand, 21, { dora: 30 });
assert.equal(r.complete, true);
assert(r.yakuNames.includes("平和"));
assert.equal(r.han, 3);
assert.equal(r.fu, 20);
assert.equal(r.points, 2700);

hand = [0, 0, 1, 1, 11, 11, 12, 12, 22, 22, 23, 23, 27, 27];
r = MahjongScore.evaluate(hand, 27, { dora: 30 });
assert(r.yakuNames.includes("七対子"));
assert.equal(r.fu, 25);

hand = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33, 0];
r = MahjongScore.evaluate(hand, 0, { dora: 5 });
assert(r.yakuNames.includes("国士無双"));
assert.equal(r.limit, "役満");

const base = [0, 1, 2, 3, 4, 5, 15, 16, 17, 19, 20, 13, 13];
const waits = MahjongScore.findWaits(base, { dora: 30 }).map(x => x.tile);
assert.deepEqual(waits.sort((a, b) => a - b), [18, 21]);

console.log("PASS probability/test.js (production scorer parity fixtures)");

