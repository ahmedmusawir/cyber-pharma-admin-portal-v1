# Phase 4 Triggered — Domain Verification Plan (cyberizedev.com)
**Timestamp:** 2026-07-22 14:17:44 · **Session:** session_2026-07-22.md · **Status:** IN PROGRESS

## Trigger (EVIDENCE)
`gcloud beta run domain-mappings create` for mission-portal.cyberizedev.com refused:
"The provided domain does not appear to be verified for the current account. …
**You currently have no verified domains.**"
→ Operator's assume-not-verified call was correct. Phase 4 runs now, then Step 5.1 re-runs.

## Deviation from gcloud's suggestion (deliberate, surfaced)
gcloud suggested verifying `mission-portal.cyberizedev.com` (the subdomain). We verify the
**base domain `cyberizedev.com`** instead — one verification covers ALL current and future
subdomains (incl. the main Cyber Pharma app later). Subdomain-verification would repeat
Phase 4 for every future app. → Ledger note: SKILL.md Phase 4 should state this explicitly;
gcloud's error text actively misleads here.

## Steps (spoon-feed rhythm)
1. **4.1 (Actor A):** `gcloud domains verify cyberizedev.com` → opens Webmaster Central in
   browser (same Google account as gcloud!). Choose **DNS TXT record** method. Google shows
   `google-site-verification=…` value. **Do NOT click Verify yet.**
2. **4.2 (Actor A):** paste TXT value back → agent supplies exact DigitalOcean record
   (Networking → Domains → cyberizedev.com → TXT, hostname `@`, value as given, TTL 3600).
3. **Propagation check** before clicking Verify (dig TXT from operator terminal) — avoids
   burning verification attempts against unpropagated DNS.
4. **4.3:** click Verify in Webmaster Central → EVIDENCE = "verified" confirmation.
5. Re-run Step 5.1 (`gcloud beta run domain-mappings create …`) → continue Phase 5.

## Ledger status
Issue #9 candidate (gcloud suggests subdomain verification — misleading) will be appended to
agent_docs/SKILL_ISSUES_LEDGER_cloud_deployment.md with this phase's outcome.
