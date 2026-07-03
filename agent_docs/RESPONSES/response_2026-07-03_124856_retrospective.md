# RUN 002 — MissionControl (Super Admin Portal) Phase 1 · Lessons

> Factory FFM run #2 (after Cyberize Run 001). Frontend-first: **auth real, domain mocked.**
> Outcome: 9 screens, 7 typed mock services, real Supabase super-admin gate, **12/12 verification
> gates PASS live** (real browser, real auth). One defect found+fixed in verification.
> Honest lessons below — not a victory lap. The next FFM inherits these.

---

## 1. What the kit gave for free vs. what was real work

**Free (consumed, not rebuilt):** Supabase SSR auth (3 clients + admin), `protectPage`,
`getUserRole` + `AppRole`, `user_roles`/`profiles` + RLS + `handle_new_user` trigger,
login/logout API routes, `useAuthStore`, most shadcn primitives, `Page/Row/Box/...`, `cn()`,
`ThemeToggler`/`ThemeProvider`.

**Real work:** the entire domain (types → 7 mock services → mock dataset), the app shell, all 9
screens, 4 missing primitives (Breadcrumb/Skeleton/Separator/AlertDialog), 2 KIPs
(DataTable/EmptyState), **the token layer itself** (see §3c), and the real-auth super-admin session
resolver bridging the kit's role enum to the FFM's `SuperAdminUser` (see §3b).

The APP_BRIEF's "the starter kit is already half-built" held — but "half" was optimistic once the
handbook drift (§3) is counted.

---

## 2. Drift lessons (the meat — recon earned its keep)

### 3a. Phantom primitives — the handbook described three things that don't exist on disk
- `src/utils/app-role.ts` — **MISSING**; `AppRole` actually lives in `get-user-role.ts` (a
  server-only module). Handbook §8 "Files Already Properly Separated" is false.
- `src/components/common/AppShellPage.tsx` — **MISSING**; handbook §4 calls it the "NEW" primitive.
- `useAuthStore` derived flags `isAdmin/isSuperadmin/isMember` — **do not exist**; the store exposes
  `{ user, role, isAuthenticated, isLoading, login, logout }` and types `user: any`. Handbook §1/§2
  and the auth decision tree promise flags that return `undefined`.

**How recon caught it:** the Day-0 sweep (verify every handbook-named file + cat the store) surfaced
all three on day one — before a single FFM line was authored against them. Had we trusted the
handbook, client code would read `s.isAdmin` (undefined) and any value-import of `AppRole` into a
client component would bundle `next/headers` and **break `next build`**.

**Consequence honored:** all client role logic reads `s.role === "..."`; `AppRole` is only ever
`import type`; `session.ts` (which does import the server module) is kept OUT of the client-imported
services barrel. Zero boundary breaks.

→ **Promote:** correct kit handbook v1.0 → v1.1 (strike or build the three claims).

### 3b. `is_super_admin` — a column that isn't; concept vs kit-real implementation
DATA_CONTRACT §2 + APP_BRIEF §8 describe `user_roles.is_super_admin` (boolean). The kit's
`user_roles` (per recon / `supabase/setup.sql`) has **`role` (enum: superadmin/admin/member)** — no
such column. Ruling (operator-confirmed): **`is_super_admin` is the CONCEPT; `role === 'superadmin'`
via `getUserRole()` is the IMPLEMENTATION.** `SuperAdminUser.isSuperAdmin: true` is a proof-carrying
invariant — the resolver returns the object only when the derived check passes, else `null`. No code
references a non-existent column. **Verified live:** real login returns `role:"superadmin"`, gate
admits to `/dashboard`, anon → `/login`.

→ **Promote:** kit handbook should state the canonical super-admin check explicitly
(`getUserRole() === 'superadmin'`), so every future FFM stops re-deriving it and no one authors a
phantom `is_super_admin` column.

### 3c. The token layer was "delivered" in docs but ABSENT on disk
`tailwind.config.ts` mapped `hsl(var(--…))` and `var(--radius)`, but `globals.scss` had **no
`:root`/`.dark` block** — every semantic token was undefined. COMPONENT_MANIFEST §4 lists tokens as
"delivered (step 1)"; disk disagreed. Recovered by installing the token block from the **delivered
design ground truth** (`_design/.../style_tile.html` — Metro Warm Mist/Slate, Coral `12 93% 64%`,
semantic-four, `--radius:0`, Saira). Without this, no component could be token-driven and G10 would
fail.

→ **Promote:** (a) recon mission should verify the **`:root` token block exists on disk**, not just
that a globals file exists (Section 4 currently asks *where tokens live*, not *whether they're
defined*). (b) The starter kit should **ship the token block in `globals`** so clones aren't born
token-less.

---

## 3. Infra / tooling lessons

### jest-mock / jsdom version skew — clones are born with a broken test suite
Fresh `npm test` had **5 suites failing to initialize** (`clearMocksOnScope is not a function`). Root
cause: `jest-environment-jsdom@30.3.0` bundled a stale `jest-mock@30.3.0` lacking a method
`jest-runtime@30.4.2` calls (the `.tsx`/jsdom suites hit it; `.ts`/node suites didn't). First fix
attempt (`jest-mock@^30.4.2`) failed — **that version was never published** (ETARGET); I re-diagnosed
and pinned `jest-mock: 30.4.1` (override) + bumped `jest-environment-jsdom` to `^30.4.1`. → 81/81.

→ **Promote (high value):** pin these in the **starter kit** `package.json` so every clone starts
green. A broken baseline test suite on clone is a silent tax on every future run.
**Meta-lesson:** on `ETARGET`, re-diagnose against the registry — don't assume "bump up."

### Deferrals (ledgered, not silently dropped)
- **CSS bar chart vs recharts:** recharts is NOT installed; built a dependency-free token-driven CSS
  chart instead of adding a package. Ledger: *evaluate recharts vs CSS chart at the real-data phase.*
- **`server-only` guard:** added `import 'server-only'` to `session.ts`, then found the package
  isn't installed / not a Next dep — it would have broken `build` the moment a Server Component
  imported it. Removed it (the module is server-only by construction via `next/headers`). Ledger:
  *add `server-only` at the next dep-hygiene pass.*
- **shadcn `add` offline:** the 4 missing primitives were hand-authored dependency-free (AlertDialog
  built on the installed `@radix-ui/react-dialog`) rather than `npx shadcn add` (no network / no new
  Radix deps). Same API surface.

### Playwright browser install was flaky in the sandbox
Unsupported-OS fallback builds + lock contention meant `npx playwright install chromium` never
reliably produced a binary. **Fix:** drove the **system Google Chrome** (`/usr/bin/google-chrome-stable`)
via `chromium.launch({ executablePath })`. Lesson for verification infra: check for a system browser
first; don't burn cycles on the bundled download.

---

## 4. Process lessons

### Real-screen verification caught what build/tsc/tests could not
`tsc` clean, `build` green, 81/81 tests — and the **dashboard growth chart still rendered blank**
(a flex `items-end` collapsed the percentage-height bars). Only the screenshot pass caught it. This
is Run-001's L16/L17 restated with teeth: **a visual real-screen pass is non-optional; static gates
are necessary, not sufficient.** Fixed (`items-end` → stretch), re-shot, confirmed.

### RED-list held because it was baked into the TYPE and SERVICE layers (the gold)
There was **no RED-list near-miss** — not because of vigilance at the UI, but because forbidden
capability was made **structurally impossible upstream**: no `create*` shape in `/types`, no
create/delete/billing method in the 7 service interfaces, `AuditAction` closed to the 7 GREEN
actions, and onboarding `approve/reject` signatures that **cannot take an email argument**. By the
time the UI is authored, a forbidden control has nothing to bind to. **The load-bearing category was
the onboarding email** — trivially easy to add as an input; kept display-only by design and
verified live (`inputCount: 0, textareaCount: 1`).
→ **Promote:** "encode the RED list in types + service signatures, not just UI review" belongs in
`stark-frontend-first` doctrine.

### The empty-seam mock kept Services scope honest
In Sub-Phase 2 (Services) the mock store was seeded EMPTY (typed collections only) so services
compiled and their logic was exercised, while the actual dataset waited for Sub-Phase 3 (Mocks).
Clean separation; no scope bleed. Worth keeping as a pattern.

### My own error: the "Supabase unreachable" false alarm
I declared Supabase unreachable and marked 5 gates BLOCKED — **wrong.** My reachability test grabbed
all three `NEXT_PUBLIC_SUPABASE_URL` lines from `.env.local` (two commented-out) → malformed URL →
`HTTP 000`. Clean re-test: reachable (`401` in 0.32s). Lesson: **parse env for the single active
value; verify a "blocker" cleanly before declaring it.** The operator caught this — the human
checkpoint worked exactly as the three-layer model intends.

### Response Logging pilot → now global doctrine (v3.1)
Mirroring every plan/report/verification to `agent_docs/RESPONSES/` before printing proved its worth:
when I made the Supabase error, the durable artifact was corrected in place (not lost in scrollback),
and every gate decision has a timestamped file. It graduated from a session rule to **CLAUDE.md
v3.1 RESPONSE LOGGING PROTOCOL**. Confirmed complementary to the session file (status transitions)
vs RESPONSES (full artifact). Keep both writes firing.

---

## 5. KIP quality → StoreLens (main-plan Phase 7)
- **DataTable** — proven across **two** homes (audit log + onboarding queue) incl. the mobile
  stacked-block mode. Generic column config + cell renderers; transfers to StoreLens verbatim.
- **EmptyState** — 7 consumers; trivially reusable.
- **StoreCard** — shared by Stores directory + Owner detail (design-once); transfers.
- Caveat unchanged from the brief: **components transfer; data-access does NOT** (platform-wide here
  vs own-stores RLS in StoreLens). Onboarding does not transfer at all.

## 6. Reconciliations resolved (DATA_CONTRACT §6)
- `Member.jobTitle` — kept optional/graceful-empty (mock flavor: "Pharmacist"/"Technician"); no
  Frank source. Cards don't reflow when it's absent. **Confirmed approach; no schema change.**
- Owner `name` — derived from primary-store `contact_person` intent; mock uses display names, falls
  back to email local-part in the real resolver. Still wants a real profile-name source in Phase 2.
- `StoreSummary.state` — kept off the card (owner name took the slot), retained in the type as a
  future directory filter. **Confirmed.**

## 7. Trickle-up — promote to the starter kit + skills (student → teacher)

**Starter kit (so clones aren't born broken/misleading):**
1. Ship the **token `:root`/`.dark` block** in `globals` (§3c).
2. Pin **`jest-mock` + `jest-environment-jsdom`** so `npm test` is green on clone (§ infra).
3. Add **`server-only`** to deps (or document it's absent).
4. Correct the **handbook** (app-role.ts / AppShellPage / useAuthStore flags; add the canonical
   `role==='superadmin'` super-admin check).

**`stark-recon` skill:**
5. Add a check: **does the `:root` token block exist on disk** (not just the globals file)?
6. Keep the Day-0 handbook-file + store-shape sweep — it caught every §3 drift.

**`stark-frontend-first` skill:**
7. Codify **"RED list lives in types + service signatures"** (§4 gold).
8. Codify the **empty-seam mock** pattern for the Services sub-phase.
9. Codify **real-screen verification is mandatory** (a green build is not a rendered app).
10. Adopt **Response Logging** as standard (now in CLAUDE.md v3.1).

## 8. What I'd do differently next time
- Check for a **system browser** before attempting the Playwright download.
- Run the **cheap login-credential probe** (`curl /api/auth/login`) before assuming an env blocker.
- When a reachability/CLI test returns `000`/empty, **suspect my own command** before the environment.

---

🥄 *Run 002 close-out. The kit gave auth for free; recon kept us from authoring against its lies;
the RED list held because it was structural, not vigilant; and the only bug that shipped past three
green gates was caught by looking at the screen.*
