# FFM Sub-Phase 0 — DISCOVERY (MissionControl / cyph-mission-control-v1)

> Mode: PLAN (read + plan only). Status: **PENDING_APPROVAL** — no types/services/mocks/components written; build NOT run.
> Generated: 2026-07-01 14:54:25 · Source of truth read: root CLAUDE.md → _project/{CLAUDE,APP_BRIEF,DATA_CONTRACT,UI_SPEC,COMPONENT_MANIFEST} → playbook/{00,01} → verification/PHASE_GATES.

## STEP 0 — Skill visibility ✅
- `stark-frontend-first` resolves from `agent_docs/.claude/skills/stark-frontend-first/` (CLAUDE.md + SKILL.md + references/templates/workflow). FFM packet is under `agent_docs/`, so the skill's dir-scope applies. **Can see + resolve — proceeding.**
- Recon prerequisite (01-DISCOVERY step 2) already satisfied: `agent_docs/RECON/RECON_cyber-pharma_phase1_2026-06-28.md` + pre-flight hygiene + green build/tests (81/81).

---

## STEP 1 — DISCOVERY FINDINGS

### A. The 3 nouns + owner-as-derived
| Noun | Backing | Meaning |
|---|---|---|
| **Business (store)** | `businesses` | the real pharmacy; carries a subscription |
| **User** | Supabase `auth.users` + `user_roles` | one auth identity |
| **UserBusiness (junction)** | `user_businesses (user_id, business_id, role)` | `role ∈ {'admin','user'}` — **no `'owner'` value** |

- **Owner = derived projection**, NOT a table/row: a user holding `role='admin'` on ≥1 store. `storeCount` = distinct `business_id` where `(user_id=U, role='admin')`. Member = `role='user'`. Primary store = `is_primary=true`.
- **Super-admin is orthogonal** — a platform flag, `business_id IS NULL`. Do NOT invent an `owners` table. Co-owners allowed (a store may appear under multiple admin-users).

### B. The 9 routes + nav
| # | Route | Screen | Pattern |
|---|---|---|---|
| 1 | `/login` | Login | standalone card, **no shell**; REAL Supabase auth |
| 2 | `/dashboard` | Dashboard | 4 KPI tiles + bar chart + owners **preview** (not the directory) |
| 3 | `/owners` | Owners directory (**canonical**) | app shell + card grid |
| 4 | `/owners/[ownerId]` | Owner detail | breadcrumb + owner band + store-card grid |
| 5 | `/stores` | Stores directory | store-card grid |
| 6 | `/stores/[storeId]` | Store detail | breadcrumb **lock** + header + roster + safe actions |
| 7 | `/onboarding` | Onboarding queue | DataTable + status/type filters |
| 8 | `/onboarding/[registrationId]` | Onboarding detail | read-only identity block + note/reason inputs |
| 9 | `/audit-log` | Audit log | read-only, append-only table |

- **Sidebar nav = 5 items:** Dashboard · Onboarding · Owners · Stores · Audit log (+ super-admin identity at foot). Sidebar 248px; active = coral tint + 3px inset accent. `/stores/[storeId]` is the single store-detail route reached from **both** front doors.

### C. The 7 services (all mock-backed in Phase 1; signatures frozen = sole swap point)
1. **MissionDashboardService** — `getPlatformStats`, `getGrowth(months)`, `getOwnersPreview(limit)`
2. **OwnerDirectoryService** — `listOwners({search?})`, `getOwner(id)`
3. **StoreDirectoryService** — `listStores({search?})`, `getStore(id)`
4. **StoreMemberService** — `listMembers(storeId)`
5. **SupportActionService** — `suspendUser`, `unsuspendUser`, `sendPasswordRecovery`, `resendInvite`, `restoreAdmin({userId,storeId,typedStoreNameConfirm})`
6. **PendingRegistrationService** — `listPending({status?,type?,search?})`, `getPending(id)`, `approve({id,verificationNote})`, `reject({id,reason})` — acts ONLY on existing records; never takes an email arg
7. **AuditLogService** — `listEntries({search?})`, `append(...)` (internal; every GREEN action writes a row)

### D. The RED list — must NOT render, even disabled (APP_BRIEF §6 · UI_SPEC §4 · gate G5)
1. No member creation / invite-to-a-new-address
2. No password set/read field (recovery-trigger only)
3. No email entry/edit **anywhere**, incl. onboarding (on-record email is display-only)
4. No delete-human (suspend / soft-reject only)
5. No billing / subscription / checkout / payment surface (sub status = read-only pill)
6. No PHI / claims / OwedBook / "$ recovered"
7. No grant-super-admin UI (console-only)
8. No impersonation / "log in as" / force-sync / suspend-whole-pharmacy
9. (Build-discipline) No auth mocking; no real domain CRUD; no API routes / migrations / SQL beyond kit defaults; no re-authoring kit auth/RBAC/RLS/user-CRUD
> One-line test: *acts on a record that already exists, without holding a credential, touching money, or showing PHI?* If no → forbidden. A disabled forbidden control still counts as present → fail.

### E. Kit inventory — CONSUME, do not rebuild (from recon, disk-verified)
- Auth: Supabase SSR — `utils/supabase/{server,client,middleware,admin}.ts`; `protectPage([AppRole.X])` (`utils/supabase/actions.ts`); `getUserRole()` (`utils/get-user-role.ts`); login/logout/signup/confirm API routes; `useAuthStore` (`store/useAuthStore.ts`).
- RBAC/DB: `user_roles` + `profiles` tables, RLS, `handle_new_user()` trigger (`supabase/setup.sql`).
- UI primitives present: Avatar, Badge, Button, Card, Command, Dialog, DropdownMenu, Form, Input, Label, Pagination, Select, Table, Tabs, **Textarea**, Toast/Toaster; layout primitives Page/Row/Box/Container/Main; `ThemeToggler` + `ThemeProvider`; `cn()`.

### F. Build delta — NEW work
- **/types**: enums + view-models (Owner/Store/Member/PendingRegistration/Dashboard/Audit) + `SuperAdminUser` + the 7 service interfaces.
- **/services**: 7 mock-backed implementations of the frozen interfaces.
- **/mocks**: dataset covering every renderable state (DATA_CONTRACT §5).
- **KIPs**: **DataTable** (audit log + onboarding queue) and **EmptyState** (directories + onboarding). MultiSelect deferred.
- **Custom app shell** (sidebar 248px + 5-nav + content) — a custom layout composed from existing primitives (NOT `AppShellPage`, which does not exist on disk).
- **9 screens** (page.tsx thin wrapper + co-located `<Screen>PageContent.tsx`).
- **shadcn primitives to add** (absent from kit `ui/`): **Breadcrumb, Skeleton, Separator, AlertDialog** (via `npx shadcn add` — kit-sanctioned). Textarea already exists (consume it; manifest labels it "new").

---

## STEP 2 — CAPTURED GUARDRAILS (binding)
- **Handbook DRIFT — code against DISK:** `app-role.ts` (AppRole is in `get-user-role.ts`), `AppShellPage`, and `useAuthStore` derived flags `isAdmin/isSuperadmin/isMember` **DO NOT EXIST**. Client role checks read `s.role === "…"`, never `s.isAdmin`. Use only Page/Row/Box/Container/Main for layout primitives.
- **NAMING NUANCE:** the FFM's own `isSuperAdmin` (capital A, DATA_CONTRACT §2 `SuperAdminUser`) is NOT the kit store flag. It is **server-resolved** (auth.getUser() + user_roles) — do NOT wire it to `useAuthStore`. ✅ Reviewed: the FFM never reads it from the store; the only client role signal is `useAuthStore.role`.
- **Auth REAL, domain MOCKED:** login + super-admin gate run against real Supabase; every domain read/write goes through a typed service over mock data — the sole later swap point. No real Supabase domain CRUD.
- **Extend, don't rebuild** kit auth/RBAC/RLS/user-CRUD.

### ⚠️ Drift to surface BEFORE Types (needs an operator nod — does not block Discovery)
**`is_super_admin` column mismatch.** DATA_CONTRACT §2 + APP_BRIEF §8 assume `user_roles.is_super_admin` (boolean). The kit's actual `user_roles` (recon, `supabase/setup.sql`) has **`role` (app_role enum: `superadmin`/`admin`/`member`)** — there is **no `is_super_admin` column**. Since auth is REAL and kit-provided, the login gate must use the kit's real mechanism: `protectPage([AppRole.SUPERADMIN])` / `getUserRole() === 'superadmin'`. Recommendation: derive `SuperAdminUser.isSuperAdmin` server-side as `(kitRole === 'superadmin')`; treat the DATA_CONTRACT's `is_super_admin` as the *concept*, the kit's `role==='superadmin'` as the *implementation*. Flagging per conflict rule (do not silently resolve).

### Reconciliation flags carried from DATA_CONTRACT §6 (mock-flavor, non-blocking)
- `Member.jobTitle` unbacked in Frank schema → keep optional/graceful-empty (mock flavor).
- Owner `name` has no clean source → derive from primary store `contact_person`, fall back to email local-part.
- `StoreSummary.state` present in schema but off the card → keep optional (future filter).

---

## STEP 3 — PROPOSED BUILD PLAN (sub-phase by sub-phase; STOP after each gate)

| # | Sub-phase | What I author | Exit gate |
|---|---|---|---|
| **1** | **Types** (`/types`) | Status enums (§1), view-models for all 9 screens (§3), `SuperAdminUser`, the 7 service interfaces (§4). No logic. | `npx tsc` clean; types match DATA_CONTRACT 1:1 |
| **2** | **Services** (`/services`) | 7 interfaces implemented as mock-backed stubs; import types from `/types`, data from `/mocks`; each write path calls `AuditLogService.append`; approve/reject + restore-admin invariants enforced in the mock. | 7 service interfaces stubbed; signatures frozen |
| **3** | **Mocks** (`/mocks`) | Dataset per DATA_CONTRACT §5: ≥6 owners (multi/single/past_due/suspended), a locked-out restore-admin target, members across all 3 AccountStatus, stores across all 3 StoreHealth (+ a "318 total" style count), pending regs of each type across statuses (converters carry desktopUsername+linkedBusiness), audit rows for every AuditAction, consistent dashboard stats. | mock set exercises every renderable state |
| **4** | **Components** (`/components` + `/app`) | shadcn adds (Breadcrumb/Skeleton/Separator/AlertDialog); KIP-2 EmptyState + KIP-1 DataTable; custom shell (sidebar+5-nav); then screens in dep order Login → Owners(canonical) → Stores → Owner detail → Store detail → Dashboard → Audit log → Onboarding queue → Onboarding detail. Real auth gate wired via `protectPage`/`getUserRole`. | 9 screens render on mock; KIPs reused; both doors reach `/stores/[storeId]` |
| **5** | **Verification** | Walk gates G1–G12 (build clean, real auth gate, all routes, GREEN actions, RED absent, onboarding constraint, dashboard, audit, breadcrumb lock, theming light/dark, 375px mobile, KIP reuse). | all hard gates green |
| **6** | **Retrospective** | Honest lessons → `playbook/RETROSPECTIVES/`. | lessons written |

**Immediate next step on approval:** Sub-Phase 1 (Types) only — author `/types`, run `tsc`, STOP for approval before Services.

**Two operator decisions worth settling before/at Types:**
1. The `is_super_admin` vs `role==='superadmin'` reconciliation above (I recommend the kit-real mechanism).
2. Recon's still-open product-intent questions (posts cascade / stripe dep / DashboardCard) — none block Types, but the posts cascade + `/users` route overlap the new work eventually.

🛑 STOP — awaiting approval before Sub-Phase 1 (Types).
