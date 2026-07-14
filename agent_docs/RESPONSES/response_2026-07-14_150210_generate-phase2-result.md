# next-deploy-generate — Phase 2 Result (files generated)
**Timestamp:** 2026-07-14 15:02:10 · **Session:** session_2026-07-14.md · **Status:** COMPLETE, at Phase-2 stop gate

## Files generated (project root, from TEMPLATES.md)
| File | Description |
|---|---|
| `Dockerfile` | 3-stage build; Stage 2 carries public-var ARGs only (no build-time secrets); Stage 3 standalone runner, non-root `nextjs` user, port 3000 |
| `cloudbuild.yaml` | Template B (no availableSecrets) — build → push → deploy; `--set-secrets SUPABASE_SECRET_KEY=cyph-mission-ctrl-supabase-secret-key:latest`; runtime SA `sa-cyph-mission-ctrl-runtime`; 1Gi / max 1 instance |
| `deploy.sh` | Config block prefilled (project, region, service, 4 public vars incl. domain URL); canonical execution block untouched; chmod +x done |
| `init-app.sh` | Idempotent one-time app setup: creates `cyph-mission-ctrl-supabase-secret-key` (placeholder value), runtime SA, runtime-SA secretAccessor binding; build-SA section notes "none required"; chmod +x done |
| `DEPLOYMENT_CHECKLIST.md` | Pre-filled, copy-pasteable — 6 sections mirroring next-deploy-execute phases, incl. DigitalOcean CNAME `mission-portal → ghs.googlehosted.com.` |

## Surfaced deviations & gaps (operator decision needed on #1)
1. **🔴 BLOCKER — `next.config.js` lacks `output: "standalone"`.** Dockerfile Stage 3 copies `.next/standalone/` — without this setting the build produces no standalone dir and the image build FAILS. Read-Only Boundary (doctrine §4.7) forbids me touching next.config.js unprompted. One-line fix: add `output: "standalone",` to nextConfig. → Operator: approve me to add it, or add it yourself.
2. **Template deviation — `node:18-alpine` → `node:22-alpine`** (all 3 stages). EVIDENCE: package.json has next ^16.2.1; Next 16 requires Node ≥ 20 — node:18 would fail the engines check at `npm ci`/build. Local dev runs v24; 22 is current LTS in containers. → TEMPLATES.md trickle-up.
3. **Extra public var — `NEXT_PUBLIC_SITE_URL`** added alongside canonical `NEXT_PUBLIC_APP_URL` (both = `https://mission-portal.cyberizedev.com`). EVIDENCE: this app's code reads SITE_URL (server.ts:7, drives the `secure` cookie flag); template mandates APP_URL always present. Both baked at build; APP_URL is inert for this app but keeps the template contract.
4. **Public values prefilled** in deploy.sh/cloudbuild substitutions (Supabase URL + `sb_publishable_*` key) — client-exposed by design, per AP-G3/AP-G6 these belong in plaintext. Secret VALUE was never read; init-app.sh creates it with a placeholder, operator adds the real value via `gcloud secrets versions add` (checklist §2).

## Stop gate
Phase-2 gate: operator confirms files look correct → Phase 3 handoff to next-deploy-execute.
