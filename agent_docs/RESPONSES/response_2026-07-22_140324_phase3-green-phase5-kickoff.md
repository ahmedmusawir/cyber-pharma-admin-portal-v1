# Phase 3 CLOSED GREEN + Phase 5 Kickoff (DNS + SSL)
**Timestamp:** 2026-07-22 14:03:24 · **Session:** session_2026-07-22.md · **Branch:** gcs-deploy-2

## Phase 3 — Smoke Test Verdict (operator, 2026-07-22)
- **EVIDENCE:** invoker binding set by Actor A + independently verified — `allUsers` / `roles/run.invoker`.
- **EVIDENCE:** app loads at https://cyph-mission-ctrl-prod-524380376459.us-east1.run.app — login renders, styling intact.
- **EVIDENCE:** super-admin login SUCCESSFUL — dashboard, sidebar, charts, seed data all render; SSR cookie session works over https.
- **EVIDENCE:** role gate verified LIVE — admin + member accounts rejected with super-admin-only message post-auth.
- Known noise: Chrome Safe Browsing flags the fresh *.run.app URL ("Dangerous"; autofill weirdness, incognito clean). Not an app defect; retired by the custom domain.

## Battle scars from Phase 3 (all fixed, all on the trickle-up ledger)
1. `deploy.sh` TEMPLATE BUG — `--substitutions` split across `,\` continuation lines → gcloud "unrecognized arguments". Fixed: single SUBSTITUTIONS string.
2. `init-app.sh` IAM race — SA bound ms after creation → 400 "does not exist"; idempotent re-run fixed. Template needs sleep/retry.
3. Post-2024 secure defaults — build SA (Actor B) can't set IAM policy → `--allow-unauthenticated` warned, service 403'd until Actor A bound invoker manually. **STAGING RULE (operator-ruled):** Path A bootstrap must grant build SA run.admin, always. Grant PENDING (build SA email query outstanding).

## Family §8 scoreboard
| # | Criterion | Status |
|---|---|---|
| 1 | Service serves 200 | EVIDENCE ✅ |
| 2 | Build + Actor B secrets | n/a (zero build-time secrets) ✅ |
| 3 | Runtime secrets (Actor C) | EVIDENCE ✅ |
| 4 | Invoker explicit + intent match | EVIDENCE ✅ |
| 5 | Custom domain HTTPS/SSL | **PENDING — Phase 5 (this run)** |
| 6 | Operator confirms behavior | EVIDENCE ✅ |

## Phase 5 plan (operator-directed: spoon-feed, one command per step)
DNS provider: DigitalOcean (authoritative for cyberizedev.com). Phase 4 contingent — only if Step 5.1 complains about domain verification.

1. **5.1** `gcloud run domain-mappings create --service cyph-mission-ctrl-prod --domain mission-portal.cyberizedev.com --region us-east1 --project cyberize-nextjs-staging` ← ISSUED, awaiting output
2. **5.2** `domain-mappings describe` → expected record: CNAME → ghs.googlehosted.com
3. **5.3** DigitalOcean: CNAME hostname=`mission-portal`, value=`ghs.googlehosted.com.`, TTL 3600
4. **5.4** SSL wait 15–30 min; poll `describe --format="yaml(status)"` for CertificateProvisioned: True
5. **5.5** `curl -I https://mission-portal.cyberizedev.com` → 200/301/302
6. **5.6** SKIPPED — deploy.sh already bakes the final domain URL (no re-deploy needed)
7. Then Phase 7 completion summary vs family §8.
