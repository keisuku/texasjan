# Current Task

Updated: **2026-08-20 JST**

## Current status

There is no active image-generation or visual-implementation task. The previous visual attempts were rejected:

- PR #43: merged, but all 29 images were subsequently rejected.
- PR #44: closed unmerged and rejected.
- PR #45: closed unmerged and rejected.

The next session must not continue those directions by default.

## Required first response in a new session

After reading `NEW_SESSION_START_HERE.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, and `DECISIONS.md`:

1. Inspect the current repository and relevant PR state read-only.
2. Summarize, in no more than ten items, what is implemented, unapproved, rejected, and unresolved.
3. Stop and wait for the user to assign the next scoped task.

## Do not do before a new instruction

- Do not generate more images.
- Do not reuse PR #43, #44, or #45 visuals as an approved baseline.
- Do not infer a requested art style from `audition-r5`; ask when a concrete choice is needed.
- Do not merge visual work.
- Do not bulk-generate similar variants.
- Do not redesign gameplay rules or replace tested flow.
- Do not ingest the entire archive into context.

## Safe work that remains available after assignment

- Gameplay/probability: continue reproducible simulations from the current fixed-4-then-2 / common-27 working rule.
- Implementation: diagnose or implement narrowly scoped changes while preserving tested scoring and flow.
- Visual exploration: only after the user supplies a new scoped brief, compare genuinely distinct art-rendering/material/world treatments while keeping the existing game structure.
- Documentation: keep the four canonical handoff files current at every material checkpoint.
