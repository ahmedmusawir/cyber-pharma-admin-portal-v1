# CYBER PHARMA — THE 8-PHASE PLAN (v1.2, Reconciled)

**Project:** Cyber Pharma v1 (Mother Ship Tier 1 — Reimbursement Monitoring / OwedBook)
**Document type:** Permanent project reference — the strategic build arc
**Version:** 1.2
**Last Updated:** 2026-06-16
**Companion to:** MASTER_APP_BRIEF.md, NEW_SESSION_CONTEXT_DROP.md, Frank Q&A Reconciliation Summary

> **What changed in v1.2:** Frank answered our questions. This pass swaps the prior plan's assumptions for confirmed facts. Each phase below shows what we **assumed** before, what's now **confirmed**, and the **net change**. No phase broke. Phases 4 and 5 went from blocked to unblocked. One security bug folded into Phase 3. One open scope decision (ALDOI) hangs over Phase 6. Migration corrected in Phase 8.

---

## PHASE 1 — Foundation Skeleton

- **Assumed:** Both app shells (OwedBook + MissionControl), RBAC, fail-closed env checks, deletion of the demo's security gaps. Never depended on Frank.
- **Confirmed:** Nothing in Frank's answers touches this. One validation: the fail-open webhook hole we planned to guard against (the GHL secret check) is real and sits in his code, so that placeholder is justified, not theoretical.
- **Net change:** None. Phase 1 stands as written.

---

## PHASE 2 — Visual Fidelity With Demo Data

- **Assumed:** Build all customer-facing screens from the demo, mock data behind the service layer. Open question: whether any NEW screens beyond the demo were needed.
- **Confirmed:** Registration is now a known quantity — three doors (self-serve, GHL webhook, manual queue), with a live reference site (pharmacybooks.com/registration) to copy logic from. The OwedBook screens regenerate from Liberty data later (Q9), so the mock-to-real swap point stays clean.
- **Net change:** Small but real. Registration is no longer a vague "signup page" — it's three defined flows to design. The OwedBook itself is unchanged. The only thing that could add screens here is ALDOI (signature capture, claims export), which belongs in Phase 6, so Phase 2 holds.

---

## PHASE 3 — Real Schema, RLS, and Audit Logging

- **Assumed:** ~15 tables, RLS on PHI, audit logging. Q8 flagged as the dependency; data model was guesswork.
- **Confirmed:** The three-noun model (Business, User, UserBusiness junction) is now ground truth from Frank's real schema — subscription hangs on the store, APA discount on the pharmacist's personal license. Q8: Alabama-first but design per-state. Q5 surfaced the reference-data privilege bug. PBM table is ~2,200 combinations, so we know its real weight.
- **Net change:** Three concrete updates. (1) Per-state columns from day one, with dispensing fee and brand multiplier externalized to config. (2) Reference-data writes get an admin gate — the Q5 bug fix folded in here. (3) Schema modeled on Frank's proven structure instead of our best guess.

---

## PHASE 4 — Reference Data Pipeline

- **Assumed:** Scheduled pull of AAC/WAC/FUL/PBM from vague "official sources," blocked on Frank's URLs; replace his Alabama Medicaid scraper.
- **Confirmed:** Every source now known. AAC free weekly (Myers & Stauffer AL), FUL free monthly (medicaid.gov API), WAC via McKesson workaround or Medi-Span ($15–20k/yr, 30-day trial), PBM self-built at ~2,200 combos with a human corrections inbox. Frank's pull code is in the API repo; he offered cloud access (needs an email).
- **Net change:** Unblocked. WAC becomes a go/no-go business call. The PBM piece is bigger than a "pull" — it's a human-in-the-loop workflow to design around, not just a download.

---

## PHASE 5 — Reimbursement Math and Imports (THE HERO)

- **Assumed:** Upload function with column-mapping for 3–4 CSV vendor formats, port the math, validate against a desktop golden dataset.
- **Confirmed:** Q1 flips imports to API-first via Liberty (proven multi-tenant), so CSV drops to fallback. Math constants are Alabama, getting externalized. Validation cohort named (Heather, Tyler, Anna, Jessica).
- **Net change:** Import path simplifies for v1 — Liberty API instead of messy multi-vendor CSV. The parallel-run from Q9 becomes our actual math-validation gate.

---

## PHASE 6 — PDF, Email, and GHL

- **Assumed:** Server-side PDF to storage, Resend email with per-pharmacy reply routing, GHL scope undecided.
- **Confirmed:** Q4 locks GHL to Option A minimal, field map documented, fail-open hole to fix. ALDOI, if in scope, lands here — it's PDF plus regulator email, exactly this phase's machinery.
- **Net change:** GHL locked minimal. This is the phase the open ALDOI decision hangs over. **If ALDOI is in:** add signature capture, claims-spreadsheet export, the official complaint PDF, and the regulator email. Biggest swing of any phase.

---

## PHASE 7 — Stripe Subscriptions and Multi-Store Admin (StoreLens)

- **Assumed:** Per-store Stripe, subscriptions mirror Stripe via webhook, APA discount via promo + lock, admin portal from the MissionControl pattern.
- **Confirmed:** Hybrid onboarding with three real doors; registration is payment-creates-account; APA is a genuine single-use license check matching our design; admin surface sorted into keep/strip/fix.
- **Net change:** Heavily grounded now. Add the manual-approval queue (the onboarder portal) as a real deliverable. The MissionControl access-scope decision for Heather (Frank's employee vs. Cyberize-only lock) attaches here.

---

## PHASE 8 — HIPAA Hardening and Production Deploy

- **Assumed:** Supabase BAA, security headers, OAuth/MFA per Q6, migration per Q9.
- **Confirmed:** Email + password for v1, real Supabase MFA available, preserve Frank's one-hour auto-logoff, OAuth deferred. Migration has no central data pile — regenerate from Liberty, named beta cohort, parallel run.
- **Net change:** Migration model corrected from bulk-copy to regenerate-from-Liberty. This phase resolves the exact cloud-HIPAA fear that made Frank keep data local — the whole reason migration is safe now.

---

## Open Decisions Tagged to Phases

| Open thread | Gates | Owner |
|---|---|---|
| ALDOI complaint filing — in or out of v1 | Phase 6 (contents) | Mical first, then Frank/Coach |
| Onboarder portal access scope (Heather vs. Cyberize-only lock) | Phase 7 | Frank/Coach |
| Medi-Span WAC trial — go/no-go | Phase 4 | Internal |
| Google Cloud IAM access (send Frank an email) | Phase 4 | Internal |
| APA membership lapse policy | Phase 7 | Frank |
| Next states + per-state values | Phase 3 | Frank (non-blocking) |
| Local desktop annotations export need | Phase 5/8 | Frank (non-blocking) |

---

## Bottom Line

No phase broke. The plan went from assumption-heavy scaffolding to a fact-grounded arc. Phases 4 and 5 are unblocked. One security bug folded into Phase 3. One scope decision (ALDOI) is the only thing that can still change v1's shape, pending the Mical-then-Frank/Coach call. Same eight phases, now built on what Frank actually told us.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.2 | 2026-06-16 | Reconciled against Frank's answers. Per-phase assumed/confirmed/net-change. Phases 4–5 unblocked, Q5 bug into Phase 3, ALDOI decision tagged to Phase 6, migration corrected in Phase 8. |
| 1.1 | 2026-06-16 | Consolidated reference version. FFM execution notes, codenames, MissionControl-first sequencing, Frank-question dependencies. |
| 1.0 | 2026-05-14 | Initial 8-phase roadmap. |
