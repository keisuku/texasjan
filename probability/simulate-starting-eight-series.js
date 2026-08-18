#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  return {
    handResults: path.resolve(argv[2] || path.join(__dirname, "starting-eight-luck-hand-results.json")),
    out: path.resolve(argv[3] || path.join(__dirname, "starting-eight-luck-series.json"))
  };
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function quantile(sorted, p) { return sorted[Math.floor((sorted.length - 1) * p)]; }

function simulate(histogram, hands, seasons, ante, players, rng) {
  const hist = Object.entries(histogram).map(([k, count]) => [Number(k), Number(count)]);
  const total = hist.reduce((n, row) => n + row[1], 0);
  function drawWinnerCount() {
    let x = Math.floor(rng() * total), cursor = 0;
    for (const [k, count] of hist) { cursor += count; if (x < cursor) return k; }
    return hist[hist.length - 1][0];
  }
  function chooseWinners(k) {
    const seats = Array.from({ length: players }, (_, i) => i);
    for (let i = seats.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [seats[i], seats[j]] = [seats[j], seats[i]];
    }
    return seats.slice(0, k);
  }

  const individual = [], gaps = [], leaders = [], lasts = [];
  let positive = 0;
  for (let s = 0; s < seasons; s++) {
    const points = new Array(players).fill(0);
    for (let h = 0; h < hands; h++) {
      for (let i = 0; i < players; i++) points[i] -= ante;
      const k = drawWinnerCount(), share = ante * players / k;
      for (const i of chooseWinners(k)) points[i] += share;
    }
    const top = Math.max(...points), last = Math.min(...points);
    gaps.push(top - last); leaders.push(top); lasts.push(last);
    for (const value of points) { individual.push(value); if (value > 0) positive++; }
  }
  for (const values of [individual, gaps, leaders, lasts]) values.sort((a, b) => a - b);
  const summarize = values => ({
    p05: quantile(values, 0.05), p25: quantile(values, 0.25),
    median: quantile(values, 0.50), p75: quantile(values, 0.75), p95: quantile(values, 0.95)
  });
  return {
    hands, seasons, antePerSeat: ante, potPerHand: ante * players,
    individualDelta: { ...summarize(individual), positivePct: Number((100 * positive / individual.length).toFixed(3)) },
    leaderLastGap: summarize(gaps), leaderDelta: summarize(leaders), lastDelta: summarize(lasts)
  };
}

const args = parseArgs(process.argv);
const handReport = JSON.parse(fs.readFileSync(args.handResults, "utf8"));
const result = handReport.results[0];
const rng = mulberry32(2026081802);
const output = {
  schemaVersion: 1,
  seed: 2026081802,
  sourceSeed: handReport.seed,
  sourceDeals: result.deals,
  assumptions: {
    players: 6,
    equalSkill: true,
    equalPolicy: "total",
    antePerSeat: 100,
    potPerHand: 600,
    bettingAndFolds: false,
    tiePots: "split equally",
    interpretation: "Deal-luck lower bound. Variable betting increases point variance."
  },
  series: [simulate(result.river.winnerCountHistogram, 10, 1000000, 100, 6, rng),
    simulate(result.river.winnerCountHistogram, 100, 1000000, 100, 6, rng)]
};
fs.writeFileSync(args.out, JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
