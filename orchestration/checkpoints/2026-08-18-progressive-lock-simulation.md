# Lane Checkpoint

- Lane: 03 Probability Lab
- Date/time (JST): 2026-08-18
- Branch / PR: `build/progressive-lock-simulation` / PR pending
- Status: `READY_FOR_REVIEW`

## Outcome

The free / lock8-at-15 / lock4+4 / lock4+2 conditions now run on identical seeded deals with the production scorer and existing five strategy ranks. Lock choice receives no future reveal. The 4→2 variant fixes six tiles and leaves eight final slots free.

## Human-visible artifacts

- Link or file: `probability/progressive-lock/REPORT.md`
- What to inspect: completion, lock regret, split pot, route share, private attribution, shared-core collision, route pivot, and sampled equity movement.

## Decisions made

- PROPOSED: compare 4→2 against 4→4 as experiments only until a larger paired run and playtest agree.

## Verification

- Test/check: `node probability/progressive-lock/test.js`
- Result: deterministic seed, 4→8 and 4→6 lock counts, visible-copy limit, and first/second-lock no-future-input invariants covered.

## Open risks

- The pilot equity sample is intentionally small and does not model betting/folding.
- The lock picker is the existing recommendation policy plus a deterministic core-extraction rule; human lock behavior may differ.

## Exact next action

Review `REPORT.md`, then choose whether to run 5,000 paired deals or first tune the core-extraction policy from playtest data.
