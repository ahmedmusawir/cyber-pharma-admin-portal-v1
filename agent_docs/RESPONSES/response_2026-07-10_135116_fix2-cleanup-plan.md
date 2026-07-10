# FIX PHASE 2 CLEANUP — Execution Plan (PENDING_APPROVAL)

- **Date:** 2026-07-10 13:51
- **Input:** recon kill-list `response_2026-07-10_131658_fix2-recon.md` + operator rulings (2026-07-10).
- **Rulings applied:** LoginPageContent "Forgot password?" link → REMOVED outright (step one). `utils/supabase/client.ts` + `admin.ts` → KEEP (blessed Phase-2 infra). Deps/package.json → UNTOUCHED (dep-hygiene task owns them). `useAuthStore` → DELETE confirmed.
- **Scope:** file deletions + two one-line surgeries. No git. No dep changes.

## Corrected kill-list count

Recon's "102" recounts to **101** on enumeration (its §1.10 bucket lists 10 files, not 11). Minus `client.ts` + `admin.ts` (rulings) = **99 files** (98 if F-1 rules to keep `/error`).

## 🚩 FLAG F-1 — needs ruling at approval (found in plan-mode research)

`api/auth/confirm/route.ts:31` (KEEP route) redirects to **`/error`** when an email-confirm link fails — and `error/page.tsx` is on the kill list. Options:
- **(a) RECOMMENDED:** one-line retarget — failure redirect `/error` → `/login`. `/login` is the natural landing for a failed super-admin link; kill list stays intact. Same surgery class as the approved LoginPageContent edit.
- (b) Keep `error/page.tsx` (3-line stub) — kill list drops to 98, route table gains `/error`.
- (c) Delete `/error` and leave the dangling redirect → failed links land on root not-found (404). Not recommended (silent ugliness).

## PLAN — steps and gates

**STEP 0 — Pre-flight baseline (read-only):** `tsc --noEmit` + `npm test` to pin the starting state (expect clean / 81-81). Any pre-existing red stops the task before deletions.

**STEP 1 — Surgery (before any deletion):**
- `src/app/login/LoginPageContent.tsx` — remove the `<a href="/auth">Forgot password?</a>` block (lines ~113-115); container `justify-between` → `justify-end` so the "No PHI in this console" badge keeps its right-hand position.
- `src/app/api/auth/confirm/route.ts` — per F-1 ruling (option a: `redirectTo.pathname = "/error"` → `"/login"`).

**STEP 2 — Delete route-group cascades + their tests (routes are import leaves — nothing else imports pages/layouts):**
- `src/app/(auth)/` — 2 files
- `src/app/(admin)/` — 18 files
- `src/app/(members)/` — 8 files
- `src/app/(superadmin)/` — 11 files
- `src/app/(public)/` — 5 files (incl. HomePageContent — unreachable, confirmed)
- `src/app/template/` — 2 files · `src/app/error/` — 1 file (per F-1) · `src/app/api/auth/signup/` — 1 · `src/app/api/auth/superadmin-add-user/` — 1
- Tests dying with targets: `src/__tests__/actions.test.ts`, `superadmin-add-user.test.ts`, `admin/` (2), `member/` (1), `superadmin/` (5) — 9 files
- **Gate:** `tsc` clean · `npm test` = 2 suites / 8 tests (early check of the final predicate)

**STEP 3 — Delete now-orphaned components / services / stores / types / utils / styles (consumers all died in step 2):**
- `src/components/auth/` — AuthTabs, LoginForm, RegisterForm, Logout (4)
- `src/components/admin/` (1) · `src/components/members/` (1) · `src/components/dashboard/` (1) · `src/components/layout/` (3) · `src/components/posts/` (3)
- `src/components/global/` — Navbar, NavbarHome, NavbarSuperadmin, NavbarLoginReg (4) — **ThemeToggler.tsx stays**
- `src/components/common/` — BackButton, Box, Container, Main, Page, PaginationControls, Row, Spinner (8) — **SpinnerLarge.tsx stays**
- `src/components/ui/` — avatar, badge, card, command, form, pagination, select, tabs (8) — **15-file KEEP set untouched**
- `src/services/postServices.ts` · `src/store/useAuthStore.ts` · `src/store/usePostStore.ts` · `src/types/posts.ts` · `src/utils/common/commonUtils.ts` · `src/utils/supabase/actions.ts` · `src/utils/supabase/fetchUserData.ts` · `src/styles/global.scss` (8)
- Remove emptied dirs: `components/{auth,admin,members,dashboard,layout,posts}`, `store/`, `styles/`, `utils/common/`, `__tests__/{admin,member,superadmin}`
- **Gate:** `tsc` clean

**STEP 4 — Full gates:** `tsc` · `npm run build` — expected route table: `/` (ƒ redirect), `/login`, 8 MC screens (dashboard, owners, owners/[ownerId], stores, stores/[storeId], onboarding, onboarding/[registrationId], audit-log), `api/auth/{login,logout,confirm}`, `/_not-found` (+ `/error` only if F-1(b)) · `npm test` = **2 suites / 8 tests exactly**.

**STEP 5 — Live walk:** `next build` + `next start` on a local port, then cookie-authenticated walk: anonymous `/` → 307 `/dashboard` → 307 `/login` (login renders, NO forgot-password link) · POST `api/auth/login` (test credential) → super-admin cookie · walk all 9 MC screens authed (200 + content markers) · `api/auth/logout` → anonymous again. Visual/browser pass offered to operator after.

**STEP 6 — Report:** result artifact → `agent_docs/RESPONSES/response_<date>_<HHMMSS>_fix2-cleanup-result.md`, session file COMPLETE entry, RECOVERY.md refresh, commit-point reminder (working tree will hold ~99 deletions + prior uncommitted paths — operator's git call).

## FILES I WILL NOT TOUCH
- The §3 KEEP manifest: 15 `ui/` files, `ThemeToggler`, `SpinnerLarge`, `proxy.ts`, `utils/supabase/{server,middleware}.ts`, `utils/get-user-role.ts`, `lib/utils.ts`, `api/auth/{login,logout,confirm}` (confirm: F-1 one-liner only), toast chain, root `layout/page/not-found/globals.scss/icon.png`, ThemeProvider.
- Per rulings: `utils/supabase/client.ts`, `utils/supabase/admin.ts`, `package.json` + lockfile, all deps.
- All MC surfaces (app/(mission-control), components/mission-control, services/mission-control, mocks, types/mission-control), `jest.setup.ts`, configs, `types/tailwind-merge.d.ts`.

## ASSUMPTIONS
1. Kill list = recon enumeration minus the two KEEP rulings; no re-trace (recon is 3 hours old, tree untouched since except operator git-side moves outside src/).
2. Live walk is curl-based with real Supabase auth (no browser tooling in this session); operator does the visual pass if desired.
3. Whole-directory deletion is used where every file in the dir is on the kill list.

## RISKS
- A consumer grep missed (dynamic import / string route ref) → caught by tsc/build gates; each cascade gated.
- Test count drift (a suite containing skipped/todo tests) → gate is exact-count 2/8; any deviation stops and reports.
- `/error` seam (F-1) — resolved at approval.

**Status:** Awaiting approval.
