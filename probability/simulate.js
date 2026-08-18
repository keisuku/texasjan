#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { MahjongScore } = require(path.join(__dirname, "..", "mahjong-score.js"));

const MODES = ["total", "sequence", "flush", "triplet", "pairs", "total"];
const MODE_SET = ["total", "sequence", "flush", "triplet", "pairs"];
const EMOTIONAL_BANDS = [8, 16, 24, 33, 50];

function parseArgs(argv) {
  const out = { config: path.join(__dirname, "config.json"), out: path.join(__dirname, "results.json") };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--config") out.config = path.resolve(argv[++i]);
    else if (argv[i] === "--out") out.out = path.resolve(argv[++i]);
    else if (argv[i] === "--quick") out.quick = true;
    else if (argv[i] === "--only") out.only = argv[++i];
    else throw new Error("Unknown argument: " + argv[i]);
  }
  return out;
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

function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function shuffle(a, rng) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function counts(ids) {
  const c = new Array(34).fill(0);
  for (const t of ids) c[t]++;
  return c;
}

function expand(c) {
  const a = [];
  for (let t = 0; t < 34; t++) for (let k = 0; k < c[t]; k++) a.push(t);
  return a;
}

function doraOf(i) {
  if (i < 27) return i % 9 === 8 ? i - 8 : i + 1;
  if (i < 31) return i === 30 ? 27 : i + 1;
  return i === 33 ? 31 : i + 1;
}

function quickMelds(c0) {
  const c = c0.slice(); let m = 0;
  for (let t = 0; t < 34 && m < 4; t++) while (c[t] >= 3 && m < 4) { c[t] -= 3; m++; }
  for (let s = 0; s < 3 && m < 4; s++) for (let r = 0; r <= 6 && m < 4; r++) {
    while (c[s * 9 + r] && c[s * 9 + r + 1] && c[s * 9 + r + 2] && m < 4) {
      c[s * 9 + r]--; c[s * 9 + r + 1]--; c[s * 9 + r + 2]--; m++;
    }
  }
  return m;
}

function bestEvaluation(ids, dora) {
  let best = null;
  for (const t of new Set(ids)) {
    const r = MahjongScore.evaluate(ids, t, { dora });
    if (!best || r.score > best.score) best = r;
  }
  return best || MahjongScore.evaluate(ids, ids[ids.length - 1], { dora });
}

function handScore(ids, dora) {
  const result = bestEvaluation(ids, dora);
  if (result.complete) return { value: 100000000 + result.score, result };
  const c = counts(ids);
  let hasPair = false;
  for (let t = 0; t < 34; t++) if (c[t] >= 2) { hasPair = true; break; }
  let doraCount = 0; for (const t of ids) if (t === dora) doraCount++;
  return { value: quickMelds(c) * 100 + (hasPair ? 50 : 0) + doraCount * 10, result };
}

function privateRange(hand, privateCounts, commonCounts) {
  let min = 0, max = 0;
  for (let t = 0; t < 34; t++) {
    min += Math.max(0, hand[t] - commonCounts[t]);
    max += Math.min(hand[t], privateCounts[t]);
  }
  return { min, max };
}

function ruleAllows(range, rule) {
  if (!rule || rule.kind === "free") return true;
  if (rule.kind === "atLeast") return range.max >= rule.count;
  if (rule.kind === "exactly") return range.min <= rule.count && range.max >= rule.count;
  throw new Error("Unsupported private rule: " + JSON.stringify(rule));
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

function fallbackHand(priv, common, dora, mode) {
  const pool = priv.concat(common), all = counts(pool);
  const items = pool.map((id, i) => ({ id, priv: i < priv.length }));
  function score(x) {
    const t = x.id; let v = t === dora ? 30 : 0;
    if (t >= 27) v += all[t] * 7;
    else {
      const r = t % 9; v += r >= 2 && r <= 6 ? 7 : 3;
      for (let d = -2; d <= 2; d++) if (r + d >= 0 && r + d <= 8) v += all[t + d] * (3 - Math.abs(d));
    }
    if (mode === "pairs") v += all[t] * 9;
    if (mode === "triplet") v += all[t] * 12;
    if (mode === "flush" && t < 27) {
      const s = Math.floor(t / 9); let n = 0;
      for (let q = s * 9; q < s * 9 + 9; q++) n += all[q];
      v += n * 2;
    }
    if (x.priv) v += 1;
    return v;
  }
  items.sort((a, b) => score(b) - score(a) || a.id - b.id || Number(b.priv) - Number(a.priv));
  return counts(items.slice(0, 14).map(x => x.id));
}

function solvePool(priv, common, dora, rule, nodeCap) {
  const A = counts(priv.concat(common)), P = counts(priv), C = counts(common), use = new Array(34).fill(0);
  const best = Object.fromEntries(MODE_SET.map(m => [m, null]));
  const routeSet = new Set(); let nodes = 0, capHit = false, solutionCount = 0;

  function canTake(ts) {
    const add = new Array(34).fill(0);
    for (const t of ts) add[t]++;
    for (let t = 0; t < 34; t++) if (use[t] + add[t] > A[t]) return false;
    return true;
  }
  function take(ts, delta) { for (const t of ts) use[t] += delta; }
  function rank(mode, isChiitoi) {
    let d = 0, simple = true, privateUse = 0, honors = 0, triplets = 0, pairTypes = 0, sequences = 0;
    const suits = {}, suitCount = [0, 0, 0];
    for (let t = 0; t < 34; t++) {
      const n = use[t]; if (!n) continue;
      if (t === dora) d += n;
      privateUse += Math.min(P[t], n);
      if (n >= 2) pairTypes++;
      if (n >= 3) triplets++;
      if (t >= 27) { simple = false; honors += n; }
      else { const s = Math.floor(t / 9); suits[s] = 1; suitCount[s] += n; if (t % 9 === 0 || t % 9 === 8) simple = false; }
    }
    for (let s = 0; s < 3; s++) for (let r = 0; r <= 6; r++) sequences += Math.min(use[s * 9 + r], use[s * 9 + r + 1], use[s * 9 + r + 2]);
    const nsuit = Object.keys(suits).length;
    const dominant = Math.max(...suitCount), offSuit = suitCount.reduce((a, b) => a + b, 0) - dominant;
    let score = d * 7 + privateUse * 0.3;
    if (mode === "sequence") score += sequences * 15 - triplets * 4 + (simple ? 10 : 0) + pairTypes;
    else if (mode === "pairs") score += pairTypes * 13 + (isChiitoi ? 90 : 0) + d * 3;
    else if (mode === "triplet") score += triplets * 20 + honors * 2 + pairTypes * 2 - sequences * 2;
    else if (mode === "flush") score += dominant * 5 - offSuit * 7 + honors * 1.3 + (nsuit === 1 ? 38 : 0);
    else score += sequences * 5 + triplets * 7 + pairTypes * 2 + (simple ? 5 : 0) + (nsuit === 1 ? 12 : 0) + (isChiitoi ? 18 : 0);
    return score;
  }
  function record(isChiitoi) {
    const hand = use.slice(), range = privateRange(hand, P, C);
    if (!ruleAllows(range, rule)) return;
    solutionCount++; routeSet.add(routeOf(hand, isChiitoi));
    const key = hand.join("");
    for (const mode of MODE_SET) {
      const score = rank(mode, isChiitoi), prev = best[mode];
      if (!prev || score > prev.rank || (score === prev.rank && key < prev.key)) {
        best[mode] = { hand, rank: score, key, isChiitoi, range };
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
  const pairChoices = [];
  for (let t = 0; t < 34; t++) if (A[t] >= 2) pairChoices.push(t);
  if (pairChoices.length >= 7) {
    const combos = [];
    function choose(at, chosen) {
      if (chosen.length === 7) { combos.push(chosen.slice()); return; }
      for (let i = at; i <= pairChoices.length - (7 - chosen.length); i++) { chosen.push(pairChoices[i]); choose(i + 1, chosen); chosen.pop(); }
    }
    choose(0, []);
    for (const combo of combos) {
      use.fill(0); for (const t of combo) use[t] = 2; record(true);
    }
    use.fill(0);
  }
  for (const mode of MODE_SET) if (!best[mode]) {
    const hand = fallbackHand(priv, common, dora, mode), range = privateRange(hand, P, C);
    if (ruleAllows(range, rule)) best[mode] = { hand, rank: -1, key: hand.join(""), isChiitoi: false, range, fallback: true };
  }
  return { best, complete: solutionCount > 0, solutionCount, routes: [...routeSet].sort(), nodes, capHit };
}

function dealOne(cfg, rng) {
  const wall = [];
  for (let t = 0; t < 34; t++) for (let k = 0; k < cfg.deckCopies; k++) wall.push(t);
  shuffle(wall, rng);
  const privates = [];
  for (let p = 0; p < 6; p++) privates.push(wall.splice(0, cfg.privateTiles));
  const doraIndicator = wall.shift(), streets = []; let common = [];
  for (const n of cfg.communalGroups) { common = common.concat(wall.splice(0, n)); streets.push(common.slice()); }
  return { privates, doraIndicator, dora: doraOf(doraIndicator), streets, remaining: wall.slice() };
}

function seatState(priv, common, dora, rule, nodeCap, mode) {
  const solved = solvePool(priv, common, dora, rule, nodeCap);
  const picked = solved.best[mode] || solved.best.total;
  if (!picked) return { solved, hand: null, score: -Infinity, result: null, range: { min: 0, max: 0 } };
  const hand = expand(picked.hand), scored = handScore(hand, dora);
  return { solved, hand, score: scored.value, result: scored.result, range: picked.range, fallback: picked.fallback };
}

function winnerShares(states) {
  let top = -Infinity;
  for (const s of states) if (s.score > top) top = s.score;
  const winners = [];
  states.forEach((s, i) => { if (s.score === top) winners.push(i); });
  const shares = new Array(states.length).fill(0);
  for (const i of winners) shares[i] = 1 / winners.length;
  return { winners, shares, top };
}

function mean(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }
function stdev(xs) { const m = mean(xs); return Math.sqrt(mean(xs.map(x => (x - m) ** 2))); }
function pct(n, d) { return d ? 100 * n / d : 0; }
function r4(n) { return Number(n.toFixed(4)); }

function emptyStreet() {
  return { players: 0, complete: 0, routes: 0, multiRoute: 0, capHits: 0, privateMin: 0, privateMax: 0, communalOnly: 0 };
}

function runConfig(cfg, root, index) {
  const deals = root[cfg.deals] || cfg.deals;
  const rng = mulberry32((root.seed ^ hashString(cfg.id) ^ index) >>> 0);
  const playerModes = cfg.playerModes || MODES;
  const streetAgg = cfg.communalGroups.map(emptyStreet);
  let splits = 0, tiedPlayers = 0, finalPlayers = 0, earlyEffectiveProxy = 0, earlyProxyDen = 0;
  let commonOnlyComplete = 0, fullOnlyComplete = 0, totalModeUplift = 0, totalModeUpliftDen = 0;
  const leaderChanges = new Array(cfg.communalGroups.length - 1).fill(0);
  const leaderComparable = new Array(cfg.communalGroups.length - 1).fill(0);
  const winnerRoutes = {};
  const winnerCountHistogram = {};
  const equitySamples = [];

  for (let di = 0; di < deals; di++) {
    const deal = dealOne(cfg, rng), perStreet = [], leaders = [];
    for (let si = 0; si < deal.streets.length; si++) {
      const common = deal.streets[si], states = [];
      for (let p = 0; p < 6; p++) {
        const state = seatState(deal.privates[p], common, deal.dora, cfg.privateRule, root.solverNodeCap, playerModes[p]);
        states.push(state); const a = streetAgg[si]; a.players++;
        if (state.solved.complete) a.complete++;
        a.routes += state.solved.routes.length;
        if (state.solved.routes.length >= 2) a.multiRoute++;
        if (state.solved.capHit) a.capHits++;
        a.privateMin += state.range.min; a.privateMax += state.range.max;
        if (state.range.min === 0) a.communalOnly++;
        if (si === 0) {
          const recKeys = new Set(MODE_SET.map(m => state.solved.best[m] && state.solved.best[m].key).filter(Boolean));
          earlyProxyDen++;
          if (recKeys.size >= 2 && state.range.max > 0) earlyEffectiveProxy++;
        }
      }
      perStreet.push(states);
      leaders.push(winnerShares(states).winners);
    }
    for (let si = 1; si < leaders.length; si++) {
      if (leaders[si - 1].length === 1 && leaders[si].length === 1) {
        leaderComparable[si - 1]++;
        if (leaders[si - 1][0] !== leaders[si][0]) leaderChanges[si - 1]++;
      }
    }
    const finalStates = perStreet[perStreet.length - 1], win = winnerShares(finalStates);
    winnerCountHistogram[win.winners.length] = (winnerCountHistogram[win.winners.length] || 0) + 1;
    finalPlayers += 6;
    if (win.winners.length > 1) splits++;
    tiedPlayers += win.winners.length;
    for (const p of win.winners) {
      const route = finalStates[p].result && finalStates[p].result.complete
        ? routeOf(counts(finalStates[p].hand), finalStates[p].result.type === "chiitoi") : "incomplete";
      winnerRoutes[route] = (winnerRoutes[route] || 0) + 1 / win.winners.length;
    }
    const finalCommon = deal.streets[deal.streets.length - 1];
    const commonState = seatState([], finalCommon, deal.dora, cfg.privateRule.kind === "free" ? cfg.privateRule : { kind: "free" }, root.solverNodeCap, "total");
    if (commonState.solved.complete) commonOnlyComplete++;
    for (let p = 0; p < 6; p++) {
      const totalState = seatState(deal.privates[p], finalCommon, deal.dora, cfg.privateRule, root.solverNodeCap, "total");
      if (totalState.solved.complete && !commonState.solved.complete) fullOnlyComplete++;
      if (commonState.score > -Infinity && totalState.score > -Infinity) {
        totalModeUpliftDen++;
        if (totalState.score > commonState.score) totalModeUplift++;
      }
    }
    if (di < root.equitySampleDeals) equitySamples.push(deal);
  }

  const equity = runEquitySamples(cfg, root, equitySamples);
  return {
    id: cfg.id, label: cfg.label, deals, tileCount: cfg.deckCopies * 34, privateTiles: cfg.privateTiles,
    communalGroups: cfg.communalGroups, privateRule: cfg.privateRule, playerModes,
    streets: streetAgg.map((a, i) => ({
      commonTiles: cfg.communalGroups.slice(0, i + 1).reduce((x, y) => x + y, 0),
      completionPct: r4(pct(a.complete, a.players)), averageRouteClasses: r4(a.routes / a.players),
      multiRoutePct: r4(pct(a.multiRoute, a.players)), averagePrivateRequired: r4(a.privateMin / a.players),
      averagePrivateAttributed: r4(a.privateMax / a.players), selectedHandCommunalSourcePossiblePct: r4(pct(a.communalOnly, a.players)),
      solverCapHitPct: r4(pct(a.capHits, a.players))
    })),
    river: {
      splitPotPct: r4(pct(splits, deals)), averageWinnerCount: r4(tiedPlayers / deals), winnerCountHistogram,
      commonBoardCompletePct: r4(pct(commonOnlyComplete, deals)),
      playerCompletionCreatedByPrivatePct: r4(pct(fullOnlyComplete, deals * 6)),
      totalRecommendationBeatsCommonOnlyPct: r4(pct(totalModeUplift, totalModeUpliftDen)),
      winnerRouteShare: Object.fromEntries(Object.entries(winnerRoutes).map(([k, v]) => [k, r4(pct(v, deals))]))
    },
    leaderChangeProxyPct: leaderChanges.map((n, i) => r4(pct(n, leaderComparable[i]))),
    effectiveEarlyDecisionProxyPct: r4(pct(earlyEffectiveProxy, earlyProxyDen)),
    equity
  };
}

function runEquitySamples(cfg, root, samples) {
  const streetCount = cfg.communalGroups.length;
  const playerModes = cfg.playerModes || MODES;
  const agg = Array.from({ length: streetCount }, () => ({ dispersions: [], top: [], leaders: [], nextDraw: [] }));
  const changes = new Array(streetCount - 1).fill(0), changeDen = new Array(streetCount - 1).fill(0);
  let effective = 0, effectiveDen = 0;
  for (let di = 0; di < samples.length; di++) {
    const deal = samples[di], equityByStreet = [], leaders = [];
    for (let si = 0; si < streetCount; si++) {
      const shares = new Array(6).fill(0), nextCompletions = new Array(6).fill(0), incomplete = new Array(6).fill(false);
      const currentCommon = deal.streets[si];
      for (let p = 0; p < 6; p++) incomplete[p] = !solvePool(deal.privates[p], currentCommon, deal.dora, cfg.privateRule, root.solverNodeCap).complete;
      for (let ri = 0; ri < root.equityRollouts; ri++) {
        const rrng = mulberry32((root.seed ^ hashString(cfg.id) ^ (di * 1009) ^ (si * 9176) ^ ri) >>> 0);
        const unseen = deal.remaining.concat(deal.streets[streetCount - 1].slice(currentCommon.length));
        shuffle(unseen, rrng);
        let cursor = 0, nextCommon = currentCommon.slice(), nextSnapshot = null;
        for (let sj = si + 1; sj < streetCount; sj++) {
          nextCommon = nextCommon.concat(unseen.slice(cursor, cursor + cfg.communalGroups[sj]));
          cursor += cfg.communalGroups[sj];
          if (sj === si + 1) nextSnapshot = nextCommon.slice();
        }
        const states = [];
        for (let p = 0; p < 6; p++) states.push(seatState(deal.privates[p], nextCommon, deal.dora, cfg.privateRule, root.solverNodeCap, playerModes[p]));
        const win = winnerShares(states); for (let p = 0; p < 6; p++) shares[p] += win.shares[p];
        if (nextSnapshot) for (let p = 0; p < 6; p++) {
          if (incomplete[p] && solvePool(deal.privates[p], nextSnapshot, deal.dora, cfg.privateRule, root.solverNodeCap).complete) nextCompletions[p]++;
        }
      }
      const eq = shares.map(x => x / root.equityRollouts), top = Math.max(...eq), leader = eq.indexOf(top);
      equityByStreet.push(eq); leaders.push(leader); agg[si].dispersions.push(stdev(eq)); agg[si].top.push(top);
      if (si < streetCount - 1) for (let p = 0; p < 6; p++) if (incomplete[p]) agg[si].nextDraw.push(100 * nextCompletions[p] / root.equityRollouts);
      if (si === 0) for (let p = 0; p < 6; p++) {
        const solved = solvePool(deal.privates[p], currentCommon, deal.dora, cfg.privateRule, root.solverNodeCap);
        const distinct = new Set(MODE_SET.map(m => solved.best[m] && solved.best[m].key).filter(Boolean)).size;
        effectiveDen++;
        const total = solved.best.total;
        if (distinct >= 2 && total && total.range.max > 0 && eq[p] >= 0.08 && eq[p] <= 0.50) effective++;
      }
    }
    for (let si = 1; si < streetCount; si++) { changeDen[si - 1]++; if (leaders[si] !== leaders[si - 1]) changes[si - 1]++; }
  }
  return {
    sampleDeals: samples.length, rolloutsPerStreet: root.equityRollouts,
    streets: agg.map((a, i) => ({
      commonTiles: cfg.communalGroups.slice(0, i + 1).reduce((x, y) => x + y, 0),
      meanEquityStdDev: r4(mean(a.dispersions)), meanTopEquityPct: r4(100 * mean(a.top)),
      nextStreetCompletionDraw: summarizeDraws(a.nextDraw)
    })),
    equityLeaderChangePct: changes.map((n, i) => r4(pct(n, changeDen[i]))),
    effectiveEarlyDecisionPct: r4(pct(effective, effectiveDen))
  };
}

function summarizeDraws(xs) {
  if (!xs.length) return null;
  const buckets = { below4: 0, around8: 0, around16: 0, around24: 0, around33: 0, around50: 0, above60: 0 };
  for (const x of xs) {
    if (x < 4) buckets.below4++;
    else if (x < 12) buckets.around8++;
    else if (x < 20) buckets.around16++;
    else if (x < 28) buckets.around24++;
    else if (x < 40) buckets.around33++;
    else if (x <= 60) buckets.around50++;
    else buckets.above60++;
  }
  return {
    states: xs.length, meanPct: r4(mean(xs)), medianPct: r4(xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)]),
    bandSharePct: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, r4(pct(v, xs.length))])),
    targetBandsPct: EMOTIONAL_BANDS
  };
}

function main() {
  const args = parseArgs(process.argv), root = JSON.parse(fs.readFileSync(args.config, "utf8"));
  if (args.quick) { root.baselineDeals = 80; root.experimentDeals = 30; root.equitySampleDeals = 4; root.equityRollouts = 4; }
  let configs = root.configs; if (args.only) configs = configs.filter(c => c.id === args.only);
  if (!configs.length) throw new Error("No configurations selected");
  const started = new Date(), results = [];
  configs.forEach((cfg, i) => {
    process.stderr.write(`[${i + 1}/${configs.length}] ${cfg.id}\n`);
    results.push(runConfig(cfg, root, i));
  });
  const report = {
    schemaVersion: 1, generatedAt: new Date().toISOString(), seed: root.seed,
    evaluator: {
      productionScorer: "../mahjong-score.js MahjongScore.evaluate",
      selectionPolicy: "Production solveFlexible search/ranking replicated; config.playerModes overrides the production total/sequence/flush/triplet/pairs/total seat policies.",
      incompleteBias: "Production quickMelds + pair + dora fallback; not shanten or exact equity.",
      bettingModel: "No folds or wagers; six live hands always reach showdown.",
      nodeCap: root.solverNodeCap
    },
    runtimeSeconds: r4((Date.now() - started.getTime()) / 1000), results
  };
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}

if (require.main === module) main();
