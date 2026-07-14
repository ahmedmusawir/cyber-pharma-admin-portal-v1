# Cloud Deployment Skill — Activation Discovery & Plan Mode Summary
**Timestamp:** 2026-07-13 18:32:47 · **Session:** session_2026-07-13.md · **Branch:** gcs-deploy-1

## Skill Activation (family doctrine v2.0 read end-to-end)
Skill root: `_SKILLS/CLOUD_DEPLOYMENT_SKILLS/CLOUD_DEPLOYMENT_SKILLS/`
Mode: **guidance-only** — I generate files and provide exact CLI commands; the operator executes every gcloud command and pastes output back (Tony Stark Protocol).

## Step 2 — Environment Discovery (EVIDENCE, from disk)
| Check | Result |
|---|---|
| Framework | Next.js ^16.2.1 (App Router), React 19.2.4, TypeScript |
| Backend deps | @supabase/ssr 0.6.1, @supabase/supabase-js 2.44.0 |
| Dockerfile | NOT FOUND |
| cloudbuild.yaml | NOT FOUND |
| deploy.sh | NOT FOUND |
| init-app.sh | NOT FOUND |
| init-gcp-project.sh | NOT FOUND |
| .env.local | EXISTS (presence only — values not read) |
| Git remote | github.com/ahmedmusawir/cyber-pharma-admin-portal-v1 |
| Branch / tree | `gcs-deploy-1` / clean |

## Routing (skill decision matrix §5.1)
No deployment files exist for this app → **full run: `next-deploy-generate` → `next-deploy-execute`**.
Path A vs Path B depends on THE FIRST QUESTION (below).

## What I do NOT know (GAP / QUESTION — no invention per §4.8)
1. **THE FIRST QUESTION: New Google Cloud Project necessary?** (YES → Path A bootstrap; NO → Path B into an existing project, e.g. `nextjs-production-staging`)
2. App-name for naming conventions (suggest: `cyber-pharma-admin` → `sa-cyber-pharma-admin-runtime`, service `cyber-pharma-admin-prod`, secrets `cyber-pharma-admin-*`)
3. Region (skill default `us-east1`)
4. Secret inventory & build-time vs runtime classification (Supabase URL/anon key are NEXT_PUBLIC → deploy.sh plaintext; service-role key if used → Secret Manager)
5. Invoker policy intent (public / domain-restricted / user-restricted) — staging for client review suggests public, but not assumed
6. Custom domain? (`{app}.cyberizedev.com` convention)

## Status
→ **Awaiting the project-fork answer + APPROVED before engaging `next-deploy-generate`.**
