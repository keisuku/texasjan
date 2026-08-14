# MAHJONG HOLD'EM — Agent Rules

This repository is the canonical implementation and handoff for **MAHJONG HOLD'EM / Future Mahjong**.

## Required reading order

Before changing code or visuals, read these files in order:

1. `CODEX_START_HERE.md`
2. `docs/handoff/MASTER_HANDOFF_2026-08-14.md`
3. `docs/handoff/VISUAL_NORTH_STAR_AND_DECISIONS.md`
4. `docs/handoff/GAMEPLAY_WORKING_SPEC.md`
5. `docs/handoff/ROADMAP_50_DIRECTIONS.md`
6. `docs/handoff/DEVELOPMENT_STRATEGY_CODEX.md`
7. Existing implementation instructions in `CLAUDE.md` and `claude-handoff/START_HERE.md`

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

Do **not** start a framework migration. First extend the visual-direction gallery from the existing 21 references to the approved exploration structure described in `docs/handoff/ROADMAP_50_DIRECTIONS.md`.

