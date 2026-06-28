# Workflow 04 — Components

Order matters:
1. Design system tokens first (Tailwind extend, CSS variables, brand assets)
2. Apply brand tokens (logo, color, font)
3. Remove vestigial template strings ("Moose Next Framework", "Your Company", etc.)
4. Build placeholder pages per UI_SPEC
5. Brand inherited auth screens (do NOT rewrite logic)
6. Build role-gated layouts using `protectPage`
7. Build error boundaries on every route group
8. Build access-denied page
9. Write component tests
10. **Project-specific:** Delete the `(superadmin)` route group + `/api/superadmin/*` if scope cuts include this (Cyber Pharma v1 Phase 1) OR brand superadmin UI if it stays in scope

Forbidden:
- Rewriting starter kit's auth UI logic
- Adding Phase 2 UI (OwedBook, tabs, filter sidebar)
- `dangerouslySetInnerHTML`
- Inventing components not in UI_SPEC

Gate: all routes navigable, role gates hold (manual walkthrough), error boundaries present, brand applied.
