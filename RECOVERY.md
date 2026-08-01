# Recovery State

## 🔴🔴 READ THIS FIRST — LIVE EXPOSURE, UNREMEDIATED (2026-08-01)
**Line ~155 of this file publishes a WORKING SUPERADMIN LOGIN** (`superadmin@email.com` /
`pass1234`) for the LIVE, PUBLIC site at https://mission-portal.cyberizedev.com
(`--allow-unauthenticated`). The Supabase project URL is also tracked (`deploy.sh:17`).
Together: project URL + client key + superadmin credential. Only RLS is in the way.
**ACTION REQUIRED BY OPERATOR: rotate that password.** Deleting the line does NOT
remediate — it is in git history (96ed539 and earlier). Rotation is the fix.
Left in place deliberately so it isn't lost before rotation; strip it after.

---

Last action (2026-08-01 19:18): **PUBLIC-SHOWCASE PREP — PART 1 SECURITY SWEEP: 🔴 FLAGGED.**
  Operator-tasked 3-part pass (sweep → verify numbers → README augment), gated to stop if
  Part 1 flagged red. **It did. Parts 2 and 3 NOT started.** Read-only — zero files modified.
  Artifact: `agent_docs/RESPONSES/response_2026-08-01_191842_showcase-security-sweep-part1.md`
  · Session: `agent_docs/SESSIONS/session_2026-08-01.md`
  **Results:** (1) tracked env files ✅ CLEAN — zero tracked, sibling repo's `.env copy.example`
  fossil NOT present; (2) secrets 🔴 — live Supabase publishable key hardcoded `deploy.sh:18`
  + `cloudbuild.yaml:7`, real project ref `yrsuwikjnbmvpznrgydb.supabase.co`, full GCP estate
  map; CLEAN on JWTs/service-role/Stripe/AWS/GH (all provider hits are doc placeholders);
  (3) mock/PHI 🟠 — `src/mocks/.../store.ts` genuinely PHI-free w/ `.example` emails, BUT
  3 NPIs pass the Luhn+80840 checksum (`1063511111`:87, `1063519999`:144, `1770000002`:285)
  → resolvable in public NPPES; "Barack Obama" fossil CONFIRMED in 5 design HTMLs;
  (4) Frank/Coach 🔴 **RED = the stop condition** — `Frank Tant` + `frank@frankrx.com` in
  2 design HTMLs, `Coach` in 11 dated approval records, `Heather` (Frank's employee) with
  her access level debated in writing, `Mical`, `moose@cyberizegroup.com`;
  (5) stale claims 🟡 — "81 tests" changelog fossil vs 2 test files on disk, dead `test:e2e`
  scripts, tracked `test-results/`. Routes verified: 13, **no escape hatches**.
Pending: **BLOCKING OPERATOR DECISION — disposition of `agent_docs/` (307 tracked files) +
  `_SKILLS/`:** strip from public repo · scrub names in place · OR publish a separate curated
  showcase repo (`src/` + `docs/` + new README) ← agent's recommendation. Part 3's README
  framing depends on this answer, so it was NOT drafted. Mechanical scrubs #3–#8 in the
  artifact are ready to execute on approval.
Next step: (1) rotate superadmin password [see red block above]; (2) make the `agent_docs/`
  call; (3) approve scrubs; (4) THEN Part 2 (npm ci → tsc → jest → build → npm audit,
  today's numbers only) → Part 3 (README, needs operator's image URLs + factory template).

---

Prior action (2026-07-22 16:52): **🏁 STAGING DEPLOY CLOSED — 6/6 FAMILY CRITERIA GREEN.**
  https://mission-portal.cyberizedev.com LIVE with managed SSL (curl: HTTP/2 307 → /dashboard,
  Google Frontend). Full run today: Issue #6 (domain-mappings now `gcloud beta`) → Phase 4
  triggered (base domain cyberizedev.com verified via DO TXT — NOT the subdomain, Issue #9) →
  mapping created → DO CNAME mission-portal→ghs.googlehosted.com. live (dig proof) → SSL issued.
  **RETROSPECTIVE + SKILL v3 REBUILD REPORT written (operator-tasked):**
  agent_docs/RESPONSES/response_2026-07-22_165223_deploy-retrospective-skill-v3.md — all 9
  ledger issues analyzed, per-file v3 change list, missed-permission closing commands in §5.
  UPDATE 17:0x — **Issue #7 CLOSED:** build SA run.admin granted (compute default SA,
  binding verified in policy output). Root-cause refined: compute SA had Editor all along;
  Editor excludes setIamPolicy → run.admin was the missing piece (ledger row 7 amended).
Pending: NOTHING on the deploy run · commit point RIPE (operator git) · skill v3 rebuild
  when operator tasks it.
Next step: FFM track — client review of staging URL → iterate. NO backend until client approves.

---

Prior action (2026-07-21 ~12:35): **DEPLOY PACKAGE COMPLETE + STANDALONE BLOCKER CLEARED.**
  5 files generated 2026-07-14 (Dockerfile, cloudbuild.yaml Template B, deploy.sh, init-app.sh,
  DEPLOYMENT_CHECKLIST.md — operator committed, 663e0c0, branch `gcs-deploy-2`). Today:
  `output: "standalone"` added to next.config.js (operator-approved) — build GREEN, exact route
  table, .next/standalone/server.js EXISTS. Surfaced deviations logged in
  response_2026-07-14_150210_generate-phase2-result.md (node:22, SITE_URL+APP_URL, prefilled
  public vars).
Pending: generate-skill Phase 3 handoff presented — awaiting operator "deploy now" to engage
  **next-deploy-execute** (init-app.sh → real secret value → ./deploy.sh → domain mapping
  mission-portal.cyberizedev.com → invoker PUBLIC). Checklist = DEPLOYMENT_CHECKLIST.md.
Next step: operator runs checklist §1–2 with agent guiding (execute skill Phase 0 plan first).

---

Prior action (2026-07-14 ~11:55): **PATH A PROJECT BOOTSTRAP COMPLETE** (deploy run, APPROVED).
  GCP project `cyberize-nextjs-staging` ACTIVE · billing linked (014A57-70D5C5-B41710) · 5 APIs
  enabled · AR repo `cloud-run-source-deploy` (us-east1). All truth-command verified, operator-
  executed (guidance-only). Decisions locked: app `cyph-mission-ctrl` · service
  `cyph-mission-ctrl-prod` · SA `sa-cyph-mission-ctrl-runtime` · invoker PUBLIC · domain =
  cyberizedev.com subdomain (exact TBD). NOTE: this repo = MISSION CONTROL app (package
  `cyph-mission-control-v1`) — deploys first; main Cyber Pharma app is a separate repo in cleanup.
Pending: `next-deploy-generate` intake (incl. secret classification from code) → generate 5
  deployment files → `next-deploy-execute`.
Next step: read next-deploy-generate/SKILL.md, run intake, present table, generate on approval.
  Sessions: session_2026-07-13.md (activation) · session_2026-07-14.md (live).
  Artifacts: response_2026-07-13_183500_path-a-plan.md · response_2026-07-14_093306_path-a-bootstrap-commands.md.

---

Prior action (2026-07-10 18:28): **FIX PHASE 2 CLEANUP COMPLETE** — kill list executed on branch
  `phase-1-cleanup` (operator-cut, was clean). 100 paths deleted (99 code + 1 test-README) +
  2 surgeries (LoginPageContent forgot-password link REMOVED; confirm-route failure redirect
  /error → /login per F-1 ruling). Rulings: client.ts + admin.ts KEPT (zero-consumer blessed
  Phase-2 infra — will look dead to recons); deps/package.json UNTOUCHED (dep-hygiene task owns
  stripe/playwright/dotenv/zustand/RHF/zod/heroicons/cmdk/radix-tabs-avatar-select removals).
  GATES ALL GREEN: tsc · build (route table exact: /, /login, 8 MC screens,
  api/auth/{login,logout,confirm}, not-found) · npm test 2 suites / 8 tests EXACTLY ·
  live walk 15/15 real Supabase (9 screens, redirect chains, dead routes 404).
  Artifacts: response_2026-07-10_131658_fix2-recon.md · _135116_fix2-cleanup-plan.md ·
  _182815_fix2-cleanup-result.md.
Operator visual pass DONE ("pristine") · ALL COMMITTED & PUSHED on `phase-1-cleanup`.
Post-push addendum (18:52): **PHASE-1 CLOSE-OUT RETROSPECTIVE written** (architect-tasked, closes
  the FFM): playbook/RETROSPECTIVES/RUN_002_phase1_closeout.md + mirror
  response_2026-07-10_185201_retrospective.md. Includes KIT-SHED SKILL INPUTS map.
Pending: retro pair + session/RECOVERY docs UNCOMMITTED (operator's git — small doc commit ripe).

## ▶ NEXT SESSION — GO STRAIGHT TO BUSINESS
**Deploy to STAGING using the devops GCS deployment skill** — operator will supply the skill
("coming soon"): on resume, look for it in `_SKILLS/` (or agent_docs/.claude/skills) BEFORE
planning any deploy; read its CLAUDE.md/SKILL.md first, same as stark-recon.
**PHASE 1 IS FORMALLY CLOSED** (retro: playbook/RETROSPECTIVES/RUN_002_phase1_closeout.md).
FFM track: staging deploy → client review → iterate. NO backend until client approves.
Queued after: dep-hygiene pass (owns ALL package removals: stripe, @playwright/test, dotenv,
zustand, RHF+resolvers, zod, heroicons, cmdk, radix tabs/avatar/select) · MC unit-test buildout ·
kit trickle-up ledger (+ new: swallow refresh_token_not_found noise in kit getUser; kill dead
test:e2e scripts; stark-recon multi-line-import grep fix).

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
