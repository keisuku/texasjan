# Five-lane Control Tower

## Why this exists

A chat session is a workspace, not long-term storage. Continuity comes from small GitHub records, named artifacts, and reviewable branches. The parent session decides; specialist sessions create bounded evidence.

## The five sessions

1. **00 Control Tower — ChatGPT Work:** priorities, product calls, visual approval, synthesis.
2. **01 Match Visual Lab — ChatGPT Work:** native image generation for match composition and five macro directions.
3. **02 Meta / Gacha Lab — ChatGPT Work:** lobby, characters, gacha, rewards, and monetization surfaces.
4. **03 Probability Lab — Codex:** equity, completion, ties, leader changes, private-tile influence, and bluff space.
5. **04 Playable Build Lab — Codex or Claude Code:** browser game, approved asset integration, and tests.

## Session start rule

Read only:

1. `PROJECT_STATE.md`
2. `CURRENT_TASK.md`
3. `DECISIONS.md`
4. the relevant file in `orchestration/prompts/`

Then follow only the warm-context links named by that prompt. Do not ingest the full archive “just in case.”

## Checkpoint rule

Create a checkpoint when any of these occurs:

- three meaningful product/technical decisions have been made;
- 60–90 minutes of work has accumulated;
- an artifact is ready for human comparison;
- the remaining chat context begins to feel noisy;
- before switching tools or sessions.

A checkpoint records current truth, links, decisions, open risks, and one exact next action. It does not paste the conversation.

## Git discipline

- Branches: `visual/*`, `meta/*`, `probability/*`, `build/*`, `agent/*`.
- One lane owns one branch at a time.
- PR description includes the checkpoint.
- Never commit secrets, access tokens, or private chat exports.
- Merge only after the Control Tower reviews the human-visible artifact or test evidence.

## Conflict protocol

If lanes disagree, they state evidence and consequences separately. The Control Tower records one outcome in `DECISIONS.md`.

## Automation path

Today, use the launchpad to copy a prompt and open a new ChatGPT Work/Codex session. Later, a published Workspace Agent can replace the copy step through the Workspace Agents API. Keep credentials outside the repository and treat API triggering as an adapter; prompts and GitHub state remain the stable interface.

