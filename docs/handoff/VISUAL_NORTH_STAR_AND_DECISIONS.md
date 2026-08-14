# Visual North Star and Decision Record

Date: 2026-08-14 JST

## Status key

- **ACCEPTED** — explicitly established principle
- **STRONG KEEP** — strongest present reference, still open to improvement
- **PROPOSED** — awaiting approval
- **REJECTED** — established failure mode

## STRONG KEEP — Clean Master baseline

The three files in `art/clean-masters/` are the current visual control group:

1. `clean-master-lobby.png`
2. `clean-master-gacha.png`
3. `clean-master-match.png`

Why they moved the project forward:

- the screen finally breathes;
- hierarchy is readable instead of uniformly decorated;
- background is calm enough that UI and faces can be protagonists;
- ivory, jade, and brass form a coherent product language;
- the match screen makes the communal field and final hand legible;
- the screens look more like one commercial game and less like unrelated AI concepts.

They are not final because:

- some proportions and placements still need correction;
- the art direction must be tested against meaningfully different macro positions;
- generated text and fine UI cannot be production assets;
- characters, backgrounds, tiles, and UI must be separated;
- the same language must work across title, lobby, gacha, match, and result.

## ACCEPTED — Clean Visual Standard

### North Star

Luxury comes from composition, whitespace, hierarchy, and material contrast—not from maximum detail.

### Density hierarchy

- High density: face, key tiles, POT, main action buttons.
- Medium density: supporting UI.
- Low density: background.
- Never render the entire screen at the same sharpness/detail level.

### Permanent limits

- Background detail should be approximately 40–60% lower than the previous V2 set.
- Main materials: normally no more than ivory, jade, brass.
- One key accent light; cyan is reserved for active-turn information.
- Gold indicates hierarchy, stakes, or reward—not every border.
- No routine halos, waves, swirls, glowing ribbons, confetti, full-screen particles, or background filigree.
- No uniform bloom, reflection, microtexture, or sharpening.
- Decorative lines exist only when they separate or explain something.

### Production layers

1. light-detail background without text/buttons/characters;
2. transparent character illustration;
3. tile/table/chip assets;
4. code-rendered UI and localization;
5. short localized FX that never hides information.

### Acceptance checks

- Main protagonist is obvious in one second.
- POT, final hand, and primary action remain readable at 25% scale.
- Blurring the background does not destroy perceived value.
- Removing 30% of decoration makes the screen feel more premium, not unfinished.
- The image can be decomposed into implementable layers.

## ACCEPTED — screen hierarchy

On the match screen the viewer should perceive, in order:

1. communal board / newly revealed information;
2. POT and betting pressure;
3. player turn and opponent ownership;
4. private tiles;
5. final 14-tile hand;
6. FOLD / CALL / RAISE and amount control.

The final hand is not a secondary summary floating in the middle. It is a principal object placed at the bottom/front, edge to edge in one row.

## PROPOSED — five macro directions

These are product fantasies, not color swaps.

### A. Grand Casino

**Promise:** bright future luxury mahjong casino.  
**Closest to:** current Clean Masters.  
**Strength:** global, premium, broadly legible.  
**Risk:** uncontrolled brass ornament returns to generic AI luxury.

### B. Future League

**Promise:** mahjong as a world championship broadcast sport.  
**Strength:** turn order, POT, rank, betting, spectator readability.  
**Risk:** character warmth and collectible appeal may weaken.

### C. Character Showdown

**Promise:** a refined character confrontation descended from Poker Chase.  
**Strength:** emotion, gacha, skins, collaboration, marketing.  
**Risk:** faces can overpower tiles and the final hand.

### D. Modern Japanese

**Promise:** Japanese craft luxury translated into a modern global game.  
**Strength:** strong origin story and distinct market identity.  
**Risk:** may regress into the visual category of an ordinary mahjong application.

### E. Graphic Pop

**Promise:** bold, tactile, instantly readable strategic mobile game.  
**Strength:** selection feel, animation, mobile readability, achievable production scope.  
**Risk:** can feel indie/cartoon rather than premium if materials and typography are weak.

These five remain **PROPOSED** until the user approves them.

## REJECTED failure modes

- cheap Web3/SF look;
- dark unreadable arena;
- every panel framed in ornate gold;
- full-screen AI texture and rippling decorative lines;
- generated UI text baked into backgrounds;
- visual-critical assets replaced by weak CSS/SVG approximations;
- character art that hides the board;
- unowned face-down tiles floating away from seats;
- ambiguous active turn;
- final hand compressed into a secondary strip;
- drag/free-move interaction;
- whole-screen mock used as the actual game layer;
- tiny local changes presented as new directions.

## Existing V2 evaluation

The earlier 18-screen V2 set is preserved under `art/visual-archive/v2/` and in the HTML gallery.

Recorded selection:

- KEEP: 1, 5, 7, 8, 10, 11, 13, 14, 15, 16, 17, 18
- MIX: none
- DROP: 2, 3, 4, 6, 9, 12

Later instruction added screen 19 in a prior numbering context; the definitive repository archive here is the named 18-screen V2 set plus three Clean Masters. Do not rely on bare numbers without filenames.

## Critical visual feedback chronology

1. Early layouts felt atmospheric but did not communicate the main state.
2. User demanded a strong “one tile away” reach/tenpai feeling.
3. Ordinary narrow mahjong tiles in a single final-hand row improved intuitive reading.
4. Communal tile reveals and opponent-owned face-down tiles became the match framework.
5. Large communal fields created more interesting hand construction but raised tie/probability questions.
6. Functional HTML became more playable, but asset-light construction remained visibly cheap.
7. Full-screen generated mock reproduced quality but was non-interactive and therefore only a target, not implementation.
8. Asset separation and real scoring/game-flow work materially improved the prototype.
9. Broad V2 product exploration finally expanded beyond one match screen.
10. User then identified V2’s “ChatGPT-like gabigabi” detail: hidden wave patterns plus over-rendering.
11. Clean Masters removed most global noise and triggered the strongest positive reaction to date.
12. The next request is broader macro exploration before expensive implementation.

