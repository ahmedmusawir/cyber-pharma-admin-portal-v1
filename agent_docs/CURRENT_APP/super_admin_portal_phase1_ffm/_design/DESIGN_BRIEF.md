# MissionControl — Design State & Architect Alignment Brief

> **Codename:** MissionControl — Cyber Pharma Super Admin Operations Console
> **Document type:** Design State / Architect Alignment Brief (companion to `APP_BRIEF` doc #1)
> **Author:** Designer (Claude), MissionControl lab
> **Version:** 1.1 · **Date:** 2026-06-20
> **Purpose:** Get the Architect on the same page on the *locked design* before a new feature is scoped. Reflects what is actually built and rendered, not intentions.
> **Conflict rule:** `APP_BRIEF` hard gates win over everything here. If a design implies a RED-list capability, the design is wrong, not the gate.

---

## 1. What MissionControl Is (the one-paragraph anchor)

A **private, console-gated internal support tool** for the Cyberize team (e.g., Stark, Coach) to find any account across the whole Cyber Pharma platform and perform a small, fixed set of **safe, audited** support actions on people who **already exist** — *without ever touching billing, creating logins, or seeing PHI*. It is not for owners, members, or customers; they manage their own world in Cyber Pharma main (OwedBook / StoreLens). Greenfield build — the design output is the visual ground truth.

### The boundary that defines the whole app

| MissionControl — **no PHI** | OwedBook / StoreLens — **PHI lives here** |
|---|---|
| Super admin: read + *safe* writes | Owner (admin) + Member (staff) |
| **Can:** find any human + status; read audit log; suspend / un-suspend; trigger password recovery; restore-admin (fenced) | Owner: register + buy stores, **create members / invite**, manage own billing (Stripe) |
| **Can never:** create members or invite; set/read passwords; touch billing or PHI | Member: view own store data, do daily claims work |

Everything downstream — the screens, the actions, the gates — is a consequence of this split.

---

## 2. Design System (locked, inherited from Cyber Pharma main)

MissionControl drinks from the **same token well** as Cyber Pharma main — it does not get a new palette. Theme family: **Metro Warm**.

| Token axis | Value |
|---|---|
| Typeface | **Saira** |
| Corner language | **Flat** — `--radius: 0` |
| Brand primary | **Coral** `12 93% 64%` (HSL) — brand only, never a status color |
| Semantic four (meaning held across all modes) | success = recovered · destructive = money/state lost · warning = pending/attention · info = neutral counts |
| Theme modes | **Mist** (default light, bg `#e2e5ea`) · **Slate** (default dark, bg `#2e3440`) wired for Phase 1; Bright + Dark-deep catalogued |
| Token format | Tailwind 3.4 → HSL, no `hsl()` wrapper, mapped in `tailwind.config.ts` |

**Two design-system flags carried into this build (need an Architect/operator nod):**

1. **Derived neutrals — pending reconciliation against `TOKEN_FILE.md`.** The brand + semantic colors are the locked anchors. The neutral stack (`muted`, `border`, `ring`, `secondary`, per-mode foregrounds) was *derived* because `TOKEN_FILE.md` is not yet in the doc set. Flagged in the token file; true up when that file surfaces.
2. **Slate card lift.** The Theme Library lists Slate surface equal to its background (`#2e3440`). The build lifts the card a few points off the background for elevation (dark-mode readability lesson). Deliberate deviation — confirm and feed back into the real token file.

**Entry-stylesheet note (resolved):** the token file's extension is a **per-kit fact, not doctrine** (`globals.css` vs `globals.scss`). The token block is written extension-agnostic (`/* */` comments only) so it's valid either way; name it to match the kit (`ls src/app/globals.*`). Doc set updated accordingly (Handbook, Theming Manual, UI/UX Manual).

---

## 3. Screen Inventory & Status

All seven screens are **built and rendered** (token-driven HTML + Playwright PNG, Mist + Slate, mobile reflow wired into every screen's CSS). Owners is the locked **canonical**; the rest are clone-and-adapt or bespoke-content on the same shell.

| # | Route | Screen | Content pattern | Status |
|---|---|---|---|---|
| 1 | `/login` | Login | standalone centered card (no shell), **real** auth | ✅ built |
| 2 | `/dashboard` | Dashboard | KPI tiles + growth chart + owners preview (list rows) | ✅ built |
| 3 | `/owners` | Owners directory | **CANONICAL** — shell + card grid + search | ✅ locked |
| 4 | `/owners/[ownerId]` | Owner detail | breadcrumb + owner band + that owner's store cards | ✅ built |
| 5 | `/stores` | Stores directory | card grid (store cards) + search by name/NCPDP | ✅ built |
| 6 | `/stores/[storeId]` | Store detail | breadcrumb lock + read-only header + member roster + GREEN actions + fenced restore-admin | ✅ built |
| 7 | `/audit-log` | Audit log | read-only append-only table | ✅ built |
| 8 | `/onboarding` | Onboarding queue | DataTable of pending registrations + filters | ✅ built |
| 9 | `/onboarding/[id]` | Onboarding detail | read-only identity block + operator review (Approve/Reject) | ✅ built |

`/stores/[storeId]` is the single canonical store-detail route, reached from **both** front doors (owner detail and the stores directory).

---

## 4. The Structural Pattern (how the screens are made)

One **app shell** (left sidebar nav: Dashboard / Onboarding / Owners / Stores / Audit log, super-admin foot) wraps every authenticated screen; Login stands alone. Content regions are a small, reused vocabulary:

- **Card grid** (3-col → 2 → 1) — Owners, Stores, Owner detail. Locked, no table fallback.
- **List rows** — Dashboard owners preview (tappable, chevron → owner detail).
- **Roster rows** — Store detail members (avatar + identity + status pill + safe-action buttons).
- **Read-only table / queue** — Audit log + Onboarding queue (the DataTable pattern, proven across both).
- **KPI tiles + bar chart** — Dashboard pulse.
- **Standalone form card** — Login.

This is the "design once, build twice" surface: the card grid + member roster transfer **verbatim** to StoreLens at Phase 7. (Data-access does **not** transfer — see §8.)

---

## 5. Interaction Model — the GREEN actions

The only writes in the app. All mocked through `SupportActionService` in Phase 1 (auth is real; domain is mocked).

| Action | Confirmation | Feedback | Audit | Where it lives |
|---|---|---|---|---|
| Suspend human | Confirm dialog (shows name) | Toast + pill → Suspended | Yes | Store detail roster |
| Un-suspend human | Confirm dialog (shows name) | Toast + pill → Active | Yes | Store detail roster |
| Trigger password recovery | Light confirm | Toast "Recovery email sent" | Yes | Store detail roster |
| Resend existing invite | None (low risk) | Toast "Invite resent" | Yes | Store detail roster |
| **Restore-admin** (store-scoped) | **Typed store-name** confirm | Toast "Admin restored at {store}" | Yes (loud) | Store detail (fenced control) |
| **Approve registration** | Confirm + **required verification note** | Toast "Approved — activation invite sent" | Yes (loud) | Onboarding detail |
| **Reject registration** | Confirm + reason | Toast "Registration rejected" | Yes | Onboarding detail |

**Restore-admin is fenced:** restores a user's **admin membership to ONE store** (exactly one `user_businesses` row for a (user, business) pair). Store-scoped, never account-level, never cross-store, can only ever set the `admin` role (never super-admin), typed store-name confirm, loud audit row. *Design open question:* it currently renders as a **store-level** fenced control; per the brief the action is per-(user, store), so the user is chosen inside its confirm flow. Architect to confirm store-level control vs per-member row action.

**Always-on safety rail:** Store detail shows a breadcrumb context lock (Owners › Owner › Store) at all times to prevent wrong-store actions.

**Onboarding fence:** Approve/Reject act only on an existing pending record. The identity block is **fully read-only** and the activation email is **displayed, never editable** — the operator can never originate a person or redirect the invite. Onboarding is a **super-admin** function; Heather is made a super admin (no separate onboarder role). Payment never renders in MissionControl — it lives in the main app.

---

## 6. The RED List — what must never render

Non-negotiable hard gates. **None of these appears in the UI even disabled or greyed-out** (a disabled "Add member" button invites scope creep — if it's forbidden, it does not exist in the markup). Verified absent across all nine screens.

No member creation / invite-to-new-address · no setting/reading passwords · no changing a user's email · no deleting a human · no subscription/billing control · no editing member profile fields (beyond fenced restore-admin) · no OwedBook/claims/PHI rendered or queried (no "$ recovered") · no granting super-admin from the UI · no impersonation / "log in as" / force-sync / suspend-whole-pharmacy.

---

## 7. Service Boundaries & Display Fields (what the designs render against)

Service names are locked; types live in `DATA_CONTRACT`. All return typed **mock** data in Phase 1.

`MissionDashboardService` (pulse metrics) · `OwnerDirectoryService` (owners derived view + detail) · `StoreDirectoryService` (all stores + store header) · `StoreMemberService` (roster) · `SupportActionService` (the GREEN writes) · `AuditLogService` (append + read) · **`PendingRegistrationService`** (list/get pending registrations + approve/reject — onboarding feature).

Designs render the brief's **minimum display fields**: owner card (name · email · store count · status pill, with graceful-empty slots for member count / last activity); store card (name · owner · NCPDP · sub status · member count); roster row (name · email · role · status · invite status · safe actions). "If available" fields are designed as graceful-empty so cards don't reflow when `DATA_CONTRACT` lands.

> **Domain note:** an **Owner is not a table** — it's a derived projection over `users` + `user_businesses`. Store count = distinct businesses where the user holds the owner/admin role. The exact owner-role enum value must be confirmed against the Frank schema in `DATA_CONTRACT`.

---

## 8. Architecture & Stack Constraints

| Layer | Technology | Note |
|---|---|---|
| Framework | Next.js **App Router** | kit-provided; no `pages/`, no `getServerSideProps` |
| Auth (**REAL** in Phase 1) | Supabase SSR + `is_super_admin` server-side gate | **NOT mocked**; non-super-admin denied |
| Authorization | RBAC + RLS, roles in `user_roles` | secure pattern; kit-provided; do not rebuild |
| Styling | Tailwind 3.4 + semantic tokens | same well as main; every color a token, zero hardcoded hex |
| Components | shadcn primitives | compose; flag genuine gaps as KIPs |
| State | Zustand | factory standard |
| Billing (read-only) | Stripe → `subscriptions` mirror | pulse only, never a control surface |
| Build mode | **Frontend-first** — auth real, **domain mocked** via typed services | the service layer is the sole later swap point |

**Folder discipline:** `/services` (API/domain logic) · `/types` (interfaces). Extend kit foundations (auth, RBAC, RLS, user-CRUD) — never re-author them.

**Key transfer caveat:** components transfer to StoreLens; **data-access does not** — MissionControl is platform-wide; StoreLens is own-stores-only under RLS. "Design once, build twice" applies to the UI layer, not the query layer.

---

## 9. Deliverables Status

| # | Deliverable | Status |
|---|---|---|
| Token file (`globals.css`/`globals.scss`, Metro Warm, Mist+Slate) | ✅ done (derived neutrals flagged) |
| 9 screen artifacts (HTML build-ref + PNG QC, Mist+Slate) | ✅ done |
| Style tile (HTML+PNG, full token system on one page) | ⬜ pending |
| `UI_SPEC.md` (hierarchy, gating, GREEN confirm flows, states, responsive, hard-gate list) | ⬜ pending |
| Component manifest + KIPs | ⬜ pending |

**KIPs flagged build-first:** **DataTable** (audit log), **EmptyState** (empty searches/zero-result directories), **MultiSelect** (future filtering). Upstream dependency (not Designer-owned): **`DATA_CONTRACT`** — doc #2, not yet authored; designs proceed on the brief's §5.6 fields.

---

## 10. Open Decisions — needs Architect input

| # | Decision | Designer position |
|---|---|---|
| 1 | `DATA_CONTRACT` authoring + owner-role enum confirmation | Blocking for real wiring, not for design; designed to §5.6 minimum fields |
| 2 | `TOKEN_FILE.md` reconciliation of derived neutrals | Adopt real values when the file surfaces; current neutrals are principled placeholders |
| 3 | Slate card lift vs Theme Library (equal bg/surface) | Recommend keeping the lift for dark-mode elevation; confirm + write back to token file |
| 4 | `globals.css` vs `globals.scss` (kit truth) | Confirm via `ls src/app/globals.*`; token block already portable |
| 5 | Restore-admin placement (store-level control vs per-member row) | Currently store-level; per-brief it's per-(user, store) — confirm reading |
| 6 | `UI_SPEC` version (v1.0 vs v1.1) | Operator/Architect call |
| 7 | Uppercase pills/labels (Metro doctrine) vs reference's sentence-case | Went uppercase-tracked per Metro; trivial to flip |

---

## 11. Roadmap / Phase Transitions

- **Phase 1 (now):** APP_BRIEF → DATA_CONTRACT → Designer → UI_SPEC → Claudy fabricates the frontend (auth real, domain mocked). Ends at the brief's §7 success criteria.
- **Phase 2+:** swap the domain service layer to real Supabase; Stripe webhook mirror; audit-log persistence; real recovery/invite emails.
- **Phase 7 (central project):** the proven MissionControl admin pattern is handed back; the Architect authors **StoreLens** from it; Claudy fabricates it into Cyber Pharma main. UI transfers; data-access is re-derived under owner RLS.

---

## 12. Readiness Checklist for an Incoming Feature

Any new feature proposed for this UI should be measured against the existing frame **before** design:

1. **Hard-gate test.** Does it create accounts, hold/read a credential, change email, delete a human, touch billing, edit member fields beyond restore-admin, render PHI, grant super-admin, or add an override power? If **any** → it's RED-list; stop.
2. **Action shape.** If it's a write, does it fit the GREEN pattern (confirm → feedback → audit row → mock-state change), and which service owns it (`SupportActionService` or a new typed service)?
3. **Surface.** Which screen/route hosts it, and does it reuse an existing content pattern (card grid / roster / table / tiles) or genuinely need a new one (→ KIP)?
4. **Tokens.** Every new element reads from the existing semantic tokens — no new color invented outside the token file.
5. **Read vs write.** If it reads platform data, is it HIPAA-safe (COUNT/GROUP-BY, never claims/PHI)?
6. **Transfer.** Does it belong in the "design once, build twice" surface (and thus StoreLens), or is it MissionControl-only?

A feature that passes 1–6 slots cleanly into the locked system; one that fails #1 is out of scope by definition.

---

## 13. Source-of-Truth & Changelog

**Reading order (highest authority first):** APP_BRIEF (scope + hard gates) → DATA_CONTRACT (types/contracts, *pending*) → Designer output `_design/` (visual ground truth) → UI_SPEC (*pending*) → this brief (design-state synthesis).

| Version | Date | Change |
|---|---|---|
| 1.1 | 2026-06-20 | Folded in the **Onboarding** feature (queue + detail): inventory → 9 screens, shell nav → 5 items, Approve/Reject added to the GREEN model, `PendingRegistrationService` added, onboarding fence + access resolution (Heather = super admin) recorded, two new audit action types. |
| 1.0 | 2026-06-09 | Initial design-state brief. Captures locked Metro Warm system, all seven built screens, GREEN/RED interaction model, stack + service boundaries, deliverables status, open decisions, and the incoming-feature readiness checklist. Authored for Architect alignment ahead of a new feature. |

---

🥄 *Stark Industries — App Factory v1.2 doctrine. Act on existing accounts, never create them, never hold the credential, never touch the money or the PHI.*
