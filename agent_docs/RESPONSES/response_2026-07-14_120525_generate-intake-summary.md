# next-deploy-generate — Phase 1 Intake Summary (Group 4 Plan Mode)
**Timestamp:** 2026-07-14 12:05:25 · **Session:** session_2026-07-14.md · **Status:** PENDING_APPROVAL

```
DEPLOYMENT PACKAGE — INTAKE SUMMARY
====================================
App Name:        cyph-mission-ctrl
GCP Project:     cyberize-nextjs-staging          (bootstrapped + verified this session)
Region:          us-east1
Custom Domain:   cyph-mission-ctrl.cyberizedev.com   ← CONFIRM exact subdomain
Backend URL:     none (app talks directly to Supabase)   ← CONFIRM
Service:         cyph-mission-ctrl-prod
Runtime SA:      sa-cyph-mission-ctrl-runtime@cyberize-nextjs-staging.iam.gserviceaccount.com
Invoker:         PUBLIC (allUsers)
```

## SECRETS (Secret Manager)
| Env Var | Secret Manager Name | Build | Runtime | Evidence |
|---|---|---|---|---|
| SUPABASE_SECRET_KEY | cyph-mission-ctrl-supabase-secret-key | No | Yes | admin.ts factory fn — env read at CALL time only; currently ZERO importers (blessed Phase-2 infra per RECOVERY.md). RECOMMEND include now → Phase-2 swap needs no deploy-file changes. |

## PUBLIC VARS (plaintext in deploy.sh — NOT Secret Manager)
| Env Var | Value / Source | Evidence |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | from operator's .env.local (value not read by agent) | client/server/middleware/admin.ts — build-baked |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | from operator's .env.local | client/server/middleware — build-baked (new-style Supabase publishable key; safe-public by design) |
| NEXT_PUBLIC_SITE_URL | https://cyph-mission-ctrl.cyberizedev.com | server.ts:7 — drives the `secure` cookie flag (MUST be https in prod). This app's code plays the NEXT_PUBLIC_APP_URL role under this name → set directly to custom domain, NO two-deploy dance needed. |

## EXCLUDED — .env.local fossils NOT read by any src code (EVIDENCE: full grep)
`NEXT_PUBLIC_API_BASE_URL` · `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` · `STRIPE_SECRET_KEY` ·
`STRIPE_PRICE_STARTER/PRO/ENTERPRISE` · `STRIPE_WEBHOOK_SECRET` — kit leftovers; dep-hygiene
task owns their removal. They do NOT enter the deployment package.

## CLASSIFICATION CONSEQUENCE
No build-time secrets → cloudbuild.yaml **Template B** (no availableSecrets block) ·
Dockerfile Stage 2 gets public-var ARGs only · `--set-secrets` carries the one runtime secret.

## GENERATED FILES (on APPROVED)
Dockerfile · cloudbuild.yaml (Template B) · deploy.sh · init-app.sh · DEPLOYMENT_CHECKLIST.md
→ all at project root, next to package.json.

## OPEN CONFIRMATIONS
1. Exact subdomain: `cyph-mission-ctrl.cyberizedev.com`? (or e.g. `mission-ctrl.cyberizedev.com`)
2. Backend URL = none — correct?
3. Include SUPABASE_SECRET_KEY as runtime secret now (recommended) — yes?

→ Awaiting your APPROVED before generating files.
