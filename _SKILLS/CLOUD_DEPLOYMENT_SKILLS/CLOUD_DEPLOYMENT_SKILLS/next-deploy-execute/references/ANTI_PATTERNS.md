# Deployment Walkthrough Anti-Patterns

Skill-specific failure modes for `next-deploy-execute`. The agent loads this reference whenever it's about to take an action that risks one of these patterns. SKILL.md links here from the "Skill-Specific Anti-Patterns" section.

These supplement the Playbook-level anti-patterns (`APP_FACTORY_SKILLS_PLAYBOOK.md` Section 13). They are NOT replacements for those — they are additions specific to deployment walkthroughs.

---

## AP-E1: Executing Commands Instead of Providing Them

**Failure:** Running a `gcloud` command yourself (in your sandbox, in a tool call) instead of giving the operator the command to paste into their terminal.

**Why it fails:** You don't have credentials for the operator's GCP project. Even if you did, the operator must stay in the loop on every change to cloud state — this is the Tony Stark Protocol. Automation that removes the operator from the loop violates it.

**Correct pattern:** Always provide commands as code blocks. Operator runs them. Operator pastes output back. You label what the output proves.

---

## AP-E2: Auto-Granting IAM to "Fix" a Failure

**Failure:** A deploy fails at Stage 2 with "permission denied" on a build-time secret. You silently add `gcloud secrets add-iam-policy-binding ... --role=secretAccessor` and move on without telling the operator what changed.

**Why it fails:** The operator no longer knows what permissions are in their project. Six months later, an audit asks "why does the build SA have access to this secret?" and there's no documented answer. Drive-by IAM grants are a slow security failure.

**Correct pattern:** Surface the missing binding to the operator. Recommend the exact `gcloud add-iam-policy-binding` command. Let the operator run it consciously. Update the deployment log.

---

## AP-E3: Combining Build-Time and Runtime Identities in Reasoning

**Failure:** Saying "the service account has access to the secrets" without specifying WHICH service account (build SA vs runtime SA). They are different (Actor B vs Actor C). Build-time secrets need Actor B; runtime secrets need Actor C. A deploy can succeed at build, succeed at deploy, and 500 at runtime because the runtime SA was never granted access.

**Why it fails:** Conflating Actor B and Actor C is the #1 cause of "build succeeded, deploy succeeded, app errors" failures. The build-time check looks fine; the runtime check was never run.

**Correct pattern:** Always name the Actor. "Actor B (build SA `12345-compute@...`) has secretAccessor on `dockbloxx-woocom-key`" is precise. "The service account has access" is dangerous.

---

## AP-E4: Declaring Deployment Complete Before Phase 6

**Failure:** App responds 200 in browser, so you say "deployment complete!" — but the invoker policy was never explicitly set. The default may be `allUsers` (too open) or restrictive (operator gets sporadic 403s from logged-out browsers and can't reproduce).

**Why it fails:** Family CLAUDE.md Section 8 lists six completion criteria. Invoker policy is criterion 4. Skipping it because the app "seems to work" is exactly the kind of partial-success-treated-as-success that turns into production incidents.

**Correct pattern:** Phase 6 is mandatory. Invoker policy is set explicitly with EVIDENCE confirming the binding. Only then declare complete.

---

## AP-E5: Skipping Truth Commands Because "It Should Be Fine"

**Failure:** Skipping `gcloud builds describe` to find the build SA because "it's probably the default Cloud Build SA." Skipping `gcloud secrets get-iam-policy` because "init-app.sh should have set this up."

**Why it fails:** "Should be" is not "is." Defaults change between GCP projects (older projects use `PROJECT_NUMBER@cloudbuild.gserviceaccount.com`; newer ones use the default Compute SA; some use a custom build SA). Init scripts can fail silently. Truth Commands cost almost nothing to run; skipping them costs hours of debugging cryptic deploy failures.

**Correct pattern:** Family CLAUDE.md Section 4.5 (Truth Commands — Never Guess Cloud State) is doctrine. Run the verification. Label EVIDENCE. Move on.

---

## AP-E6: Forgetting the Two-Deploy Pattern on First Deploy Without Custom Domain

**Failure:** First deploy succeeds, app loads, but every internal link points to `https://pending-initial-deploy/...` because the placeholder URL was never updated.

**Why it fails:** `NEXT_PUBLIC_APP_URL` is baked into the build. The first build used the placeholder. The app on the running container has the placeholder hardcoded into its client JS. A redeploy with the real URL is required before the app is actually correct.

**Correct pattern:** Phase 3 Step 3.3 is mandatory unless a custom domain is being set up immediately. Confirm with the operator: "Are you setting up the custom domain now (Phase 5) or shipping with the `*.run.app` URL?" Either way, a second deploy follows. Don't declare Phase 3 complete after one deploy unless the URL is final.

---

## AP-E7: Trusting Operator Claims Over Verification Output

**Failure:** Operator says "I'm pretty sure the runtime SA has the right permissions." You log this as EVIDENCE and move on.

**Why it fails:** Operator memory is CLAIM, not EVIDENCE (family CLAUDE.md Section 4.4). The whole point of the evidence discipline is to distinguish what was actually checked from what someone thinks is true. Treating CLAIM as EVIDENCE collapses the distinction.

**Correct pattern:** "Got it — that's CLAIM. Let me confirm with the Truth Command:" then provide `gcloud secrets get-iam-policy ...`. Operator pastes output. NOW it's EVIDENCE.

---

## AP-E8: Suggesting Secrets Be Committed to Git

**Failure:** Telling the operator to put a secret value into `deploy.sh` "just for testing" or "as a fallback."

**Why it fails:** `deploy.sh` is checked into the repo. GitHub Push Protection often catches secrets in pushes and blocks them — but the secret is now in the local commit history regardless, requiring a history rewrite to remove. Even worse, secrets caught by push protection often leak through other channels (open PR diffs, CI logs, error reports).

**Correct pattern:** Secrets ALWAYS live in Secret Manager. `deploy.sh` contains only `NEXT_PUBLIC_*` plaintext values (which are public anyway), naming variables, and the execution block. If a secret needs to be rotated, that's `gcloud secrets versions add`, not editing a file.
