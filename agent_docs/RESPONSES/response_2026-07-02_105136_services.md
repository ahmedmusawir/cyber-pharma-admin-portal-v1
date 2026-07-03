# FFM Sub-Phase 2 — SERVICES (MissionControl / cyph-mission-control-v1)

> Status: **COMPLETE — awaiting approval before Sub-Phase 3 (Mocks).**
> Generated: 2026-07-02 10:51:36 · Gate: `npx tsc --noEmit` → **CLEAN**. Frozen Types signatures unchanged.

## What was authored
7 mock-backed domain services (implementing the frozen `@/types/mission-control` interfaces) + 1 real-auth session resolver + a minimal mock-store seam.

| File | Interface | Notes |
|---|---|---|
| `src/services/mission-control/missionDashboardService.ts` | `MissionDashboardService` | `getPlatformStats` / `getGrowth(months)` / `getOwnersPreview(limit)` — HIPAA-safe reads |
| `…/ownerDirectoryService.ts` | `OwnerDirectoryService` | `listOwners({search?})` / `getOwner(id)` — reads pre-derived projections |
| `…/storeDirectoryService.ts` | `StoreDirectoryService` | `listStores({search?})` (name/NCPDP) / `getStore(id)` |
| `…/storeMemberService.ts` | `StoreMemberService` | `listMembers(storeId)` |
| `…/supportActionService.ts` | `SupportActionService` | 5 GREEN member writes; each appends audit |
| `…/pendingRegistrationService.ts` | `PendingRegistrationService` | list/get/approve/reject; onboarding invariants enforced |
| `…/auditLogService.ts` | `AuditLogService` | `append` (internal, id+timestamp generated) / `listEntries({search?})` |
| `…/index.ts` | — | barrel: exports the **7 mock services only** (no server-only code) |
| `…/session.ts` | — | **REAL auth** `getSuperAdminUser()` — server-only; NOT in the barrel |
| `src/mocks/mission-control/store.ts` | — | **SEAM only** — empty typed collections + zeroed stats; dataset = Sub-Phase 3 |

## Gate results
- `npx tsc --noEmit` → **CLEAN** (zero errors).
- **Watch item — isSuperAdmin DERIVED, not hardcoded** ✅ (`session.ts`):
  ```ts
  const role = await getUserRole(user.id);
  const isSuperAdmin = role === AppRole.SUPERADMIN;
  if (!isSuperAdmin) return null;      // login denied unless derived check passes
  return { id, email, displayName, isSuperAdmin: true };
  ```
  `isSuperAdmin: true` is returned ONLY when the kit-real check passes; otherwise `null`. No `is_super_admin` column referenced. Real Supabase (`createClient` + `getUserRole`) — not mocked.
- RED-list service audit → no create/delete/billing/email-edit/impersonation methods exist.

## Invariants enforced in mock logic
- **Every GREEN write appends an audit row** via `auditLogService.append` (suspend, unsuspend, recovery-trigger, resend, restore-admin, approve, reject) — success AND failure rows.
- **Onboarding (approve/reject):** signatures take only `{registrationId, verificationNote|reason}` — **never an email arg**; the activation invite is fired to `detail.email` (read from the record, never supplied). Transitions valid **only from `pending_verification`**; note/reason must be non-empty; reject is a **soft** flip (record retained, never deleted).
- **Restore-admin:** store-scoped; fails unless `typedStoreNameConfirm === store.name`; success mutates exactly one `(user, store)` roster row to `role='admin', active`; loud audit row on both paths.
- **Recovery = trigger only** (no password ever set/read); **resend = existing invite only** (never a new address).

## Boundary-trap guard (Run-001)
- `session.ts` (imports `next/headers` via `createClient`) is **server-only** and is **not** re-exported from the client-importable services barrel.
- Removed a `import 'server-only'` guard I initially added: the `server-only` package is **not installed / not a Next dep** (`node_modules/server-only` absent) — it would have broken `npm run build` the moment a Server Component imported `session.ts`. The module is server-only by construction anyway (next/headers). No dependency added (out of scope).

## Scope honored
- Signatures FROZEN — no interface shape changed from Sub-Phase 1.
- No real Supabase **domain** CRUD (mock is the sole swap point); auth is the only real piece.
- Mock **dataset** deliberately deferred: `store.ts` is an empty seam so services compile + their logic is wired. Actions currently return "not found"/failed against empty collections by design — Sub-Phase 3 (Mocks §5) seeds the data that makes them succeed.

## Note for Sub-Phase 3 (Mocks)
`store.ts` exposes the exact shape to fill: `owners`, `ownerDetailsById`, `stores`, `storeDetailsById`, `membersByStoreId`, `registrations`, `registrationDetailsById`, `audit`, `platformStats`, `growth`. Seed per DATA_CONTRACT §5 (all states) so every service returns live data.

🛑 STOP — awaiting approval before Sub-Phase 3 (Mocks).
