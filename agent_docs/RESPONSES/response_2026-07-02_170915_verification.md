# FFM Sub-Phase 5 — VERIFICATION (MissionControl) · Gates G1–G12

> Status: **COMPLETE — awaiting approval before Sub-Phase 6 (Retrospective).**
> Generated: 2026-07-02 17:09:15.

## ⚠️ CORRECTION (2026-07-02, post-report)
The "Supabase unreachable" claim below was **WRONG — a flawed test**. The reachability check
extracted all three `NEXT_PUBLIC_SUPABASE_URL` lines from `.env.local` (two are commented-out
alternates), built a malformed multi-host URL, and got `HTTP 000` — which I misread as unreachable.
**Clean re-test:** active URL `yrsuwikjnbmvpznrgydb.supabase.co` resolves and responds
`auth/v1/health → HTTP 401` in 0.32s. **Supabase IS reachable from this sandbox.**

Corrected blocker: NOT reachability. The only remaining gap for a live login walk is a **super-admin
login credential (email + password)** — `.env.local` holds Supabase URL + API keys (publishable/secret),
which is app-to-Supabase config, NOT a user's login. With a super-admin email+password, a live
Playwright walk (browser is installed: `@playwright/test`) can close G2-pass / G3-authed / G5-in-UI /
G10-real-screen / G11-375px via real login + screenshots. The G4/G6/G7/G8 service-layer proofs below
stand regardless.

## ⚠️ Environment blocker (original — SUPERSEDED by the correction above)
~~**Supabase is unreachable from this sandbox**~~ (`curl auth/v1/health → HTTP 000`, network to `*.supabase.co` blocked) and there are **no seeded super-admin credentials**. Auth is REAL and must not be mocked — so I **cannot** perform a live super-admin login or reach any authed screen in a browser here. Every gate that lives behind the auth wall is verified by the strongest available proxy (the **service layer the UI calls**, executed for real; + code/import inspection), and the genuinely browser-visual gates are marked **BLOCKED (env)** — not passed. **No gate FAILED.**

## Per-gate results

| Gate | Verdict | Evidence |
|---|---|---|
| **G1** Build clean | ✅ PASS | `npm run build` GREEN, `tsc --noEmit` CLEAN; all 9 routes in the route table |
| **G2** Real auth gate | ✅ deny live / ⛔ pass blocked | **Live:** all 5 protected routes → **HTTP 307 → /login** for anonymous; `/login` → 200. Gate resolves `user=null` and redirects (no 500) even with Supabase down. **Super-admin PASS path BLOCKED** (no reachable Supabase / no creds); gate logic code-verified: `getSuperAdminUser()` → `getUserRole()==='superadmin'` else null |
| **G3** All 9 routes render | ✅ routes / ⛔ authed render blocked | All 9 present in build; `/login` renders 200 live; protected → redirect live. Authed screen render BLOCKED (behind auth) |
| **G4** GREEN actions | ✅ PASS (service) | Harness (real exec): suspend + recovery + resend + restore-admin all `ok`, **4 audit rows appended**; typed-name mismatch → `ok:false`. UI→service wiring code-verified; browser-observed BLOCKED |
| **G5** RED absent | ✅ static / ⛔ running-UI blocked | Whole-tree grep CLEAN — no create-member/password/email-edit/delete/billing/impersonation control exists in source, so none can render. Password/email inputs exist ONLY in `/login` (the operator's own auth). Running authed-UI visual BLOCKED |
| **G6** Onboarding constraint | ✅ PASS (service+code) | Harness: `approve`/`reject` take **no email arg** (compile-enforced); empty note → `ok:false`; approve fires invite to the **on-record email** (`sam@lakesiderx.example`, read not supplied); reject soft. Identity block is a read-only field grid; email rendered display-only (code-verified) |
| **G7** Dashboard counts | ✅ PASS | Harness: `getPlatformStats` derives from seed — `totalPharmacies 12 = stores.length`, `totalOwners 6 = owners.length`, growth Σ = 12. No decorative numbers. No PHI/$ recovered |
| **G8** Audit | ✅ PASS | Harness: every action appends a row; `auditLogService.listEntries()` reads all 11 (7 seed + 4 new) |
| **G9** Breadcrumb lock | ✅ PASS (code) | Breadcrumb present + always-rendered on `stores/[storeId]` (Stores › Owner › Store) and `onboarding/[registrationId]` (Onboarding › Pharmacy) — rendered outside loading guards |
| **G10** Theming | ✅ dark default live / ⛔ real-screen blocked | **Live SSR:** `<html lang="en" class="dark">` (dark first paint, no flash). Token layer installed (Metro Warm Mist/Slate, semantic tokens, no hardcoded hex in MC components). Light+dark **real-screen visual pass BLOCKED** (needs authed browser) |
| **G11** Mobile 375px | ✅ code / ⛔ visual blocked | Responsive breakpoints across 10 MC files; card grids 3→2→1, KPI 4→2, DataTable collapses to stacked blocks (<md), sidebar → top strip. Visual 375px pass BLOCKED |
| **G12** KIPs reused | ✅ PASS | **DataTable** → audit-log + onboarding queue (2 homes). **EmptyState** → owners, stores, owner-detail, store-detail, onboarding queue, onboarding detail, audit-log (7 consumers) |

## Summary
- **Full PASS (objective):** G1, G4, G6, G7, G8, G9, G12.
- **PASS on the verifiable half, BLOCKED on the browser-visual half (env, not defect):** G2 (deny live / super-admin pass blocked), G3 (routes/redirect live / authed render blocked), G5 (source-clean / running-UI blocked), G10 (dark-default live / real-screen blocked), G11 (code-responsive / visual blocked).
- **FAIL: none.**
- Baseline `npm test` after verification: **81/81** (temp harness deleted; no corpse). Dev server stopped; port 3000 down.

## To fully green the BLOCKED halves (operator action, on a Supabase-reachable machine)
1. `npm run dev` where `*.supabase.co` is reachable; seed/confirm a **super-admin** (`user_roles.role='superadmin'`) by hand in the Supabase console.
2. Log in at `/login` → confirm redirect to `/dashboard` (G2 pass); log in as a non-super-admin → confirm denial + sign-out.
3. Walk all 9 screens; fire each GREEN action; confirm toasts + Audit log rows (G4/G5/G8 in-UI).
4. Confirm onboarding email is display-only, no email/payment field (G6 in-UI).
5. Toggle light/dark on the major surfaces (cards-on-bg, muted text, borders, pills) (G10 real-screen).
6. 375px pass on every screen (G11).

## Ledger (updated)
- Evaluate **recharts vs CSS chart** at the real-data phase (per ruling).
- Add **`server-only`** package at the next dep-hygiene pass.
- Browser-visual gate closure (G2 pass / G5 / G10 real-screen / G11) pending a Supabase-reachable run.

🛑 STOP — Verification complete (objective gates green; browser-visual gates blocked by the sandbox's lack of Supabase, documented). Awaiting approval before Sub-Phase 6 (Retrospective).
