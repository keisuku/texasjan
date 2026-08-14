# Development Strategy — Codex, ChatGPT Work, and Production Tools

Date: 2026-08-14 JST

## Conclusion

From this point, **Codex should be the primary production workspace**, while ChatGPT Work remains valuable for image generation, art-direction critique, and human-facing visual selection.

The project has passed the point where a conversation alone is a safe canonical memory. It now contains:

- many source files;
- visual assets;
- test harnesses;
- scoring logic;
- multiple branches and previous experiments;
- explicit accepted/proposed/rejected decisions;
- a need for screenshot-to-target iteration.

These are repository problems, so GitHub must be canonical and Codex should operate from it.

## Recommended division of labor

### ChatGPT Work / image generation

Best for:

- broad visual exploration;
- raster masters and background/character studies;
- comparing art directions;
- user-facing KEEP / MIX / DROP review;
- refining prompts from visible human reaction.

### Codex

Best for:

- reading the full repository before acting;
- building the HTML gallery;
- integrating assets without destroying logic;
- running tests;
- screenshot capture and visual-diff iteration;
- implementing game state and AI betting;
- committing persistent documentation;
- maintaining file/asset manifests.

### Claude Code / other coding agents

Useful as a deliberate comparator on bounded tasks, not as a second source of truth. Give every agent:

- the same Golden Visual;
- the same acceptance criteria;
- the same time limit;
- an isolated branch/worktree;
- a screenshot comparison requirement.

Choose the best verified output, not the most confident explanation.

### Unity/Godot/Three.js/PixiJS

Do not select a final runtime solely because it is easy.

Choose after the Golden Visual and 30-second slice define actual needs:

- HTML/CSS/JS: fastest UI/state prototype and mobile web distribution;
- PixiJS/Phaser: sprite-heavy tactile 2D and effects;
- Three.js/WebGL/WebGPU: true camera, table depth, material light, 3D tiles;
- Unity: strongest mature asset ecosystem, animation, mobile packaging, multiplayer/service integrations;
- Godot: lower-cost open-source engine with capable 2D/3D workflow.

Likely near-term strategy:

1. keep the current browser prototype for rules and UX;
2. settle Golden Visual;
3. implement a polished browser vertical slice with real assets;
4. use the slice to decide whether the final match renderer stays web-based or moves to Unity/Godot;
5. keep simulation/scoring data portable and engine-independent.

## Asset strategy

Visual-critical elements should be sourced deliberately:

- licensed or custom character illustrations;
- licensed/custom 3D or high-quality rendered tile bodies;
- premium table/environment plate;
- chip and coin assets;
- purpose-made action buttons;
- controlled reveal/all-in/tsumo FX;
- production fonts with global-language coverage.

Before buying assets, verify:

- commercial-game license;
- modification rights;
- redistribution restrictions;
- use in promotional material;
- source formats;
- mobile performance;
- visual compatibility with the chosen Golden Visual.

Do not buy a large unrelated asset bundle merely to avoid design decisions.

## Persistent workflow

Every major visual iteration should produce:

1. source image or layered source reference;
2. prompt/brief;
3. verdict: KEEP / MIX / DROP;
4. human reason;
5. implementation-layer notes;
6. screenshot of the current build;
7. difference score against the approved target;
8. Git commit or archived rejected folder.

## Suggested next Codex prompt

Use the repository root prompt in `PROMPT_FOR_CODEX.md`.

