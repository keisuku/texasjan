# Gameplay Working Specification

Date: 2026-08-14 JST  
Status: **WORKING BASELINE — requires simulation and playtest**

## 1. Current playable configuration

| Element | Current working value |
|---|---|
| Players | 6 |
| Tile set | Standard 136 tiles, 34 types × 4 |
| Initial communal tiles | 15, shown as 5 × 3 |
| Later reveals | +4 I, +4 II, +4 III |
| Final communal total | 27 |
| Private tiles | 8 per player |
| Player construction | Select up to 14 total from communal/private sources |
| Private minimum | None in current exploratory implementation |
| Communal-only 14 | Allowed |
| Final row | 13 hand tiles + right-most TSUMO tile |
| Selection | Tap source tile to include; tap final tile to remove |
| Selection cap | 14; no automatic replacement |
| Reveal persistence | Existing selections persist when +4 reveals |
| Betting | Hold'em-style FOLD/CHECK/CALL/RAISE/ALL-IN direction |
| Scoring | Japanese mahjong yaku/han/fu/points engine exists |
| Discussed scoring note | Riichi and tsumo; no ippatsu |

## 2. Why this version feels promising

The user manually experienced:

- seven pairs becoming discoverable;
- narrow near-completions;
- hands that fail to reach tenpai;
- occasional high-scoring possibilities;
- meaningful choice between private and communal tiles;
- a recommendation system imperfect enough to leave discovery to the player.

This was the first configuration described as feeling surprisingly balanced and full of possibility.

## 3. Known unresolved risks

1. Twenty-seven communal tiles may make strong hands too frequent.
2. Allowing communal-only 14-tile hands may increase ties and reduce hidden-information value.
3. Eight private tiles may create excessive route breadth or dominant holdings.
4. The recommendation system is not a reliable best-hand solver for every yaku.
5. The current reveal cadence is emotionally different from Hold'em’s 3/1/1 structure.
6. Full yaku and wait handling around the designated TSUMO tile needs systematic verification.
7. Current AI betting must be judged through repeated complete rounds, not isolated button clicks.

## 4. Original mathematical hypothesis retained for comparison

The earlier primary candidate was:

- 116 tiles;
- initial common 13;
- private 4;
- FLOP +3;
- TURN +1;
- RIVER +1;
- exactly two private tiles used in the final hand;
- automatic best-hand selection;
- semi-structured initial board, then fair shuffled future.

Why 116 was interesting:

- after 20 known tiles, 96 unknown remain;
- four copies of one type are approximately 4.17% per single reveal, close to a Hold'em one-out river probability;
- sixteen tile copies across four types are approximately 16.7% per single reveal, close to common eight-out Hold'em bands;
- the chance that one specified four-copy type appears in a three-tile flop was hypothesized near the pocket-pair-to-set band.

These analogies are starting points, not proof of a fun complete game.

## 5. Simulation matrix

At minimum compare:

### Deck sizes

- 108
- 112
- 116
- 120
- 124
- 136

### Communal structures

- 13 + 3 + 1 + 1
- 15 + 3 + 1 + 1
- 15 + 4 + 4 + 4
- other structures only if they have a clear Hold'em-emotion rationale

### Private tiles

- 4
- 6
- 8

### Final-hand restrictions

- at least 1 private;
- exactly 2 private;
- at least 2 private;
- exactly 3 private;
- free selection up to 14;
- free selection with a tie-break penalty for communal-only construction.

### Initial board policy

- fully random;
- semi-structured multi-route;
- three selectable communal route groups, only as an explicit experimental branch.

## 6. Core KPIs

Track at least one million deals per serious candidate when the scorer is stable:

- equity distribution by street;
- turn reversal rate;
- river reversal rate;
- private contribution;
- communal contribution;
- tie/split-pot rate;
- major-hand completion;
- completion by yaku;
- success by outs;
- player equity dispersion;
- nuts frequency;
- draw frequency;
- dominated-state frequency;
- bluff opportunity proxy;
- river decision survival;
- proportion almost decided at the start;
- wait overlap;
- route diversity.

## 7. Target experience

Do not maximize completion. Create recognizable bands:

- approximately 8%: miracle;
- approximately 16%: thin draw;
- approximately 24%: meaningful draw;
- approximately 31–35%: strong draw;
- around 50%: rare composite monster draw, not the default.

The emotional target is:

> likely enough to hope, unlikely enough to miss, and still alive on the river.

## 8. Board-generation constraints

Initial board generation may create an interesting starting point, but future draws cannot be personalized.

Good boards:

- show at least one clear 2-han-or-better dream;
- usually show multiple routes;
- allow private tiles to change evaluation materially;
- do not collapse every player onto the same wait;
- do not make the board itself the universal winning hand.

## 9. AI betting minimum

The match must no longer behave like a static UI where only the user’s amount changes.

After a user action:

1. active focus moves to the next live seat;
2. opponent decides check/call/raise/fold;
3. bet and stack animate/update;
4. action continues around the table;
5. betting street closes only when all live players have matched or folded;
6. next communal group is revealed;
7. the same loop repeats;
8. side pots and all-in states are respected;
9. showdown resolves and stacks persist into the next hand.

The first AI may be heuristic, but it must create uncertainty through hand strength, draw strength, position, pot odds, stack pressure, and controlled bluff frequency.

