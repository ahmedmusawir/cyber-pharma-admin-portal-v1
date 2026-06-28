# 05 — COMPONENTS (Sub-Phase 4)

> Build the 9 screens from `_design/` + UI_SPEC, composing shadcn primitives. Build KIPs first.

## Order (COMPONENT_MANIFEST §4)
1. Tokens (`globals.*` + Tailwind map) — install the real token file from `_design/`.
2. Shell + shared primitives (Avatar, Badge variants + type badge, Card, Button variants, Input, **Textarea**, read-only field grid).
3. **KIP-2 EmptyState** + **KIP-1 DataTable** (homes: audit log + onboarding queue).
4. Screens: Login → Owners (canonical) → Stores → Owner detail → Store detail → Dashboard → Audit log → Onboarding queue → Onboarding detail.
5. KIP-3 MultiSelect — defer to first filtering need.

## RED-list enforcement (per screen)
No add-member, no password field, no email entry/edit, no billing/checkout, no PHI — **not even disabled**. Onboarding identity block is read-only; only inputs are the verification note + reject reason; invite email is display-only. Store detail keeps the breadcrumb context lock. If a design seems to imply a forbidden control, STOP and surface.

## Theming
Every color a semantic token. Light + dark both pass. Mobile 375px holds (sidebar → top strip; grids collapse; DataTable rows → stacked blocks).
