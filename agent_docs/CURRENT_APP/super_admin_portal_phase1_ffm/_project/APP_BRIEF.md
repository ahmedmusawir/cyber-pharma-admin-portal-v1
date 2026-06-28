# APP BRIEF — MissionControl (Super Admin Portal)

**Codename:** MissionControl
**Project:** Cyber Pharma Platform — Super Admin Operations Console (standalone app)
**Document type:** APP_BRIEF (canonical Factory handoff doc #1 of 4)
**Author:** Architect (Claude), MissionControl lab
**Date:** 2026-06-20
**Status:** DRAFT (rev 0.4, Heather super-admin decision recorded) → awaiting operator REVIEW
**Evidence base:** Operator decisions (brainstorming) + Frank API extraction (data shapes + lifecycle) + Onboarding Queue Feature Brief v1.0

---

## 1. App Type

**Internal operations tool** — full-stack web app, private (no public DNS), single audience. Greenfield build (no source app to convert; the Designer's output is the visual ground truth).

---

## 2. One-Sentence Purpose

A console-gated support console that lets the Cyberize team find any account across the whole platform, review and approve pharmacy onboarding requests, and perform a small fixed set of safe, audited actions on records that already exist — without ever creating accounts, holding credentials, touching billing, or seeing PHI.

---

## 3. Who Uses This

- **Primary users (v1):** Cyberize team operators (e.g., Stark, Coach) **plus Heather** (Frank's employee, the onboarding operator). Super-admin is granted ONLY by hand in the Supabase console; no self-serve path exists.
- **Heather's access (decided, provisional):** Heather is a **super admin for v1** — Coach-approved, recorded 2026-06-20. This is provisional: if Frank later wants her access narrowed, we revisit. A scoped **onboarder role** (reaching ONLY the onboarding queue) is kept as the fallback design — the onboarding surface stays self-contained so that fence can be drawn cleanly later without rework.
- **Frank (customer/partner) access:** TBD — deferred, operator-approved later. Not assumed for v1.
- **No other customer-side or partner-side super-admin access is assumed.**
- **NOT for:** Pharmacy owners or members managing their own stores — that lives in the separate Cyber Pharma main app (OwedBook / StoreLens).

---

## 4. Why We're Building It

1. **Support + onboarding reality.** When an owner/member has an account problem, or a pharmacy submits a registration request, a trusted operator needs platform-wide visibility to act fast — without bothering anyone or touching PHI.
2. **Prove the admin pattern in low-stakes code.** MissionControl is internal and PHI-free — the safe place to prove the card-grid + member-management pattern. At Cyber Pharma main **Phase 7**, StoreLens is fabricated from this **proven** pattern. Design once, build twice. (Onboarding approval is the exception — platform-only, does NOT transfer to StoreLens.)
3. **The starter kit is already half-built** — Supabase SSR auth, RBAC, RLS, working superadmin/admin user-CRUD already exist. We extend, we do not rebuild.

---

## 5. In Scope (Phase 1)

### 5.1 Domain notes

**Owner** is NOT a table. An Owner is a **derived platform projection**: a `user` who holds an owning/admin role in one or more `user_businesses` junction rows. "Store count" = distinct `businesses` where that user holds the owner/admin role; primary store = the `is_primary = true` row. The exact role enum value denoting "owner" must be **confirmed against the Frank schema in DATA_CONTRACT**. Do NOT invent an `owners` table.

**PendingRegistration** is a **self-submitted onboarding request**, created by the pharmacy itself via the main app's `register-pending` path (confirmed in the Frank API extract — the client posts its own `{ ncpdp, npi, email, … }`). It is **NOT created in MissionControl.** It holds pharmacy-identity data only — zero patients, zero PHI. MissionControl only reads it and flips its status.

### 5.2 Canonical route map (locked)

```
/login                         superadmin auth (REAL)
/dashboard                     pulse metrics + owners preview/shortcut
/owners                        owners directory (card grid)
/owners/[ownerId]              owner detail (that owner's stores grid)
/stores                        stores directory (card grid, all stores)
/stores/[storeId]              store detail (members + safe actions)
/onboarding                    pending-registrations queue (DataTable)
/onboarding/[registrationId]   registration detail (review + approve/reject)
/audit-log                     read-only history
```

Store detail lives at the single canonical route `/stores/[storeId]`, reached from both front doors (owner detail and stores directory).

### 5.3 Screens

1. **Login** — Supabase SSR auth, gated by server-side `is_super_admin`. Non-super-admins denied.
2. **Dashboard** — platform pulse (HIPAA-safe metric cards + growth chart) + a short "recent / needs-attention" owners shortcut (preview only).
3. **Owners directory** — card grid of every owner, searchable.
4. **Owner detail** — owner header + card grid of that owner's stores. Drills to store detail.
5. **Stores directory** — card grid of every store platform-wide, searchable by name/NCPDP.
6. **Store detail** — always-visible breadcrumb context lock, read-only store info header, scoped member roster with safe actions, fenced store-scoped Restore-admin.
7. **Onboarding queue** — DataTable of pending registrations, default-filtered to `pending_verification`, with status filter and search (name / NCPDP / NPI). Two row types distinguished by a badge: **New pharmacy** vs **Desktop converter**.
8. **Onboarding detail** — full read-only identity block, a verification-notes input, and the Approve / Reject actions.
9. **Audit log viewer** — read-only, append-only.

**Sidebar nav:** Dashboard · Owners · Stores · **Onboarding** · Audit log (+ super-admin identity at the foot).

### 5.4 GREEN actions + per-action UX rules

All writes mocked through their services in Phase 1 (auth is real; domain mocked — §6.11).

| Action | Confirmation | Success feedback | Audit row | Mock-state change (Phase 1) |
|---|---|---|---|---|
| Suspend human | Confirm dialog (shows name) | Toast + pill → Suspended | Yes | status → suspended |
| Un-suspend human | Confirm dialog (shows name) | Toast + pill → Active | Yes | status → active |
| Trigger password recovery | Light confirm | Toast "Recovery email sent" | Yes | None |
| Resend existing invite | None (low risk) | Toast "Invite resent" | Yes | None (refresh `invited_at`) |
| Restore-admin (store-scoped) | **Typed store-name** confirm | Toast "Admin restored for {name} at {store}" | Yes (loud) | Re-activate/create one `user_businesses` admin row for (user, store) |
| **Approve registration** | Confirm dialog (shows pharmacy name) + **required verification note** | Toast "Approved — activation invite sent" | Yes (loud) | status `pending_verification` → approved; invite-send mocked |
| **Reject registration** | Confirm dialog (shows name) + **reason field** | Toast "Registration rejected" | Yes | status → rejected (soft; record retained) |

**Onboarding load-bearing constraint:** Approve fires an activation invite **to the email already on the self-submitted record** — the operator never enters or edits an email, never sets a credential. The pharmacy self-activates (sets its own password) in the main app. **Account creation does not happen in MissionControl.** Converter rows link to a migrated business via the pharmacy-supplied `activation_key` — system-set, never operator-editable.

**Onboarding status lifecycle (UI reflects):** `pending_verification` → **approved** (→ pharmacy self-activates → `completed`) or **rejected**; `expired` as the timeout state (a background job, NOT an operator action). Approve/Reject are enabled only on `pending_verification` rows.

### 5.5 Service boundaries (names locked; types live in DATA_CONTRACT)

- **MissionDashboardService** — platform pulse metrics
- **OwnerDirectoryService** — list/search owners (derived view) + owner detail + their stores
- **StoreDirectoryService** — list/search all stores + store detail header
- **StoreMemberService** — read a store's member roster
- **SupportActionService** — suspend/un-suspend, trigger recovery, resend invite, restore-admin
- **PendingRegistrationService** — list/filter pending records, get one, approve (status flip + invite trigger, mocked), reject (status flip + reason, mocked)
- **AuditLogService** — append (on every action) + read (the viewer)

All return typed **mock** data in Phase 1.

### 5.6 Minimum display fields

**Owner card:** name · email · store count · member count (if cheap) · health pill (worst-of their stores) · last activity/created (if available).

**Store card:** store name · owner name · NCPDP · NPI (optional, business identifier) · subscription status · member count · state.

**Member roster row:** name · email · role · status · invite status (if pending) · last login (if available) · available safe actions.

**Onboarding queue row:** pharmacy name · NCPDP · NPI · contact person · submitted date · type badge (new / converter) · status pill.

**Onboarding detail — identity block (read-only):** pharmacy name, NCPDP, NPI, pharmacy license, pharmacist license, contact person, role in pharmacy, email, phone, mobile, fax, website, full address, pharmacy software system. *Converter rows also:* desktop username + linked business reference (read-only).

**Onboarding detail — operator block:** verification-notes input (required on approve), then Approve / Reject.

### 5.7 Designer guidance

- **Card-grid layout is locked** for Owners and Stores (no table fallback).
- The **Dashboard owners list is a preview/shortcut only** — NOT the full directory (`/owners`).
- **Store detail must always show the breadcrumb/context lock.**
- **No red-list controls may appear visually — not even disabled or greyed-out.** A disabled forbidden control invites scope creep. If forbidden, it does not exist in the UI. This explicitly includes **any email-entry/edit field on the onboarding surface** and **any payment/checkout control**.
- **Onboarding queue reuses the DataTable pattern** (its second home after the audit log); onboarding detail reuses the read-only band + field-block pattern from owner/store detail. The one genuinely new element is the **verification-notes input**.
- **Converter vs new-pharmacy rows** are distinguished by a badge; converters are a finite one-time batch (worth a filter).
- **Onboarding approval does NOT transfer to StoreLens** — platform-only, outside design-once-build-twice. Design it self-contained so a future scoped onboarder role can fence around it cleanly.
- Same theming tokens as Cyber Pharma main; mobile-first (375px) before desktop.

### 5.8 HIPAA-safe dashboard metrics

All `COUNT` / `GROUP BY` on platform tables — never claims data:
total pharmacies · total owners · total members · active/past-due/canceled subs (read-only pulse) · active/suspended/invite-pending accounts · new pharmacies over time · pharmacies by state · invites sent vs accepted.

*(Pending registrations also contain zero PHI — pharmacy-identity/business paperwork only — which is why the onboarding queue is safe in a no-PHI console.)*

---

## 6. Out Of Scope (Phase 1) — HARD GATES

Non-negotiable. If the Designer or Claudy asks "should I add X?" and X is here, the answer is no.

1. ❌ **No member creation. No invite-to-a-new-address.** Account genesis lives ONLY in the owner's/pharmacy's own hands in the main app. MissionControl acts on accounts/records that already exist.
2. ❌ **No setting or reading passwords.** Recovery-trigger only.
3. ❌ **No changing a user's email.** (Also: no email entry/edit anywhere on the onboarding surface.)
4. ❌ **No deleting any human.** Suspend only; reject is a soft status flip, never a hard delete. Hard delete is Supabase-console-only.
5. ❌ **No subscription or billing control, and no payment/checkout surface anywhere — including the onboarding flow.** Stripe is the source of truth; all billing happens in the main app. Dashboard sub status is read-only pulse.
6. ❌ **No editing member profile fields** beyond the fenced store-scoped restore-admin.
7. ❌ **No rendering of OwedBook / claims / PHI data anywhere.** No "$ recovered" metric.
8. ❌ **No granting super-admin from the UI.** Console-only, by hand.
9. ❌ **No impersonation / "log in as" / force-sync / suspend-a-whole-pharmacy** override powers.
10. ❌ **No re-authoring of kit-provided foundation** (auth, RBAC, RLS, user-CRUD). Extend; do not rebuild. (Lesson 2, Run 001.)
11. ❌ **No mocking of auth, and no early real domain CRUD.** Auth is **REAL** in Phase 1 (Supabase SSR login + `is_super_admin` gate run against real Supabase). All **domain** reads/writes go through typed services against **MOCK** data. The service layer is the sole later swap point.
12. ❌ **Onboarding approve/reject act ONLY on existing, self-submitted pending records.** No email is entered or edited on this surface; no credential is set; no payment renders. Account creation and payment happen by the pharmacy in the main app at activation. The operator's reach stops at "approved."

---

## 7. Success Criteria

v1 (frontend-first) is done when:

- [ ] `npm run build` succeeds with zero type errors
- [ ] **Real** Supabase auth works: super admin logs in; non-super-admin denied (auth is NOT mocked)
- [ ] All nine screens render against **mock** domain data; both front doors reach the same `/stores/[storeId]`
- [ ] The full GREEN action set is present, each obeying its §5.4 UX rule; breadcrumb context lock always visible on store detail
- [ ] Onboarding queue renders pending records (mock) with status filter + type badge; detail shows the read-only identity block + verification-notes input
- [ ] Approve requires a verification note and obeys its UX rule; Reject captures a reason; both emit audit rows; **neither exposes an email-entry or payment field**
- [ ] Not one RED-list capability is reachable — and none appears in the UI even disabled
- [ ] Dashboard renders every §5.8 metric from typed mock service contracts
- [ ] Every action emits a (mock) audit entry; the Audit log viewer reads it
- [ ] Light + dark mode pass; mobile (375px) holds on every screen

---

## 8. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js (App Router) | Factory standard; kit-provided |
| Auth (REAL in Phase 1) | Supabase SSR (browser/server/admin clients) | Kit-provided; `is_super_admin` gate; NOT mocked |
| Authorization | RBAC + RLS, roles in `user_roles` (never `user_metadata`) | Secure pattern; kit-provided |
| Styling | Tailwind 3.4.1 + semantic theme tokens (CSS variables) | Same token well as Cyber Pharma main; Rule Zero-B |
| Components | ShadCN primitives + DataTable KIP | Factory standard; DataTable reused by audit log + onboarding |
| State | Zustand | Factory standard |
| Billing (read-only) | Stripe → `subscriptions` mirror via webhooks | Sub-status pulse only; not a control surface |
| Email | Supabase recovery + invite flows | User-completed, never admin-held |
| Build mode | Frontend-first: **auth real**, **domain mocked** via typed services | Domain service layer is the sole later swap point |

**Phase-2 note:** the activation-invite send on Approve is **net-new** work — even Frank's code leaves it a TODO (`auth.py:990`). Phase 1 mocks it with a toast; do NOT estimate the real send as free.

---

## 9. Source-Of-Truth Artifacts

Reading order, highest authority first:

1. **This APP_BRIEF** — scope and hard gates
2. **DATA_CONTRACT** — types, service contracts, mock requirements; shapes traced to Frank API extraction
3. **Designer output** (`_design/`) — visual ground truth (greenfield)
4. **UI_SPEC** — screen-by-screen behavior, authored FROM designs + data contract
5. **Onboarding Queue Feature Brief v1.0** + **SUPER_ADMIN_PORTAL_LAB_BRIEF** — originating context

**Conflict rule:** APP_BRIEF hard gates and the RED list win over everything. If a design implies a RED-list capability, the design is wrong, not the gate.

---

## 10. Known Discrepancies

- **Greenfield.** No source app, no legacy screenshot. The Designer's output IS the canonical visual reference.
- **Data shapes predate the UI.** Entities (`businesses`, `user_businesses`, `subscriptions`, `user_roles`, `audit_logs`, `apa_memberships`, `pending_registrations`) come from the Frank API extracts.
- **Starter-kit admin UI exists but is unstyled.** The kit ships a functional superadmin/admin CRUD. This lab styles it and adds the store/subscription/onboarding/audit dimensions; it does not rebuild the auth/RBAC/CRUD core.

---

## 11. Constraints

**Hard:**
- Private app, no public DNS.
- Super admins minted console-only; UI has no path to create one.
- Zero PHI rendered or queried, ever.
- Auth real in Phase 1; domain data mocked (§6.11).
- Mobile-first (Rule Zero): 375px before desktop.
- Every color reads from a semantic token; no hardcoded hex.
- Same theming tokens as Cyber Pharma main.
- The onboarding surface is self-contained, so a future scoped onboarder role can fence around it cleanly.

**Soft:**
- Reuse card-grid + member-table + DataTable patterns so StoreLens (Phase 7) inherits them verbatim.
- Prefer kit primitives over new dependencies.

---

## 12. Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| "Add member"/password/email/payment field creeps in later | High (PHI/integrity backdoor) | Med | Hard gates #1–3, #5, #12; no red-list control rendered even disabled (§5.7) |
| "Design once, build twice" oversold | Med | High | Components transfer to StoreLens; data-access (platform-wide vs own-stores RLS) does NOT; onboarding does NOT transfer at all |
| Sub-status metrics shown before Stripe mirror exists | Low | Med | Frontend-first mocks the contract; real wiring gated later |
| Restore-admin misused to escalate | High | Low | Fenced: store-scoped, `admin`-only, typed store-name confirm, loud audit row |
| Owner "role" enum ambiguous in Frank schema | Med | Med | Confirm exact owner/admin role value in DATA_CONTRACT before wiring |
| Heather (super admin) access later narrowed by Frank | Low | Med | Decided provisionally (Coach, 2026-06-20); onboarding surface kept self-contained so a scoped onboarder role can be fenced later without rework |

**Open questions (route through Coach → Frank — not Designer blockers):**
- Heather super-admin access: **decided provisionally** (Coach, 2026-06-20) — revisit only if Frank wants it narrowed.
- Activation-invite send is unbuilt even in Frank's code — confirmed Phase-2 net-new (don't estimate as free).
- Who exactly gets super-admin, and at what point for Frank.
- Does Frank want a 6-month-suspended → auto-purge policy? (Automated job, not a UI button.)

---

## 13. Phase Transitions

- **Phase 1 (Factory work):** this brief → DATA_CONTRACT → Designer → UI_SPEC → FFM → Claudy fabricates the frontend (auth real, domain mocked). Ends at §7 success criteria.
- **Phase 2+ (operator/later work):** swap domain service layer to real Supabase; Stripe webhook mirror; audit-log persistence; **real activation-invite + recovery/invite emails**; expired-registration timeout job.
- **Main-plan Phase 7:** the proven MissionControl admin pattern is handed back; the Architect authors StoreLens from it (onboarding excluded). Heather's super-admin access (decided provisionally) is revisited here only if Frank requests narrowing.

---

## 14. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 DRAFT | 2026-06-08 | Initial authoring. Three-noun model, drill-down nav, GREEN/RED split, console-only super-admin, HIPAA-safe dashboard. |
| 0.2 DRAFT | 2026-06-08 | Post-review surgical pass: Owner as derived view (no `owners` table); v1 super-admin Cyberize-only, Frank TBD; Restore-admin redefined store-scoped; auth-real/domain-mocked boundary; route map, service boundaries, per-action UX rules, display fields, Designer guidance added. |
| 0.3 DRAFT | 2026-06-20 | Folded in the **Onboarding Queue** feature (Feature Brief v1.0): new `/onboarding` + detail routes, Onboarding nav item, `PendingRegistrationService`, Approve/Reject GREEN actions, onboarding display fields, status lifecycle, new hard gate #12 (act-on-existing-only, no email/payment), converter row type. Confirmed against Frank's `register-pending` lifecycle: pharmacy self-submits the email, so the load-bearing constraint holds. Operator-access (Heather vs Cyberize-only) tagged to Phase 7. Activation-invite send flagged Phase-2 net-new. |
| 0.4 DRAFT | 2026-06-20 | **Heather super-admin access decided** (Coach-approved, provisional — revisit only if Frank narrows it). §3, the access risk, the open question, and the Phase-7 note updated to match. Resolves the contradiction the gate review caught between this brief (was Cyberize-only/TBD) and the designer's UI_SPEC §9 / Design Brief (Heather = super admin). The scoped onboarder-role fence is retained as the fallback design. |

---

🥄 *Stark Industries — App Factory v1.2 doctrine. Judge a request that already exists; never originate the person, never hold the credential, never touch the money or the PHI.*
