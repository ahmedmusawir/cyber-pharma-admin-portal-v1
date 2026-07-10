# Recovery State

Last action (2026-07-10 13:20): **FIX PHASE 2 RECON COMPLETE** — kit-surface consumer trace (read-only,
  repo unchanged). Kill-list: 102 files DELETE; MC KEEP manifest = 15 ui/ + 9 kit-infra files.
  ONE retarget seam: LoginPageContent.tsx:113 "Forgot password?" → /auth (fix BEFORE (auth) dies).
  ⚠️ useAuthStore NOT MC-consumed → DELETE. Orphaned TODAY: stripe, @playwright/test, dotenv,
  styles/global.scss. Predicted post-cleanup tests: 2 suites / 8 tests (from 11/81).
  Report: agent_docs/RESPONSES/response_2026-07-10_131658_fix2-recon.md.
Pending: FIX PHASE 2 cleanup plan (separate approved task). Open Qs: supabase client.ts/admin.ts
  keep-or-delete (Phase-2 infra), zustand dep fate.

Prior action (2026-07-09 20:06): **NAV SPINNER COMPLETE** — SpinnerLarge in content slot on every nav
  (sidebar static): (mission-control)/loading.tsx (hard loads) + Shell transition-pending (client navs —
  Next 16 stale-page semantics make loading.tsx alone insufficient; key kit lesson). tsc · build ·
  81/81 · live proof 5/5 · operator-confirmed. Artifact: response_2026-07-09_200614_nav-spinner-result.md.
Earlier today: **FIX PHASE 1 COMPLETE** — root rehome (/ = true 307 → /dashboard, zero-flash), mobile
  drawer rebuild (doctrine hamburger + left slide-over w-3/4, PNG look, foot restored), Cyber Pharma
  branding (login, rail, drawer, favicon). Live walk 29/29 ("bullseye").
  Artifact: response_2026-07-09_165454_fix-phase-1-result.md.
Current state: Phase-1 FFM + FIX PHASE 1 + nav spinner working. Branch `phase-1-FFM-verify`,
  working tree UNCOMMITTED: my ~12 paths (src/ + public/) + operator-side _SKILLS/ moves (~84 paths).
  Operator handles ALL git — Claude never commits (standing rule).
Pending: commit point ripe (operator's call). FIX PHASE 2 = kit cleanup (delete kit surfaces) — NOT started.
Next step: strictly FFM track — complete → deploy for client review → iterate. NO backend until client approves.

## ▶ ON RESUME — GO STRAIGHT TO BUSINESS
1. Read `agent_docs/SESSIONS/session_2026-07-09.md` (full state dump — everything is there).
2. FFM is done: 9 screens, 7 mock services, real Supabase super-admin gate. All 6 sub-phases approved.
3. Author against the recon report + DATA_CONTRACT, NOT the kit handbook (5 confirmed handbook drifts).

## Standing rule (now CLAUDE.md v3.1 doctrine): mirror every plan/report/verification/retrospective
  to agent_docs/RESPONSES/ as response_<date>_<HHMMSS>_<slug>.md BEFORE printing.

## Verification credential (test): superadmin@email.com / pass1234 (real Supabase, role superadmin).

## OPEN LEDGER — trickle-up to the starter kit (student→teacher)
- Kit: ship token :root block in globals; pin jest-mock 30.4.1 + jest-environment-jsdom ^30.4.1;
  add server-only; correct handbook (app-role.ts / AppShellPage / useAuthStore flags; add
  role==='superadmin' canonical check).
- stark-recon: verify the :root token block EXISTS on disk (not just the globals file).
- stark-frontend-first: RED-list-in-types/services; empty-seam mocks; mandatory real-screen verify.
- Deferred: recharts-vs-CSS-chart at real-data phase; server-only dep add.

## Phase 2 (post-FFM, when tasked)
Swap domain service layer → real Supabase; Stripe subscriptions mirror; audit-log persistence;
real activation-invite + recovery/invite emails; expired-registration timeout job.

## Trail (agent_docs/RESPONSES/, 13 artifacts) — full FFM decision history
preflight (plan+result) · jest-dep-hygiene (plan+result) · discovery · types · services · mocks ·
components-chunk1 · components-complete · verification (superseded) · verification-live · retrospective.
