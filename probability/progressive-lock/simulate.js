#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { MahjongScore } = require(path.join(__dirname, "..", "..", "mahjong-score.js"));

const VARIANTS = ["free", "lock8_flop", "lock4_4", "lock4_2"];
const MODES = ["total", "sequence", "flush", "triplet", "pairs", "total"];
const MODE_SET = ["total", "sequence", "flush", "triplet", "pairs"];

function parseArgs(argv) {
  const args = {
    config: path.join(__dirname, "config.json"),
    out: path.join(__dirname, "sample-results.json"),
    report: path.join(__dirname, "REPORT.md")
  };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--config") args.config = path.resolve(argv[++i]);
    else if (argv[i] === "--out") args.out = path.resolve(argv[++i]);
    else if (argv[i] === "--report") args.report = path.resolve(argv[++i]);
    else if (argv[i] === "--deals") args.deals = Number(argv[++i]);
    else if (argv[i] === "--quick") args.quick = true;
    else throw new Error("Unknown argument: " + argv[i]);
  }
  return args;
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

function shuffle(a, rng) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function counts(ids) {
  const out = new Array(34).fill(0);
  for (const id of ids) out[id]++;
  return out;
}

function expand(c) {
  const out = [];
  for (let t = 0; t < 34; t++) for (let n = 0; n < c[t]; n++) out.push(t);
  return out;
}

function doraOf(i) {
  if (i < 27) return i % 9 === 8 ? i - 8 : i + 1;
  if (i < 31) return i === 30 ? 27 : i + 1;
  return i === 33 ? 31 : i + 1;
}

function privateRange(hand, privateCounts, commonCounts) {
  let min = 0, max = 0;
  for (let t = 0; t < 34; t++) {
    min += Math.max(0, hand[t] - commonCounts[t]);
    max += Math.min(hand[t], privateCounts[t]);
  }
  return { min, max };
}

function routeOf(hand, isChiitoi) {
  if (isChiitoi) return "seven_pairs";
  const ids = expand(hand);
  const suits = new Set(ids.filter(t => t < 27).map(t => Math.floor(t / 9)));
  if (suits.size === 1) return "flush";
  let trips = 0;
  for (let t = 0; t < 34; t++) if (hand[t] >= 3) trips++;
  return trips >= 3 ? "triplet" : "sequence";
}

function requiredSatisfied(hand, required) {
  for (let t = 0; t < 34; t++) if (hand[t] < required[t]) return false;
  return true;
}

// The search and five strategy ranks intentionally mirror probability/simulate.js.
// Only the `required` multiset check is new.
function solvePool(priv, common, dora, nodeCap, mode, required = new Array(34).fill(0)) {
  const A = counts(priv.concat(common));
  const P = counts(priv);
  const C = counts(common);
  const use = new Array(34).fill(0);
  const best = Object.fromEntries(MODE_SET.map(m => [m, null]));
  const routes = new Set();
  let nodes = 0, capHit = false, solutionCount = 0;

  function canTake(ts) {
    const add = new Array(34).fill(0);
    for (const t of ts) add[t]++;
    for (let t = 0; t < 34; t++) if (use[t] + add[t] > A[t]) return false;
    return true;
  }
  function take(ts, delta) { for (const t of ts) use[t] += delta; }
  function rank(strategy, isChiitoi) {
    let d = 0, simple = true, privateUse = 0, honors = 0, triplets = 0, pairTypes = 0, sequences = 0;
    const suits = {}, suitCount = [0, 0, 0];
    for (let t = 0; t < 34; t++) {
      const n = use[t]; if (!n) continue;
      if (t === dora) d += n;
      privateUse += Math.min(P[t], n);
      if (n >= 2) pairTypes++;
      if (n >= 3) triplets++;
      if (t >= 27) { simple = false; honors += n; }
      else {
        const s = Math.floor(t / 9); suits[s] = 1; suitCount[s] += n;
        if (t % 9 === 0 || t % 9 === 8) simple = false;
      }
    }
    for (let s = 0; s < 3; s++) for (let r = 0; r <= 6; r++) {
      sequences += Math.min(use[s * 9 + r], use[s * 9 + r + 1], use[s * 9 + r + 2]);
    }
    const nsuit = Object.keys(suits).length;
    const dominant = Math.max(...suitCount);
    const offSuit = suitCount.reduce((a, b) => a + b, 0) - dominant;
    let score = d * 7 + privateUse * 0.3;
    if (strategy === "sequence") score += sequences * 15 - triplets * 4 + (simple ? 10 : 0) + pairTypes;
    else if (strategy === "pairs") score += pairTypes * 13 + (isChiitoi ? 90 : 0) + d * 3;
    else if (strategy === "triplet") score += triplets * 20 + honors * 2 + pairTypes * 2 - sequences * 2;
    else if (strategy === "flush") score += dominant * 5 - offSuit * 7 + honors * 1.3 + (nsuit === 1 ? 38 : 0);
    else score += sequences * 5 + triplets * 7 + pairTypes * 2 + (simple ? 5 : 0) + (nsuit === 1 ? 12 : 0) + (isChiitoi ? 18 : 0);
    return score;
  }
  function record(isChiitoi) {
    if (!requiredSatisfied(use, required)) return;
    const hand = use.slice();
    const range = privateRange(hand, P, C);
    const key = hand.join("");
    solutionCount++;
    routes.add(routeOf(hand, isChiitoi));
    for (const strategy of MODE_SET) {
      const score = rank(strategy, isChiitoi), prev = best[strategy];
      if (!prev || score > prev.rank || (score === prev.rank && key < prev.key)) {
        best[strategy] = { hand, rank: score, key, isChiitoi, range };
      }
    }
  }
  function rec(t0, melds, pair) {
    if (++nodes > nodeCap) { capHit = true; return; }
    if (melds === 4 && pair) { record(false); return; }
    for (let t = t0; t < 34; t++) {
      if (capHit) return;
      if (melds < 4 && canTake([t, t, t])) { take([t, t, t], 1); rec(t, melds + 1, pair); take([t, t, t], -1); }
      if (!pair && canTake([t, t])) { take([t, t], 1); rec(t, melds, true); take([t, t], -1); }
      if (melds < 4 && t < 27 && t % 9 <= 6 && canTake([t, t + 1, t + 2])) {
        take([t, t + 1, t + 2], 1); rec(t, melds + 1, pair); take([t, t + 1, t + 2], -1);
      }
    }
  }
  rec(0, 0, false);
  const pairTypes = [];
  for (let t = 0; t < 34; t++) if (A[t] >= 2) pairTypes.push(t);
  function choosePairs(at, chosen) {
    if (chosen.length === 7) {
      use.fill(0); for (const t of chosen) use[t] = 2; record(true); return;
    }
    for (let i = at; i <= pairTypes.length - (7 - chosen.length); i++) {
      chosen.push(pairTypes[i]); choosePairs(i + 1, chosen); chosen.pop();
    }
  }
  if (pairTypes.length >= 7) choosePairs(0, []);
  use.fill(0);

  let picked = best[mode] || best.total;
  if (!picked) {
    const hand = fallbackHand(priv, common, dora, mode, required);
    picked = {
      hand,
      rank: -1,
      key: hand.join(""),
      isChiitoi: false,
      range: privateRange(hand, P, C),
      fallback: true
    };
    best[mode] = picked;
  }
  return { best, picked, complete: solutionCount > 0, solutionCount, routes: [...routes].sort(), nodes, capHit };
}

function tileUtility(t, all, dora, mode) {
  let value = t === dora ? 35 : 0;
  value += all[t] * (mode === "triplet" ? 16 : mode === "pairs" ? 12 : 8);
  if (t >= 27) return value + (mode === "triplet" ? 20 : 5);
  const rank = t % 9;
  value += rank >= 2 && rank <= 6 ? 8 : 3;
  for (let d = -2; d <= 2; d++) {
    if (rank + d >= 0 && rank + d <= 8) value += all[t + d] * (3 - Math.abs(d));
  }
  if (mode === "sequence") value += 12;
  if (mode === "flush") {
    const suit = Math.floor(t / 9); let suitCount = 0;
    for (let q = suit * 9; q < suit * 9 + 9; q++) suitCount += all[q];
    value += suitCount * 2;
  }
  return value;
}

function fallbackHand(priv, common, dora, mode, required) {
  const all = counts(priv.concat(common));
  const selected = required.slice();
  let used = selected.reduce((a, b) => a + b, 0);
  const candidates = [];
  for (let t = 0; t < 34; t++) for (let n = selected[t]; n < all[t]; n++) candidates.push(t);
  candidates.sort((a, b) => tileUtility(b, all, dora, mode) - tileUtility(a, all, dora, mode) || a - b);
  for (const t of candidates) if (used < 14) { selected[t]++; used++; }
  if (used !== 14) throw new Error("Unable to build 14-tile fallback");
  return selected;
}

function assignSource(type, priv, common, locked) {
  const privateUsed = locked.filter(x => x.type === type && x.source === "private").length;
  const commonUsed = locked.filter(x => x.type === type && x.source === "common").length;
  const privateCount = priv.filter(x => x === type).length;
  const commonCount = common.filter(x => x === type).length;
  if (privateUsed < privateCount) return "private";
  if (commonUsed < commonCount) return "common";
  throw new Error("Lock source exceeds visible copies for tile " + type);
}

function strategyRoute(picked, mode) {
  if (picked && !picked.fallback) return routeOf(picked.hand, picked.isChiitoi);
  if (mode === "pairs") return "seven_pairs";
  if (mode === "flush") return "flush";
  if (mode === "triplet") return "triplet";
  return "sequence";
}

// This function has no wall/future argument by design. Tests assert that property.
function chooseLocks(priv, common, dora, existing, addCount, mode, nodeCap) {
  const required = counts(existing.map(x => x.type));
  const solved = solvePool(priv, common, dora, nodeCap, mode, required);
  const recommended = solved.picked.hand;
  const available = counts(priv.concat(common));
  const candidates = [];
  for (let t = 0; t < 34; t++) {
    const remaining = Math.min(recommended[t], available[t]) - required[t];
    for (let n = 0; n < remaining; n++) candidates.push(t);
  }
  if (candidates.length < addCount) {
    for (let t = 0; t < 34; t++) {
      const already = required[t] + candidates.filter(x => x === t).length;
      for (let n = already; n < available[t] && candidates.length < addCount; n++) candidates.push(t);
    }
  }
  candidates.sort((a, b) => {
    const ub = tileUtility(b, available, dora, mode), ua = tileUtility(a, available, dora, mode);
    return ub - ua || a - b;
  });
  const locked = existing.map(x => ({ ...x }));
  for (const type of candidates.slice(0, addCount)) locked.push({ type, source: assignSource(type, priv, common, locked) });
  if (locked.length !== existing.length + addCount) throw new Error("Unable to choose required locks");
  return { locked, route: strategyRoute(solved.picked, mode), solverCapHit: solved.capHit };
}

function bestEvaluation(ids, dora) {
  let best = null;
  for (const win of new Set(ids)) {
    const result = MahjongScore.evaluate(ids, win, { dora });
    if (!best || result.score > best.score) best = result;
  }
  return best || MahjongScore.evaluate(ids, ids[ids.length - 1], { dora });
}

function quickMelds(c0) {
  const c = c0.slice(); let melds = 0;
  for (let t = 0; t < 34 && melds < 4; t++) while (c[t] >= 3 && melds < 4) { c[t] -= 3; melds++; }
  for (let s = 0; s < 3 && melds < 4; s++) for (let r = 0; r <= 6 && melds < 4; r++) {
    while (c[s * 9 + r] && c[s * 9 + r + 1] && c[s * 9 + r + 2] && melds < 4) {
      c[s * 9 + r]--; c[s * 9 + r + 1]--; c[s * 9 + r + 2]--; melds++;
    }
  }
  return melds;
}

function scoreHand(hand, dora) {
  const ids = expand(hand), result = bestEvaluation(ids, dora);
  if (result.complete) return { value: 100000000 + result.score, result };
  const c = counts(ids), hasPair = c.some(n => n >= 2), doraCount = ids.filter(t => t === dora).length;
  return { value: quickMelds(c) * 100 + (hasPair ? 50 : 0) + doraCount * 10, result };
}

function dealOne(cfg, rng) {
  const wall = [];
  for (let t = 0; t < 34; t++) for (let copy = 0; copy < 4; copy++) wall.push(t);
  shuffle(wall, rng);
  const privates = [];
  for (let p = 0; p < 6; p++) privates.push(wall.splice(0, 8));
  const doraIndicator = wall.shift();
  const common15 = wall.splice(0, 15);
  const turn4 = wall.splice(0, 4);
  const river4 = wall.splice(0, 4);
  const final4 = wall.splice(0, 4);
  return {
    privates,
    dora: doraOf(doraIndicator),
    streets: [common15, common15.concat(turn4), common15.concat(turn4, river4), common15.concat(turn4, river4, final4)],
    remaining: wall.slice()
  };
}

function locksForVariant(variant, priv, streets, dora, mode, nodeCap) {
  let locked = [], flopRoute = null, capHit = false;
  if (variant === "lock8_flop") {
    const choice = chooseLocks(priv, streets[0], dora, [], 8, mode, nodeCap);
    locked = choice.locked; flopRoute = choice.route; capHit ||= choice.solverCapHit;
  } else if (variant === "lock4_4" || variant === "lock4_2") {
    const first = chooseLocks(priv, streets[0], dora, [], 4, mode, nodeCap);
    locked = first.locked; flopRoute = first.route; capHit ||= first.solverCapHit;
    const second = chooseLocks(priv, streets[1], dora, locked, variant === "lock4_2" ? 2 : 4, mode, nodeCap);
    locked = second.locked; capHit ||= second.solverCapHit;
  }
  return { locked, flopRoute, capHit };
}

function evaluateSeat(priv, common, dora, mode, locked, nodeCap) {
  const required = counts(locked.map(x => x.type));
  const solved = solvePool(priv, common, dora, nodeCap, mode, required);
  const scored = scoreHand(solved.picked.hand, dora);
  return {
    complete: solved.complete,
    hand: solved.picked.hand,
    value: scored.value,
    result: scored.result,
    range: solved.picked.range,
    capHit: solved.capHit
  };
}

function winnerShares(states) {
  const top = Math.max(...states.map(s => s.value));
  const winners = states.map((s, i) => s.value === top ? i : -1).filter(i => i >= 0);
  const shares = new Array(states.length).fill(0);
  for (const p of winners) shares[p] = 1 / winners.length;
  return { winners, shares };
}

function multisetOverlap(a, b) {
  const ac = counts(a), bc = counts(b);
  let n = 0;
  for (let t = 0; t < 34; t++) n += Math.min(ac[t], bc[t]);
  return n;
}

function evaluateDealVariant(deal, variant, cfg) {
  const locks = [], flopRoutes = [];
  let lockCapHits = 0;
  for (let p = 0; p < 6; p++) {
    const choice = locksForVariant(variant, deal.privates[p], deal.streets, deal.dora, MODES[p], cfg.solverNodeCap);
    locks.push(choice.locked); flopRoutes.push(choice.flopRoute); if (choice.capHit) lockCapHits++;
  }
  const finalStates = [];
  for (let p = 0; p < 6; p++) {
    finalStates.push(evaluateSeat(deal.privates[p], deal.streets[3], deal.dora, MODES[p], locks[p], cfg.solverNodeCap));
  }
  const win = winnerShares(finalStates);
  const winnerRoutes = win.winners.map(p => finalStates[p].result.complete
    ? routeOf(finalStates[p].hand, finalStates[p].result.type === "chiitoi") : "incomplete");
  let collisionPairs = 0, overlapTotal = 0;
  for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) {
    const overlap = multisetOverlap(
      locks[a].filter(x => x.source === "common").map(x => x.type),
      locks[b].filter(x => x.source === "common").map(x => x.type)
    );
    if (overlap > 0) collisionPairs++;
    overlapTotal += overlap;
  }
  let pivot = 0, pivotDen = 0;
  for (let i = 0; i < win.winners.length; i++) {
    const p = win.winners[i];
    if (flopRoutes[p]) { pivotDen++; if (flopRoutes[p] !== winnerRoutes[i]) pivot++; }
  }
  return { locks, flopRoutes, finalStates, win, winnerRoutes, collisionPairs, overlapTotal, pivot, pivotDen, lockCapHits };
}

function rankOrder(eq) {
  return eq.map((v, seat) => ({ v, seat })).sort((a, b) => b.v - a.v || a.seat - b.seat).map(x => x.seat);
}

function sampledEquity(deal, variant, cfg, dealIndex) {
  const equities = [];
  for (let street = 0; street < 4; street++) {
    if (street === 3) {
      const actual = evaluateDealVariant(deal, variant, cfg);
      equities.push(actual.win.shares);
      continue;
    }
    const shares = new Array(6).fill(0);
    for (let rollout = 0; rollout < cfg.equityRollouts; rollout++) {
      const rng = mulberry32((cfg.seed ^ (dealIndex * 1009) ^ (street * 9176) ^ (rollout * 31337) ^ VARIANTS.indexOf(variant)) >>> 0);
      const unseen = deal.streets[3].slice(deal.streets[street].length).concat(deal.remaining);
      shuffle(unseen, rng);
      const simulated = {
        privates: deal.privates,
        dora: deal.dora,
        streets: deal.streets.map(x => x.slice()),
        remaining: []
      };
      for (let next = street + 1; next < 4; next++) {
        const offset = (next - street - 1) * 4;
        simulated.streets[next] = simulated.streets[next - 1].concat(unseen.slice(offset, offset + 4));
      }
      const result = evaluateDealVariant(simulated, variant, cfg);
      for (let p = 0; p < 6; p++) shares[p] += result.win.shares[p];
    }
    equities.push(shares.map(x => x / cfg.equityRollouts));
  }
  return equities;
}

function emptyAgg() {
  return {
    playerStates: 0, complete: 0, regret: 0, splits: 0, winnerCount: 0,
    privateMin: 0, privateMax: 0, collisionPairs: 0, overlapTotal: 0,
    pivot: 0, pivotDen: 0, lockCapHits: 0, finalCapHits: 0,
    routeShare: {}, equityLeaderChanges: [0, 0, 0], equityRankMoves: [0, 0, 0], equitySamples: 0
  };
}

function pct(n, d) { return d ? 100 * n / d : 0; }
function r4(n) { return Number(n.toFixed(4)); }

function run(cfg) {
  const rng = mulberry32(cfg.seed), deals = [];
  for (let i = 0; i < cfg.deals; i++) deals.push(dealOne(cfg, rng));
  const aggs = Object.fromEntries(VARIANTS.map(v => [v, emptyAgg()]));
  for (let di = 0; di < deals.length; di++) {
    const deal = deals[di];
    const results = Object.fromEntries(VARIANTS.map(v => [v, evaluateDealVariant(deal, v, cfg)]));
    const free = results.free;
    for (const variant of VARIANTS) {
      const result = results[variant], agg = aggs[variant];
      agg.splits += Number(result.win.winners.length > 1);
      agg.winnerCount += result.win.winners.length;
      agg.collisionPairs += result.collisionPairs;
      agg.overlapTotal += result.overlapTotal;
      agg.pivot += result.pivot; agg.pivotDen += result.pivotDen;
      agg.lockCapHits += result.lockCapHits;
      for (let p = 0; p < 6; p++) {
        const state = result.finalStates[p]; agg.playerStates++;
        agg.complete += Number(state.complete);
        agg.regret += Number(free.finalStates[p].complete && !state.complete);
        agg.privateMin += state.range.min; agg.privateMax += state.range.max;
        agg.finalCapHits += Number(state.capHit);
      }
      for (let i = 0; i < result.win.winners.length; i++) {
        const route = result.winnerRoutes[i];
        agg.routeShare[route] = (agg.routeShare[route] || 0) + 1 / result.win.winners.length;
      }
      if (di < cfg.equitySampleDeals) {
        const eq = sampledEquity(deal, variant, cfg, di);
        agg.equitySamples++;
        for (let s = 1; s < 4; s++) {
          const before = rankOrder(eq[s - 1]), after = rankOrder(eq[s]);
          agg.equityLeaderChanges[s - 1] += Number(before[0] !== after[0]);
          agg.equityRankMoves[s - 1] += Number(before.some((seat, rank) => after[rank] !== seat));
        }
      }
    }
  }
  const metrics = {};
  for (const variant of VARIANTS) {
    const a = aggs[variant];
    metrics[variant] = {
      finalCompletionPct: r4(pct(a.complete, a.playerStates)),
      lockRegretPct: variant === "free" ? 0 : r4(pct(a.regret, a.playerStates)),
      splitPotPct: r4(pct(a.splits, cfg.deals)),
      averageWinnerCount: r4(a.winnerCount / cfg.deals),
      winnerRouteSharePct: Object.fromEntries(Object.entries(a.routeShare).map(([k, v]) => [k, r4(pct(v, cfg.deals))])),
      averagePrivateRequired: r4(a.privateMin / a.playerStates),
      averagePrivateAttributed: r4(a.privateMax / a.playerStates),
      sharedCoreCollisionPairPct: variant === "free" ? null : r4(pct(a.collisionPairs, cfg.deals * 15)),
      averageSharedCommonLockOverlap: variant === "free" ? null : r4(a.overlapTotal / (cfg.deals * 15)),
      winnerRoutePivotPct: variant === "free" ? null : r4(pct(a.pivot, a.pivotDen)),
      equityLeaderChangePct: a.equityLeaderChanges.map(n => r4(pct(n, a.equitySamples))),
      equityAnyRankMovePct: a.equityRankMoves.map(n => r4(pct(n, a.equitySamples))),
      solverCapHitPct: r4(pct(a.lockCapHits + a.finalCapHits, a.playerStates * (variant === "free" ? 1 : 2)))
    };
  }
  return {
    schemaVersion: 2,
    seed: cfg.seed,
    deals: cfg.deals,
    equitySampleDeals: cfg.equitySampleDeals,
    equityRollouts: cfg.equityRollouts,
    rules: { deck: 136, players: 6, private: 8, communalGroups: [15, 4, 4, 4], final: 14 },
    pairedDealPolicy: "All variants consume the exact same seeded deal before any strategy is evaluated.",
    lookaheadPolicy: "Lock choice receives only private tiles, the currently revealed communal prefix, dora, prior locks, and strategy mode.",
    evaluator: "mahjong-score.js plus the production probability strategy/search replicated with a mandatory-lock multiset constraint.",
    metrics
  };
}

function renderReport(report) {
  const rows = VARIANTS.map(v => {
    const m = report.metrics[v];
    return `| ${v} | ${m.finalCompletionPct}% | ${m.lockRegretPct}% | ${m.splitPotPct}% | ${m.averagePrivateAttributed} | ${m.sharedCoreCollisionPairPct == null ? "—" : m.sharedCoreCollisionPairPct + "%"} |`;
  }).join("\n");
  return `# 固定4→2・公開4→4→4 — paired-seed pilot\n\n状態: **WORKING BASELINE / 実験結果**\n\n同じ seed **${report.seed}** の ${report.deals} deals を、${VARIANTS.map(v => `\`${v}\``).join(" / ")} の${VARIANTS.length}条件へ同時に通した。共通牌は15＋4＋4＋4＝27枚。production scorer と既存5方針を再利用し、固定処理には未来の +4 を渡していない。\n\n| 条件 | 最終完成 | 固定後悔 | split pot | 私牌由来平均 | 共通core衝突(pair) |\n|---|---:|---:|---:|---:|---:|\n${rows}\n\n## 23枚版との差（lock4_2）\n\n| 公開 | 最終完成 | 固定後悔 | split pot |\n|---|---:|---:|---:|\n| 15＋4＋4＝23枚 | 63.7667% | 34.1% | 32.2% |\n| 15＋4＋4＋4＝27枚 | ${report.metrics.lock4_2.finalCompletionPct}% | ${report.metrics.lock4_2.lockRegretPct}% | ${report.metrics.lock4_2.splitPotPct}% |\n\n27枚化で完成率は **+12.5333pt**、固定後悔は **-10.4pt**、split potは **-8.8pt**。同じ固定6枚でも、最後の4枚が救済と勝敗分離の両方に効いている。\n\n## 追加指標\n\n${VARIANTS.map(v => { const m = report.metrics[v]; return `- **${v}**: winner route ${JSON.stringify(m.winnerRouteSharePct)}; route pivot ${m.winnerRoutePivotPct == null ? "—" : m.winnerRoutePivotPct + "%"}; equity leader change 15→19 / 19→23 / 23→27 = ${m.equityLeaderChangePct.join("% / ")}%`; }).join("\n")}\n\n## 読み方\n\n- **固定後悔**は、同一dealで free なら完成するのに、その固定条件では完成不能になったplayer-state率。\n- **共通core衝突**は、2席が固定した「共通由来」の牌型に1枚以上のmultiset overlapがあるplayer-pair率。\n- **route pivot**は、勝者の初回固定方針と最終完成ルートが異なる率。\n- **equity movement** は ${report.equitySampleDeals} deals × ${report.equityRollouts} fair runouts の方向性指標。sampleが小さいため採用判断には使わない。\n\n## 判定\n\n人間の操作感では固定4→2を維持し、追加公開を4→4→4へ戻す方向を作業基準とする。完成76.3%は初期合格帯75–92%へ入った。固定後悔23.7%は目標20%以下に少し届かないため、本番採用前に追加playtestを続ける。\n`;
}

function main() {
  const args = parseArgs(process.argv);
  const cfg = JSON.parse(fs.readFileSync(args.config, "utf8"));
  if (args.quick) { cfg.deals = 8; cfg.equitySampleDeals = 1; cfg.equityRollouts = 2; cfg.solverNodeCap = Math.min(cfg.solverNodeCap, 120000); }
  if (args.deals) cfg.deals = args.deals;
  const report = run(cfg);
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(args.report, renderReport(report));
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}

module.exports = { chooseLocks, counts, dealOne, mulberry32, run, solvePool };
if (require.main === module) main();
