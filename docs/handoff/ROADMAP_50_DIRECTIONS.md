# Roadmap — 50-Direction Visual Exploration

Date: 2026-08-14 JST  
Status: **PROPOSED — macro directions require user approval**

## 1. Recommendation

Use one smartphone HTML gallery to compare:

> **5 macro product/art directions × the same 10 product screens = 50 concepts**

This is deliberately not 50 random images and not 50 micro-variations of one match screen.

## 2. Five macro directions

### A — Grand Casino

Bright future luxury; ivory, jade, restrained brass; the current Clean Masters are the control group.

### B — Future League

World championship broadcast; strong active-turn sequence, rank, pressure, and spectator clarity.

### C — Character Showdown

Poker Chase lineage with more restrained UI; emotion and collectible character presence lead.

### D — Modern Japanese

Japanese origin as premium craft: lacquer, ceramic ivory, washi softness, copper/brass restraint.

### E — Graphic Pop

Tactile mobile strategy; bold hierarchy, readable shapes, satisfying tile selection and reveal motion.

## 3. Ten common screens per direction

1. Title / opening
2. Lobby / home
3. Mode selection
4. Character roster/detail
5. Gacha / slot
6. Match overview
7. Player betting turn
8. Communal reveal + tenpai/wait focus
9. All-in + showdown
10. Result + rank/event/shop expression

Each direction must show the same product obligations. A beautiful match image alone is insufficient.

## 4. Generation discipline

For every image:

- design resolution: 941 × 1672;
- portrait mobile composition;
- no generated fine text as a production claim;
- preserve room for localized code-rendered text;
- separate background, character, object, and UI intent in metadata;
- use no more than one major special effect;
- identify the single protagonist;
- identify which screen region must remain interactive;
- list foreseeable implementation layers.

## 5. Gallery behavior

The gallery must be phone-friendly and persist evaluation locally.

Per concept:

- full-screen preview;
- direction and screen labels;
- KEEP / MIX / DROP;
- 1–5 rating;
- short note;
- implementation difficulty;
- reusable-asset estimate;
- side-by-side compare;
- filter by direction, screen, or verdict;
- export to Japanese text and JSON.

MIX means:

> Do not adopt the whole concept, but transplant one named element into another direction.

Example:

- A background: KEEP
- C character scale: MIX
- B turn indicator: MIX
- E button material: DROP

## 6. Evaluation rubric — 100 points

| Criterion | Points |
|---|---:|
| Main state understood within one second | 15 |
| Final 14-tile hand feels like a protagonist | 15 |
| Communal reveal and betting pressure are clear | 12 |
| Premium quality without AI clutter | 12 |
| Character and collectible appeal | 10 |
| Mobile ergonomics/readability | 10 |
| Distinctive world-market identity | 10 |
| Motion/interaction potential | 8 |
| Realistic layer decomposition | 8 |

Automatic rejection signals:

- generated-gibberish text dominates;
- board/private/final-hand ownership is ambiguous;
- characters cover actionable tiles;
- decorative detail is uniform across the screen;
- the composition cannot be separated into production layers;
- it reads as ordinary mahjong or cheap Web3 UI.

## 7. Convergence after 50

1. Keep the top two macro directions.
2. Extract MIX elements by category: layout, character scale, table, tiles, buttons, turn focus, effects, lobby/gacha language.
3. Produce six integrated Golden Visual candidates.
4. Validate each on match, lobby, and gacha.
5. Select one design system.
6. Decompose assets and build one 30-second vertical slice.

## 8. What not to implement before convergence

- framework migration;
- full lobby/gacha economy;
- character animation system;
- global shader stack;
- production multiplayer backend;
- large asset store purchase batch;
- dozens of CSS component variants.

Allowed parallel work:

- gameplay simulation;
- scoring tests;
- AI betting state machine;
- asset licensing research;
- visual asset separation experiments that do not lock layout.

## 9. Existing gallery seed

`visual-exploration/index.html` already contains:

- 18 broad V2 product references;
- 3 Clean Masters;
- KEEP / MIX / DROP controls;
- notes, score, filters, and export.

It is a handoff/evaluation seed. Replace its placeholder future slots only after the five macro directions are approved.

