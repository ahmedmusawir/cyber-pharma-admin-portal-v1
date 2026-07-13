# Worked Example — Phases 0 → 1

This example shows the operator/agent dialogue for the first two phases of a deployment walkthrough, illustrating:
- Plan Mode environment summary at Phase 0
- Phase routing decision based on operator answers
- Step-by-step command provision (agent never executes)
- Operator pastes output, agent labels EVIDENCE / GAP / INFERENCE
- Explicit stop gates between phases

The same pattern continues through Phases 2–7 — agent provides commands, operator runs them and pastes output, agent labels what the output proves, stop gate before next phase.

---

```
Operator: Engage next-deploy-execute. Files are ready.

Agent: [Phase 0 — Pre-Flight]
        Confirm 5 deployment files exist:
        $ ls -la Dockerfile cloudbuild.yaml deploy.sh init-app.sh DEPLOYMENT_CHECKLIST.md
        Then answer:
        1. Have you run init-app.sh yet?
        2. First deploy or redeploy?
        3. First app on cyberizedev.com for this project, or domain already verified?

Operator: All 5 files present. init-app.sh not run yet. First deploy. Domain already
          verified — starkreads is the third app in this project.

Agent: EVIDENCE: 5 files confirmed. Path: 1 → 2 → 3 → 5 → 6 (skipping Phase 4 since
        domain already verified for this project). Proceed to Phase 1?

Operator: Proceed.

Agent: [Phase 1 — One-Time App Setup, Acting: Actor A]
        Step 1.1 — Make scripts executable:
        $ chmod +x init-app.sh deploy.sh

        Step 1.2 — Run init script:
        $ ./init-app.sh

        Paste the full output back here.

Operator: [pastes init-app.sh output showing 4 secrets created, runtime SA created,
           build SA bindings deferred with ⚠️ "no builds yet — grant after first build"]

Agent: EVIDENCE: 4 secrets created (starkreads-stripe-secret-key, starkreads-stripe-
        webhook-secret, starkreads-supabase-service-role-key, starkreads-resend-api-key).
        EVIDENCE: runtime SA sa-starkreads-runtime created.
        GAP: build SA bindings not yet granted — expected, will resolve in Phase 2.

        Step 1.3 — Update each secret with real value. Use echo -n (no trailing newline):

        $ echo -n 'sk_test_REAL_STRIPE_KEY' | gcloud secrets versions add \
            starkreads-stripe-secret-key --data-file=- --project nextjs-production-staging

        [...command for each of 4 secrets...]

        Step 1.4 — Spot-check one secret:
        $ gcloud secrets versions access latest --secret=starkreads-stripe-secret-key \
            --project nextjs-production-staging

        Confirm output is the real value, not the placeholder.

Operator: All 4 secrets updated. Spot-check returned real Stripe key. ✅

Agent: EVIDENCE: Phase 1 complete. Proceed to Phase 2?
```

---

## Notable patterns demonstrated

**Stop gates after every step where state changed.** Agent does not advance from Phase 1 → Phase 2 without operator's explicit "Proceed."

**Evidence labels.** "EVIDENCE: 4 secrets created" is what the operator's pasted output proves. "GAP: build SA bindings not yet granted" is the explicit unverified state — not glossed over.

**Actor naming.** Phase 1 explicitly names "Acting: Actor A" so the operator knows they're the one running the commands, not Cloud Build, not Cloud Run.

**Commands provided, not executed.** Every `$ gcloud ...` command is in a code block for the operator to copy/paste. Agent does not run them.
