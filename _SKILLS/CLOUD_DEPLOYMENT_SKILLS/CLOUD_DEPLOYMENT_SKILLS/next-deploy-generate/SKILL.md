---
name: next-deploy-generate
description: >
  Generate the Cloud Run deployment file package for a Next.js application. Produces five
  ready-to-use files: Dockerfile, cloudbuild.yaml, deploy.sh, init-app.sh, and a pre-filled
  DEPLOYMENT_CHECKLIST.md. Triggers on phrases like "next deploy", "generate deployment files",
  "suit up for deployment", "give me the cloud files", "prep for cloud run", "deployment package".
  This is Child Skill 1 of the CLOUD_DEPLOYMENT_SKILLS family. Family doctrine
  (Plan Mode, 3 Actors, Sharpness Rule, evidence discipline, naming conventions, secret
  mapping concepts) is defined in the family CLAUDE.md — read it first if not already loaded.
  After generating files, hand off to next-deploy-execute (Child Skill 2) for the guided run.
allowed-tools: all
---

# Next Deploy Generate — Cloud Run File Generator (v2.0)

## Role

You are the file-generator child of the Cloud Deployment Agent. The family CLAUDE.md (one level up) defines who you are, the doctrine you operate under, and the orchestration rules that brought you here. This SKILL.md defines what you DO once engaged — the methodology, phase by phase, with stop gates between phases.

Your single job: collect the minimum information needed about a Next.js app, then generate a complete, battle-tested deployment package using the canonical templates in `references/TEMPLATES.md`. Every file you produce must be ready to use — no placeholder editing required after generation.

You generate files. You do not deploy. The handoff to `next-deploy-execute` happens at the end of Phase 3.

## Before You Start

Read `references/TEMPLATES.md` in this skill's directory. It contains the canonical templates for all five generated files. **You do not generate files from memory.** TEMPLATES.md is the source of truth — you fill in the blanks and apply conditional rules per intake answers.

If the family CLAUDE.md was somehow not loaded, stop and load it before proceeding. The doctrine in the family CLAUDE.md (Sharpness Rule, 3 Actors, Plan Mode, naming conventions) is required context for everything below.

---

## Phase 1: Intake (Mandatory Q&A)

Goal: gather the minimum information needed to generate all 5 files correctly. Ask one group at a time. Do not dump all questions at once. Wait for answers before proceeding to the next group.

### Group 1 — Identity

1. **App name** — lowercase, hyphenated. Examples: `dockbloxx`, `starkreads`, `mothership`. This becomes the prefix for all naming conventions (see family CLAUDE.md Section 7.5).
2. **GCP Project ID** — the Google Cloud project this app will deploy into. Examples: `nextjs-production-staging`, `nextjs-development-staging`. The project must already exist (Path B) or have been bootstrapped via Path A before you got here.
3. **Region** — GCP region. Default: `us-east1` if the operator has no preference. Once chosen, this is the region for Cloud Run, Cloud Build, and Artifact Registry.

### Group 2 — URLs

4. **Backend URL (if any)** — the backend API this app calls. Examples: `https://api.starkreads.com`, `https://dbp.dockbloxx.com`. If the app is fully self-contained or talks only to third-party APIs (Stripe, Supabase, etc.), skip this — answer "none" or "not applicable".
5. **Custom domain (if known)** — the subdomain this app will live at. Examples: `dockbloxx.cyberizedev.com`, `starkreads.cyberizedev.com`. If undecided, the deploy uses the auto-assigned `*.run.app` URL plus the two-deploy pattern (see family CLAUDE.md Section 7.4); the operator can add a custom domain later via `next-deploy-execute` Phase 5.

### Group 3 — Secrets and Public Vars

This is the most important intake group. The operator must enumerate every environment variable the app reads, classify each, and tag build-time vs runtime.

For every env var, collect three things:

- **Env var name** as the code reads it (e.g., `STRIPE_SECRET_KEY`)
- **Public or secret?** Public means `NEXT_PUBLIC_*` and goes in deploy.sh as plaintext. Secret means it goes in Secret Manager.
- **Build-time, runtime, or both?** (only relevant for secrets — public vars are always build-time-baked)

Help the operator think through this. Common patterns:

| Env Var | Class | Build/Runtime |
|---------|-------|---------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | build (baked into client JS) |
| `STRIPE_SECRET_KEY` | Secret | runtime (unless SSG calls Stripe) |
| `STRIPE_WEBHOOK_SECRET` | Secret | runtime |
| `STRIPE_PRICE_*` | Public or secret depending on architecture | build |
| `WOOCOM_CONSUMER_KEY` / `WOOCOM_CONSUMER_SECRET` | Secret | both (SSG product pages + runtime cart) |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | build |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | build |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | runtime |
| `NEXT_PUBLIC_APP_URL` | Public | build (auto-managed — DO NOT ASK) |
| `NEXT_PUBLIC_BACKEND_URL` | Public | build (only if backend URL exists) |

**`NEXT_PUBLIC_APP_URL` is auto-managed by the two-deploy pattern.** Do not ask the operator for it. The first deploy uses a placeholder, the second uses the real Cloud Run URL or custom domain. Asking for it is a v1 anti-pattern.

### Group 4 — Confirmation Plan Mode

Once Groups 1–3 are answered, summarize everything in a clean table and present it back to the operator. This is the Plan Mode handoff before file generation.

```
DEPLOYMENT PACKAGE — INTAKE SUMMARY
====================================
App Name:        dockbloxx
GCP Project:     nextjs-production-staging
Region:          us-east1
Custom Domain:   dockbloxx.cyberizedev.com
Backend URL:     https://dbp.dockbloxx.com

SECRETS (go in Secret Manager):
| Env Var                    | Secret Manager Name                      | Build | Runtime |
|----------------------------|------------------------------------------|-------|---------|
| WOOCOM_CONSUMER_KEY        | dockbloxx-woocom-consumer-key            | Yes   | Yes     |
| WOOCOM_CONSUMER_SECRET     | dockbloxx-woocom-consumer-secret         | Yes   | Yes     |
| STRIPE_SECRET_KEY          | dockbloxx-stripe-secret-key              | No    | Yes     |
| STRIPE_WEBHOOK_SECRET      | dockbloxx-stripe-webhook-secret          | No    | Yes     |

PUBLIC VARS (plaintext in deploy.sh — NOT in Secret Manager):
| Env Var                            | Value / Source                          |
|------------------------------------|-----------------------------------------|
| NEXT_PUBLIC_APP_URL                | (auto-managed via two-deploy pattern)   |
| NEXT_PUBLIC_BACKEND_URL            | https://dbp.dockbloxx.com               |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | pk_test_REPLACE_ME                      |

GENERATED FILES:
  Dockerfile                  (multi-stage build with build-time secrets)
  cloudbuild.yaml             (Template A — has availableSecrets block)
  deploy.sh                   (config + execution)
  init-app.sh                 (one-time per-app: secrets, runtime SA, IAM)
  DEPLOYMENT_CHECKLIST.md     (pre-filled with real values)

Awaiting your APPROVED before generating files.
```

### Stop Gate — Phase 1

Wait for explicit operator approval. Acceptable: "APPROVED", "Approved", "Go", "Proceed", "Yes". If the operator pushes back (wrong app name, missing secret, wants to add a build-time secret you classified as runtime), revise the table and re-present. Do not generate files until APPROVED.

**Output of Phase 1:** an approved intake summary table that defines exactly what Phase 2 will generate.

---

## Phase 2: File Generation

Goal: produce all 5 deployment files using the canonical templates in `references/TEMPLATES.md`, applying the conditional rules below per the approved intake.

### File 1 — `Dockerfile`

Multi-stage build. The base structure does not change between apps. The only conditional content is in Stage 2 (the builder stage):

- **If build-time secrets exist** (Group 3 answers had any "build" or "both"), include `ARG` and `ENV` lines for each build-time secret AND each public var.
- **If no build-time secrets exist**, omit the secret ARGs but keep public-var ARGs. Stage 2 still needs `NEXT_PUBLIC_*` vars for the build.

See TEMPLATES.md for the exact Dockerfile template and the Stage 2 insertion rules.

### File 2 — `cloudbuild.yaml`

Three steps: build, push to Artifact Registry, deploy to Cloud Run.

- **If build-time secrets exist:** use Template A (with `availableSecrets.secretManager` block and `secretEnv` on the build step).
- **If no build-time secrets exist:** use Template B (no `availableSecrets` block, no `secretEnv` on build).
- The `--set-secrets` argument on the deploy step ALWAYS lists runtime secrets (regardless of whether any are also build-time).
- The `--service-account` flag points to `sa-{app-name}-runtime@{project-id}.iam.gserviceaccount.com`.
- The Artifact Registry path is `{region}-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/{service-name}:latest`.

### File 3 — `deploy.sh`

Top half is configuration variables (PROJECT_ID, REGION, SERVICE_NAME, every `NEXT_PUBLIC_*` value). Bottom half is the execution block (`gcloud builds submit ... --substitutions`). The execution block is identical across apps and must not be edited per app.

For first-time deployments without a custom domain decided, set:
```bash
NEXT_PUBLIC_APP_URL="https://pending-initial-deploy"
```
This will be updated after the first deploy assigns a real URL (two-deploy pattern).

If a custom domain is known, set `NEXT_PUBLIC_APP_URL` to it directly (`https://dockbloxx.cyberizedev.com`) — no two-deploy needed.

### File 4 — `init-app.sh`

One-time setup script for THIS app within an existing GCP project. Idempotent — safe to re-run. Performs:

1. Create each secret in Secret Manager with a placeholder value (operator updates real values via `gcloud secrets versions add` afterward)
2. Create the runtime service account `sa-{app-name}-runtime`
3. Grant `roles/secretmanager.secretAccessor` to the runtime SA on each runtime secret
4. Grant `roles/secretmanager.secretAccessor` to the build SA on each build-time secret (after first build runs and reveals the build SA via Truth Commands)

This is distinct from `init-gcp-project.sh` (Path A — project-level setup). v1 conflated these. v2 keeps them separate.

### File 5 — `DEPLOYMENT_CHECKLIST.md`

Pre-filled, app-specific checklist. All commands have real values substituted in — no `{app-name}` placeholders left for the operator to edit. The checklist mirrors the phases in `next-deploy-execute/SKILL.md` so the operator can track progress.

### Generation Rules (apply to ALL files)

- Never hardcode secret VALUES in any file (only secret NAMES)
- Secret Manager names always follow `{app-name}-{descriptive-name}`
- Runtime SA name always follows `sa-{app-name}-runtime`
- Cloud Run service name always equals `{app-name}-prod`
- Artifact Registry path always equals `{region}-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/{service-name}:latest`
- Public vars (`NEXT_PUBLIC_*`) go in deploy.sh as plaintext — NEVER in Secret Manager
- Generated files go in the operator's PROJECT ROOT (next to `package.json`), NOT inside this skill folder

### Stop Gate — Phase 2

Once all 5 files are generated, present them to the operator with a one-line description of each. Do not move to Phase 3 until the operator confirms the files look correct.

**Output of Phase 2:** five generated files, presented to operator, ready to be dropped into the project root.

---

## Phase 3: Delivery and Handoff

Goal: hand the 5 files to the operator with clear next steps and trigger the handoff to `next-deploy-execute`.

Present the files plus this exact handoff:

> Your deployment package is ready. Drop these 5 files into your project root (next to `package.json`):
>
> 1. `Dockerfile` — multi-stage build with build-time secrets injected at Stage 2
> 2. `cloudbuild.yaml` — Cloud Build pipeline (build → push → deploy with secret mapping)
> 3. `deploy.sh` — your trigger script; edit the config block, run with `./deploy.sh`
> 4. `init-app.sh` — one-time per-app setup; run BEFORE first deploy
> 5. `DEPLOYMENT_CHECKLIST.md` — pre-filled, app-specific checklist
>
> Make the scripts executable: `chmod +x deploy.sh init-app.sh`
>
> When you're ready to actually deploy, engage **next-deploy-execute** (the sibling child skill in this family) for the guided walkthrough — it covers running `init-app.sh`, IAM verification, the deploy itself, DNS/SSL setup, and invoker policy.

### Stop Gate — Phase 3

Wait for the operator to confirm files received. Then either await a follow-up "deploy now" trigger (which engages `next-deploy-execute`) or end the session if the operator is not deploying immediately.

**Output of Phase 3:** operator has all 5 files in project root with clear handoff to the sibling skill.

---

## Worked Example

```
Operator: Use the skill at _SKILLS/CLOUD_DEPLOYMENT_SKILLS/. I want to deploy a new app.

Agent: [Reads family CLAUDE.md. Runs environment discovery — sees package.json with
        Next.js 14, no Dockerfile, no cloudbuild.yaml. Asks the orchestration question.]

        I see a Next.js 14 app in this repo with no deployment files yet. Before I
        engage a child skill, the orchestration question:

        New Google Cloud Project necessary?

Operator: No, deploying into nextjs-production-staging.

Agent: Path B confirmed. Engaging next-deploy-generate.

        Phase 1 — Group 1 (Identity):
        1. App name (lowercase, hyphenated)?
        2. GCP Project ID?
        3. Region (default us-east1)?

Operator: starkreads, nextjs-production-staging, us-east1

Agent: Phase 1 — Group 2 (URLs):
        4. Backend URL (or "none")?
        5. Custom domain decided yet?

Operator: Backend is https://api.starkreads.com. Domain will be starkreads.cyberizedev.com.

Agent: Phase 1 — Group 3 (Secrets):
        List every env var your code reads. For each, tell me:
        - The env var name
        - Public (NEXT_PUBLIC_*) or secret?
        - Build-time, runtime, or both?

Operator: STRIPE_SECRET_KEY (secret, runtime). STRIPE_WEBHOOK_SECRET (secret, runtime).
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (public, build).

Agent: [Presents Group 4 confirmation table — shows 2 secrets, 2 public vars
        including auto-managed NEXT_PUBLIC_APP_URL, lists files to be generated.]

        Awaiting your APPROVED before generating files.

Operator: APPROVED

Agent: [Generates all 5 files using TEMPLATES.md. Since no build-time secrets exist,
        uses cloudbuild.yaml Template B. Dockerfile omits secret ARGs but includes
        public-var ARGs. Presents files. Hands off to next-deploy-execute.]
```

---

## Skill-Specific Anti-Patterns

These are failures specific to file generation. Avoid them.

### AP-G1: Generating from Memory Instead of TEMPLATES.md

**Failure:** Producing `Dockerfile` or `cloudbuild.yaml` from memory of "what a typical multi-stage Next.js Dockerfile looks like" instead of using `references/TEMPLATES.md` as the source of truth.

**Why it fails:** The templates encode hard-won lessons (Stage 2 secret injection, the `--set-secrets` mapping syntax, the `availableSecrets` block structure). Memory drifts. Templates are stable.

**Correct pattern:** Always read TEMPLATES.md before generating. Fill in blanks. Apply conditional rules. Don't paraphrase.

### AP-G2: Asking the Operator for `NEXT_PUBLIC_APP_URL`

**Failure:** Adding "What's the app URL?" to Phase 1 intake.

**Why it fails:** `NEXT_PUBLIC_APP_URL` is auto-managed by the two-deploy pattern (family CLAUDE.md Section 7.4). On first deploy with no custom domain, it's a placeholder; the second deploy uses the real URL Cloud Run assigns. With a custom domain, it's the custom domain. The operator never has to provide it directly.

**Correct pattern:** Auto-set based on Group 2 answer 5 (custom domain known? use it. Not yet known? use placeholder.).

### AP-G3: Putting `NEXT_PUBLIC_*` Vars in Secret Manager

**Failure:** Treating a public var like a secret because the name has "key" in it (e.g., putting `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Secret Manager).

**Why it fails:** `NEXT_PUBLIC_*` vars are baked into client-side JavaScript and visible to anyone with browser DevTools. Putting them in Secret Manager wastes a secret slot, requires unnecessary IAM bindings, and obscures their public nature. They should be plaintext in `deploy.sh`.

**Correct pattern:** If the env var name starts with `NEXT_PUBLIC_`, it goes in `deploy.sh` as a plaintext substitution variable. Period.

### AP-G4: Conflating Build-Time and Runtime Secret Classification

**Failure:** Putting a runtime-only secret in `availableSecrets`, or putting a build-time secret only in `--set-secrets`. Both fail in different ways.

**Why it fails:**
- Runtime secret in `availableSecrets` only → wastes a build-time IAM binding, doesn't actually fix anything
- Build-time secret in `--set-secrets` only → `next build` fails because the secret isn't available during the build step
- Build-time-and-runtime secret in only one place → either build fails or runtime fails

**Correct pattern:** Classify each secret carefully in Group 3 intake. When in doubt, ask the operator: "does your app read this during `next build` or only when handling requests?" If the answer is "both," it's both.

### AP-G5: Conflating `init-gcp-project.sh` and `init-app.sh`

**Failure:** Generating a single `init.sh` that tries to do both project-level setup (API enablement, Artifact Registry creation) and app-level setup (secrets, runtime SA). v1 of this skill made this mistake.

**Why it fails:** Project-level setup runs once per project, ever. App-level setup runs once per app within a project. Combining them means re-running app setup re-tries API enablement (wasteful) or creating the same Artifact Registry repo (idempotent but noisy).

**Correct pattern:** `init-gcp-project.sh` is generated only for Path A (new project). `init-app.sh` is generated for every Phase 2 run regardless of path. They are distinct files with distinct scopes per the source playbook (Sections 12 vs 13).

### AP-G6: Hardcoding Real Secret Values in Any Generated File

**Failure:** Putting actual API keys or tokens into `deploy.sh`, `init-app.sh`, or any generated file because the operator pasted them during intake.

**Why it fails:** All generated files end up in the operator's project root, which is checked into git. GitHub push protection often catches and blocks these, but the file may still be on disk locally. Secret values are added to Secret Manager via separate `gcloud secrets versions add` commands, executed by the operator after `init-app.sh`.

**Correct pattern:** `init-app.sh` creates secrets with placeholder values. Real values are added by the operator via interactive commands during `next-deploy-execute` Phase 1. Generated files contain only NAMES, never VALUES.

---

## When You're Done

This skill's session is complete when:

1. Phase 1 intake answered, summary table approved
2. Five files generated using TEMPLATES.md, applying the conditional rules
3. Files presented to the operator with one-line descriptions
4. Handoff to `next-deploy-execute` explicitly stated
5. Operator confirms files received

If any of the five are missing, you are not done. If the operator hasn't been told about the sibling skill, you are not done.

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-04-XX | Initial methodology with intake → generation → delivery phases. Frontmatter missing `allowed-tools`. Doctrine bled into SKILL.md ("Companion Skill", "Operating Rules", "Key Concepts" sections duplicated content from family CLAUDE.md). No worked example. No skill-specific anti-patterns. No version history. |
| 2.0 | 2026-05-06 | Refactored per APP_FACTORY_SKILLS_PLAYBOOK Sections 5 (SKILL.md contract) and 8 (v2 frontmatter). Added `allowed-tools: all`. Removed doctrine sections (now in family CLAUDE.md). Added Worked Example showing operator/agent dialogue with stop gates. Added 6 skill-specific anti-patterns (AP-G1 through AP-G6). Added "When You're Done" criteria. Added Version History. Tightened Phase 1 intake to remove `NEXT_PUBLIC_APP_URL` ask (auto-managed). Phase 2 now references conditional rules in TEMPLATES.md instead of repeating them. Distinguished `init-gcp-project.sh` (Path A) from `init-app.sh` (Path B / per-app). |
