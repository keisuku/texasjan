# Current Task

Updated: **2026-08-15 JST**

## Gate A — launch the four specialist lanes

Create durable, independently resumable work in four lanes while the parent ChatGPT Work session remains product director.

### Required outputs

- **Match Visual Lab:** five representative 941 × 1672 match-screen concepts, one per macro direction, generated as actual images rather than prose only.
- **Meta / Gacha Lab:** a cross-screen product-language test covering lobby, character, and gacha, with at least one high-quality generated visual proof.
- **Probability Lab:** a reproducible baseline simulation report for the current rule set plus the first tunable experiment matrix.
- **Playable Build Lab:** a verified current-build audit and a minimal vertical-slice implementation plan that preserves approved scoring and flow.

### Acceptance gate

The Control Tower must be able to compare artifacts by links or files, record KEEP / MIX / DROP, and choose the next two directions without reopening the full historical conversation.

### Explicit non-goals

- No framework migration.
- No 50-screen bulk generation before Gate A review.
- No promotion of a proposed visual direction to final without human approval.
- No large gameplay rewrite before probability baseline measurements.

### Completion protocol

Every lane ends with a checkpoint using `orchestration/CHECKPOINT_TEMPLATE.md`. Durable code, docs, or assets go to a lane branch and PR. If a tool cannot write GitHub, it returns the checkpoint and downloadable artifacts for the Control Tower to persist.

