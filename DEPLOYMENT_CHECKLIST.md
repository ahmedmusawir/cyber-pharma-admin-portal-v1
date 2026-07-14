# Deployment Checklist — Cyph Mission Control

**App:** `cyph-mission-ctrl` · **Service:** `cyph-mission-ctrl-prod` · **Project:** `cyberize-nextjs-staging` · **Region:** `us-east1` · **Domain:** `mission-portal.cyberizedev.com`

---

## 1. Pre-Flight

- [ ] Files in project root: `Dockerfile`, `cloudbuild.yaml`, `deploy.sh`, `init-app.sh`
- [ ] `output: "standalone"` present in `next.config.js` (required by Dockerfile Stage 3)
- [ ] Scripts executable: `chmod +x deploy.sh init-app.sh`
- [ ] Authenticated: `gcloud auth list`
- [ ] Correct project: `gcloud config get-value project` → should show `cyberize-nextjs-staging`

## 2. One-Time Setup

- [ ] Run `./init-app.sh`
- [ ] Update the secret with the real value (paste the actual Supabase secret key from `.env.local`):
  ```bash
  echo -n 'REAL_SUPABASE_SECRET_KEY' | gcloud secrets versions add cyph-mission-ctrl-supabase-secret-key --data-file=- --project cyberize-nextjs-staging
  ```
- [ ] Verify secret exists:
  ```bash
  gcloud secrets list --project cyberize-nextjs-staging --filter="name:cyph-mission-ctrl"
  ```

## 3. First Deploy

- [ ] Run `./deploy.sh`
- [ ] Custom domain is known upfront → `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` are already `https://mission-portal.cyberizedev.com` — NO two-deploy dance needed
- [ ] Note the auto-assigned `*.run.app` URL from output (works immediately, before DNS)
- [ ] Verify app loads at the `*.run.app` URL (login page; cookies need the custom domain + HTTPS to be fully correct)

## 4. DNS + SSL

- [ ] Create domain mapping:
  ```bash
  gcloud run domain-mappings create --service cyph-mission-ctrl-prod --domain mission-portal.cyberizedev.com --region us-east1 --project cyberize-nextjs-staging
  ```
- [ ] Get DNS records:
  ```bash
  gcloud run domain-mappings describe --domain mission-portal.cyberizedev.com --region us-east1 --project cyberize-nextjs-staging
  ```
- [ ] Add CNAME in DigitalOcean: hostname=`mission-portal`, value=`ghs.googlehosted.com.`, TTL=3600
- [ ] Wait 15–30 min for Google-managed SSL
- [ ] Verify: `curl -I https://mission-portal.cyberizedev.com`

## 5. Invoker Policy (PUBLIC)

- [ ] Set access:
  ```bash
  gcloud run services add-iam-policy-binding cyph-mission-ctrl-prod --project cyberize-nextjs-staging --region us-east1 --member="allUsers" --role="roles/run.invoker"
  ```
- [ ] Verify:
  ```bash
  gcloud run services get-iam-policy cyph-mission-ctrl-prod --project cyberize-nextjs-staging --region us-east1 --format="yaml(bindings)"
  ```

## 6. Done

- [ ] App loads at `https://mission-portal.cyberizedev.com` with valid SSL
- [ ] Login works with real Supabase (super-admin gate)
- [ ] All 9 Mission Control screens work
- [ ] Runtime secret accessible (Phase-2 infra — `SUPABASE_SECRET_KEY` mapped; unused by code today, verified by deploy success)
