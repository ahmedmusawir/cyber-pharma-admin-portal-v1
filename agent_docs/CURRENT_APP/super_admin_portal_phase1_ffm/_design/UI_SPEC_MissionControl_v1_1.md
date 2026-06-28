# UI_SPEC — MissionControl (Super Admin Portal)

> **Version:** 1.1 (DRAFT — Designer-authored, awaiting DATA_CONTRACT reconciliation)
> **Status:** Authored FROM the locked `_design/` artifacts + APP_BRIEF + Onboarding Queue Feature Brief
> **Design Mode:** Demo (functional clarity)
> **Canonical screen:** Owners directory · **Token theme:** Metro Warm (Mist / Slate)
> **Conflict rule:** APP_BRIEF hard gates win. If a spec below implies a RED-list capability, the spec is wrong.

---

## 1. Screen Inventory

| # | Route | Screen | Pattern | Status |
|---|---|---|---|---|
| 1 | `/login` | Login | standalone form card (no shell) | Built |
| 2 | `/dashboard` | Dashboard | KPI tiles + bar chart + owners preview list | Built |
| 3 | `/onboarding` | Onboarding queue | DataTable of pending registrations + filters | Built |
| 4 | `/onboarding/[registrationId]` | Onboarding detail | read-only identity block + operator review | Built |
| 5 | `/owners` | Owners directory | **canonical** — app shell + card grid | Locked |
| 6 | `/owners/[ownerId]` | Owner detail | breadcrumb + owner band + store-card grid | Built |
| 7 | `/stores` | Stores directory | store-card grid | Built |
| 8 | `/stores/[storeId]` | Store detail | breadcrumb lock + header + roster + actions | Built |
| 9 | `/audit-log` | Audit log | read-only table | Built |

`/stores/[storeId]` is the single store-detail route, reached from both owner detail and the stores directory.

---

## 2. Visual System (reads from the token file)

- **App shell:** fixed left sidebar (248px) — brand, nav (**Dashboard / Onboarding / Owners / Stores / Audit log**), super-admin foot — + scrollable content region. Login has no shell. Onboarding sits second, between Dashboard and Owners (an attention/inbox surface).
- **Type:** Saira. H1 22–26/700, H2 20/700, H3 16/600, body 15/400, small 13 muted, label 11 uppercase tracked.
- **Radius:** `--radius: 0` (flat).
- **Active nav state:** coral tint background + coral text + 3px inset coral accent bar (left on desktop, bottom on mobile).
- **Status semantics:** success=Active/recovered/approved · warning=past-due/pending/invite · destructive=suspended/lost/rejected · info=neutral counts + converter badge. Pills = token-tinted bg + token text. **Brand coral is never a status.**

---

## 3. Responsive Rules (Rule Zero — 375px holds first)

- Sidebar → horizontal scrollable top strip; active accent moves to bottom border.
- Card grids 3-col → 2 (≤1024px) → 1 (≤760px); KPI tiles 4 → 2.
- Roster rows and **all DataTable rows** (audit log + onboarding queue) → stacked blocks; the table header hides, the primary cell surfaces first.
- Search inputs go full-width.

---

## 4. Hard Gates (RED — must never render, even disabled)

No member creation / invite-to-new-address · no password set/read field · **no email-change or email entry** · no delete-human · no billing/subscription/checkout control · no member-profile editing (beyond fenced restore-admin) · no OwedBook/claims/PHI/"$ recovered" · no grant-super-admin · no impersonation / force-sync / suspend-whole-pharmacy. **Verified absent across all nine screens.** The onboarding feature stays inside these gates because the operator only ever acts on an existing pending record and the activation invite goes only to the email already on it (§7.9).

---

## 5. GREEN Action Confirm Flows (the only writes)

Routed through `SupportActionService` (member actions) and **`PendingRegistrationService`** (onboarding actions); mock in Phase 1. Each emits a mock audit row consumed by the Audit log.

| Action | Confirmation UX | Success | State change (mock) |
|---|---|---|---|
| Suspend human | Confirm dialog naming the person | Toast + pill → Suspended | status → suspended |
| Un-suspend human | Confirm dialog naming the person | Toast + pill → Active | status → active |
| Trigger password recovery | Light confirm | Toast "Recovery email sent to {email}" | none |
| Resend invite | None (low risk) | Toast "Invite resent" | refresh `invited_at` |
| **Restore-admin** | **Typed store-name** confirm | Toast "Admin restored for {name} at {store}" | one `user_businesses` row, role=`admin` |
| **Approve registration** | Confirm dialog (names pharmacy); **verification note required** to enable | Toast "Approved — activation invite sent" | status → `approved`; invite fired (mock) |
| **Reject registration** | Confirm dialog (names pharmacy) + **reason** field | Toast "Registration rejected" | status → `rejected` (soft; never deleted) |

**Restore-admin fence:** store-scoped, `admin`-only, typed-confirm, loud audit row.
**Approve fence:** the activation invite goes **only to the email already on the record** — never entered or edited by the operator. The pharmacy sets its own password later in the main app. No payment/checkout renders in MissionControl.

---

## 6. Global States

- **Loading:** skeleton cards/rows/tiles; shell stays put.
- **Empty / no-match:** EmptyState (icon + one-line message + optional clear-search). Never a blank region.
- **Error:** inline non-destructive message + retry; action errors → destructive toast and the optimistic pill reverts.
- **Search:** client-filter over the loaded mock set.

---

## 7. Screen Specifications

### 7.1 Login `/login`
Real Supabase SSR auth gated by server-side `is_super_admin`; non-super-admins denied. Brand, email, password, Sign in (primary), forgot-password link, "no PHI" note. Sign in enabled when both fields non-empty; denial → inline error, no shell exposed.

### 7.2 Dashboard `/dashboard`
HIPAA-safe pulse + needs-attention preview (NOT the full directory). 4 KPI tiles (Pharmacies / Active subs / Pending / Suspended), "new pharmacies" bar chart, owners preview list (search + tappable rows → owner detail). All COUNT/GROUP-BY from `MissionDashboardService`; no claims/PHI.

### 7.3 Onboarding queue `/onboarding`
- **Purpose:** read surface of pharmacies awaiting onboarding approval.
- **Elements:** header + count; search by pharmacy name / NCPDP / NPI; status filter segments (default **Pending verification**; also Approved / Rejected / Expired); type filter (All / New / Converter); **DataTable** (DataTable KIP's 2nd home).
- **Columns:** Pharmacy · NCPDP · NPI · Contact · Submitted · Type badge (New=muted / Converter=info) · Status pill.
- **Gating:** row click → `/onboarding/[registrationId]`; Approve/Reject are **only enabled on `pending_verification`** rows (and live on the detail, not the row).
- **States:** loading skeleton rows; no-match → EmptyState.

### 7.4 Onboarding detail `/onboarding/[registrationId]`
- **Purpose:** verify and decide on one pending registration. The only onboarding write surface.
- **Elements:** breadcrumb context lock (Onboarding › {pharmacy}); header (name + type badge + status pill); **read-only identity block** (pharmacy name, NCPDP, NPI, pharmacy + pharmacist license, contact, role, email, phone/mobile/fax, website, address, software; converter rows add desktop username + linked business ref — all read-only); operator block: **required verification-notes** input + an **invite-destination callout** showing the on-record email as non-editable + Approve (primary) / Reject (destructive-outline).
- **Load-bearing constraint (design-enforced):** the identity block contains **zero inputs**; the only inputs in the whole feature are the verification note and the reject reason. The activation email is **displayed, never editable**. This is what keeps the feature off the RED list.
- **Gating:** Approve disabled until a verification note is entered; typed reason required on Reject.
- **States:** action in-flight → button busy; failure → revert + destructive toast.
- **HIPAA:** every field is pharmacy-identity (business paperwork), zero patient data.

### 7.5 Owners directory `/owners` (CANONICAL)
Searchable card grid of every owner → owner detail. Card: name · email · store count · status pill (worst-of their stores); graceful-empty member-count / last-activity slots. No-match → EmptyState.

### 7.6 Owner detail `/owners/[ownerId]`
Breadcrumb + owner band + card grid of that owner's stores (reuses store card) → store detail. Zero stores → EmptyState.

### 7.7 Stores directory `/stores`
Card grid of every store → store detail. Card: name · status · owner · NCPDP · member count. Search by name or NCPDP. No-match → EmptyState.

### 7.8 Store detail `/stores/[storeId]`
Always-visible breadcrumb lock; read-only store header; fenced store-scoped Restore-admin; member roster with per-row safe actions (Active → Send recovery / Suspend; Invite-pending → Resend invite; Suspended → Un-suspend). No add-member / password / email-edit / delete — not even disabled.

### 7.9 Audit log `/audit-log`
Read-only, append-only table. Columns Time · Actor · Action · Target · Result; no row actions. **Action vocabulary now includes** `Approved registration` and `Rejected registration` (loud rows from the onboarding actions) alongside the member-action set. Search filters; MultiSelect filter is a future KIP.

---

## 8. Human-in-the-Loop Checkpoints

Suspend/Un-suspend (confirm naming the person) · Restore-admin (typed store-name) · password recovery (light confirm) · **Approve registration (required verification note + confirm)** · **Reject registration (reason + confirm)**. Every GREEN action writes an audit row; the Audit log is the read-back of record.

---

## 9. Locked Decisions (Onboarding feature)

| Decision | Locked as |
|---|---|
| Detail surface | Own **route** `/onboarding/[id]` (parity + breadcrumb lock), not a drawer |
| Converters | **Same queue + type filter**, not a separate view |
| Verification note on approve | **Required** (feeds the loud audit row) |
| Reject | **Soft** (status flip, kept for record); never a hard delete |
| Invite-send representation | **Toast**; real email is a Phase 2 service swap |
| Operator access | Onboarding is a **super-admin** function; Heather is made a super admin. No separate onboarder role. |

---

## 10. Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 DRAFT | 2026-06-09 | Initial UI_SPEC from the seven locked design artifacts. |
| 1.1 DRAFT | 2026-06-20 | Folded in the **Onboarding** feature: `/onboarding` + `/onboarding/[id]` added to inventory and shell nav (now 5 items); Approve/Reject added to the GREEN flow table; per-screen specs §7.3–7.4 with the read-only / non-editable-email constraint; two new audit action types; architect §10 decisions locked. |
