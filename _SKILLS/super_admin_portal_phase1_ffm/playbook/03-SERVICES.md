# 03 — SERVICES (Sub-Phase 2)

> Author `/services` — the 7 interfaces (DATA_CONTRACT §4). Each returns typed mock data via `/mocks`.

## Services
`MissionDashboardService`, `OwnerDirectoryService`, `StoreDirectoryService`, `StoreMemberService`, `SupportActionService`, `PendingRegistrationService`, `AuditLogService`.

## Discipline
- **Signatures are frozen** (DATA_CONTRACT §4). Real Supabase later replaces the bodies only.
- Every write in `SupportActionService` + `PendingRegistrationService` calls `AuditLogService.append`.
- Enforce invariants in the mock: `approve` never takes an email arg; `reject` never deletes; `restoreAdmin` validates the typed store name.
- Do NOT wrap kit auth. `SuperAdminUser` is read from real Supabase in the shell/layout, not a service here.
- Gate: all 7 interfaces stubbed, typed, compile-clean.
