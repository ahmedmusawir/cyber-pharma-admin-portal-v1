# 04 — MOCKS (Sub-Phase 3)

> Author `/mocks` — deletable in one commit. Must exercise EVERY UI state (DATA_CONTRACT §5).

## Coverage required
- **Owners (≥6):** one multi-store (5+), one single-store, one with a past-due store, one with a suspended store.
- **Restore-admin target:** ≥1 store where the owner has no active `admin` membership (locked-out).
- **Members:** all three `AccountStatus` on one store (active, suspended, invite_pending).
- **Stores:** all three `StoreHealth` (active, past_due, suspended); a `318 total` style count.
- **Pending registrations:** each `type` (new, converter) across statuses; converters carry `desktopUsername` + `linkedBusiness`.
- **Audit:** an entry for every `AuditAction` incl. approved/rejected_registration.
- **Dashboard:** `PlatformStats` consistent with the mock; `getGrowth(6)` ascending.

Gate: every pill, badge, and empty-state has at least one mock that triggers it.
