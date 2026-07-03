// MissionControl — Identity + View-Models (DATA_CONTRACT §2, §3, §3.7)
//
// View-models are screen-shaped projections, NOT raw DB rows. MissionControl
// reads; it never returns a writable entity. There are intentionally NO
// create-* shapes and NO editable identity/credential/billing fields anywhere
// here — the RED list is the product definition (APP_BRIEF §6), absolute for
// every operator including the super-admin.

import type {
  AccountStatus,
  MemberRole,
  StoreHealth,
  SubscriptionStatus,
  RegistrationStatus,
  RegistrationType,
} from './status';

// ── §2 Identity (from REAL auth — not mocked) ──────────────────────────────
//
// The logged-in operator is the ONLY domain object sourced from real Supabase.
// There is a SINGLE operator role in MissionControl: super-admin. No admin/member
// operator variants exist here (the kit's admin/member roles are learn-from-only).
//
// is_super_admin RULING (operator-confirmed 2026-07-01): the DATA_CONTRACT's
// `is_super_admin` is the CONCEPT; the IMPLEMENTATION is the kit-real check
// `role === 'superadmin'` resolved server-side via user_roles / getUserRole().
// `isSuperAdmin` below is therefore a derived invariant — (kitRole === 'superadmin')
// computed server-side — NOT a read of any `is_super_admin` column (no such column
// exists on disk; that doc claim is logged for a later doc-drift correction).
export interface SuperAdminUser {
  id: string; // Supabase auth.users.id (uuid)
  email: string;
  displayName: string; // best-available; falls back to email local-part
  isSuperAdmin: true; // invariant for any session that reaches the shell
}

// ── §3.1 Owner (derived projection — no owners table) ──────────────────────

// Owners directory card + Dashboard owners-preview row.
export interface OwnerSummary {
  ownerId: string; // the admin user's id
  name: string; // display name — see DATA_CONTRACT §6 provenance note
  email: string;
  storeCount: number; // distinct businesses where this user is 'admin'
  memberCount?: number; // aggregate across their stores (graceful-empty)
  health: StoreHealth; // worst-of their stores
  lastActivityAt?: string; // ISO; graceful-empty
}

// Owner detail header + their stores.
export interface OwnerDetail {
  ownerId: string;
  name: string;
  email: string;
  health: StoreHealth;
  stores: StoreSummary[]; // reuses the store card
}

// ── §3.2 Store (Business) ──────────────────────────────────────────────────

// Stores directory card + Owner-detail store card.
export interface StoreSummary {
  storeId: string; // businesses.id
  name: string; // businesses.pharmacy_name
  ownerId: string;
  ownerName: string;
  ncpdp: string;
  npi?: string; // optional on card
  state?: string; // present in Frank schema; card render TBD (future filter)
  memberCount: number;
  health: StoreHealth;
}

// Store detail header + roster.
export interface StoreDetail {
  storeId: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ncpdp: string;
  npi: string;
  state?: string;
  subscriptionStatus: SubscriptionStatus; // drives the read-only "SUB" header pill
  members: Member[];
}

// ── §3.3 Member (roster row) ───────────────────────────────────────────────
//
// Available safe actions are DERIVED by the UI from accountStatus, never stored:
//   active → [sendRecovery, suspend]; invite_pending → [resendInvite]; suspended → [unsuspend]
// No create / password / email-edit / delete action exists for a member.
export interface Member {
  userId: string;
  name: string;
  email: string; // display-only (no email-edit field anywhere — RED list)
  role: MemberRole; // 'admin' | 'user' (Frank truth)
  jobTitle?: string; // UNBACKED in Frank schema; graceful-empty mock flavor (§6)
  accountStatus: AccountStatus;
  inviteStatus?: 'pending'; // present only when accountStatus === 'invite_pending'
  lastLoginAt?: string; // ISO; graceful-empty
}

// ── §3.4 Pending Registration (onboarding) ─────────────────────────────────

// Onboarding queue row.
export interface PendingRegistrationSummary {
  registrationId: string;
  pharmacyName: string;
  ncpdp: string;
  npi: string;
  contactPerson: string;
  submittedAt: string; // ISO (Frank: created_at)
  type: RegistrationType; // from is_desktop_converter
  status: RegistrationStatus;
}

// Onboarding detail — read-only identity block + operator review.
// The identity block is display-only by design: `email` is the activation-invite
// destination and is NEVER editable (this is what keeps the feature off the RED list).
export interface PendingRegistrationDetail {
  registrationId: string;
  pharmacyName: string;
  ncpdp: string;
  npi: string;
  pharmacyLicense?: string;
  pharmacistLicense?: string;
  contactPerson: string;
  roleInPharmacy?: string;
  email: string; // the activation-invite destination — READ-ONLY, never editable
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
  address?: string; // composed: address, city, state, zip
  pharmacySoftware?: string;
  submittedAt: string;
  type: RegistrationType;
  status: RegistrationStatus;
  // Converter-only (present when type === 'converter'):
  desktopUsername?: string;
  linkedBusiness?: { businessId: string; name: string }; // read-only confirmation ref
}

// ── §3.5 Dashboard ─────────────────────────────────────────────────────────
//
// All COUNT/GROUP-BY on platform tables. Never claims/PHI. No "$ recovered".
export interface PlatformStats {
  totalPharmacies: number;
  totalOwners: number;
  totalMembers: number;
  activeSubs: number; // KPI tile
  pastDueSubs: number;
  canceledSubs: number;
  pendingInvites: number; // KPI tile ("Pending")
  suspendedAccounts: number; // KPI tile
}

export interface GrowthPoint {
  label: string; // e.g. "Jan"
  count: number; // new pharmacies that month
}

// ── §3.6 Audit ─────────────────────────────────────────────────────────────
//
// The action vocabulary is closed: only the GREEN actions can be audited. There
// is deliberately no created_* / deleted_* action — this app originates nothing
// and deletes no human.
export type AuditAction =
  | 'suspended_member'
  | 'unsuspended_member'
  | 'sent_recovery'
  | 'resent_invite'
  | 'restored_admin'
  | 'approved_registration'
  | 'rejected_registration';

export interface AuditEntry {
  id: string;
  occurredAt: string; // ISO
  actorName: string; // the super-admin who acted
  action: AuditAction;
  target: string; // human label, e.g. "Tina Cho" or "Cedar Pharmacy"
  result: 'done' | 'failed';
}

// ── §3.7 Shared action result ──────────────────────────────────────────────
export interface ActionResult {
  ok: boolean;
  message: string; // toast copy
  auditId?: string; // the audit row this action wrote
}
