# 02 — TYPES (Sub-Phase 1)

> Author `/types` from DATA_CONTRACT. Compile-clean, zero `any`.

## Build
- The status vocabularies (DATA_CONTRACT §1): `AccountStatus`, `MemberRole`, `BusinessStatus`, `SubscriptionStatus`, `StoreHealth`, `RegistrationStatus`, `RegistrationType`.
- `SuperAdminUser` (§2) — from real auth.
- View-models (§3): `OwnerSummary/Detail`, `StoreSummary/Detail`, `Member`, `PendingRegistrationSummary/Detail`, `PlatformStats`, `GrowthPoint`, `AuditEntry`, `ActionResult`.

## Discipline
- Import from `/types` everywhere; no inline shapes.
- `Member.jobTitle?`, owner `name` source, and `StoreSummary.state` are the three flagged reconciliations (DATA_CONTRACT §6) — keep optional/graceful-empty; do not invent backing data.
- Gate: `tsc` clean; every §3 interface present and named exactly.
