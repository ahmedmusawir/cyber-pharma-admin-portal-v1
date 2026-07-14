# Cloud Deployment — Path A Plan (Activation Step 4 summary)
**Timestamp:** 2026-07-13 18:35 · **Session:** session_2026-07-13.md · **Branch:** gcs-deploy-1

## Environment (EVIDENCE — see response_2026-07-13_183247_deploy-activation-discovery.md)
Next.js ^16.2.1 App Router + Supabase SSR app; ZERO deployment-package files on disk; `.env.local` present (values unread); repo remote github.com/ahmedmusawir/cyber-pharma-admin-portal-v1.

## Path engaged
**Path A — New Project Bootstrap** (operator answered YES to "New Google Cloud Project necessary?"). Happens once per GCP project, ever. Then the standard chain: `next-deploy-generate` → `next-deploy-execute`.

## Run order
1. **Prerequisites (operator confirms):** gcloud CLI installed + authenticated · billing-capable account · project ID chosen (lowercase, hyphenated, globally unique) · region (skill default `us-east1`)
2. **Project bootstrap** (guided, operator executes every command = init-gcp-project.sh scope):
   - `gcloud projects create PROJECT_ID` → attach billing → enable APIs: Cloud Build, Cloud Run, Artifact Registry, Secret Manager, IAM → create Artifact Registry Docker repo `cloud-run-source-deploy` in region
3. **`next-deploy-generate`:** intake summarized in a table (its own Plan Mode gate) → generates 5 files at project root: `Dockerfile`, `cloudbuild.yaml`, `deploy.sh`, `init-app.sh`, `DEPLOYMENT_CHECKLIST.md`
4. **`next-deploy-execute`:** Phase-gated walkthrough — init-app.sh (app secrets + runtime SA `sa-{app}-runtime`), first deploy with `NEXT_PUBLIC_APP_URL` placeholder → second deploy with real URL (Two-Deploy Pattern §7.4), IAM verified by Truth Commands (never guessed), explicit invoker policy, optional custom-domain DNS/SSL.

## Unknowns I need from the operator (QUESTION — no invention)
| # | Item | Note |
|---|------|------|
| 1 | New project ID | e.g. `cyber-pharma-staging` — must be globally unique |
| 2 | Region | default `us-east1` unless overridden |
| 3 | App-name for conventions | suggest `cyber-pharma-admin` → service `cyber-pharma-admin-prod`, SA `sa-cyber-pharma-admin-runtime`, secrets `cyber-pharma-admin-*` |
| 4 | Secret inventory | expect Supabase: `NEXT_PUBLIC_SUPABASE_URL` + anon key (public → deploy.sh plaintext); service-role key if used (Secret Manager). Will classify build-time vs runtime from code + operator |
| 5 | Invoker policy | staging-for-client-review suggests public; not assumed |
| 6 | Custom domain? | `{app}.cyberizedev.com` convention, or bare *.run.app for staging |

## Guardrails in force
Guidance-only mode (operator runs all gcloud commands) · Sharpness Rule · 3-Actors labeling · Evidence Discipline · Truth Commands · Read-Only Boundary (I touch only the 6 deployment-package files) · No Invention.

→ **Awaiting your APPROVED before proceeding.**
