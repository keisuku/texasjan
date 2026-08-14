# MAHJONG HOLD'EM — Master Handoff

Date: **2026-08-14 JST**  
Repository: `keisuku/texasjan`  
Purpose: preserve the entire current product direction when moving from a long ChatGPT Work session into Codex.

---

## 1. Project North Star — ACCEPTED

Create a genuinely playable, world-market competitive game that begins as:

> **麻雀版テキサスホールデム / Mahjong Texas Hold'em**

Extended explanation:

> Everyone shares the same revealed mahjong tiles, combines them with private tiles, makes a hand, and bets.

The project is not trying to invent the strangest possible new game. The core philosophy is:

- preserve the historically refined structure of Texas Hold'em wherever possible;
- add only the most attractive parts of mahjong;
- favor finish and elegance over novelty;
- favor clarity over accumulated rules;
- every new mechanic must explain which Hold'em pleasure it strengthens.

The target is a game more intuitive, beautiful, addictive, and watchable than Poker Chase, while remaining realistic for an AI-assisted individual/small-team production.

---

## 2. Product pillars — ACCEPTED

### 2.1 Information change creates the game

The principal loop is:

1. read the communal board;
2. read private tiles;
3. infer own hand and opposing ranges;
4. bet;
5. reveal new communal tiles;
6. probabilities and relative strength change;
7. bet again.

This is the Hold'em loop:

> **Information Change → Probability Change → Decision**

Traditional mahjong actions such as constant discarding, calling, river reading, furiten, defensive tiles, and detailed tile-efficiency are not the protagonist.

### 2.2 Visual is product

Visual work must begin before every rule is frozen. Mathematics, UX, art, and implementation advance in parallel.

The failure mode to prevent is:

> Agent decides it is complete → human sees it for the first time → score is zero.

The human must see concepts from the earliest stage and evaluate them with KEEP / MIX / DROP.

### 2.3 One perfected slice beats a broad cheap world

The user does not want a large explorable world or many weak screens. The intended individual-development advantage is selection and concentration:

- a beautiful match field;
- premium character illustrations;
- excellent tile and chip assets;
- tactile selection and betting;
- polished reveal, tenpai, all-in, and showdown moments.

Think of perfecting less than 30 seconds of a modern premium game rather than building a visibly unfinished universe.

---

## 3. Strongest current human verdict

### STRONG KEEP / BASELINE — not final

The three Clean Masters under `art/clean-masters/` are the current strongest visual baseline.

The user's evaluation was exceptionally positive:

> 「めちゃくちゃ良い感じです！！！震えるほど一気にこれまでの5千倍前進した気がしてます。」

But the user immediately added:

- detailed correction points remain;
- more directions should be explored;
- making large changes after implementation will be expensive;
- the design should be resolved as far as possible first;
- a 50-direction HTML comparison similar to the earlier Future Mahjong workflow may be appropriate;
- five higher-level abstract directions should probably be defined before detailed breakdown.

Interpretation:

- Preserve the Clean Masters as the visual control group.
- Do not treat them as the final Golden Visual.
- Do not begin a costly production rewrite based only on these three screens.
- Explore meaningfully different macro directions, not tiny cosmetic variations.

---

## 4. Why earlier progress repeatedly failed

The user identified a recurring production error:

- trying to construct nearly everything without proper image/game assets;
- relying on improvised SVG and CSS for visual-critical components;
- placing temporary UI pieces that looked like last-minute patches;
- implementing interaction before the screen hierarchy was truly approved;
- presenting static images with invisible hotspots as if that were a real game;
- creating unnecessary dragging/free movement when the requested behavior was simple tap-to-select;
- polishing the same screen in tiny increments without expanding the product vision;
- producing busy, overdrawn AI imagery with waves, filigree, particles, and uniform texture.

The correction is permanent:

1. establish a convincing ideal screen;
2. obtain human approval on large composition and direction;
3. break it into production layers and real assets;
4. implement only the needed interaction;
5. compare Current Build against Golden Visual;
6. iterate by visible difference, not by “it functions.”

---

## 5. Visual target — ACCEPTED

The game should not look like:

- a conventional mahjong app;
- cheap Web3 science fiction;
- a generic AI-generated game screen;
- a dark unreadable sci-fi dashboard;
- a page full of decorative frames and meaningless glowing objects.

The target is:

- top-tier premium mobile competitive game;
- bright 2.5D to 3D presentation;
- tension of a luxury casino;
- instant readability closer to top card battlers;
- greater match-state clarity than Poker Chase;
- a unique Future Mahjong identity;
- central board, POT, six players, own private tiles, final hand, and bet actions readable immediately.

Current clean material language:

- ivory;
- jade/emerald;
- brass/gold;
- restrained cyan only for active-turn information;
- one dominant light direction and limited bloom.

See `CLEAN_VISUAL_STANDARD.md` and `docs/handoff/VISUAL_NORTH_STAR_AND_DECISIONS.md`.

---

## 6. Working gameplay baseline — not final mathematics

The current playable branch has evolved beyond the original 116-tile hypothesis.

### Current browser prototype baseline

- standard 136 tiles;
- six players;
- initial communal field: 15 revealed tiles arranged 5 × 3;
- three later reveal groups: `+4 I`, `+4 II`, `+4 III`;
- private tiles: 8;
- player may select up to 14 total tiles from private and communal sources;
- all 14 may come from communal tiles if desired;
- the first 13 occupy the final hand and the right-most tile is treated as TSUMO;
- selected source tiles visibly dim and receive a selected marker;
- tapping a selected final-hand tile removes it;
- once 14 are selected, another tile cannot be added until one is removed;
- newly revealed `+4` groups do not clear the selection;
- recommended-hand helpers exist but are intentionally imperfect and exploratory;
- standard poker actions and a six-player game-flow shell exist;
- riichi and tsumo are relevant; ippatsu is intentionally absent in the discussed direction.

This configuration produced the first genuinely enjoyable manual discovery moments: finding seven pairs, narrowly creating a hand, sometimes failing to reach tenpai, and occasionally discovering high-scoring shapes.

### Important status

This is a **WORKING BASELINE**, not a mathematically final rule set.

The original research hypothesis still matters:

- 116 tiles;
- 13 communal + 4 private;
- FLOP +3, TURN +1, RIVER +1;
- exactly two private tiles used;
- semi-structured initial board;
- future draws fully fair after the initial state;
- target Hold'em-like success bands around 8%, 16%, 24%, 31–35%, and rare 50% composite draws.

The current 136 / 15+4+4+4 / private-8 prototype is an experiential discovery that must be simulated against the earlier probability goals rather than assumed correct.

---

## 7. Core mathematical goal — ACCEPTED

The game does not need to reproduce ordinary mahjong probabilities. It should reproduce the emotional probability curve of Texas Hold'em:

- “it might come”;
- “it usually misses”;
- TURN misses but RIVER remains;
- rare river completion is dramatic;
- players can hold different draws and relative hand strengths;
- community reveals must not make everyone tie too often;
- private information must materially influence winning;
- betting and bluffing must remain meaningful.

Required simulation topics include:

1. equity distribution by street;
2. turn and river leader-change rates;
3. private-tile contribution;
4. communal-tile contribution;
5. showdown tie/split-pot rate;
6. major-hand completion;
7. completion by yaku;
8. success by mahjong-outs count;
9. player equity dispersion;
10. nuts/draw/dominated-state frequency;
11. river decisions remaining;
12. hands effectively decided too early;
13. wait overlap between players;
14. number and diversity of viable routes per player;
15. bluff opportunity.

Do not optimize for “natural mahjong” when it damages Hold'em tension.

---

## 8. Board-generation principle — ACCEPTED

The initial board may be semi-structured to avoid meaningless starts.

Good initial states show multiple visible dreams such as:

- pure straight;
- mixed triple sequence;
- all simples + pinfu;
- half flush;
- seven pairs;
- multiple competing composite routes.

But after the initial board is generated, private tiles and all future reveals must be fairly shuffled. Never manipulate future draws to create drama for a specific player.

The design metric is not ordinary shanten alone. Track:

- Major Hand Distance;
- Mahjong Outs;
- Major Route Count;
- Hidden Tile Influence;
- Board Volatility.

---

## 9. UX requirements — ACCEPTED

The user repeatedly emphasized that the fatal failure is when the situation does not enter the head immediately.

Required clarity:

- a visible “one tile away” feeling similar to a casino/pachinko reach moment;
- candidate winning tiles shown as supporting information;
- if the player holds a winning tile, it visibly lights;
- replaceable/usable tiles are clearly framed or marked;
- the final 14-tile hand is a principal protagonist and spans the bottom edge in one clean row;
- communal tiles are arranged clearly, with the initial 15 in 5 × 3 and later reveals grouped;
- every opponent's private cards read as belonging to that seat even while face-down;
- active-player focus should travel around the table in an unmistakable sequence;
- tap behavior, not dragging;
- used communal/private tiles visibly dim;
- no hidden automatic replacement at the selection cap.

---

## 10. Product scope inspired by Poker Chase

Do not compare only match screens. The product expression includes:

- title/opening;
- lobby;
- mode selection;
- characters;
- cosmetics;
- gacha/slot;
- shop/season pass;
- rank progression;
- missions/events;
- tournament;
- match/betting/reveal/tenpai/all-in/tsumo/result.

This is why the current visual archive contains 18 broad product screens and why the next structured exploration uses ten representative surfaces per direction.

---

## 11. Reusable existing assets

Potentially reusable Future Mahjong identity:

- fire for characters/wan association;
- water for pin association;
- grass for sou association;
- bright future arena;
- premium mechanical base;
- characters;
- spherical tiles may remain a brand option, but the current MAHJONG HOLD'EM prototype intentionally returned to ordinary tile shapes for clarity.

Legacy systems are not sacred:

- rotating seats;
- exchange station;
- lock mechanics;
- river-centered UI;
- direct 14-tile drag interaction.

Use only what strengthens this game.

---

## 12. Current repository implementation state

As of the handoff:

- default branch: `main`;
- existing main commit before this handoff: `cddcd9a` (“Merge real yaku scoring and live waits”);
- `index.html` is a large single-file browser prototype;
- `mahjong-score.js` holds independent scoring/wait evaluation;
- `assets/tiles/` contains the conventional tile set;
- `assets/ui/` contains accepted and rejected generated UI assets;
- `art/specs/` and verify pages define asset quality gates;
- `tests/` covers acceptance, scoring, flow, mobile, motion, and skins;
- earlier Claude and ChatGPT work is preserved under `claude-handoff/` and `art/rejected/`.

This handoff adds, rather than replaces:

- the current Clean visual standard;
- the three highest-rated Clean Masters;
- the 18-screen V2 visual archive;
- a smartphone evaluation gallery;
- the next 50-direction plan;
- Codex operating instructions.

---

## 13. Immediate roadmap

### Gate A — macro direction approval

Approve or revise the five directions in `docs/handoff/ROADMAP_50_DIRECTIONS.md`.

### Gate B — 50-screen HTML exploration

Generate five directions × ten common screens. Evaluate KEEP / MIX / DROP, score, and notes on smartphone.

### Gate C — convergence

Select two directions, then create six integrated Golden Visual candidates using KEEP and MIX elements.

### Gate D — three-screen system test

Verify the finalists on match, lobby, and gacha. If the same visual language cannot survive all three, it is not a product design system.

### Gate E — 30-second vertical slice

Implement only:

1. inspect private tiles;
2. tap tiles into final hand;
3. try recommendation directions;
4. bet/call/raise;
5. opponents act around the table;
6. reveal next communal group;
7. tenpai/wait tension;
8. showdown/result.

Polish this slice until it looks and feels commercial.

---

## 14. Permanent warning to future agents

Do not confuse activity with progress.

- Fifty random images are not fifty directions.
- A functional button is not a finished interaction.
- A CSS gradient is not a premium asset.
- A static screenshot with hotspots is not a game.
- More detail is not more quality.
- More screens are not more product if they expose cheapness.
- Step-by-step local optimization cannot replace a clearly imagined final target.

Every implementation step must answer:

> Does this visibly close the gap between the current build and the approved Golden Visual while preserving the game’s Hold'em tension?

