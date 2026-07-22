# next-deploy-execute — Phase 0 Pre-Flight (routing plan)
**Timestamp:** 2026-07-21 14:37:05 · **Session:** session_2026-07-21.md · **Status:** PENDING routing confirmation

## File presence (EVIDENCE — verified on disk this session, committed on `gcs-deploy-2`)
Dockerfile · cloudbuild.yaml · deploy.sh (+x) · init-app.sh (+x) · DEPLOYMENT_CHECKLIST.md — all present at project root. `output: "standalone"` in next.config.js, build-verified.

## Routing answers
1. Files exist — **EVIDENCE** (above).
2. init-app.sh never run for this app — **INFERENCE** (project `cyberize-nextjs-staging` was created 2026-07-14 in this run; no secrets/SAs created since bootstrap). Operator to confirm.
3. First-time deployment — **INFERENCE** (no Cloud Run service can exist; project is brand-new). Operator to confirm.
4. Domain verification status of `cyberizedev.com` for Cloud Run — **QUESTION**: verification is tied to the Google account/Search Console owners, and prior deploys (dockbloxx etc.) lived in OTHER projects. Has `moose@cyberizegroup.com` (or the deploying account) already verified cyberizedev.com with Google? If YES → skip Phase 4. If NO/unsure → run Phase 4 when the domain-mapping create complains.

## Proposed routing
**Phases 1 → 2 → 3 → (4 if needed) → 5 → 6 → 7**
- Phase 1: run ./init-app.sh, add REAL secret value (echo -n!), verify
- Phase 2: truth-command IAM check — runtime SA binding (build SA: GAP until first build; NO build-time secrets exist, so no build-SA secret bindings are needed at all for this app)
- Phase 3: ./deploy.sh → service URL → browser smoke test (NO two-deploy dance — domain URL already baked)
- Phase 4: only if domain never verified for the deploying account
- Phase 5: domain mapping mission-portal.cyberizedev.com + DigitalOcean CNAME + SSL wait + curl verify (Step 5.6 final-deploy SKIPPED — deploy.sh already carries the final domain URL)
- Phase 6: invoker PUBLIC (allUsers) + policy verify
- Phase 7: completion summary vs family §8 criteria

→ Awaiting operator confirmation of #2/#3, answer to #4, and "Proceed to Phase 1".
