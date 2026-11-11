# Design Principles

1. **Task over decoration.** Office managers update rosters all day. Optimise for speed and scanability, not delight.
2. **Colour means something.** Blue is action, teal is "verified", and status colours are used only for workflow state. Never use colour alone; pair it with a label or icon (WCAG 1.4.1).
3. **Dense but legible.** 13px base, compact data grids, 8px spacing grid. Whitespace separates groups, not rows.
4. **Show the system's reasoning.** Every auto-matched or auto-corrected field shows its source and confidence. Trust comes from transparency, which also supports the audit story.
5. **Fewer fields, pre-filled.** Ask only for exceptions. Known data is pre-populated, and bulk upload is first-class.
6. **Status is always visible.** Each change shows per-payer state: Draft, Submitted, Needs review, Approved, Rejected.
7. **Accessible by default.** WCAG 2.1 AA: 4.5:1 text contrast, visible focus, full keyboard operation, 32px+ targets.
8. **Synthetic data only.** No real provider or patient information appears anywhere.

## Palette (see `src/styles/tokens.js`)
| Role | Token | Hex |
|---|---|---|
| Primary action | primary.600 | #0F55A5 |
| Verified / secondary | accent.700 | #00675B |
| Approved | success | #2E7D32 |
| Needs review | warning | #9A5B00 |
| Rejected | error | #C62828 |
| Submitted | info | #0F55A5 |
| Draft / pending | pending | #52606D |
| Page background | neutral.25 | #F7F8FA |
| Surface | neutral.0 | #FFFFFF |
| Borders | neutral.100 | #E4E8ED |
| Text | neutral.900 / 600 | #17202A / #52606D |

Rationale: low-chroma neutrals and a deep, trustworthy blue suit the healthcare and enterprise-payer context. Teal differentiates "verified" from "action". Warning is a dark amber so it passes contrast on its tinted background.
