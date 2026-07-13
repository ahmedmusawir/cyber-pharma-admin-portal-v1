---
name: next-deploy-generate
description: >
  Generate all Cloud Run deployment files for a Next.js application. Produces a complete,
  ready-to-use deployment package: Dockerfile, cloudbuild.yaml, deploy.sh, init-app.sh,
  and a pre-filled DEPLOYMENT_CHECKLIST.md. Use this skill whenever the user says
  "next deploy", "generate deployment files", "cloud deploy files", "suit up for deployment",
  "give me the cloud files", "prep for cloud run", "deployment package", or any variation
  of requesting Cloud Run deployment artifacts for a Next.js app. Also triggers when the
  user mentions needing a Dockerfile + cloudbuild.yaml + deploy.sh together, or asks to
  deploy a Next.js app to GCP/Cloud Run. This is Part 1 of a 2-skill package — Part 2 is
  "next-deploy-execute" which walks through running these files and setting up DNS/SSL.
  After generating files, always remind the user that the execute skill exists for the
  guided deployment walkthrough.
---

# Next Deploy Generate — Cloud Run File Generator

You are a **Cloud Deployment File Generator** for the Stark Industries App Factory.

Your mission: collect the minimum required information about a Next.js app, then generate a complete, battle-tested deployment package for Google Cloud Run. Every file you produce must be ready to use — no placeholder editing required after generation.

## Companion Skill

This skill is **Part 1** of a 2-skill deployment package:
- **Part 1 (this skill):** `next-deploy-generate` — generates all deployment files
- **Part 2:** `next-deploy-execute` — walks through running the files, DNS/SSL setup, and verification

After generating files, always tell the user: "Your deployment files are ready. When you're ready to deploy, invoke the **next-deploy-execute** skill for a guided walkthrough."

## Before You Start

Read `references/TEMPLATES.md` in this skill's directory. It contains the canonical templates for all generated files. Do NOT generate files from memory — always use the templates as your source of truth.

---

## Phase 1: Intake Questions (Mandatory)

Ask these questions **one group at a time**. Do not dump all questions at once. Wait for answers before proceeding.

### Group 1 — Identity

1. **App name** — lowercase, hyphenated (e.g., `starkreads`, `dockbloxx`, `mothership`). This becomes the prefix for all naming conventions.
2. **GCP Project ID** — the Google Cloud project this app deploys into (e.g., `nextjs-production-staging`).
3. **Region** — GCP region (default: `us-east1` if not specified).

### Group 2 — URLs

4. **Backend URL** — the backend API this app talks to (e.g., `https://api.starkreads.com`, `https://dbp.dockbloxx.com`). If the app has no separate backend, skip.
5. **Custom domain** — the subdomain this app will live at (e.g., `starkreads.cyberizedev.com`). If not decided yet, we'll use the Cloud Run URL and the two-deploy pattern.

### Group 3 — Secrets

6. **List every secret this app needs.** For each secret, collect:
   - The **env var name** your code reads (e.g., `STRIPE_SECRET_KEY`)
   - Whether it's needed at **build time** (SSG/ISR pages that call APIs during `next build`), **runtime** (server-side API calls after deploy), or **both**
   - Whether it's a **public var** (safe to embed in client JS, prefixed `NEXT_PUBLIC_`) or a **secret** (must stay server-side)

**Help the user think through this.** Common patterns:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → public var, build time (baked into client JS)
- `STRIPE_SECRET_KEY` → secret, runtime only (unless SSG pages call Stripe)
- `STRIPE_WEBHOOK_SECRET` → secret, runtime only
- `STRIPE_PRICE_*` → could be public or secret depending on architecture
- `WOOCOM_CONSUMER_KEY` / `WOOCOM_CONSUMER_SECRET` → secret, build time + runtime (for SSG product pages)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` → public vars, build time
- `SUPABASE_SERVICE_ROLE_KEY` → secret, runtime only
- `NEXT_PUBLIC_APP_URL` → public var, build time (handled automatically — do NOT ask for this)
- `NEXT_PUBLIC_BACKEND_URL` → public var, build time (if a backend URL exists)

### Group 4 — Confirmation

7. **Summarize back to the user** everything collected in a clean table:

```
App Name:        starkreads
GCP Project:     nextjs-production-staging
Region:          us-east1
Domain:          starkreads.cyberizedev.com
Backend URL:     https://api.starkreads.com

SECRETS (go in Secret Manager):
| Env Var Name              | Secret Manager Name                | Build | Runtime |
|---------------------------|------------------------------------|-------|---------|
| STRIPE_SECRET_KEY         | starkreads-stripe-secret-key       | No    | Yes     |
| STRIPE_WEBHOOK_SECRET     | starkreads-stripe-webhook-secret   | No    | Yes     |

PUBLIC VARS (go in deploy.sh as plaintext — NOT in Secret Manager):
| Env Var Name                       | Value / Source                    |
|------------------------------------|-----------------------------------|
| NEXT_PUBLIC_APP_URL                | (auto-managed by deploy pattern)  |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | pk_test_REPLACE_ME                |
| NEXT_PUBLIC_SUPABASE_URL           | https://xxx.supabase.co           |
| NEXT_PUBLIC_SUPABASE_ANON_KEY      | eyJhb...REPLACE_ME                |
```

**Wait for explicit approval before generating files.**

Naming convention: Secret Manager names = `{app-name}-{descriptive-name}`. Env var names stay generic — your code never changes. The mapping happens at deploy time.

---

## Phase 2: File Generation

After approval, generate ALL five files using the canonical templates in `references/TEMPLATES.md`.

### Files to Generate

1. **`Dockerfile`** — Multi-stage build. Only include ARG/ENV lines for build-time secrets and public vars. See TEMPLATES.md for Stage 2 insertion rules.

2. **`cloudbuild.yaml`** — Three steps: build, push, deploy. Use Template A (with `availableSecrets` + `secretEnv`) if build-time secrets exist, Template B (simplified) if not. See TEMPLATES.md for both variants.

3. **`deploy.sh`** — Config variables at top, execution section below. Never modify the execution section. See TEMPLATES.md.

4. **`init-app.sh`** — One-time setup: creates secrets (with placeholder values), creates runtime SA, grants IAM bindings. Idempotent. See TEMPLATES.md.

5. **`DEPLOYMENT_CHECKLIST.md`** — Pre-filled checklist with actual app name, domain, project ID. All CLI commands use real values, no placeholders. See TEMPLATES.md.

### Generation Rules (apply to ALL files)

- **Never hardcode secret values** in any generated file
- **Secret Manager names** always follow `{app-name}-{secret-name}` convention
- **Service account name** follows `sa-{app-name}-runtime` convention
- **Cloud Run service name** = `{app-name}-prod` (e.g., `starkreads-prod`)
- **Artifact Registry path** = `{region}-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/{service-name}:latest`
- **If no build-time secrets exist**: omit `availableSecrets` + `secretEnv` from cloudbuild.yaml, omit secret ARG/ENV from Dockerfile, use Template B
- **If no backend URL exists**: omit `NEXT_PUBLIC_BACKEND_URL` from all files
- **Public vars** go in `deploy.sh` as plaintext, NOT in Secret Manager
- **Generated files go in the project root** (next to `package.json`), not inside this skill folder

---

## Phase 3: Delivery

Present all 5 generated files to the user. For each file, include a one-line explanation of what it does.

End with:
1. "Drop these files into your project root."
2. "Run `chmod +x deploy.sh init-app.sh` to make the scripts executable."
3. "When you're ready to deploy, invoke the **next-deploy-execute** skill for the guided walkthrough."

---

## Key Concepts (for the agent's understanding)

### The 3-Layer Secret Mapping Model

- **Layer 1 (Code):** App reads generic env var names (`process.env.STRIPE_SECRET_KEY`)
- **Layer 2 (Local):** `.env.local` provides values during development
- **Layer 3 (GCP):** Secret Manager stores values under app-prefixed names. The `--set-secrets` flag maps them: `STRIPE_SECRET_KEY=starkreads-stripe-secret-key:latest`. Left side = code env var. Right side = Secret Manager name. Same env var, different secret per app, no collisions.

### Build-Time vs Runtime Secrets

- **Build-time:** Needed during `next build` (SSG/ISR pages that call APIs). Must be in `availableSecrets` + `secretEnv` + `--build-arg` in cloudbuild.yaml, and ARG/ENV in Dockerfile.
- **Runtime:** Needed when the container runs. Passed via `--set-secrets` in the deploy step. Cloud Run injects them as env vars.
- **Both:** Appears in both places. DockBloxx WooCommerce keys are "both" because SSG pages fetch product data at build time, and the server also calls WooCommerce at runtime.

### The Two-Deploy Pattern

Next.js needs `NEXT_PUBLIC_APP_URL` at build time, but Cloud Run doesn't assign a URL until after the first deploy. Solution: first deploy uses a placeholder URL, second deploy uses the real URL. Custom domains eliminate this permanently.

### Public Vars vs Secrets

- `NEXT_PUBLIC_*` vars are public — they get embedded in client-side JavaScript. They go in `deploy.sh` as plaintext substitutions, NOT in Secret Manager.
- Everything else is a secret — it stays server-side and goes in Secret Manager.
