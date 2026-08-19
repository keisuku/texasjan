# MAHJONG HOLD'EM — Project State

Updated: **2026-08-20 JST**  
Repository: `keisuku/texasjan`  
Product promise: **Mahjong Texas Hold'em**

## One-minute state

The repository contains a playable six-player browser prototype from title screen through lobby, matching, match, showdown, result, and rematch. Betting, scoring, waits, progressive tile locking, opponent showdown inspection, and several meta screens are implemented.

The gameplay implementation is usable as a **WORKING BASELINE**. The visual direction is **not approved**. In particular, the 29 images merged in PR #43 were later rejected in full by the user and must be treated as archive material, not as a chosen art direction.

## Implemented gameplay

- Six-player betting with clockwise action order.
- Fold, call/check, raise, and all-in; raise amount can be adjusted with a slider.
- Independent mahjong scoring and wait calculation.
- Tap-to-select final hand. Do not add dragging, automatic replacement, or selection reset on reveal.
- Showdown/result flow with opponent private/final-hand inspection.
- Title, lobby, matching, cosmetics, gacha/shop stubs, match, showdown, and result are reachable.
- Japanese-first interface copy is present in the main flow.

## Current working rule

- 136-tile set, six players.
- Eight private tiles per player.
- Start with 15 communal tiles; no preflop lock.
- First `+4`: lock four tiles.
- Second `+4`: lock two additional tiles.
- Third and fourth `+4`: reveal only; no additional lock.
- Showdown uses 27 communal tiles, fixed six, and free selection of the remaining eight tiles to form the final 14.

This is not final game balance. The last paired 500-deal comparison for the fixed-4-then-2 / common-27 rule reported approximately 76.3% completion, 23.7% lock regret, and 23.4% split rate. The regret target was not met, so further simulation and playtesting remain necessary.

## Visual status — important

### Positive historical signals, not a final style

- Excitement and immediacy from earlier V2 screens.
- Clarity and restraint from the Clean Master set.
- A modern Japanese premium-club concept.
- Strong character emotion and high-quality material texture.
- The earlier `audition-r5` format is a useful example of exploring character art styles, but its exact style or meaning must not be inferred without asking the user.

### Explicitly rejected

- All 29 images merged in PR #43. They remain in `main` only as historical files.
- PR #44: match-screen proposals; closed unmerged and rejected.
- PR #45: character-style R6; closed unmerged and rejected.
- Cheap CSS-gradient buttons and generic placeholder-looking UI.
- Arbitrary changes of camera angle or game premise when the request is to compare art style, character rendering, material treatment, and world tone.
- Train, print, white-room, toy-city, ocean, theater, and sky-arena detours from the failed exploration.

### Current visual gate

- Newly approved art style: **0**.
- Newly approved world/material direction: **0**.
- Valid current comparison candidates: **0**.
- Do not generate, implement, or merge a new visual direction until the user gives a new scoped instruction.

## Verification status

PR #42 recorded passing acceptance, hands, skins, flow, mobile, scoring, visual-event, and Node checks. Motion testing had an intermittent Web Animations virtual-time issue. A mobile result-screen control was also reported below the 44 px target. Re-run the documented browser checks before claiming a later implementation is verified.

## Canonical continuity

GitHub is the project memory; chat sessions are temporary. Every new session must begin with:

1. `NEW_SESSION_START_HERE.md`
2. `PROJECT_STATE.md`
3. `CURRENT_TASK.md`
4. `DECISIONS.md`
5. only then, the relevant lane prompt or source files

Do not preload the archive or infer approval from a merged PR. A merge proves that files reached `main`; it does not prove that the user approved the visual result.
