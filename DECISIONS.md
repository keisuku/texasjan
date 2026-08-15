# Decision Log

This is the short, append-only decision register. Detailed evidence belongs in linked documents or PRs.

| Date | State | Decision | Evidence / consequence |
|---|---|---|---|
| 2026-08-14 | ACCEPTED | Product promise is “Mahjong Texas Hold'em.” | Preserve Hold'em information/reveal/betting tension. |
| 2026-08-14 | ACCEPTED | Visual is product and must be shown before completion. | Human review is a required gate. |
| 2026-08-14 | STRONG KEEP | Clean Masters are the visual control group, not final. | `art/clean-masters/*.webp` |
| 2026-08-14 | WORKING BASELINE | 136 tiles; six players; 15 communal + three `+4`; eight private; final 14 selection. | Must be simulated, not assumed correct. |
| 2026-08-15 | ACCEPTED | ChatGPT Work remains product/visual director because native image generation is mission-critical. | Codex supports implementation, simulation, repository maintenance, and orchestration. |
| 2026-08-15 | ACCEPTED | GitHub is the sole canonical project memory; chat transcripts are not source of truth. | Short state files plus PR/checkpoint discipline replace giant context dumps. |
| 2026-08-15 | ACCEPTED | Use one parent Control Tower plus four specialist lanes. | See `orchestration/CONTROL_TOWER.md`. |
| 2026-08-15 | PROPOSED | Five macro directions: Grand Casino, Future League, Character Showdown, Modern Japanese, Graphic Pop. | Gate A must compare representative visuals first. |

## States

- **ACCEPTED:** binding until the user changes it.
- **STRONG KEEP:** strongest baseline, still improvable.
- **WORKING BASELINE:** implemented or testable, not mathematically final.
- **PROPOSED:** awaiting human approval.
- **REJECTED:** do not revive without new evidence and explicit interest.

