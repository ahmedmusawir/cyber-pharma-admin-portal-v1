# 06 — VERIFICATION (Sub-Phase 5)

> No deploys. Local smoke + build clean + tests. Run `verification/BUILD_CHECKLIST.md`.

## Checks
- `npm run build` — zero type errors.
- Real auth: super admin logs in; non-super-admin denied (auth NOT mocked).
- All 9 routes render against mock data; both front doors reach `/stores/[storeId]`.
- Every GREEN action obeys its UX rule (confirm/feedback/audit/mock-state); breadcrumb lock present.
- Onboarding: approve requires a note; reject captures a reason; neither exposes email-entry or payment.
- **RED-list sweep:** no forbidden control reachable or rendered (even disabled) on any screen.
- Dashboard renders every §5.8 metric; audit viewer reads emitted rows.
- Light + dark + 375px all hold.

Gate: every row in `verification/PHASE_GATES.md` is green. Then STOP for approval.
