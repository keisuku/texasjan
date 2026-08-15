# MAHJONG HOLD'EM — Agent Rules

This repository is the canonical implementation and handoff for **MAHJONG HOLD'EM / Future Mahjong**.

## Required reading order

Start with the smallest useful context:

1. `PROJECT_STATE.md`
2. `CURRENT_TASK.md`
3. `DECISIONS.md`
4. the relevant lane prompt under `orchestration/prompts/`

Read older handoffs and archives only when the active task links them or a specific ambiguity requires them. Do not preload the full project history.

## Decision states are binding

- **ACCEPTED**: explicitly approved direction. Preserve unless the user changes it.
- **STRONG KEEP / BASELINE**: strongest current human preference; use as the comparison baseline, but do not call it final.
- **WORKING BASELINE**: current playable rule or implementation, still subject to simulation and playtest.
- **PROPOSED**: not approved. Do not silently promote it.
- **REJECTED**: do not revive without a new reason and explicit user interest.

If documents conflict, the newest dated handoff wins for current intent, but an older explicit **ACCEPTED** decision must not be overwritten by an agent inference.

## Visual-first production rules

1. **VISUAL IS PRODUCT.** Establish the ideal screen before committing to production architecture.
2. Do not make a major layout, proportion, art-language, character-presence, or screen-hierarchy decision without showing it and obtaining human approval.
3. Never declare a visual complete before the user has seen it.
4. Use `visual-exploration/index.html` for KEEP / MIX / DROP comparisons.
5. The current strongest baseline is the three-image Clean Master set under `art/clean-masters/`.
6. Avoid generic AI aesthetics: no full-screen filigree, waves, swirls, particles, glow ribbons, micro-patterns, excessive bloom, or uniform sharpness.
7. Backgrounds should be light in detail. High detail is reserved for faces, tiles, POT, and primary controls.
8. Visual-critical components must be real bitmap/3D/source assets where appropriate. Do not rebuild everything as cheap CSS gradients or improvised SVG.
9. HTML/CSS should primarily own text, numbers, layout, interaction states, accessibility, and responsive behavior.
10. Keep visual layers separable: background, character, table/tiles/chips, UI, localized FX.

## Product-focus rules

- The one-line promise is **“Mahjong Texas Hold'em.”**
- Preserve the Hold'em loop: information change → probability change → betting decision.
- Do not make discard selection, rivers, calls, furiten, or traditional tile-efficiency the protagonist.
- The two principal visual protagonists are:
  1. the revealed communal tile field and betting state;
  2. the player's final 14-tile hand at the bottom edge.
- A player unfamiliar with mahjong should understand the actionable state in roughly three minutes.

## Implementation safety

- Do not implement tile dragging. Source tiles are tapped and mirrored into the final-hand row.
- Do not auto-replace an old tile when 14 tiles are selected.
- Do not reset selected tiles when a `+4` group is revealed.
- Do not use a full-screen mock image with invisible hotspots as the final implementation.
- Do not remove or replace tested scoring/game-flow behavior while working on visual exploration.
- Preserve user changes and unrelated branches.

## Verification

Before handing off implementation changes, run or inspect the browser tests documented in `tests/README.md`:

- acceptance
- hands
- motion
- skins
- flow
- mobile
- scoring

For visual work, compare at 941 × 1672 and at approximately 25% scale. The main state must still read clearly at the smaller size.

## Immediate next task

Follow `CURRENT_TASK.md`. The current gate is coordinated through `orchestration/index.html`; do not start a framework migration or a 50-screen bulk generation pass.

