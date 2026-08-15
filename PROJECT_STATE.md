# MAHJONG HOLD'EM — Project State

Updated: **2026-08-15 JST**  
Repository: `keisuku/texasjan`  
Product promise: **Mahjong Texas Hold'em**

## One-minute state

MAHJONG HOLD'EM is a six-player browser game combining shared mahjong tiles, private information, and Hold'em-style betting. The repository already has a playable title → lobby → matching → match → showdown → result loop, independent scoring logic, conventional tile assets, UI asset specs, and browser tests.

The strongest visual baseline is the three-image **Clean Master** set in `art/clean-masters/`. It received the strongest user reaction so far but remains **STRONG KEEP**, not final. The next visual gate is to compare five genuinely different product directions before an expensive production rewrite.

## Current operating model

GitHub is the only canonical memory. Chat sessions are temporary workers.

| Lane | Primary tool | Responsibility | Status |
|---|---|---|---|
| 00 Control Tower | ChatGPT Work | Product decisions, synthesis, approvals | ACTIVE |
| 01 Match Visual Lab | ChatGPT Work | Native image generation, match composition | READY |
| 02 Meta / Gacha Lab | ChatGPT Work | Lobby, character, gacha, monetization surfaces | READY |
| 03 Probability Lab | Codex | Simulation, equity, tie rate, rule tuning | READY |
| 04 Playable Build Lab | Codex / Claude Code | Browser implementation and tests | READY |

Use `orchestration/index.html` as the launchpad and `orchestration/WORKSTREAMS.json` as the machine-readable lane registry.

## Binding product principles

- Preserve the Hold'em loop: **information change → probability change → betting decision**.
- Visual is product. Show visual work before calling it complete.
- Do not make discard selection, rivers, calls, furiten, or ordinary tile efficiency the protagonist.
- The communal field and the player's final 14-tile hand are the two principal visual objects.
- Use real image/source assets for visual-critical components. Code owns layout, text, numbers, interaction, accessibility, and responsive behavior.
- Future reveals must be fair after any accepted semi-structured initial-board generation.

## Working gameplay baseline

The current prototype uses 136 tiles, six players, 15 initial communal tiles, three later `+4` reveal groups, eight private tiles, and a selectable final 14-tile hand. This is a **WORKING BASELINE**, not final mathematics. It must be measured against Hold'em-like emotional probability bands around 8%, 16%, 24%, 31–35%, and rare ~50% composite draws.

## Visual baseline and next gate

Clean Masters use restrained ivory, jade, and brass, with cyan reserved for active-turn information. Five macro directions remain proposed: Grand Casino, Future League, Character Showdown, Modern Japanese, and Graphic Pop.

Do not generate a full 50-screen set yet. First prove the five directions on representative match concepts, then test the strongest candidates across match, lobby, and gacha.

## Context policy

- **Hot context:** this file, `CURRENT_TASK.md`, `DECISIONS.md`, and the relevant lane prompt.
- **Warm context:** the one or two handoff/spec files linked by the active task.
- **Cold archive:** older handoffs, rejected art, long chronology. Read only for a specific question.

Never paste the whole archive into a new session. At every handoff, preserve decisions and artifact links, not the entire conversation.

## Next human-visible milestone

Launch the four specialist prompts from the control room. The Control Tower then compares their artifacts and records the next accepted gate in `DECISIONS.md`.

