# PHASE_GATES — MissionControl Phase 1

> Every gate must be green before the phase is "done". Adapted from APP_BRIEF §7.

| Gate | Criterion | How to verify |
|---|---|---|
| G1 | Build clean | `npm run build` — zero type errors |
| G2 | Real auth gate | super admin logs in; non-super-admin denied; auth NOT mocked |
| G3 | All 9 routes render | navigate each; both doors reach `/stores/[storeId]` |
| G4 | GREEN actions | each obeys confirm/feedback/audit/mock-state (UI_SPEC §5) |
| G5 | RED-list absent | no forbidden control reachable OR rendered (even disabled) on any screen |
| G6 | Onboarding constraint | identity read-only; only inputs = note + reason; invite email display-only; no payment |
| G7 | Dashboard | every HIPAA-safe metric renders from typed mock services; no PHI/$ recovered |
| G8 | Audit | every action emits a row; viewer reads them |
| G9 | Breadcrumb lock | store detail + onboarding detail always show context lock |
| G10 | Theming | light + dark pass; every color a semantic token; no hardcoded hex |
| G11 | Mobile | 375px holds on all 9 screens |
| G12 | KIPs | DataTable + EmptyState built, reused across their homes |
