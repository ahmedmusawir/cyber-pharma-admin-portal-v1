# FIX PHASE 2 RECON — Kit-Surface Consumer Trace (Kill-List Report)

- **Date:** 2026-07-10 13:16
- **Mode:** stark-recon (read-only, targeted consumer trace — NOT a general recon). Repo byte-for-byte unchanged. No git.
- **Method:** full import-edge extraction over `src/` (`grep -rn "from ["']"`, 649 edges — includes multi-line imports; see Surprise S-8), per-surface reverse-dependency lists, href/redirect map, package-usage map, per-suite test counts.
- **Labels:** per stark-recon EVIDENCE_DISCIPLINE (EVIDENCE / INFERENCE / CLAIM / GAP / QUESTION).
- **Verdict codes:** **DELETE** = zero MissionControl consumers · **KEEP** = MC consumes it · **COUPLED** = shared, needs surgery (exact seam named).

---

## 0. Headline

- **102 files enumerated for the kill list** (all cascades verified consumer-by-consumer). MC survives on a 15-file `ui/` set + 9 kit-infra files.
- **proxy.ts contains ZERO redirects** — the feared retarget problem lives in exactly ONE KEEP-surface line: `LoginPageContent.tsx:113` ("Forgot password?" → `/auth`). Everything else pointing at dead routes dies with the dead routes.
- **Drift vs task expectation:** `useAuthStore` is NOT in the MC dependency manifest — MC calls `/api/auth/login|logout` via fetch directly. useAuthStore's only consumers are kit `LoginForm`/`Logout` → **DELETE**.
- **Stripe is orphaned NOW** (zero imports; one comment mention). So are `@playwright/test` (no config, no e2e dir) and `dotenv` (zero refs).
- **Predicted post-cleanup test baseline: 2 suites / 8 tests** (from 11/81).

---

## 1. Classification — task-listed surfaces

### 1.1 (auth) group — **DELETE (whole cascade)**

| File | Consumers | Verdict |
|---|---|---|
| `src/app/(auth)/auth/page.tsx` (route `/auth`) | route only; inbound links all from DELETE surfaces + 1 KEEP seam (§4) | DELETE |
| `src/app/(auth)/layout.tsx` | wraps `/auth`; imports NavbarLoginReg | DELETE |
| `src/components/auth/AuthTabs.tsx` | only `(auth)/auth/page.tsx:3` | DELETE |
| `src/components/auth/LoginForm.tsx` (kit) | only `AuthTabs.tsx:5` | DELETE |
| `src/components/auth/RegisterForm.tsx` | only `AuthTabs.tsx:6` | DELETE |
| `src/components/auth/Logout.tsx` | **ZERO consumers — already orphan** (EVIDENCE: no import site in 649 edges) | DELETE |

→ `src/components/auth/` dies whole. `ui/tabs` dies with AuthTabs (§1.9).

### 1.2 api/auth — folder surgery (**COUPLED at the folder level**)

| Route | Consumers | Verdict |
|---|---|---|
| `api/auth/login` | MC `LoginPageContent.tsx:28`, kit `useAuthStore.ts:22` | **KEEP — verified** |
| `api/auth/logout` | MC `Shell.tsx:90`, MC `LoginPageContent.tsx:50`, kit `useAuthStore.ts:49` | **KEEP — verified** |
| `api/auth/confirm` | zero in-code callers — consumed EXTERNALLY by Supabase email-confirmation links (INFERENCE from route purpose; standard PKCE/OTP callback). Phase-2 recovery/invite emails will need it. | **KEEP — verified (external consumer)** |
| `api/auth/signup` | only kit `RegisterForm.tsx:70` | **DELETE** |
| `api/auth/superadmin-add-user` | only its own test. Kit AddUserForm uses the server action `addUser` (`AddUserForm.tsx:28`), NOT this route | **DELETE** (Surprise S-5) |

### 1.3 (admin) / (members) / (superadmin) groups — **DELETE (all, zero MC consumers)**

All three layouts gate via `protectPage([AppRole.X])` → `redirect("/auth")` (`utils/supabase/actions.ts:14,19`) and render kit `Navbar` + a sidebar. MC's layout explicitly does not use any of it (EVIDENCE: `(mission-control)/layout.tsx` JSDoc: "Chosen over protectPage() because protectPage hardcodes a /auth redirect").

- **(admin), 18 files:** `layout.tsx`, `not-found.tsx`, `admin-booking/{page,InsertForm}`, `admin-portal/{page,loading,AdminPortalPageContent,actions,DeleteUserButton}`, `admin-portal/add-member/{page,AddMemberForm}`, `admin-portal/edit/[id]/{page,EditUserForm}`, `profile/{page,ProfileForm}`, `users/{page,loading,UserPageContent}` — DELETE.
- **(members), 8 files:** `layout.tsx`, `not-found.tsx`, `booking/{page,InsertForm}`, `members-portal/{page,loading}`, `members-portal/profile/{page,ProfileForm}` — DELETE.
- **(superadmin), 11 files:** `layout.tsx`, `not-found.tsx`, `superadmin-portal/{page,loading,SuperadminPortalPageContent,actions,DeleteUserButton}`, `add-user/{page,AddUserForm}`, `edit/[id]/{page,EditUserForm}` — DELETE.
- Note: `SuperadminSidebar` IS consumed by `(superadmin)/layout.tsx` (the 2026-06-08 recon example's "orphan" claim is stale — CLAIM corrected); it dies with the layout regardless.

### 1.4 Remaining kit routes — **DELETE**

| Surface | Evidence | Verdict |
|---|---|---|
| `(public)/HomePageContent.tsx` | ZERO importers ( `(public)/page.tsx` was deleted in FIX PHASE 1; `/` now 307s at app root: `src/app/page.tsx:12`) — **unreachable, confirmed** | DELETE |
| `(public)/demo/{page,DemoPageContent}` | route reachable at `/demo` but zero inbound links; imports kit Page/Row/Box/button only | DELETE |
| `(public)/layout.tsx`, `(public)/loading.tsx` | wrap only demo + dead home; import NavbarHome, Main, Spinner | DELETE |
| `/template` (`page` + `TemplatePageContent`) | zero inbound links; kit scaffold | DELETE |
| `/error/page.tsx` | 3-line stub, zero inbound refs (`grep '"/error'` → none) | DELETE |
| `/profile`(admin) `/users` `/admin-booking` `/booking` | counted in group cascades above | DELETE |

### 1.5 Posts cascade — **DELETE (entire chain)**

Chain (EVIDENCE, all import sites verified): `UserPageContent` → `PostsTable`/`PostPagination` → `PostDeleteModal`, `usePostStore` → `postServices`; `types/posts` ← InsertForm×2, PostsTable, usePostStore; `utils/common/commonUtils.ts` ← PostsTable only.

Files: `services/postServices.ts`, `store/usePostStore.ts`, `types/posts.ts`, `components/posts/{PostsTable,PostPagination,PostDeleteModal}.tsx`, `utils/common/commonUtils.ts` — all DELETE.
- `postServices.ts:1` targets `${NEXT_PUBLIC_API_BASE_URL}/api/posts` — an EXTERNAL api; **no `/api/posts` route exists in this repo** (GAP). Env var `NEXT_PUBLIC_API_BASE_URL` becomes orphan (Surprise S-7).

### 1.6 Booking components — **DELETE (both already orphans)**

- `components/admin/AdminBookingList.tsx` — ZERO consumers (admin-booking/page uses its local `InsertForm`).
- `components/members/MemberEventList.tsx` — ZERO consumers (booking/page uses its local `InsertForm`). Sole importer of `@heroicons/react`.
- The two route-local `InsertForm.tsx` files die with their groups (§1.3).

### 1.7 Navbars — **MC consumes NONE**

| File | Consumers | Verdict |
|---|---|---|
| `global/Navbar.tsx` | (admin)/(members)/(superadmin) layouts | DELETE (dies with layouts) |
| `global/NavbarHome.tsx` | (public)/layout only | DELETE |
| `global/NavbarSuperadmin.tsx` | **ZERO — already orphan** | DELETE |
| `global/NavbarLoginReg.tsx` | (auth)/layout only | DELETE |
| `global/ThemeToggler.tsx` | **MC `Shell.tsx`** | **KEEP** — COUPLED seam: delete the 4 Navbar files individually, keep `ThemeToggler.tsx` in place |

### 1.8 Standing orphans — reconfirmed

- `components/dashboard/DashboardCard.tsx` — ZERO consumers (EVIDENCE, corrected import map) → DELETE.
- `HomePageContent.tsx` — confirmed unreachable (§1.4).
- Additional already-orphans found: `Logout.tsx`, `NavbarSuperadmin.tsx`, `AdminBookingList.tsx`, `MemberEventList.tsx`, `components/common/Container.tsx`, `utils/supabase/fetchUserData.ts`, `src/styles/global.scss` (§6).

### 1.9 Shared component folders — surgery lines

**`components/ui/` — KEEP 15** (MC/root-layout consumers, EVIDENCE per-file):
`alert-dialog`, `breadcrumb`, `button`, `dialog` (MC StoreDetail direct), `dropdown-menu` (via ThemeToggler), `input`, `label`, `separator`, `sheet`, `skeleton`, `table` (via MC DataTable), `textarea`, `toast`+`use-toast`+`toaster` (chain: root `layout.tsx` → toaster → use-toast → toast; MC detail pages call use-toast).

**`components/ui/` — DELETE 8** (kit-only consumers, all of which die):
`avatar` (Navbars), `badge` (PostsTable), `card` (kit forms/portals/DashboardCard/LoginForm — NO MC consumer), `command` (kit sidebars), `form` (kit RHF forms), `pagination` (PostPagination), `select` (superadmin forms), `tabs` (AuthTabs).

**`components/common/` — KEEP 1 / DELETE 8:**
KEEP `SpinnerLarge.tsx` (MC Shell + MC loading.tsx). DELETE: `BackButton`, `Box`, `Container` (orphan now), `Main`, `Page`, `PaginationControls`, `Row`, `Spinner` (consumers: kit LoginForm + (public)/loading + (admin)/users/loading — all DELETE targets).

**`components/layout/`** — all 3 sidebars DELETE (die with kit layouts).

### 1.10 Stores & utils

| File | Consumers | Verdict |
|---|---|---|
| `store/useAuthStore.ts` | kit `LoginForm`, kit `Logout` ONLY. **NOT consumed by MC** — MC login/logout hit the api routes via fetch (`LoginPageContent.tsx:28,50`, `Shell.tsx:90`) | **DELETE** ⚠️ drift vs task's expected-KEEP manifest |
| `store/usePostStore.ts` | posts cascade only | DELETE |
| `utils/supabase/actions.ts` (`protectPage`) | 3 kit layouts + its test. Hardcodes `redirect("/auth")` | DELETE |
| `utils/supabase/client.ts` | ProfileForm×2 + Navbar×3 — all DELETE targets; zero MC consumers (MC has no browser-side Supabase) | DELETE — QUESTION Q1 |
| `utils/supabase/admin.ts` | kit portal `actions.ts`×2 + 3 tests; zero MC consumers | DELETE — QUESTION Q2 |
| `utils/supabase/fetchUserData.ts` | ZERO — standing orphan | DELETE |
| `utils/supabase/server.ts` | MC `session.ts`, api/auth routes, `get-user-role.ts` | **KEEP** |
| `utils/supabase/middleware.ts` | `proxy.ts` + its test | **KEEP** |
| `utils/get-user-role.ts` | MC `session.ts:` (role==='superadmin' canonical check), kit layouts (dying), useAuthStore (dying), 2 KEEP tests | **KEEP** |
| `lib/utils.ts` (`cn`) | all MC components + entire ui/ | **KEEP** |
| `src/styles/global.scss` | ZERO importers (live stylesheet is `src/app/globals.scss` ← `app/layout.tsx:3`) | DELETE (orphan duplicate) |

---

## 2. SPECIFIC HUNT 1 — proxy.ts redirect targets

**proxy.ts has ZERO redirect targets.** EVIDENCE: `src/proxy.ts:4-6` — sole body is `return await updateSession(request)`; `src/utils/supabase/middleware.ts:36` comment: "Refresh the session but don't redirect - let layouts handle auth". Nothing to retarget in the proxy layer. ✅

**App-wide inventory of references INTO soon-dead routes** (the real retarget list):

| Source | Target | Source status | Action |
|---|---|---|---|
| `src/app/login/LoginPageContent.tsx:113` — "Forgot password?" `<a href="/auth">` | `/auth` | **KEEP (MC surface!)** | **RETARGET/REMOVE BEFORE deleting (auth)** — the only live seam |
| `utils/supabase/actions.ts:14,19` | `/auth` | DELETE target | dies together |
| `(admin)/profile/page.tsx:11`, `(members)/members-portal/profile/page.tsx:11` | `/auth` | DELETE targets | die together |
| `components/auth/Logout.tsx:14`, `Navbar.tsx:125`, `NavbarHome.tsx:128` | `/auth` | DELETE targets | die together |
| `NavbarHome.tsx:91-93` → portals, `Sidebar/AdminSidebar/SuperadminSidebar` → portal routes, `HomePageContent` → `/booking`×6, `UserPageContent:35` → `/posts/insert` (already-dead route) | various | DELETE targets | die together |

No KEEP surface other than `LoginPageContent.tsx:113` references any DELETE route (EVIDENCE: full href/redirect map; MC Shell targets `/dashboard /owners /stores /onboarding /audit-log /login` only; root+group `not-found.tsx` link `/` → 307 `/dashboard`).

---

## 3. SPECIFIC HUNT 2 — MC dependency manifest (kit-born KEEP list, file by file)

**Infra / auth:**
1. `src/proxy.ts` — session refresh on every request
2. `src/utils/supabase/middleware.ts` — updateSession impl
3. `src/app/api/auth/login/route.ts` — MC login
4. `src/app/api/auth/logout/route.ts` — MC sign-out (Shell + login-page bounce)
5. `src/app/api/auth/confirm/route.ts` — external Supabase email-link callback
6. `src/utils/supabase/server.ts` — server client factory
7. `src/utils/get-user-role.ts` — role resolver behind `getSuperAdminUser()`
8. `src/lib/utils.ts` — `cn()`
9. `src/app/providers/ThemeProvider.tsx` — root layout (next-themes)

**Components:**
10. `src/components/common/SpinnerLarge.tsx` — MC loading.tsx + Shell pending
11. `src/components/global/ThemeToggler.tsx` — Shell top bar
12-26. `src/components/ui/`: `alert-dialog`, `breadcrumb`, `button`, `dialog`, `dropdown-menu`, `input`, `label`, `separator`, `sheet`, `skeleton`, `table`, `textarea`, `toast`, `toaster`, `use-toast` (15 files)

**Root-level (kit-born, MC-rebuilt/owned):** `src/app/layout.tsx`, `src/app/globals.scss`, `src/app/not-found.tsx`, `src/app/page.tsx` (MC-authored), plus configs (`tailwind.config.ts`, `jest.config.js`, `tsconfig.json`, `next.config`).

Everything kit-born NOT on this list has zero MC consumers.

---

## 4. SPECIFIC HUNT 3 — test map & predicted baseline

Current verified baseline: 11 suites / 81 tests (counts below sum to 81 ✓).

| Suite | Tests | Covers | Fate |
|---|---|---|---|
| `__tests__/get-user-role.test.ts` | 6 | `utils/get-user-role` (KEEP) | **KEEP** |
| `__tests__/proxy.test.ts` | 2 | `proxy` + `supabase/middleware` (KEEP) | **KEEP** |
| `__tests__/actions.test.ts` | 7 | `protectPage` (DELETE) | dies |
| `__tests__/superadmin-add-user.test.ts` | 5 | orphan api route (DELETE) | dies |
| `__tests__/admin/actions.test.ts` | 10 | (admin) actions (DELETE) | dies |
| `__tests__/admin/AddMemberForm.test.tsx` | 7 | (admin) form (DELETE) | dies |
| `__tests__/member/ProfileForm.test.tsx` | 10 | (members) profile (DELETE) | dies |
| `__tests__/superadmin/actions.test.ts` | 12 | (superadmin) actions (DELETE) | dies |
| `__tests__/superadmin/AddUserForm.test.tsx` | 6 | (superadmin) form (DELETE) | dies |
| `__tests__/superadmin/EditUserForm.test.tsx` | 9 | (superadmin) form (DELETE) | dies |
| `__tests__/superadmin/SuperadminPortalPageContent.test.tsx` | 7 | (superadmin) page (DELETE) | dies |

**PREDICTED POST-CLEANUP BASELINE: 2 suites / 8 tests** (get-user-role 6 + proxy 2). 9 suites / 73 tests deleted with their targets. `jest.setup.ts` stays. GAP: MC's own screens have no unit suites (verification was live-gate based) — post-cleanup npm test will be green but thin; noted for the ledger, not this pass.

---

## 5. SPECIFIC HUNT 4 — latent dependency orphans (for the dep-hygiene pass)

**Orphaned ALREADY (before any cleanup):**
- `stripe` ^22.1.0 — ZERO imports anywhere; only textual mention is a comment `types/mission-control/status.ts:21` (EVIDENCE: `grep -riE stripe src` → 1 comment)
- `@playwright/test` — no `playwright.config.*`, no e2e dir on disk; `test:e2e*` scripts are dead pointers (GAP)
- `dotenv` (dev) — zero references in repo code/config

**Become orphaned when kill-list lands:**
- `zustand` — both stores die — QUESTION Q3 (CLAUDE.md names Zustand as the state standard; Phase 2 may re-consume)
- `react-hook-form`, `@hookform/resolvers`, `zod` — consumers are exclusively kit forms + `ui/form` (all DELETE). Phase-2 real forms will likely want them back (INFERENCE)
- `@heroicons/react` — sole importer MemberEventList (already-orphan) — effectively dead now
- `cmdk` (ui/command), `@radix-ui/react-tabs` (ui/tabs), `@radix-ui/react-avatar` (ui/avatar), `@radix-ui/react-select` (ui/select)

**Confirmed KEEP deps:** `@supabase/ssr`, `@supabase/supabase-js`, `@radix-ui/react-dialog` (alert-dialog/dialog/sheet), `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-slot`, `@radix-ui/react-toast`, `lucide-react`, `next-themes`, `sass`, `clsx`, `tailwind-merge`, `class-variance-authority`, `tailwindcss-animate` + `@tailwindcss/typography` + `@tailwindcss/aspect-ratio` + `@shrutibalasa/tailwind-grid-auto-fit` (all four wired in `tailwind.config.ts:91-95`).

**Env orphan:** `NEXT_PUBLIC_API_BASE_URL` (postServices only).

---

## 6. Surprises (the gold)

- **S-1** `useAuthStore` is kit-only — NOT an MC dependency (task's expected-KEEP manifest is wrong on this one). MC auth is fetch → api routes + server-side `session.ts`.
- **S-2** `proxy.ts` does no routing at all — pure session refresh; "layouts handle auth" by design.
- **S-3** `stripe`, `@playwright/test`, `dotenv` are orphaned TODAY — dep-hygiene can act without waiting for the kill-list.
- **S-4** `src/styles/global.scss` is a zero-consumer duplicate of the live `src/app/globals.scss` — orphan stylesheet.
- **S-5** `api/auth/superadmin-add-user` has zero app callers — kit AddUserForm uses the `addUser` server action instead. Route + its 5 tests die cleanly.
- **S-6** Already-orphan set is bigger than the standing ledger: `Logout`, `NavbarSuperadmin`, `AdminBookingList`, `MemberEventList`, `Container`, `fetchUserData`, plus DashboardCard (known).
- **S-7** `postServices` points at an EXTERNAL `${NEXT_PUBLIC_API_BASE_URL}/api/posts` — no such route in this repo; the posts feature was never wired to this app's backend (clone-debt fossil).
- **S-8** Recon-skill lesson: single-line `^import.*from` grep MISSES multi-line imports (`} from "..."`) — first pass falsely orphaned `ui/breadcrumb`/`ui/alert-dialog` (MC-critical files!). Corrected with a bare `from "..."` pattern. → trickle-up to stark-recon PLAYBOOK.

## 7. Open QUESTIONS for the cleanup plan

- **Q1** `utils/supabase/client.ts` (browser client): zero MC consumers → DELETE per rules, but it's 20 lines of Phase-2-likely infra. Delete now and re-add later, or keep as blessed infra?
- **Q2** `utils/supabase/admin.ts` (service-role client): same shape — Phase-2 user management will need one. Delete or keep?
- **Q3** `zustand` dep: goes to zero consumers post-cleanup. Drop at dep-hygiene, or keep (CLAUDE.md standard) for Phase 2?

## 8. Sequencing constraints for the cleanup plan (NOT executed this task)

1. **Retarget `LoginPageContent.tsx:113` FIRST** (remove or point at a stub) — before `(auth)` deletion, else a live KEEP page links a 404.
2. Delete cascades whole (group + its exclusive components + its tests in one stroke) to keep `tsc`/build green at every step.
3. Do NOT touch: the 15-file ui/ KEEP set, `ThemeToggler` (inside a dying folder), `SpinnerLarge` (inside `common/` where 8 siblings die), root `not-found.tsx`, toast chain.
4. Post-cleanup gates: `tsc` clean · build green (route table should shrink to: `/` redirect, `/login`, 8 MC screens, `api/auth/{login,logout,confirm}`, root not-found) · `npm test` = **2 suites / 8 tests** · live walk of the 9 MC screens.

---

*Read-only recon complete. Repo unchanged. No git operations. Cleanup plan is a separate approved task.*
