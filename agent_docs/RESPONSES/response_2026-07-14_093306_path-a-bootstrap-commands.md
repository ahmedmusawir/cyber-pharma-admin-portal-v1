# Path A — Project Bootstrap Command Block (guided, operator-executed)
**Timestamp:** 2026-07-14 09:33:06 · **Session:** session_2026-07-14.md · **Status:** APPROVED → IN PROGRESS

## Locked decisions
| Item | Value |
|---|---|
| Project ID | `cyberize-nextjs-staging` |
| Region | `us-east1` |
| App name | `cyph-mission-ctrl` |
| Service | `cyph-mission-ctrl-prod` |
| Runtime SA | `sa-cyph-mission-ctrl-runtime@cyberize-nextjs-staging.iam.gserviceaccount.com` |
| Invoker | PUBLIC |
| Domain | subdomain of cyberizedev.com — exact name TBD (suggest `cyph-mission-ctrl.cyberizedev.com`) |
| Secrets | agent verifies from code at generate intake |

## Pre-flight findings
1. **GAP/QUESTION — gcloud CLI not found in the agent shell.** `gcloud`, `gsutil`, `bq` all absent from PATH; no `~/.config/gcloud` directory exists. INFERENCE: the CLI is likely not installed on this machine (not just a PATH issue). Operator must confirm — run `gcloud --version` in your terminal (or `! gcloud --version` in-session). If missing: install via https://cloud.google.com/sdk/docs/install, then `gcloud init` + `gcloud auth login`.
2. **SKILL DRIFT (flagged, non-blocking):** family CLAUDE.md references `init-gcp-project.sh` and `install-gcloud.sh` templates in TEMPLATES.md, but TEMPLATES.md v2 contains only Templates 1–5 (Dockerfile, cloudbuild ×2, deploy.sh, init-app.sh, DEPLOYMENT_CHECKLIST). Bootstrap is guided manually per CLAUDE.md §5.2 (explicitly permitted: "or guide manual project/billing/API setup"). → skill trickle-up ledger.

## Bootstrap commands (Actor A — you, in your terminal; paste output back after each step)

**Step 1 — Create the project** (one-time; fails loudly if ID is taken globally):
```bash
gcloud projects create cyberize-nextjs-staging
```

**Step 2 — Attach billing** (Cloud Build/Run refuse to enable without it):
```bash
gcloud billing accounts list
gcloud billing projects link cyberize-nextjs-staging --billing-account=BILLING_ACCOUNT_ID
```
(Replace `BILLING_ACCOUNT_ID` with the `ACCOUNT_ID` from the list output — format `XXXXXX-XXXXXX-XXXXXX`.)

**Step 3 — Set as active project** (so subsequent commands target it):
```bash
gcloud config set project cyberize-nextjs-staging
```

**Step 4 — Enable the 5 required APIs** (build robot, run platform, image store, secret store, IAM):
```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com iam.googleapis.com
```

**Step 5 — Create the shared Docker repo** (where Cloud Build pushes images; shared by all apps in this project):
```bash
gcloud artifacts repositories create cloud-run-source-deploy --repository-format=docker --location=us-east1 --project=cyberize-nextjs-staging
```

**Step 6 — Verify (Truth Commands):**
```bash
gcloud projects describe cyberize-nextjs-staging --format="value(projectId,lifecycleState)"
gcloud services list --enabled --project=cyberize-nextjs-staging | grep -E "cloudbuild|run|artifactregistry|secretmanager|iam"
gcloud artifacts repositories list --project=cyberize-nextjs-staging --location=us-east1
```

## After bootstrap verifies green
→ Engage `next-deploy-generate` (read its SKILL.md, run intake incl. secret classification from code, generate the 5 files).
