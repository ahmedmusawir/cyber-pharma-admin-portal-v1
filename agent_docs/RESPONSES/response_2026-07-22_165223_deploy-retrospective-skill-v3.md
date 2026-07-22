# DEPLOYMENT RUN RETROSPECTIVE — cyph-mission-ctrl → Cloud Run
## Lessons-Learned Report + CLOUD_DEPLOYMENT_SKILLS v3 Rebuild Input

**Timestamp:** 2026-07-22 16:52 (+06) · **Status:** DEPLOY COMPLETE — ALL 6 FAMILY CRITERIA GREEN
**Run:** Path A first deploy · repo `cyber-pharma-admin-portal-v1` · branch `gcs-deploy-2`
**Sources:** SKILL_ISSUES_LEDGER_cloud_deployment.md (9 issues) · session_2026-07-13/14/21/22.md ·
10 response artifacts · skill v2 files under `_SKILLS/CLOUD_DEPLOYMENT_SKILLS/CLOUD_DEPLOYMENT_SKILLS/`

---

## 1. Executive Summary

The full pipeline — project bootstrap → file generation → init → build/deploy → domain
verification → DNS+SSL — is **DONE and verified**. Final evidence (2026-07-22 10:45 UTC):

```
curl -I https://mission-portal.cyberizedev.com
HTTP/2 307 · location: /dashboard · server: Google Frontend   ← valid managed SSL, app serving
```

**Verdict on skill v2:** the *doctrine* held up (3-actor model, evidence discipline, stop
gates, truth commands — zero doctrine failures across 9 issues). The *mechanics* did not:
every hard failure was either a template bug (#3, #5), doc drift (#1), or **GCP platform
drift** — commands and defaults that changed under the skill since it was written
(#2, #4, #6, #7, #9). v3's job is a mechanics refresh, not a redesign.

**One item is still OPEN on this project:** the build-SA `run.admin` grant (Issue #7,
"the permission we missed after project creation") — §5 below has the exact closing commands.

---

## 2. Final Shipped State (Phase 7 completion record)

| Item | Value | Evidence |
|---|---|---|
| GCP project | `cyberize-nextjs-staging` (524380376459) | created 07-14, billing linked |
| Service | `cyph-mission-ctrl-prod` · us-east1 · rev 00001-l6d | Cloud Build d91e573b SUCCESS 10m17s |
| run.app URL | https://cyph-mission-ctrl-prod-524380376459.us-east1.run.app | operator smoke test GREEN 07-22 |
| Custom domain | https://mission-portal.cyberizedev.com | HTTP/2 307 → /dashboard over valid SSL |
| DNS | DigitalOcean CNAME `mission-portal` → `ghs.googlehosted.com.` (TTL 3600) | dig +short confirmed |
| Domain verification | BASE domain `cyberizedev.com` (Webmaster Central, DNS TXT) | mapping create accepted |
| Invoker | PUBLIC (`allUsers` → roles/run.invoker) | get-iam-policy pasted 07-21 |
| Runtime SA | `sa-cyph-mission-ctrl-runtime` + secretAccessor on `supabase-secret-key` | policy pasted 07-21 |
| Secrets | 1 runtime (supabase-secret-key, v2 real value) · 0 build-time | deploy healthy |
| Smoke test | login · dashboard · charts · seed data · SSR cookies · live role gate | operator verdict 07-22 |

Family completion scoreboard (family CLAUDE.md §8): **6/6 EVIDENCE ✅**

---

## 3. Run Timeline (condensed)

| Date | Milestone |
|---|---|
| 07-13 | Skill activated · Path A chosen · plan approved |
| 07-14 | Project bootstrap (project, billing, 5 APIs, AR repo) · generate intake · 5 files generated |
| 07-21 | `output:"standalone"` blocker cleared · init-app.sh (2 runs, IAM race) · deploy.sh fixed + deployed · 403/invoker saga · Phase 6 pulled forward |
| 07-22 | Operator smoke test GREEN · Phase 5 start · Issue #6 (beta) · Phase 4 triggered + base-domain verified · mapping created · CNAME live · SSL issued · **DONE** |

Two CLI crashes occurred mid-run; both recoveries were clean off RECOVERY.md + session files.

---

## 4. Issue-by-Issue Analysis (all 9, grouped by theme)

### Theme A — Doc drift inside the skill itself

**#1 · CLAUDE.md references templates that don't exist** (Activation, 07-14)
Family CLAUDE.md names `init-gcp-project.sh` + `install-gcloud.sh`; TEMPLATES.md v2 has
neither. Worked around via manual guided bootstrap per §5.2.
→ **v3:** ship both templates OR delete the references. A skill must never cite its own
missing files — it burns trust at activation, minute one.

### Theme B — Template bugs (would bite every future run)

**#3 · No `output: "standalone"` pre-check** (Generate, 07-14)
Template Dockerfile Stage 3 copies `.next/standalone/` — repo didn't produce it. Caught by
reading, not by the skill; a generated package that cannot build was still "delivered".
→ **v3:** generate SKILL.md Phase 1 intake gets a hard gate: read next.config.js, require
`output: "standalone"` (or propose the one-line add + local build proof) BEFORE Phase 2.

**#5 · deploy.sh `--substitutions` continuation-line bug** (Phase 3, 07-21)
TEMPLATES.md Template 3 splits `--substitutions` across `,\` continuation lines; bash keeps
each line's leading indent → separate argv tokens → gcloud "unrecognized arguments". Bites
whenever there is >1 substitution line — i.e., essentially always.
→ **v3:** rewrite Template 3 execution block as a string-builder:
```bash
SUBSTITUTIONS="_SERVICE_NAME=${SERVICE_NAME}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}"
# ...one += per var...
gcloud builds submit --config cloudbuild.yaml --substitutions "${SUBSTITUTIONS}" ...
```

### Theme C — GCP platform drift (the big one: the cloud moved under the skill)

**#2 · Dockerfile pins `node:18-alpine`; Next 16 needs Node ≥ 20** (Generate, 07-14)
→ **v3:** parameterize Node version; detect from `package.json` engines / Next major.
Generated this run with `node:22-alpine` — make that the floor.

**#4 · init-app.sh IAM propagation race** (Phase 1, 07-21)
SA created, IAM bind milliseconds later → 400 "SA does not exist"; `set -e` killed the
script before its own verification block. Idempotent re-run succeeded (idempotency = the
one thing that saved this from being a hard failure).
→ **v3:** Template 4 gets a retry loop between SA create and first bind (e.g. up to 6 × 10s
polling `gcloud iam service-accounts describe` before binding). Keep idempotency.

**#6 · `gcloud run domain-mappings` left the GA track** (Phase 5, 07-22)
GA form → "unrecognized arguments"; command now requires `gcloud beta` prefix.
→ **v3:** every domain-mappings command in SKILL.md Phase 5 + Template 5 checklist becomes
`gcloud beta run domain-mappings ...`. Add a note: Google is steering toward load-balancer
custom domains; revisit if beta track disappears too.

**#7 · THE MISSED PERMISSION — build SA cannot set IAM policy** (Phase 3/6, 07-21) — see §5.

**#9 · gcloud's domain-verification error text misleads** (Phase 4, 07-22)
Error suggests verifying the *subdomain*. Correct move: verify the **base domain** — one
verification covers all present and future subdomains (main Cyber Pharma app included).
→ **v3:** execute SKILL.md Phase 4 states in bold: "Always verify the base domain. Ignore
gcloud's subdomain suggestion." Also codify the run's propagation discipline: add the TXT,
`dig +short TXT <domain>` until it shows, THEN click Verify.

### Theme D — Environmental noise (expectation-setting, not bugs)

**#8 · Chrome Safe Browsing flags fresh `*.run.app` URLs** (Phase 3, 07-21)
"Dangerous" interstitial + autofill weirdness on the raw URL; incognito clean; retired by
the custom domain.
→ **v3:** execute SKILL.md Step 3.4 smoke-test note: expect Safe Browsing noise on fresh
run.app URLs; test in incognito; the custom domain retires it. Prevents a false "the deploy
is broken" alarm.

---

## 5. THE MISSED PERMISSION — Build SA `run.admin` (Issue #7) — STILL OPEN

**What happened.** deploy.sh ran with `--allow-unauthenticated`. The deploy itself
succeeded, but gcloud warned "Setting IAM policy failed" and the fresh service **403'd in
the browser** until Actor A manually bound `allUsers → roles/run.invoker`.

**Root cause.** Post-2024 GCP secure defaults. On older projects the build service account
inherited Editor-class power, so `--allow-unauthenticated` Just Worked. On projects created
now, the build SA (the compute default SA on new projects) lacks
`run.services.setIamPolicy` — it can deploy the service but cannot open it to the public.
The skill was written against the old world and never mentions this. (Operator
independently ruled out org-policy domain restriction — `allValues: ALLOW`, EVIDENCE.)

**Operator ruling (unqualified, 07-21):** *staging-project Path A bootstrap must grant the
build SA `run.admin` immediately after project creation.* This is the permission we skipped
— the grant was queued behind "find the build SA email" and never executed.

**Closing commands for THIS project (Actor A, one-time):**

```bash
# 1. Truth command — reveal the actual build SA (a build exists now, so this is definitive):
gcloud builds list --project cyberize-nextjs-staging --limit=1 --format="value(serviceAccount)"

# 2. Grant run.admin to that SA (expected: projects/-/serviceAccounts/524380376459-compute@developer.gserviceaccount.com):
gcloud projects add-iam-policy-binding cyberize-nextjs-staging \
  --member="serviceAccount:<BUILD_SA_EMAIL_FROM_STEP_1>" \
  --role="roles/run.admin"

# 3. Verify:
gcloud projects get-iam-policy cyberize-nextjs-staging \
  --flatten="bindings[].members" --format="table(bindings.role)" \
  --filter="bindings.members:<BUILD_SA_EMAIL_FROM_STEP_1>"
```

After this, every future deploy in this project (including the main Cyber Pharma app) gets
working `--allow-unauthenticated` with no manual unlock.

**v3 prescription (three layers):**
1. Family CLAUDE.md §5.2 Path A bootstrap gains a mandatory step right after project
   creation + API enable: resolve build SA → grant `roles/run.admin` (staging rule).
2. Path B (§5.3) gains a pre-flight truth command verifying the grant exists.
3. execute SKILL.md Step 3.1 pre-warns: *if the grant is missing, the first URL will 403
   until Actor A binds the invoker manually* — so the operator expects it instead of
   debugging it.

---

## 6. Skill v3 Change List — by file

### `CLOUD_DEPLOYMENT_SKILLS/CLAUDE.md` (family doctrine)
- §5.2 Path A: add build-SA `run.admin` grant step post-project-create (Issue #7). Fix or
  ship the referenced `init-gcp-project.sh` / `install-gcloud.sh` templates (Issue #1).
- §4.5 Truth Commands: domain-mapping status command → `gcloud beta` form (Issue #6);
  add the build-SA reveal via `gcloud builds list --format="value(serviceAccount)"`.
- §8 completion checklist: unchanged — it worked (6/6 provable with evidence).

### `next-deploy-generate/SKILL.md`
- Phase 1 intake: add next.config.js `output:"standalone"` hard gate (Issue #3); detect
  Node floor from package.json / Next major (Issue #2).
- New anti-pattern AP-G5: "Delivering a package without proving the repo can produce
  `.next/standalone/`."

### `next-deploy-generate/references/TEMPLATES.md`
- Template 1 (Dockerfile): parameterize Node image, floor `node:22-alpine` (Issue #2).
- Template 3 (deploy.sh): string-builder SUBSTITUTIONS pattern (Issue #5).
- Template 4 (init-app.sh): SA-propagation retry loop between create and bind (Issue #4).
- Template 5 (checklist): all domain-mapping commands → `gcloud beta` (Issue #6).

### `next-deploy-execute/SKILL.md`
- Step 3.1: pre-warn about interim 403 when build SA lacks run.admin (Issue #7).
- Step 3.4: Safe Browsing note — incognito smoke test on fresh run.app (Issue #8).
- Phase 4: "always verify the BASE domain" in bold + TXT-propagation-before-Verify
  discipline (Issue #9).
- Phase 5: `gcloud beta` throughout; note the checklist's §4/§5 ordering vs the skill's
  Phase 5/6 — this run pulled invoker (Phase 6) forward into Phase 3 out of necessity;
  v3 should bless that as the normal path (public apps: bind invoker at first deploy).

### `next-deploy-execute/references/ANTI_PATTERNS.md`
- Add: trusting GA command forms without a truth-command probe; verifying subdomains;
  treating first-URL 403 as an app bug; treating Safe Browsing flags as an app bug.

---

## 7. What Went RIGHT — keep in v3, verbatim

1. **3-actor mental model** (§4.2) — every IAM failure was instantly attributable
   (Actor B can't set policy; Actor A unlocks). Zero confusion across 9 issues.
2. **Evidence discipline + truth commands** — no cloud state was ever guessed; every ✅ on
   the scoreboard has a pasted command output behind it.
3. **Stop gates + spoon-feed rhythm** — one command per step meant every failure was
   isolated the moment it happened, with a one-command blast radius.
4. **Idempotent init-app.sh** — turned the IAM race (#4) from a disaster into a re-run.
5. **Assume-unverified Phase 4 routing** — "run Phase 4 only if the mapping complains" cost
   zero when it triggered and would have cost zero if it hadn't.
6. **Prefilled DEPLOYMENT_CHECKLIST.md** — every command ready with real values; recovery
   after both CLI crashes resumed off it in seconds.
7. **The live issues ledger** (operator directive, 07-22) — recording issues *as they
   happened* is why this report is evidence, not memory. **v3 should mandate the ledger as
   a skill artifact** (create at activation, append per issue).

## 8. Process Meta-Lessons (beyond the skill)

- **Session files + RECOVERY.md survived two CLI crashes** with zero context loss. The
  "write to file BEFORE screen" rule paid for itself twice in one run.
- **Platform drift is the dominant failure class** (5 of 9 issues). v3 should carry a
  "last verified against gcloud" date stamp and a standing instruction: on any
  "unrecognized arguments", suspect track migration (try beta) before suspecting the operator.
- **Old terminal scrollback after a crash is a hazard** — a stale `projects create` output
  was nearly misread as a fresh (impossible) event. Recovery protocol addition: after any
  crash, trust session files over terminal scrollback.

---

## 9. Remaining Actions

| # | Action | Owner | Status |
|---|---|---|---|
| 1 | Build SA `run.admin` grant (§5 commands) | Actor A (operator) | **OPEN — only remaining item** |
| 2 | Skill v3 rebuild per §6 | next session(s), operator-tasked | QUEUED |
| 3 | Commit point: session docs, ledger, RESPONSES (operator's git) | operator | RIPE |

**The deploy family run is otherwise CLOSED — 6/6 completion criteria with evidence.**

---

## ADDENDUM (2026-07-22 17:0x) — Action 1 CLOSED + root-cause refinement

Operator executed the §5 grant: `roles/run.admin` bound to
`524380376459-compute@developer.gserviceaccount.com` — binding verified in the returned
policy. **Zero open items remain on this run.**

Root-cause refinement for Issue #7 (EVIDENCE from the policy dump): the compute default SA
**did** hold `roles/editor` on this 2026 project — the "no Editor auto-grant" inference was
wrong. The real mechanism: **Editor excludes all `*.setIamPolicy` permissions**, so
`--allow-unauthenticated` from a build can never work on Editor alone; `run.admin` is the
required piece regardless of Editor. The legacy `@cloudbuild.gserviceaccount.com` SA also
exists (cloudbuild.builds.builder only) but is not the default build identity on new
projects. → v3 CLAUDE.md §5.2 should state the rule this way, not as an Editor-era story.
Passive verification: the next `deploy.sh` run must show NO "Setting IAM policy failed"
warning — that's the proof the bootstrap rule works end-to-end.
