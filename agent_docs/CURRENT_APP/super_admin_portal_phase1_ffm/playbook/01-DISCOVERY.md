# 01 — DISCOVERY (Sub-Phase 0)

> Read, don't write. Produce a structured summary, then STOP.

## Steps
1. Read the FFM reading order in root `CLAUDE.md` (all of `_project/`).
2. Run/confirm a current **stark-recon** report on the kit's actual state. Treat the starter-kit handbook as *claims*, verified against recon.
3. Inventory what the kit ALREADY provides — auth (SSR, 3 clients), RBAC (`protectPage`), RLS, `user_roles`, working superadmin/admin user-CRUD. **These are consume-directly, not rebuild.**
4. Map the 9 screens (UI_SPEC §1) and the 7 services (DATA_CONTRACT §4) to what's new vs inherited.
5. Produce the **Discovery Summary**: kit inventory, the build delta, the KIPs (DataTable, EmptyState), open risks, and the proposed Sub-Phase 1 plan. STOP.

## Watch for
- The auth-wrapper trap: do NOT wrap kit auth in a new service. `SuperAdminUser` comes from real Supabase.
- Greenfield: designs in `_design/` are the visual truth — confirm they're present.
