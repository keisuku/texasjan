# Decision Log

This is the short, append-only decision register. Detailed evidence belongs in linked documents or PRs.

| Date | State | Decision | Evidence / consequence |
|---|---|---|---|
| 2026-08-14 | ACCEPTED | Product promise is “Mahjong Texas Hold'em.” | Preserve Hold'em information/reveal/betting tension. |
| 2026-08-14 | ACCEPTED | Visual is product and must be shown before completion. | Human review is a required gate. |
| 2026-08-14 | STRONG KEEP | Clean Masters are the visual control group, not final. | art/clean-masters/*.webp |
| 2026-08-14 | WORKING BASELINE | 136 tiles; six players; 15 communal + three +4; eight private; final 14 selection. | Must be simulated, not assumed correct. |
| 2026-08-15 | ACCEPTED | ChatGPT Work remains product/visual director because native image generation is mission-critical. | Codex supports implementation, simulation, repository maintenance, and orchestration. |
| 2026-08-15 | ACCEPTED | GitHub is the sole canonical project memory; chat transcripts are not source of truth. | Short state files plus PR/checkpoint discipline replace giant context dumps. |
| 2026-08-15 | ACCEPTED | Use one parent Control Tower plus four specialist lanes. | See orchestration/CONTROL_TOWER.md. |
| 2026-08-15 | PROPOSED | Five macro directions: Grand Casino, Future League, Character Showdown, Modern Japanese, Graphic Pop. | Gate A must compare representative visuals first. |
| 2026-08-17 | ACCEPTED | Human review screens use direct Japanese questions; internal workflow codes such as KEEP / MIX / DROP are not shown to the user. | One large image, visible progress, three plain-language choices, and swipe/previous/next navigation are the default review pattern. |
| 2026-08-16 | ACCEPTED | Contemporary Japanese atmosphere is the product default; avoid Chinese-coded clothing, architecture, ornament, and imperial color grammar. | Meta / Gacha Lab first proof rejected and replaced by five Japanese-centered directions. |
| 2026-08-16 | ACCEPTED | Japanese identity should come from restraint, contemporary fashion, product behavior, typography, craft, and materials rather than cliché stacking. | Backgrounds remain simple, modular, low-detail, and reusable across characters. |
| 2026-08-16 | ACCEPTED | Meta/customization UI must expose return, purpose, category, multiple choices, selected state, preview/try, and confirm/acquire. | Familiar usability is solved conventionally before adding spectacle. |
| 2026-08-16 | ACCEPTED | Main preview, selected thumbnail, garment card, and matching table/chip/stamp must represent one consistent character and set. | Prevents the generated-composite mismatch identified in the first proof. |
| 2026-08-16 | REJECTED | art/meta-gacha-lab/meta-gacha-clean-evolution-v1.png as a candidate visual. | Too Chinese-coded, too character-dominant, and unclear as gacha versus customization. |
| 2026-08-17 | STRONG KEEP | Gate Aの主軸は、タイトル・開始、キャラクターロビー、モード選択、キャラクター一覧、着せ替え、4枚公開の6画面。 | 26/26の人間レビュー完了。詳細は docs/visual/HUMAN_REVIEW_2026-08-17.md。 |
| 2026-08-17 | ACCEPTED | 統合方針は、旧V2の押したくなる高揚感を主軸に、Cleanの簡潔さ、Aの現代日本プレミアム、Cのキャラクター感情、Dの工芸素材を限定的に使う。 | Clean全画面を単独の最終案とはせず、通常対局の読みやすさへ継承する。 |
| 2026-08-17 | ACCEPTED | 強い演出は4枚公開、ALL-IN、アガリ・勝利へ集中する。 | 常時発光や全画面の高密度装飾を避け、平常時との落差を商品価値にする。 |
| 2026-08-17 | ACCEPTED | キャラクター・着せ替え・ガチャ結果は画面を増やしすぎず、集約・タブ化を優先する。 | 大会表、ランク進行、ミッション、イベント、シーズンパスは将来へ延期。 |
| 2026-08-17 | REJECTED | B｜日本発フューチャーリーグ、E｜日本グラフィックポップを今回の主方向として使う。 | Gate Aの明示的な人間判断。 |
| 2026-08-17 | REJECTED | 現行のガチャ告知、分散したガチャ結果、ごちゃついたショップ・ランク・ミッション、テンパイ注目をそのまま使う。 | 直感性と管理可能性を優先して再設計または今回見送り。 |

## States

- ACCEPTED: explicitly approved direction.
- STRONG KEEP / BASELINE: strongest current preference and comparison baseline, not final.
- WORKING BASELINE: playable or measurable rule still subject to simulation and playtest.
- PROPOSED: not approved.
- REJECTED: do not revive without a new reason and explicit human interest.
