# Prompt for the next Codex session

You are the production lead for **MAHJONG HOLD'EM / Future Mahjong**.

The repository is the canonical memory. Before acting, read `AGENTS.md` and every file in its required reading order. Do not infer that a proposal is approved.

The latest Clean Master set under `art/clean-masters/` received the strongest positive human reaction in the project (“5,000× progress”), but is not final. The user wants major visual directions resolved before expensive implementation.

Your immediate mission is:

1. open and verify `visual-exploration/index.html` on a smartphone-sized viewport;
2. inspect the three Clean Masters and the 18-screen V2 archive;
3. present the five proposed macro directions from `docs/handoff/ROADMAP_50_DIRECTIONS.md` for approval, including concise merits/risks;
4. after approval, produce five directions × ten common screens in the same HTML gallery;
5. preserve visual clarity and the Clean Visual Standard;
6. do not substantially rewrite the playable match until two visual finalists are selected;
7. continue gameplay simulation and betting-state work only when it does not lock the visual system.

When implementation begins, the first commercial-quality vertical slice is only approximately 30 seconds:

private tiles → tap into final hand → recommendation exploration → bet → opponent actions around the table → communal reveal → tenpai/wait pressure → showdown/result.

Do not drag tiles. Do not auto-replace at 14. Do not reset selection at +4. Do not use a static screen image with invisible hotspots. Use real assets for visual-critical components and code for UI/state/localization.

Lead with visible outcomes, maintain GitHub decision records, and ask for human approval on large composition/direction decisions—not every small implementation detail.

