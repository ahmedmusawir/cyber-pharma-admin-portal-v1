# RECON REPORT — Cyber Pharma Super Admin Portal — Phase 1

> **Skill:** stark-recon v1.1 (full 6-phase run) · **Date:** 2026-06-28 · **Mode:** read-only ground-truth
> **Repo:** `cyber-pharma-admin-portal-v1` (branch: `phase-1`) · **Verified against:** STARTER_KIT_HANDBOOK_v1.0.md
> **Doctrine:** Disk wins. Every finding labeled EVIDENCE / INFERENCE / CLAIM / GAP / QUESTION.
> Repo left byte-for-byte unchanged. No source edits, no git. The only write is this file.

---

## ⚡ HEADLINE (read this first)

The kit builds **clean** (Next 16.2.6 / Turbopack, `tsc` passes, 23 routes, 81-test baseline per handbook). But the handbook has **drifted in exactly the Run-001 ways it warned about** — and a fresh batch:

1. **`src/utils/app-role.ts` does NOT exist** (handbook §8 claims it does). `AppRole` lives in `get-user-role.ts`, which is server-only. **The exact L1/L5 lie, reproduced.**
2. **`src/components/common/AppShellPage.tsx` does NOT exist** (handbook §4 calls it the "NEW" primitive with heavy JSDoc). The layout decision tree points at a missing file.
3. **`useAuthStore` has NO derived role flags** (`isAdmin/isSuperadmin/isMember`) — handbook §1/§2 and the auth decision tree promise them. Store also types `user: any`. **L6 reproduced.**
4. **`ThemeToggle` is actually `ThemeToggler.tsx`** — name drift in §4/§11.
5. **GHL `hooktest` fossil is LIVE** (`/api/ghl/hooktest` surfaces in the build) — clone-debt from a QR project, same fossil class as Run 001.
6. **A full posts + jsonsrv demo cascade** rides along; the `jsonsrv` half is fully orphaned (no route reaches it).

---

## Section 0 — Day-0 Ground-Truth Sweep (highest-value drift)

### S0.1 — Handbook-named files: exist vs MISSING

| Handbook claim | On disk? | Label |
|---|---|---|
| `src/services/authService.ts` (says: must NOT exist) | **absent** | ✅ EVIDENCE — correct; kit auth consumed directly |
| `src/utils/app-role.ts` (§8: "exports AppRole — universal") | **MISSING** | 🔴 EVIDENCE — handbook lie (L1/L5 reproduced) |
| `src/components/common/AppShellPage.tsx` (§4: "NEW primitive") | **MISSING** | 🔴 EVIDENCE — handbook lie |
| `src/components/global/ThemeToggle.tsx` (§4/§11) | **MISSING** (is `ThemeToggler.tsx`) | 🟠 EVIDENCE — name drift |
| `get-user-role.ts`, `useAuthStore.ts`, `proxy.ts`, all `supabase/*`, all `auth/*`, `Page/Row/Box/Container/Main/PaginationControls`, all sidebars, `LoginForm/RegisterForm/AuthTabs` | present | ✅ EVIDENCE |

### S0.2 — Handbook-claimed shapes vs disk

- **`useAuthStore` shape — EVIDENCE** (`src/store/useAuthStore.ts:5-12`): exposes `{ user, role, isAuthenticated, isLoading, login, logout }`. **No `isAdmin / isSuperadmin / isMember` derived flags.** Handbook §1 ("derived role flags"), §2 decision tree, and the §1 Auth Decision Tree (`useAuthStore() derived flags (isAdmin, isSuperadmin, isMember)`) are **FALSE against disk.** Client role checks must read `s.role === "admin"`, not `s.isAdmin` (which returns `undefined`).
- **`user: any` — EVIDENCE** (`useAuthStore.ts:6`). Handbook §8 says "TypeScript: strict mode, no `any`." Reproduces Run-001 L6.
- **`AppRole` location — EVIDENCE** (`get-user-role.ts:4`): the enum is co-located with `getUserRole()`, which imports `./supabase/server` (server-only). Handbook §8 "Files Already Properly Separated" claims `app-role.ts` holds the universal enum. **Not separated.**

### S0.3 — Forbidden-zone greps (kit baseline)

- **`: any` / `as any` — EVIDENCE:** product-code hits (excluding tests): `useAuthStore.ts:6` (`user: any`), `server.ts:6` (`cookieStore as any`), `command.tsx:35` (`children as any`), `postServices.ts:53,70` & `jsonsrvPostServices.ts:73,90` (demo `data: any`), `(admin)/admin-booking/InsertForm.tsx:58` & `(members)/booking/InsertForm.tsx:58` (`catch (error: any)`). Test files use `as any` liberally (acceptable in mocks).
- **`dangerouslySetInnerHTML` — EVIDENCE: none** in `src/`. ✅
- **`user_metadata` role-read smell — EVIDENCE: none forbidden.** All product hits are **writes** to `user_metadata` on `auth.admin.createUser/updateUser` (`(superadmin|admin)-portal/actions.ts`) — intentional per handbook Gotcha 4 (trigger reads `full_name`/`role`). `ProfileForm.tsx:25` only reads `full_name` for display. Role authorization is read from the `user_roles` table via `getUserRole()`, **not** from metadata. ✅ INFERENCE — no privilege smell.

### S0.4 — Doc-named routes verified by `find`

- `/api/ghl/hooktest` — **EVIDENCE: present and LIVE** (`src/app/api/ghl/hooktest/route.ts`, surfaces in build route table). Cross-project fossil.
- Auth routes under `api/auth/` (not `api/superadmin/`) — EVIDENCE confirmed.

### S0.5 — Test runner

- **EVIDENCE:** `package.json → "test": "jest"`; `jest@^30`, `ts-jest`, `jest-environment-jsdom`, `@playwright/test` (e2e). Handbook §7 correctly says **Jest** — no Vitest drift this run. ✅

### S0.6 — Env names (from code, not docs)

- **EVIDENCE** (`grep process.env src/`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL`.
- Uses **Q4-2025 naming** (`publishable`/`secret`), not legacy `anon`/`service_role`. ✅
- **GAP:** **No `.env.example` / `.env.local.example` committed.** Only a real (gitignored) `.env.local` exists. An author has no committed template — env var names must come from this report / code grep.

### S0.7 — Build route table (ground truth, 23 routes)

```
○ /              ƒ /admin-booking          ƒ /admin-portal/add-member
ƒ /admin-portal  ƒ /admin-portal/edit/[id] ƒ /api/auth/{confirm,login,logout,signup,superadmin-add-user}
ƒ /api/ghl/hooktest   ○ /auth   ƒ /booking   ○ /demo   ○ /error
ƒ /members-portal   ƒ /members-portal/profile   ƒ /profile
ƒ /superadmin-portal  ƒ /superadmin-portal/add-user  ƒ /superadmin-portal/edit/[id]
○ /template   ƒ /users
```
Build: **EVIDENCE — `✓ Compiled successfully`, TypeScript clean, 23/23 static pages generated.** Proxy (Middleware) active. Routes NOT in handbook baseline: `/admin-booking`, `/booking`, `/users`, `/api/ghl/hooktest`, `/error`, `/template`.

---

## Section 1 — Stack Versions

- **Next.js:** `^16.2.1` declared; **16.2.6 actually installed/built** (EVIDENCE: build banner). Handbook says 16.2.1. Minor drift.
- **React:** `^19.2.4` (matches handbook).
- **Tailwind:** `^3.4.1` → **token mechanic = HSL + `tailwind.config` + `:root` CSS vars** (NOT `@theme`/OKLCH). `darkMode: ["class"]` (EVIDENCE: `tailwind.config:4`).
- **TypeScript:** `^5` (strict per handbook claim — but see `any` smells above).
- **Node:** **not pinned** (GAP — no `.nvmrc`, no `engines`).
- **Notable heavyweights:** `stripe@^22.1.0` (present but no Stripe code found — latent), `@supabase/ssr@^0.6.1`, `zustand@^4.5.4`, `next-themes@^0.4.6`, `sass@^1.77.6`, `react-hook-form`+`zod`, `cmdk@^1.1.1`. **`lucide-react@^1.16.0`** — unusual major (lucide normally 0.x); flag for verification at install.

---

## Section 2 — Kit Structure vs Handbook

**Verified present:** all `supabase/*` clients (+ extra `fetchUserData.ts`), `actions.ts` (`protectPage`), `get-user-role.ts`, `proxy.ts` (no root `middleware.ts` — correct for Next 16), all common primitives except `AppShellPage`.

**DRIFT FOUND:**
- `app-role.ts` — MISSING (see S0.1).
- `AppShellPage.tsx` — MISSING (see S0.1).
- `ThemeToggle.tsx` → actually `ThemeToggler.tsx` (EVIDENCE: `src/components/global/ThemeToggler.tsx`).
- Extra utils dir `src/utils/supabase/fetchUserData.ts` (not in handbook).
- Extra `src/components/auth/Logout.tsx` (not listed).

**`src/services/` contents — EVIDENCE:** `postServices.ts`, `jsonsrvPostServices.ts` — **both are demo/scaffolding** (see §8). **No project-domain services exist yet.**

**Route groups — EVIDENCE:** `(public) (auth) (superadmin) (admin) (members)` all present. Plus non-grouped `src/app/{template,error,providers}`.

---

## Section 3 — Auth Pattern

- **User read via — EVIDENCE:** Server → `protectPage([AppRole.X])` (`supabase/actions.ts:7`) / `supabase.auth.getUser()`. Client → `useAuthStore` (`s.user`, `s.role`).
- **Role resolved via — EVIDENCE:** `getUserRole(userId)` queries `user_roles` table (`get-user-role.ts:17`) — DB is source of truth. Client gets `role` from the login API response, stored in `useAuthStore`.
- **Existing auth service:** **none** (correct — kit auth consumed directly; do NOT author `authService.ts`).
- **`user_metadata` role smell:** **none forbidden** (writes-for-trigger only; see S0.3).
- **Boundary risk (INFERENCE):** `AppRole` sits in a server-only module, but **no `"use client"` file value-imports it** (grep found 0 value-imports; `useAuthStore` uses `import type`). The kit gets away with the missing `app-role.ts` separation *today* — but any future client component that value-imports `AppRole` (for a `<select>` of roles, etc.) will bundle `next/headers` and **break `next build`**. This is a landmine, not a current fire.

---

## Section 4 — Design Reality

- **Tokens live in — EVIDENCE:** `src/app/globals.scss` (**Sass**, 875 B) — `:root` HSL vars + `@apply`. Only Sass-specific syntax is one `//` comment (line 37). **L14 risk:** if a designer ships `globals.css`, this is a `.scss→.css` conversion task (trivial here — strip the `//`).
- **Hardcoded numbered colors — EVIDENCE:** **198 occurrences** across `src/components` + `src/app` (`slate-/zinc-/gray-/red-6/green-6/purple-6/...`). Large token-reconciliation scope.
- **Dark mode — EVIDENCE:** class-based (`darkMode: ["class"]`).
- **Font — EVIDENCE:** `Inter` via `next/font/google` (`layout.tsx:2`; also in orphan `layout-org.tsx`).
- **Theme toggle — EVIDENCE:** present as `ThemeToggler.tsx`; `ThemeProvider` at `src/app/providers/ThemeProvider.tsx`; wired into Navbar/NavbarHome/NavbarSuperadmin/NavbarLoginReg.
- **Role color standard:** only **3** `purple-600/400` sites — standard lightly applied (INFERENCE: role-colored UI not yet built out).

---

## Section 5 — Database

- **Schema delivery — EVIDENCE:** **No `supabase/migrations/` dir.** Schema lives in `supabase/setup.sql` (identical copy at `docs/setup.sql`) + `docs/migration_add_profiles.sql`. Single-file setup, not migration-sequenced.
- **Enum — EVIDENCE:** `CREATE TYPE public.app_role AS ENUM ('superadmin','admin','member')` (`setup.sql:15`). (DB enum exists, though TS reads `role` as text.)
- **Tables — EVIDENCE:** `public.user_roles` (`:24`) + `public.profiles` (`:50`) — the two-table pattern, both RLS-enabled (`:32`, `:57`).
- **RLS — EVIDENCE:** per-user read/update policies on both (`:35`, `:60`, `:67`).
- **Trigger/function — EVIDENCE:** `handle_new_user()` (`:87`) — the Mark IV trigger. Matches handbook §2.
- **Drift:** duplicated SQL (`supabase/setup.sql` == `docs/setup.sql`) — QUESTION which is canonical.

---

## Section 6 — Skills / Security / Env

- **Skills — EVIDENCE:** **No `.claude/skills/` at repo root.** Skills resolve from **`agent_docs/.claude/skills/`** (`frontend-design`, `skill-creator`, `stark-frontend-first`, `webapp-testing`) + the staged `_SKILLS/` payload. **Launch-CWD nuance:** the `stark-frontend-first` skill only activates when Claude Code is launched such that `agent_docs/.claude/skills` is in scope. Document the launch CWD in RECOVERY.md.
- **Security — EVIDENCE:** `npm audit` → **18 moderate** vulnerabilities. No `agent_docs/security/` audit artifacts. (A `stark-repo-security-v1.1` skill payload is staged in `_SKILLS/` but not yet run.)
- **Required env vars:** see S0.6 (5 vars; **no committed example file** — GAP).
- **Launch CWD — EVIDENCE:** `pwd = /home/moose/nextjs/cyber-pharma-admin-portal-v1`.
- **Pointer files — EVIDENCE:** root `CLAUDE.md` (the 20 KB Factory doctrine) + `README.md`. No root `AGENTS.md`/`GEMINI.md` (those live in the FFM payload at `_SKILLS/super_admin_portal_phase1_ffm/`).

---

## Section 8 — Demo / Tutorial Scaffolding (the cascade trap)

Two demo cascades inherited. **Disk-verified consumer trace:**

**A) `posts` cascade (PARTIALLY WIRED — backs live demo routes):**
- service `src/services/postServices.ts` · store `src/store/usePostStore.ts` · types `src/types/posts.ts` · components `src/components/posts/{PostsTable,PostPagination,PostDeleteModal}.tsx`
- **Consumed by LIVE routes:** `/users` (`(admin)/users/UserPageContent.tsx`), `/admin-booking` & `/booking` `InsertForm.tsx`. So deletion is **coupled** to removing those demo routes — not a clean lift-out.

**B) `jsonsrv` cascade (FULLY ORPHANED — safe delete):**
- service `src/services/jsonsrvPostServices.ts` (→ `https://jsonplaceholder.typicode.com/posts`) · store `src/store/useJsonsrvPostStore.ts` · components `src/components/jsonsrv/{PostsTable,PostPagination,PostDeleteModal}.tsx` · util `src/utils/jsonSrv/jsonsrvUtils.ts`
- **EVIDENCE — zero route consumers:** `components/jsonsrv` is imported by nothing; `useJsonsrvPostStore` only by its own `PostsTable`. **No build route reaches it.** Dead weight — clean deletion bucket.

**C) `booking`/events scaffolding:** `/admin-booking`, `/booking`, `components/admin/AdminBookingList.tsx`, `components/members/MemberEventList.tsx`, two `InsertForm.tsx` (the `error: any` sites). Demo feature, not product.

**D) Third-party demo API — EVIDENCE:** `jsonplaceholder.typicode.com` (`jsonsrvPostServices.ts:2`).

**E) Cross-project residue — EVIDENCE:** `/api/ghl/hooktest` (GoHighLevel fossil — live in build). Same clone-debt class as Run 001's QR fossil.

**Recommended deletion bucket:** scope a "demo-cascade + fossil purge" task into the FFM Components sub-phase. **Order:** (1) jsonsrv cascade — clean; (2) ghl/hooktest — clean; (3) `route-1.ts`, `layout-org.tsx`, `template/`, `error/` if unused — clean; (4) posts cascade + `/users` + booking — coupled, decide product intent first (QUESTION).

---

## Section 9 — FFM Packaging & Compile Scope

- **tsconfig excludes `agent_docs/**`? — 🔴 NO (FLAG).** EVIDENCE: `tsconfig.json` `"exclude": ["node_modules"]` only. The FFM payload ships **3 `.template.ts` files** (`agent_docs/.claude/skills/stark-frontend-first/templates/{service,types,mock-data}.template.ts`). With only `node_modules` excluded, these can enter `tsc` scope and throw phantom errors — the exact Run-001 S9 trap. **Mitigation:** add `agent_docs/**` (and `_SKILLS/**`) to tsconfig `exclude`, OR rename stubs `.ts.txt`. *(Note: today's `tsc` passed — but `tsconfig` `include` likely narrows to `src`; confirm before trusting.)*
- **Test runner excludes agent_docs? — ✅ YES.** EVIDENCE: `jest.config.js` `roots: ['<rootDir>/src']` — jest only scopes `src/`.
- **`.ts/.tsx` under agent_docs — EVIDENCE:** the 3 `.template.ts` files above.

---

## Section 10 — Surprises (the gold)

1. **🔴 `app-role.ts` missing + `AppShellPage.tsx` missing + `useAuthStore` flags missing** — three handbook primitives the docs treat as real. Authoring against §1/§4/§8 verbatim would write code against three non-existent surfaces.
2. **GHL `hooktest` fossil is a LIVE build route** — not just a dead file; it ships.
3. **`src/app/layout-org.tsx`** — orphan backup of `layout.tsx` (duplicate `Inter`/font wiring). Confusing twin; deletion candidate.
4. **`src/app/api/auth/logout/route-1.ts`** — orphan duplicate beside `route.ts`; doesn't surface in build. Dead.
5. **`src/components/dashboard/DashboardCard.tsx` — ZERO consumers** (EVIDENCE: grep). Orphan — QUESTION: delete, or keep as Phase-2 starter? (Same orphan class as the Phase-2 example's `SuperadminSidebar`.)
6. **`command.tsx` (with `as any`) is NOT an orphan here** — consumed by all three sidebars (`CommandInput`). Disk wins over the Phase-2 example's "unimported command.tsx" note.
7. **`stripe@^22.1.0` dependency with no Stripe code** — latent/unused dep. QUESTION: intended for a later phase, or clone-debt?
8. **`/template` and `/error` are real static routes** — leftover scaffolding surfaces in the build.
9. **Package name is `cyph-mission-control-v1`** (not `cyber-pharma-*`) — matches the FFM target `super_admin_portal_phase1_ffm` / Mission Control design brief. Naming is intentional, just worth noting.
10. **`cn()` helper — EVIDENCE: present & standard** (`src/lib/utils.ts` — `twMerge(clsx(...))`). ✅
11. **Duplicated schema** (`supabase/setup.sql` == `docs/setup.sql`) — pick one canonical.

---

## Recommendation to Architect

### ✅ Verified facts the FFM can write against (no re-verify)
- Next 16.2.x (App Router) · React 19.2.4 · **Tailwind 3.4 → HSL/config tokens, `darkMode: class`** · Jest (not Vitest) · `cn()` standard.
- Auth: consume kit directly — `protectPage([AppRole.X])` server-side, `useAuthStore` client-side. **No `authService.ts`.** Role from `user_roles` via `getUserRole()`.
- DB two-table pattern (`profiles` + `user_roles`) + `handle_new_user()` trigger + per-user RLS — present, matches handbook §2/§3.
- Env naming = `publishable`/`secret` (Q4-2025).
- Route groups `(public)(auth)(superadmin)(admin)(members)` exist; build is green.

### 🔴 Doctrine drift to surface (handbook v1.0 → v1.1 corrections)
1. §8 — **delete the `app-role.ts` claim** OR create the file (split `AppRole` out of `get-user-role.ts`). Until then, **client code value-importing `AppRole` will break the build.**
2. §1/§2 — **`useAuthStore` has no `isAdmin/isSuperadmin/isMember`.** Either add the derived flags (kit-reconciliation task) or rewrite the handbook decision tree to `s.role === "..."`. **Do not author FFM client code reading `s.isAdmin`.**
3. §4 — **`AppShellPage` does not exist.** Either build it or strike it from the layout decision tree before any FFM references it.
4. §4/§11 — rename references `ThemeToggle` → **`ThemeToggler`**.
5. §8 — `user: any` in `useAuthStore` contradicts "strict, no any" → reconciliation task (type as the project `User`).

### 🧹 Cleanup candidates (scope into FFM Components sub-phase)
- **Clean deletes:** jsonsrv cascade (service+store+components+util), `/api/ghl/hooktest`, `logout/route-1.ts`, `layout-org.tsx`, `DashboardCard.tsx` (if truly unused), `template/`, `error/` (if unused).
- **Coupled (decide product intent first):** posts cascade + `/users` + `/admin-booking` + `/booking` + booking components.
- **Packaging:** add `agent_docs/**` + `_SKILLS/**` to `tsconfig` `exclude` (or rename `.template.ts` → `.ts.txt`).
- **Hygiene:** commit a `.env.example`; pin Node (`.nvmrc`); resolve duplicated `setup.sql`; `npm audit` (18 moderate); verify `lucide-react@^1.16.0` major.

### ❓ Open questions for the Operator
1. Is the **posts/booking demo** to be deleted, or repurposed as the Super Admin Portal's data scaffolding?
2. Keep `stripe` dep (future phase) or remove as clone-debt?
3. Canonical SQL: `supabase/setup.sql` or `docs/setup.sql`?
4. `DashboardCard.tsx` — delete orphan, or retain as a Phase-1 card pattern?

---

*stark-recon v1.1 · 6 phases · read-only · repo unchanged · 2026-06-28*
