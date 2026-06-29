# Recovery State

Last action (2026-06-29): COMPLETED Phase-1 Pre-Flight Hygiene + Jest dep-hygiene. Build + tests GREEN (81/81, 11/11).
Current state: jsonsrv cascade / ghl-hooktest / route-1 / layout-org / dup docs/setup.sql DELETED;
  tsconfig excludes agent_docs+_SKILLS; jest fixed via overrides(jest-mock=30.4.1) + jest-environment-jsdom^30.4.1.
  Uncommitted (no git ops done): see `git status`. Verified: `npm run build` ✓, `npm test` 81/81 ✓.
Pending: NOTHING blocking. Architect can author FFM from the recon report.
Next step: Operator decides recon open-questions (posts cascade / stripe dep / DashboardCard) THEN FFM authoring.

## Standing rule (this session): mirror every plan/report/verification to agent_docs/RESPONSES/
  pattern response_<date>_<HHMMSS>_<slug>.md BEFORE printing to screen.

## Trail (agent_docs/RESPONSES/)
- response_2026-06-29_132516_preflight-plan.md
- response_2026-06-29_134337_preflight-execution-result.md
- response_2026-06-29_171742_jest-dep-hygiene-plan.md
- response_2026-06-29_172435_jest-dep-hygiene-result.md

## ▶ ON RESUME — GO STRAIGHT TO BUSINESS
1. Read `agent_docs/RECON/RECON_cyber-pharma_phase1_2026-06-28.md` — the recon report (source of truth).
2. Biggest drifts to honor before any FFM line: app-role.ts MISSING, AppShellPage MISSING,
   useAuthStore has NO isAdmin/isSuperadmin/isMember flags + user:any, ThemeToggle→ThemeToggler.
3. Cleanup buckets + open questions are in the report's "Recommendation to Architect".
4. FFM target: `_SKILLS/super_admin_portal_phase1_ffm/`. Plan: `agent_docs/CYBER_PHARMA_8_PHASE_PLAN_v1_2.md`.

## Key facts (Tony's corrections — already approved, do NOT re-ask)
- Approval: Option 1, FULL 6 PHASES. Phase label = `phase1` (Super Admin Portal Phase 1).
- Session logs → `agent_docs/SESSIONS/` (not root). Recon reports → `agent_docs/RECON/` (uppercase).
- Brand assets to use: `agent_docs/branding_stuff/` (logos, favicon-512, brand_preview).
- FFM target: `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/`. Plan: `agent_docs/CYBER_PHARMA_8_PHASE_PLAN_v1_2.md`.
