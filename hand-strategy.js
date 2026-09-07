/* Hand construction from a seat's private tiles and the revealed common field.
   Pure and deterministic: no wall, opponent hands, DOM, or random source.
   Ranks are route preferences, not win probabilities or a best-score claim. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MahjongHandStrategy = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const TYPES = 34, HAND_SIZE = 14, DEFAULT_NODE_LIMIT = 450000;
  const MODES = ["total", "sequence", "pairs", "triplet", "flush"];
  const ORPHANS = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];

  function counts(ids) {
    const result = new Array(TYPES).fill(0);
    for (const id of ids) result[id]++;
    return result;
  }
  function expand(hand) {
    const ids = [];
    for (let t = 0; t < TYPES; t++) for (let n = 0; n < hand[t]; n++) ids.push(t);
    return ids;
  }
  function checkedIds(ids, name) {
    if (!Array.isArray(ids)) throw new TypeError(name + " must be an array");
    for (const id of ids) {
      if (!Number.isInteger(id) || id < 0 || id >= TYPES) throw new RangeError(name + " has an invalid tile ID");
    }
    return ids.slice();
  }
  function context(opts) {
    opts = opts || {};
    const hand = checkedIds(opts.hand || [], "hand"), common = checkedIds(opts.common || [], "common");
    const locked = checkedIds(opts.locked || [], "locked"), all = counts(hand.concat(common));
    const required = counts(locked), privateCounts = counts(hand);
    if (locked.length > HAND_SIZE) throw new RangeError("More than 14 locked tiles");
    for (let t = 0; t < TYPES; t++) {
      if (all[t] > 4) throw new RangeError("The known pool exceeds four physical copies of a tile");
      if (required[t] > all[t]) throw new RangeError("A locked tile is not available in the known pool");
    }
    return {hand, common, locked, all, required, privateCounts,
      dora: opts.dora, mode: MODES.includes(opts.mode) ? opts.mode : "total"};
  }
  function contains(hand, required) {
    for (let t = 0; t < TYPES; t++) if (hand[t] < required[t]) return false;
    return true;
  }
  function tileUtility(t, all, selected, ctx) {
    const mode = ctx.mode;
    let value = t === ctx.dora ? 30 : 0;
    value += all[t] * (mode === "triplet" ? 15 : mode === "pairs" ? 12 : 7);
    if (selected[t] > 0 && selected[t] < 3) value += mode === "pairs" ? 18 : 12;
    if (t >= 27) value += mode === "triplet" ? 10 : 0;
    else {
      const rank = t % 9;
      value += rank >= 2 && rank <= 6 ? 7 : 3;
      for (let delta = -2; delta <= 2; delta++) {
        if (rank + delta < 0 || rank + delta > 8) continue;
        value += all[t + delta] * (3 - Math.abs(delta));
        if (delta && mode !== "pairs") value += selected[t + delta] * (3 - Math.abs(delta)) * 3;
      }
      if (mode === "flush") {
        const start = t - rank;
        for (let id = start; id < start + 9; id++) value += all[id] * 2 + selected[id] * 2;
      }
    }
    // A small deterministic tie-break retains the existing private preference.
    if (ctx.privateCounts[t] > selected[t]) value += 1;
    return value;
  }
  function fill(ctx, available, limit) {
    const selected = ctx.required.slice(), ids = ctx.locked.slice();
    while (ids.length < limit) {
      let best = -1, bestValue = -Infinity;
      for (let t = 0; t < TYPES; t++) {
        if (selected[t] >= available[t]) continue;
        const value = tileUtility(t, available, selected, ctx);
        if (value > bestValue) {best = t; bestValue = value;}
      }
      if (best < 0) break;
      selected[best]++; ids.push(best);
    }
    return ids;
  }

  // Reserve every mandatory copy before ranking the remaining visible tiles.
  function fallback(opts) {
    const ctx = context(opts);
    const requested = opts && opts.limit !== undefined ? opts.limit : HAND_SIZE;
    if (!Number.isInteger(requested) || requested < ctx.locked.length || requested > HAND_SIZE) {
      throw new RangeError("Selection limit must contain all locks and be at most 14");
    }
    return fill(ctx, ctx.all, Math.min(requested, ctx.hand.length + ctx.common.length));
  }

  // targetHand is an ID list, not a counts array. New locks stay inside its
  // exact multiset; extra physical copies elsewhere in the pool are irrelevant.
  function chooseLocks(opts) {
    const ctx = context(opts), count = opts.count;
    if (!Number.isInteger(count) || count < ctx.locked.length || count > HAND_SIZE) {
      throw new RangeError("Lock count must contain all existing locks and be at most 14");
    }
    const target = opts.targetHand === undefined ? fallback(opts) : checkedIds(opts.targetHand, "targetHand");
    const available = counts(target);
    if (target.length < count || target.length > HAND_SIZE || !contains(available, ctx.required)) {
      throw new RangeError("Target hand cannot contain the requested locks");
    }
    for (let t = 0; t < TYPES; t++) if (available[t] > ctx.all[t]) {
      throw new RangeError("Target hand uses unavailable tile copies");
    }
    return fill(ctx, available, count);
  }

  function routeRank(use, family, ctx) {
    let dora = 0, simple = true, privateUse = 0, honors = 0, triplets = 0, pairTypes = 0, sequences = 0;
    const suits = [0, 0, 0];
    for (let t = 0; t < TYPES; t++) {
      const n = use[t]; if (!n) continue;
      if (t === ctx.dora) dora += n;
      privateUse += Math.min(ctx.privateCounts[t], n);
      if (n >= 2) pairTypes++;
      if (n >= 3) triplets++;
      if (t >= 27) {simple = false; honors += n;}
      else {suits[Math.floor(t / 9)] += n; if (t % 9 === 0 || t % 9 === 8) simple = false;}
    }
    for (let s = 0; s < 3; s++) for (let r = 0; r <= 6; r++) {
      sequences += Math.min(use[s * 9 + r], use[s * 9 + r + 1], use[s * 9 + r + 2]);
    }
    const suitTypes = suits.filter(Boolean).length, dominant = Math.max.apply(null, suits);
    const offSuit = suits.reduce(function (sum, n) {return sum + n;}, 0) - dominant;
    const pairs = family === "seven_pairs";
    let score = dora * 7 + privateUse * .3;
    if (family === "thirteen_orphans") return 1000 + score;
    if (ctx.mode === "sequence") score += sequences * 15 - triplets * 4 + (simple ? 10 : 0) + pairTypes;
    else if (ctx.mode === "pairs") score += pairTypes * 13 + (pairs ? 90 : 0) + dora * 3;
    else if (ctx.mode === "triplet") score += triplets * 20 + honors * 2 + pairTypes * 2 - sequences * 2;
    else if (ctx.mode === "flush") score += dominant * 5 - offSuit * 7 + honors * 1.3 + (suitTypes === 1 ? 38 : 0);
    else score += sequences * 5 + triplets * 7 + pairTypes * 2 + (simple ? 5 : 0) + (suitTypes === 1 ? 12 : 0) + (pairs ? 18 : 0);
    return score;
  }

  /* Enumerate complete shapes while keeping a shared deterministic work cap.
     Metadata always survives, including when hand is null: a capped search
     must never be presented as proof that no complete hand exists. */
  function solve(opts) {
    opts = opts || {};
    const ctx = context(opts), all = ctx.all, required = ctx.required;
    const nodeLimit = opts.nodeLimit === undefined ? DEFAULT_NODE_LIMIT : opts.nodeLimit;
    if (!Number.isInteger(nodeLimit) || nodeLimit < 1 || nodeLimit > DEFAULT_NODE_LIMIT) {
      throw new RangeError("nodeLimit must be between 1 and " + DEFAULT_NODE_LIMIT);
    }
    const use = new Array(TYPES).fill(0), solutions = new Map();
    let nodes = 0, truncated = false;
    function visit() {
      if (nodes >= nodeLimit) {truncated = true; return false;}
      nodes++; return true;
    }
    function record(family) {
      if (!contains(use, required)) return;
      const key = use.join(""), rank = routeRank(use, family, ctx), previous = solutions.get(key);
      if (!previous || rank > previous.rank) solutions.set(key, {hand: use.slice(), rank, family, key});
    }

    if (ctx.hand.length + ctx.common.length >= HAND_SIZE) {
      // The thirteen-orphans shape is not a four-meld hand. It needs its own
      // enumeration, just as the production scoring engine does.
      if (ORPHANS.every(function (t) {return all[t] >= 1;})) {
        for (const pair of ORPHANS) {
          if (all[pair] < 2) continue;
          if (!visit()) break;
          use.fill(0); for (const t of ORPHANS) use[t] = 1;
          use[pair]++; record("thirteen_orphans");
        }
      }
      use.fill(0);

      // Required pair types are selected first. Cyclic windows miss valid
      // seven-pair hands when mandatory tiles are spread across the pool.
      const forcedPairs = [], optionalPairs = [];
      let pairsPossible = true;
      for (let t = 0; t < TYPES; t++) {
        if (required[t]) {
          if (required[t] > 2 || all[t] < 2) pairsPossible = false;
          else forcedPairs.push(t);
        } else if (all[t] >= 2) optionalPairs.push(t);
      }
      function choosePairs(at, left) {
        if (!visit()) return;
        if (!left) {record("seven_pairs"); return;}
        for (let i = at; i <= optionalPairs.length - left; i++) {
          if (truncated) return;
          use[optionalPairs[i]] = 2;
          choosePairs(i + 1, left - 1);
          use[optionalPairs[i]] = 0;
        }
      }
      if (pairsPossible && forcedPairs.length <= 7 && forcedPairs.length + optionalPairs.length >= 7 && !truncated) {
        for (const t of forcedPairs) use[t] = 2;
        choosePairs(0, 7 - forcedPairs.length);
      }
      use.fill(0);

      // Canonical ordering of meld groups removes permutations. Precomputed
      // suffix coverage rejects locks that later groups can no longer supply.
      const groups = [];
      for (let t = 0; t < TYPES; t++) {
        if (all[t] >= 3) groups.push([t, t, t]);
        if (t < 27 && t % 9 <= 6 && all[t] && all[t + 1] && all[t + 2]) groups.push([t, t + 1, t + 2]);
      }
      const suffix = new Array(groups.length + 1);
      suffix[groups.length] = new Array(TYPES).fill(0);
      for (let i = groups.length - 1; i >= 0; i--) {
        suffix[i] = suffix[i + 1].slice();
        const group = groups[i];
        for (const t of group) suffix[i][t] = Math.max(suffix[i][t], group[0] === group[2] ? 3 : 1);
      }
      const requiredTypes = [];
      for (let t = 0; t < TYPES; t++) if (required[t]) requiredTypes.push(t);
      function canFinish(start, left) {
        let missing = 0;
        for (const t of requiredTypes) {
          const deficit = Math.max(0, required[t] - use[t]);
          missing += deficit;
          if (deficit > suffix[start][t] * left) return false;
        }
        return missing <= left * 3;
      }
      function meldSearch(start, left) {
        if (!visit()) return;
        if (!left) {record("standard"); return;}
        if (!canFinish(start, left)) return;
        for (let i = start; i < groups.length; i++) {
          if (truncated) return;
          const group = groups[i], a = group[0], b = group[1], c = group[2];
          if (a === c ? use[a] + 3 > all[a] : use[a] >= all[a] || use[b] >= all[b] || use[c] >= all[c]) continue;
          use[a]++; use[b]++; use[c]++;
          meldSearch(i, left - 1);
          use[a]--; use[b]--; use[c]--;
        }
      }
      for (let pair = 0; pair < TYPES && !truncated; pair++) {
        if (all[pair] < 2) continue;
        use[pair] = 2; meldSearch(0, 4); use[pair] = 0;
      }
    }
    const ranked = Array.from(solutions.values()).sort(function (a, b) {
      return b.rank - a.rank || a.key.localeCompare(b.key);
    });
    const cursor = Number.isFinite(opts.cursor) ? Math.trunc(opts.cursor) : 0;
    const index = ranked.length ? ((cursor % ranked.length) + ranked.length) % ranked.length : -1;
    const selected = index >= 0 ? ranked[index] : null;
    return {hand: selected ? selected.hand.slice() : null, family: selected ? selected.family : null,
      rank: selected ? selected.rank : null, index, total: ranked.length, nodes, nodeLimit,
      truncated, searchComplete: !truncated};
  }

  return {fallback, chooseLocks, solve, expand};
});
