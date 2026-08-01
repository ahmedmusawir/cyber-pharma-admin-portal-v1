# PART 1 — MINI SECURITY SWEEP (public showcase prep)

**Repo:** cyber-pharma-admin-portal-v1 (Cyph Mission Control)
**Date:** 2026-08-01 19:18
**Branch:** `main` @ `96ed539`, tree clean · 307 tracked files
**Method:** grep-only, read-only. No files modified.

## VERDICT: 🔴 FLAGGED — DO NOT PUBLISH

**Stopping before Part 2 per the gate condition.** Five items swept, four flagged.
One finding is CRITICAL and independent of the showcase question — it needs action
whether or not this repo ever goes public.

| # | Item | Result |
|---|------|--------|
| 1 | Tracked env files | ✅ **CLEAN** (one advisory) |
| 2 | Hardcoded keys/secrets | 🔴 **FLAGGED** — live credential + real infra identity |
| 3 | Mock/seed PHI audit | 🟠 **FLAGGED** — 3 checksum-valid NPIs + the Obama fossil |
| 4 | "Frank" / "Coach" | 🔴 **FLAGGED RED** — real client identity, ~40 hits |
| 5 | Stale claims | 🟡 **FLAGGED** — minor, all fixable in Part 3 |

---

## 🔴 CRITICAL — found under item 5, reported first

**`RECOVERY.md:99` publishes a working superadmin login to a live public site.**

```
## Verification credential (test): superadmin@email.com / pass1234
   (real Supabase, role superadmin)
```

`RECOVERY.md` is tracked. `https://mission-portal.cyberizedev.com` is live, public
(`--allow-unauthenticated`), and backed by the real Supabase project whose URL is also
in the repo. That is a complete, usable credential pair for a superadmin account on a
reachable production surface.

This is not a showcase problem — it is a live exposure that exists right now on the
current `main`. **Rotate that password regardless of what you decide about publishing.**

---

## ITEM 1 — TRACKED ENV FILES ✅ CLEAN

`git ls-files | grep -iE "\.env"` → **zero results.** No env file is tracked, and no
env file exists on disk anywhere outside `node_modules`.

**The sibling-repo fossil does NOT exist here.** Specifically checked for `.env copy.example`
by that exact filename pattern and by content shape. Not present, never was.

**Advisory (not a flag):** `.gitignore` ignores only `.env*.local`. A plain `.env`,
`.env.example`, or `.env copy.example` would sail straight into a commit. The pattern
that bit the sibling repo is still unguarded here. Suggested tightening:

```gitignore
.env*
!.env.example
```

---

## ITEM 2 — HARDCODED KEYS / SECRETS 🔴 FLAGGED

### What is clean

- **No JWTs anywhere.** This is the important negative — a leaked Supabase anon or
  service-role key is a JWT, and there are none. The single `eyJ...` hit
  (`AUTH_MANUAL_v1.1.md:1709`) is the publicly-known `{"alg":"HS256","typ":"JWT"}`
  header, truncated with `...`. Not a secret.
- **No service-role key, no Stripe / AWS / GitHub / OpenAI / SendGrid keys, no private keys.**
  Every provider-format hit is a documentation placeholder: `sk_test_xxx`,
  `pk_test_REPLACE_ME`, `whsec_xxx`, `sk_test_fake_key`, `sk_test_REAL_STRIPE_KEY`
  (literally the instruction text).
- **Zero assignment-shaped secret literals in source.** The non-markdown grep returned
  nothing at all.

### FLAG 2A — live Supabase publishable key, hardcoded

| File | Line | Value |
|------|------|-------|
| `deploy.sh` | 18 | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_8FvPLZTmChxMrPwv7q9-rw_NgjoDk1S"` |
| `cloudbuild.yaml` | 7 | same value |

Publishable keys are public-by-design — this ships in the browser bundle, so it is not
a breach. But it is a **real live value**, it identifies your production project, and
your spec flags real characters whether masked or not.

### FLAG 2B — real Supabase project reference

| File | Line |
|------|------|
| `deploy.sh` | 17 |
| `cloudbuild.yaml` | 6 |
| `agent_docs/RESPONSES/response_2026-07-02_170915_verification.md` | 10 |

`https://yrsuwikjnbmvpznrgydb.supabase.co` — the live project. Combined with FLAG 2A and
the CRITICAL credential above, a reader has project URL + client key + superadmin login.
Only RLS stands between that and your data.

### FLAG 2C — real GCP infrastructure identity

| Identifier | Hits |
|------------|------|
| `cyberizedev.com` | 85 |
| `cyberize-nextjs-staging` | 34 |
| `mission-portal` | 32 |
| `run.app` URLs | 25 |
| project number `524380376459` | 10 |

Plus, in `cloudbuild.yaml:43,45`: runtime SA `sa-cyph-mission-ctrl-runtime@…`, secret name
`cyph-mission-ctrl-supabase-secret-key`, and compute SA `524380376459-compute@developer.gserviceaccount.com`.

None of these are secrets. Together they are a complete map of your staging estate —
project, number, region, service, service accounts, secret names, domain.

---

## ITEM 3 — MOCK / SEED DATA AUDIT 🟠 FLAGGED

### The shipped app mock is genuinely well-built

`src/mocks/mission-control/store.ts` — fictional names, `.example` TLD emails throughout
(`marcus.webb@cedarrx.example`, `rosa@pineridgerx.example`, …), and the file's own header
states "PHI-free by construction." Verified: **no patient data, no DOB, no SSN, no MRN,
no claims, no prescriptions.** The HIPAA posture in `UI_SPEC.md:103` ("every field is
pharmacy-identity, zero patient data") holds up under grep. This part is a credit to the build.

### FLAG 3A — three NPIs pass the official checksum

Ran Luhn-with-`80840`-prefix over all 20 NPI-labelled values. Seventeen are correctly
synthetic. Three validate:

| NPI | File:line | Status |
|-----|-----------|--------|
| `1063511111` | `src/mocks/mission-control/store.ts:87` | ✅ valid checksum |
| `1063519999` | `src/mocks/mission-control/store.ts:144` | ✅ valid checksum |
| `1770000002` | `src/mocks/mission-control/store.ts:285` | ✅ valid checksum |

A checksum-valid NPI is resolvable in the **public NPPES registry** and may map to a real
provider. Accidental — the seed pattern (`…1111`, `…9999`, sequential) happened to land on
valid check digits three times. Fix is one digit each.

`1093817465` (the Obama store's NPI) is invalid — safe on that axis.

### FLAG 3B — the Obama fossil, confirmed present

Same class as the sibling repo:

| File | Line |
|------|------|
| `_design/DESKTOP/_HTML/dashboard.html` | 57 |
| `_design/DESKTOP/_HTML/owner_detail.html` | 76, 78 |
| `_design/DESKTOP/_HTML/owners_canonical.html` | 185 |
| `_design/DESKTOP/_HTML/store_detail.html` | 49, 51 |

(all under `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/`)

"Barack Obama" / `barack@hydeparkrx.com` seeded as a demo pharmacy owner with 5 stores.
Note the shipped app mock is clean — this lives only in the design HTML.

### FLAG 3C — audit-log demo rows read as real support activity

`_design/DESKTOP/_HTML/audit_log.html:26` — named individuals attached to suspensions and
password recoveries: Tina Cho, Jane Doe, Ravi Patel, Maria Lopez, Priya Nair, James Wright,
Dan Okafor. All fictional, but in a public showcase an audit log of people being suspended
reads as production data at a glance. Cosmetic, worth neutralizing.

---

## ITEM 4 — "FRANK" / "COACH" 🔴 FLAGGED RED — THE STOP CONDITION

### Real client, named with a real business mailbox

| File | Line | Content |
|------|------|---------|
| `_design/DESKTOP/_HTML/dashboard.html` | 58 | `Frank Tant` · `frank@frankrx.com` |
| `_design/DESKTOP/_HTML/owners_canonical.html` | 197 | `Frank Tant` · `frank@frankrx.com` |

The client is named, his business domain is named, and he is rendered as a demo user of
the very tool built for him.

### Internal team + client staff, in decision records

**"Coach"** — 11 hits carrying dated approvals:
`DESIGN_BRIEF.md:14` · `_project/APP_BRIEF.md:27,28,248,250,251,273` ·
`_project/CLAUDE.md:70` · `CYBER_PHARMA_8_PHASE_PLAN_v1_2.md:81,82,93`

**"Heather"** — named as *"Frank's employee, the onboarding operator"*, with her access
level debated and recorded:

> "Heather is a **super admin for v1** — Coach-approved, recorded 2026-06-20. This is
> provisional: if Frank later wants her access narrowed, we revisit."
> — `_project/APP_BRIEF.md:28`

**"Mical"** — `CYBER_PHARMA_8_PHASE_PLAN_v1_2.md:81`, routing a regulatory decision.

**`moose@cyberizegroup.com`** — your internal mailbox, 4 hits across `_SKILLS/` and
`agent_docs/RESPONSES/`.

**"Frank-domain"** as a schema label — ~15 files across `_SKILLS/`, `agent_docs/APP_FACTORY/`,
`agent_docs/.claude/skills/`.

### The structural problem behind item 4

`agent_docs/` is **307 tracked files of your internal factory**. Not just names — client
risk registers, a scope debate over **ALDOI regulatory complaint filing**, product names
not yet public (OwedBook, StoreLens), retrospectives, and per-person access decisions.
Publishing this repo publishes all of it.

This is the finding that should hold the showcase. A public repo that names a client,
his employee, his email, and the internal debate about how much access to give her is a
client-relationship problem no README wording can offset.

---

## ITEM 5 — STALE CLAIMS 🟡 FLAGGED (minor)

| Claim | Location | Reality |
|-------|----------|---------|
| "Test suite expanded from 54 → 81 tests" | `docs/change_logs/v0.4.0-2026-04-13.md:9` | Pre-cleanup starter-kit fossil. Only 2 test files exist now. |
| "81/81" | `RECOVERY.md:79` | Historical (07-09) but reads as current on a skim |
| "2 suites / 8 tests EXACTLY" | `RECOVERY.md:56` | Matches the 2 files on disk — **plausible, pending Part 2** |
| `test:e2e` / `test:e2e:ui` scripts + `@playwright/test` | `package.json:8-9,48` | Dead — RECOVERY.md already lists "kill dead test:e2e scripts" as open |
| `test-results/.last-run.json` | tracked | Stray Playwright artifact, should not be in git |
| Password `Test1234!` | `docs/MANUAL_TESTING.md:60` | Test cred in a doc — low risk, but publishes a password |

**Routes verified — no escape hatches.** 13 routes, all legitimate: 8 mission-control
screens, `/login`, `/`, and 3 auth API routes. No backdoor, no god-mode, no hidden
superadmin path. `docs/` has 13 tracked files, all present, no dead links found.

**README is 2 lines** — nothing stale, just empty. That is Part 3's job.

---

## REQUIRED BEFORE PART 2 / PART 3

**Immediate, independent of showcase:**
1. Rotate `superadmin@email.com` password on the live Supabase project. Remove the
   credential line from `RECOVERY.md:99`.

**Decision needed from operator — the showcase blocker:**
2. What happens to `agent_docs/` (307 files) and `_SKILLS/`? Options: strip from the
   public repo entirely · scrub names in place · publish a separate curated showcase repo
   with only `src/`, `docs/`, and a new README. **This is your call, not mine.**

**Mechanical scrubs, ready on approval:**
3. Rename `Frank Tant`/`frank@frankrx.com` → fictional, in 2 design HTML files.
4. Replace `Barack Obama`/`barack@hydeparkrx.com` → fictional, in 5 design HTML files.
5. Perturb 3 checksum-valid NPIs (one digit each) in `store.ts`.
6. Redact `Coach` / `Heather` / `Mical` / `moose@cyberizegroup.com` — scope depends on #2.
7. Decide on infra identity: keep (it's a live public URL you're showcasing anyway) or
   templatize `deploy.sh` + `cloudbuild.yaml` to `PROJECT_ID` placeholders.
8. Correct the "81 tests" changelog line; drop dead `test:e2e` scripts; untrack
   `test-results/`; tighten `.gitignore` to `.env*`.

**Part 2 (verify numbers) and Part 3 (README) remain held.** Part 3 in particular should
not be written until #2 is decided — the README's framing depends on what the public repo
actually contains.

---
*Read-only sweep. No files were modified. Awaiting operator direction.*
