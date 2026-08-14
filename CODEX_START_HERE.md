# CODEX START HERE — MAHJONG HOLD'EM

Last updated: **2026-08-14 JST**

## The most important fact

The user described the latest Clean Master direction as:

> 「震えるほど一気にこれまでの5千倍前進した気がしてます」

This is the strongest positive visual verdict in the current MAHJONG HOLD'EM phase.

It does **not** mean the design is final. The same message explicitly says there are still detailed corrections and that more macro directions should be explored before implementation becomes expensive.

Therefore:

- Treat `art/clean-masters/clean-master-lobby.webp`
- `art/clean-masters/clean-master-gacha.webp`
- `art/clean-masters/clean-master-match.webp`

as the **STRONG KEEP / comparison baseline**, not as a locked production design.

## Current decision point

The next decision is not a button color or a margin. It is:

> **What kind of product should MAHJONG HOLD'EM look and feel like at the highest level?**

The proposed exploration is:

- five macro product/art directions;
- the same ten representative screens in each direction;
- 50 concepts in a smartphone-friendly HTML gallery;
- human KEEP / MIX / DROP evaluation;
- then two finalists;
- then six consolidated Golden Visuals;
- then one 30-second vertical slice.

This proposal is documented in `docs/handoff/ROADMAP_50_DIRECTIONS.md`. It remains **PROPOSED** until the user approves the five macro directions.

## Do this next

1. Open `visual-exploration/index.html` and inspect the existing 18 broad V2 references plus the three Clean Masters.
2. Read the full handoff documents in the order specified by `AGENTS.md`.
3. Present the five macro directions at high quality and seek approval for those directions only.
4. Once approved, generate the 50-screen comparison gallery without repeatedly stopping for micro-confirmations.
5. Do not substantially refactor `index.html` until the visual finalists are selected.

## What already works

The current repository is not an empty mock:

- title → lobby → matching → game → showdown → result → replay flow;
- mobile design coordinate system at 941 × 1672;
- standard mahjong tile assets;
- selection from common/private tiles into the final 14-tile hand;
- yaku, han, fu, points and wait evaluation;
- betting and game-flow test harnesses;
- visual asset specifications and verification pages.

See `README.md`, `tests/README.md`, and `claude-handoff/START_HERE.md` before modifying these systems.

## Codex or ChatGPT Work?

Use **Codex as the main production environment from here** because the project now needs repository-wide reading, persistent file changes, test execution, screenshot comparison, asset integration, and disciplined commits.

Use **ChatGPT Work as the art-director/review surface** when large image-generation batches, visual critique, or human comparison is the primary task. The repository must remain the canonical memory so either environment can resume safely.

The correct workflow is not “Codex instead of visual generation.” It is:

> Visual direction and generated masters → GitHub canonical assets/specs → Codex implementation and verification → smartphone review → GitHub decision record.
