# DATA_CONTRACT — MissionControl (Super Admin Portal)

**Document type:** DATA_CONTRACT (canonical Factory handoff doc #2 of 4)
**Author:** Architect (Claude), MissionControl lab
**Version:** 1.0 · **Date:** 2026-06-20
**Companion to:** APP_BRIEF rev 0.4 · UI_SPEC v1.1 · COMPONENT_MANIFEST v1.1
**Evidence base:** Frank API extraction (`models.py` verbatim) + Triangulation Doc (rebuild schema resolution)
**Conflict rule:** APP_BRIEF hard gates win on scope. This doc wins on **data shapes**. UI_SPEC wins on behavior.

---

## 0. The Owner-Role Resolution (the open question, now closed)

The blocking DATA_CONTRACT question — *what role value denotes an "owner"?* — is resolved from Frank's schema:

> **`user_businesses.role` is `String(50)`, default `'user'`, with only two real values: `'admin'` or `'user'`. There is NO separate `'owner'` enum.**

Therefore, in MissionControl:

- **An Owner is a derived projection, not a row.** Owner = a user who holds `role = 'admin'` in **one or more** `user_businesses` rows. There is no `owners` table.
- **`storeCount`** = count of distinct `business_id` where `(user_id = U, role = 'admin')`.
- **A Member** is a user with `role = 'user'` on a store.
- **Primary store** = the `user_businesses` row with `is_primary = true`.
- **Super-admin** is orthogonal: a platform flag in `user_roles.is_super_admin` (server-controlled), with `business_id IS NULL`. It is NOT a `user_businesses` role.

**Edge case to honor:** a single store can have multiple `admin` users (co-owners). Such a store appears under each admin-user in the Owners directory. The directory lists *admin-users*, not a one-to-one owner-per-store.

---

## 1. Status Vocabularies (single source of truth)

These enums back every pill in the UI. Defined once; imported everywhere.

```typescript
// Member/user account state (NOT the same as user_businesses.role)
export type AccountStatus = 'active' | 'suspended' | 'invite_pending';

// Per-business permission role (Frank: user_businesses.role)
export type MemberRole = 'admin' | 'user';

// Business lifecycle (Frank: businesses.status)
export type BusinessStatus = 'pending' | 'active' | 'suspended';

// Stripe subscription mirror (Frank: businesses.subscription_status)
export type SubscriptionStatus =
  | 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';

// Derived single pill for store cards (precedence: suspended > past_due > active)
export type StoreHealth = 'active' | 'past_due' | 'suspended';

// Onboarding (Frank: pending_registrations.status)
export type RegistrationStatus =
  | 'pending_verification' | 'approved' | 'rejected' | 'expired' | 'completed';

// Onboarding row type (Frank: pending_registrations.is_desktop_converter)
export type RegistrationType = 'new' | 'converter';
```

**StoreHealth derivation (the service computes this; the UI never re-derives):**
`suspended` if `business.status === 'suspended'`; else `past_due` if `subscription_status ∈ {past_due, unpaid, incomplete}`; else `active`.

**Pill mapping (UI_SPEC §2 semantic four):** active→success · past_due/invite_pending→warning · suspended/rejected→destructive · neutral counts + `converter`→info. Brand coral is never a status.

---

## 2. Identity (from REAL auth — not mocked)

The logged-in operator is the only domain object sourced from **real** Supabase in Phase 1.

```typescript
// Resolved server-side from auth.getUser() + user_roles.is_super_admin.
// Login is denied unless isSuperAdmin === true.
export interface SuperAdminUser {
  id: string;          // Supabase auth.users.id (uuid)
  email: string;
  displayName: string; // best-available; falls back to email local-part
  isSuperAdmin: true;  // invariant for any session that reaches the shell
}
```

---

## 3. View-Models (what the mocked services return)

These are **screen-shaped projections**, not raw DB rows. MissionControl reads; it never returns a writable entity.

### 3.1 Owner

```typescript
// Owners directory card + Dashboard owners-preview row
export interface OwnerSummary {
  ownerId: string;          // the admin user's id
  name: string;             // display name — see §6 provenance note
  email: string;
  storeCount: number;       // distinct businesses where this user is 'admin'
  memberCount?: number;     // aggregate across their stores (graceful-empty)
  health: StoreHealth;      // worst-of their stores
  lastActivityAt?: string;  // ISO; graceful-empty
}

// Owner detail header + their stores
export interface OwnerDetail {
  ownerId: string;
  name: string;
  email: string;
  health: StoreHealth;
  stores: StoreSummary[];   // reuses the store card
}
```

### 3.2 Store (Business)

```typescript
// Stores directory card + Owner-detail store card
export interface StoreSummary {
  storeId: string;          // businesses.id
  name: string;             // businesses.pharmacy_name
  ownerId: string;
  ownerName: string;
  ncpdp: string;
  npi?: string;             // optional on card
  state?: string;           // present in Frank schema; card render TBD (filter later)
  memberCount: number;
  health: StoreHealth;
}

// Store detail header + roster
export interface StoreDetail {
  storeId: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ncpdp: string;
  npi: string;
  state?: string;
  subscriptionStatus: SubscriptionStatus; // drives the "SUB ACTIVE" header pill
  members: Member[];
}
```

### 3.3 Member (roster row)

```typescript
export interface Member {
  userId: string;
  name: string;
  email: string;
  role: MemberRole;            // 'admin' | 'user' (Frank truth)
  jobTitle?: string;           // ⚠️ see §6 — UNBACKED in Frank's schema; graceful-empty
  accountStatus: AccountStatus;
  inviteStatus?: 'pending';    // present only when accountStatus === 'invite_pending'
  lastLoginAt?: string;        // ISO; graceful-empty
  // Available actions are derived by the UI from accountStatus, not stored:
  //   active → [sendRecovery, suspend]; invite_pending → [resendInvite]; suspended → [unsuspend]
}
```

### 3.4 Pending Registration (onboarding)

```typescript
// Onboarding queue row
export interface PendingRegistrationSummary {
  registrationId: string;
  pharmacyName: string;
  ncpdp: string;
  npi: string;
  contactPerson: string;
  submittedAt: string;        // ISO (Frank: created_at)
  type: RegistrationType;     // from is_desktop_converter
  status: RegistrationStatus;
}

// Onboarding detail — read-only identity block + operator review
export interface PendingRegistrationDetail {
  registrationId: string;
  pharmacyName: string;
  ncpdp: string;
  npi: string;
  pharmacyLicense?: string;
  pharmacistLicense?: string;
  contactPerson: string;
  roleInPharmacy?: string;
  email: string;              // the activation-invite destination — READ-ONLY, never editable
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
  address?: string;           // composed: address, city, state, zip
  pharmacySoftware?: string;
  submittedAt: string;
  type: RegistrationType;
  status: RegistrationStatus;
  // Converter-only (present when type === 'converter'):
  desktopUsername?: string;
  linkedBusiness?: { businessId: string; name: string }; // read-only confirmation ref
}
```

### 3.5 Dashboard

```typescript
export interface PlatformStats {
  totalPharmacies: number;
  totalOwners: number;
  totalMembers: number;
  activeSubs: number;     // KPI tile
  pastDueSubs: number;
  canceledSubs: number;
  pendingInvites: number; // KPI tile ("Pending")
  suspendedAccounts: number; // KPI tile
  // All COUNT/GROUP-BY on platform tables. Never claims/PHI. No "$ recovered".
}

export interface GrowthPoint {
  label: string;   // e.g. "Jan"
  count: number;   // new pharmacies that month
}
```

### 3.6 Audit

```typescript
export type AuditAction =
  | 'suspended_member' | 'unsuspended_member'
  | 'sent_recovery' | 'resent_invite' | 'restored_admin'
  | 'approved_registration' | 'rejected_registration';

export interface AuditEntry {
  id: string;
  occurredAt: string;     // ISO
  actorName: string;      // the super-admin who acted
  action: AuditAction;
  target: string;         // human label, e.g. "Tina Cho" or "Cedar Pharmacy"
  result: 'done' | 'failed';
}
```

### 3.7 Shared action result

```typescript
export interface ActionResult {
  ok: boolean;
  message: string;        // toast copy
  auditId?: string;       // the audit row this action wrote
}
```

---

## 4. Service Contracts (the SOLE swap point)

Every method returns **typed mock data** in Phase 1. Auth is real; these are mocked. Real Supabase wiring replaces the mock bodies later — signatures do not change.

```typescript
export interface MissionDashboardService {
  getPlatformStats(): Promise<PlatformStats>;
  getGrowth(months: number): Promise<GrowthPoint[]>;
  getOwnersPreview(limit: number): Promise<OwnerSummary[]>; // recent / needs-attention
}

export interface OwnerDirectoryService {
  listOwners(params?: { search?: string }): Promise<OwnerSummary[]>;
  getOwner(ownerId: string): Promise<OwnerDetail>;
}

export interface StoreDirectoryService {
  listStores(params?: { search?: string }): Promise<StoreSummary[]>;
  getStore(storeId: string): Promise<StoreDetail>;
}

export interface StoreMemberService {
  listMembers(storeId: string): Promise<Member[]>;
}

// Every method emits an AuditEntry (via AuditLogService.append) in the mock.
export interface SupportActionService {
  suspendUser(userId: string): Promise<ActionResult>;
  unsuspendUser(userId: string): Promise<ActionResult>;
  sendPasswordRecovery(userId: string): Promise<ActionResult>;
  resendInvite(userId: string): Promise<ActionResult>;
  // store-scoped, admin-only; confirm requires the typed store name (validated in UI)
  restoreAdmin(params: {
    userId: string;
    storeId: string;
    typedStoreNameConfirm: string;
  }): Promise<ActionResult>;
}

// Acts ONLY on existing self-submitted records. No create, no email entry, no payment.
export interface PendingRegistrationService {
  listPending(params?: {
    status?: RegistrationStatus;   // default 'pending_verification'
    type?: RegistrationType;
    search?: string;               // name / NCPDP / NPI
  }): Promise<PendingRegistrationSummary[]>;
  getPending(registrationId: string): Promise<PendingRegistrationDetail>;
  approve(params: { registrationId: string; verificationNote: string }): Promise<ActionResult>;
  reject(params: { registrationId: string; reason: string }): Promise<ActionResult>;
}

export interface AuditLogService {
  listEntries(params?: { search?: string }): Promise<AuditEntry[]>;
  append(entry: Omit<AuditEntry, 'id' | 'occurredAt'>): Promise<AuditEntry>; // internal
}
```

**Approve/Reject invariants (enforced by the mock + later the real service):**
`approve` only transitions `pending_verification → approved` and fires the activation invite to `detail.email` (the on-record address) — it never accepts an email argument. `reject` only transitions to `rejected` (soft; record retained) and never deletes. Both require their text input (note / reason) to be non-empty.

---

## 5. Mock Data Requirements

The mock set must exercise every state the UI can render, or QA can't see them.

- **Owners (≥6):** at least one multi-store owner (5+ stores), one single-store, one whose stores include a **past_due** store (→ `health: past_due`), and one with a **suspended** store (→ `health: suspended`).
- **Restore-admin scenario:** at least one store reachable where the owner has **no active `admin` membership** (locked-out), so the fenced action has a real target.
- **Members:** cover all three `AccountStatus` values on at least one store (active, suspended, invite_pending).
- **Stores (≥ a few hundred count for the "318 total" label; render a page):** cover all three `StoreHealth` values.
- **Pending registrations:** at least one of **each** `type` (new, converter) and span the statuses (`pending_verification`, `approved`, `rejected`, `expired`). Converter rows must carry `desktopUsername` + `linkedBusiness`.
- **Audit:** entries for every `AuditAction`, including `approved_registration` and `rejected_registration`.
- **Dashboard:** `PlatformStats` numbers consistent with the mock owners/stores/members; `getGrowth(6)` returns 6 ascending-ish points.

Mocks live in `/mocks`, deletable in one commit. Types live in `/types`. Services in `/services` import types from `/types` and data from `/mocks`.

---

## 6. Field Provenance & Reconciliation Notes

Where each non-obvious field comes from in Frank's schema — and the three places the design outran the schema (flagged, not silently invented).

| View-model field | Frank source | Note |
|---|---|---|
| `OwnerSummary.ownerId` | `users.id` (the admin user) | derived projection |
| `OwnerSummary.storeCount` | COUNT `user_businesses` where role='admin' | derived |
| `StoreSummary.health` | `businesses.status` + `subscription_status` | derived (§1 precedence) |
| `StoreDetail.subscriptionStatus` | `businesses.subscription_status` | direct |
| `Member.role` | `user_businesses.role` | `'admin' | 'user'` only |
| `PendingRegistration*.type` | `pending_registrations.is_desktop_converter` | boolean → enum |
| `PendingRegistrationDetail.linkedBusiness` | `pending_registrations.business_id` | converter link, read-only |
| `PendingRegistrationDetail.email` | `pending_registrations.email` | the non-editable invite destination |

**Three reconciliation flags (need an operator nod; none blocks the FFM build):**

1. **`Member.jobTitle` is unbacked.** The designs show "pharmacist" / "technician", but Frank's `user_businesses` has **no job-title column** — only `role` (`admin`/`user`). Resolution options: (a) display the permission role instead ("Admin"/"Member"), or (b) keep `jobTitle?` as an optional graceful-empty field pending a real source. **Recommend (b) for now** — designed as graceful-empty so cards don't reflow; the pharmacist/technician strings are mock flavor until a job-title source is confirmed.

2. **Owner `name` has no clean source.** Frank's `users` has `username` + `email`, not a display name. Candidates: `businesses.contact_person` from the owner's primary store, or a future profile field. **Recommend:** derive `displayName` from `contact_person` of the primary store for v1; fall back to email local-part. Flagged for confirmation.

3. **`StoreSummary.state`** exists in Frank's schema but the designed card omits it (owner name took the slot). Kept optional in the type; **recommend** surfacing `state` as a future directory **filter** rather than a card field.

---

## 7. Build-Time Boundary (restates APP_BRIEF §6.11)

- **Auth is real.** `SuperAdminUser` comes from Supabase SSR + `user_roles.is_super_admin`. Do NOT mock it.
- **Domain is mocked.** Every service in §4 returns mock data behind its interface. Do NOT wire real Supabase domain CRUD in Phase 1.
- **The service interfaces are the only swap point.** Real wiring (Phase 2) replaces mock bodies; the contracts in §4 are frozen.

---

## 8. Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-20 | Initial DATA_CONTRACT. **Resolved the owner-role enum** from Frank's `models.py` (`user_businesses.role` = `'admin'`/`'user'`; Owner = derived `admin`-holder, no `owners` table, no `'owner'` enum). Defined status vocabularies, view-models for all 9 screens, the 7 service contracts (incl. `PendingRegistrationService`), mock requirements, and field provenance. Flagged three design-vs-schema reconciliations: member `jobTitle` (unbacked), owner display-name source, and store `state` on card. |

---

🥄 *Stark Industries — App Factory v1.2 doctrine. The contract is the type-level truth; the service layer is the only door to the real backend.*
