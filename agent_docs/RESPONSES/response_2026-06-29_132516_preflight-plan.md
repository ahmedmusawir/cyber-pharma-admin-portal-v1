# Phase 1 Pre-Flight Hygiene — Plan & Investigation

> Mirror of the on-screen plan. Status: **PENDING_APPROVAL** — not yet executed.
> Generated: 2026-06-29 13:25:16

## 📋 STEP 1 — Read-Only Investigation Results

### 1.1 — Phantom names in the FFM payload
Searched `_SKILLS/super_admin_portal_phase1_ffm/` + `agent_docs/.claude/skills/`:

| Name | Hits | Verdict |
|---|---|---|
| `AppShellPage` | **0** | ✅ FFM does not reference the missing primitive |
| `app-role` | **0** | ✅ FFM does not reference the missing file |
| `isSuperadmin` (kit spelling) | **0** | ✅ clean |
| `isMember` | **0** | ✅ clean |
| `isAdmin` | 1 — `stark-frontend-first/references/ANTI_PATTERNS.md:9` | ⚠️ It's a **negative example** (`user.user_metadata?.is_super_admin` — the wrong way). Not a real reference. Harmless. |
| `isSuperAdmin` (note capital **A**) | 2 — `_project/DATA_CONTRACT.md:72,77` | ⚠️ **Naming nuance, not a phantom.** The FFM defines its **own** session invariant field `isSuperAdmin`; this is a *different name* from the kit store's missing `isSuperadmin` flag. Flagging for the Architect: if the FFM intends to *read* this off `useAuthStore`, it'll break (store has no such field). Out of scope this pass — noting only. |

**Bottom line:** our FFM docs do **not** depend on the missing `AppShellPage`/`app-role` primitives. Good.

### 1.2 — tsconfig include/exclude
- `"exclude": ["node_modules"]` — only node_modules.
- `"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"]`
- **Does `include` narrow to `src/`? → NO.** The `**/*.ts` glob is resolved relative to the tsconfig location (repo root), **not** `baseUrl: "src"`. So `agent_docs/**` and `_SKILLS/**` (incl. the 3 `.template.ts` stubs) are nominally **in compile scope**. The build passes today only because those stubs happen to be valid TS — it's a latent landmine. **Step 2B is justified.**

### 1.3 — Consumer re-verification (delete targets)
The **jsonsrv cascade is a closed island** — every internal edge points only inward, zero external importers:

| Target | External consumers | Safe? |
|---|---|---|
| `services/jsonsrvPostServices.ts` | only `useJsonsrvPostStore.ts` (in-cascade) | ✅ |
| `store/useJsonsrvPostStore.ts` | only `components/jsonsrv/PostsTable.tsx` (in-cascade) | ✅ |
| `components/jsonsrv/*` (3 files) | **none outside the dir** | ✅ |
| `utils/jsonSrv/jsonsrvUtils.ts` | only `components/jsonsrv/PostsTable.tsx` (in-cascade) | ✅ |
| `api/ghl/hooktest/route.ts` | **0** | ✅ |
| `api/auth/logout/route-1.ts` | **0** | ✅ |
| `layout-org.tsx` | **0** | ✅ |

Note: `components/jsonsrv/PostsTable.tsx` imports the shared `@/types/posts` and `@/components/ui/*` — those are **kept** (out of scope); deleting jsonsrv just removes a consumer of them. No orphaning. **All 7 targets confirmed zero-consumer.**

### 2C — Schema dedup
- `supabase/setup.sql` vs `docs/setup.sql` → **BYTE-IDENTICAL** (`cmp` clean; sha256 `1cb236b5…` both; 4660 B each).
- No code/doc references the `docs/setup.sql` path.
- `docs/migration_add_profiles.sql` is a **different** file (4596 B) — out of scope, untouched.

## 📋 PLAN — Phase 1 Pre-Flight Hygiene (awaiting approval)

**A. Clean-delete (7 zero-consumer items + 1 empty dir):**
- `src/services/jsonsrvPostServices.ts`
- `src/store/useJsonsrvPostStore.ts`
- `src/components/jsonsrv/PostsTable.tsx`, `PostPagination.tsx`, `PostDeleteModal.tsx` → then remove the now-empty `src/components/jsonsrv/`
- `src/utils/jsonSrv/jsonsrvUtils.ts` → then remove the now-empty `src/utils/jsonSrv/`
- `src/app/api/ghl/hooktest/route.ts` → then remove now-empty `src/app/api/ghl/hooktest/` and `src/app/api/ghl/`
- `src/app/api/auth/logout/route-1.ts` (leaves `route.ts` intact)
- `src/app/layout-org.tsx`

**B. tsconfig packaging:** add `"agent_docs/**"` and `"_SKILLS/**"` to `tsconfig.json` `"exclude"` (alongside `node_modules`).

**C. Schema dedup:** delete `docs/setup.sql` (identical dup); keep `supabase/setup.sql` canonical. Leave `docs/migration_add_profiles.sql` untouched.

**FILES I WILL NOT TOUCH:** `src/store/*` (except the jsonsrv store deletion above), `get-user-role.ts`, `auth/*`, `DashboardCard.tsx`, posts cascade, `/users`, `/admin-booking`, `/booking`, booking components, `package.json`/deps, `docs/migration_add_profiles.sql`, `types/posts.ts`, `components/ui/*`.

**ASSUMPTIONS:**
1. Removing emptied parent dirs (`jsonsrv/`, `jsonSrv/`, `api/ghl/`) is desired (no empty husks left behind). Say so if you'd rather I leave empty dirs.
2. `docs/setup.sql` carries no separate history value beyond `supabase/setup.sql` (the byte-identical canonical).

**RISKS:** Minimal — all deletes are zero-consumer and the build was green pre-change. The `/api/ghl/hooktest` and `/template`-class routes will drop from the route table (expected). `tsconfig` exclude change is additive/defensive.

**POST-APPROVAL:** execute → `npm run build` → `npm test` → report both before closing the gate.

🛑 Stopping — awaiting approval.
