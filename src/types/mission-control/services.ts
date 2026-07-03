// MissionControl — Service Contracts (DATA_CONTRACT §4)
//
// THE SOLE SWAP POINT. Every method returns typed MOCK data in Phase 1; real
// Supabase wiring later replaces the mock bodies — these signatures are frozen
// and do NOT change. Auth is real; these domain services are mocked.
//
// Scope invariants baked in by omission (RED list / APP_BRIEF §6):
//   • No create-*/invite-to-new-address method — MissionControl originates no accounts.
//   • No password set/read, no email-entry argument anywhere.
//   • No billing/subscription/checkout method — sub status is read-only data.
//   • No delete-human — suspend / soft-reject only.

import type {
  PlatformStats,
  GrowthPoint,
  OwnerSummary,
  OwnerDetail,
  StoreSummary,
  StoreDetail,
  Member,
  PendingRegistrationSummary,
  PendingRegistrationDetail,
  AuditEntry,
  ActionResult,
} from './entities';
import type { RegistrationStatus, RegistrationType } from './status';

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
// `approve` fires the activation invite to the on-record email — it never accepts
// an email argument. `reject` is a soft status flip; the record is retained.
export interface PendingRegistrationService {
  listPending(params?: {
    status?: RegistrationStatus; // default 'pending_verification'
    type?: RegistrationType;
    search?: string; // name / NCPDP / NPI
  }): Promise<PendingRegistrationSummary[]>;
  getPending(registrationId: string): Promise<PendingRegistrationDetail>;
  approve(params: { registrationId: string; verificationNote: string }): Promise<ActionResult>;
  reject(params: { registrationId: string; reason: string }): Promise<ActionResult>;
}

export interface AuditLogService {
  listEntries(params?: { search?: string }): Promise<AuditEntry[]>;
  append(entry: Omit<AuditEntry, 'id' | 'occurredAt'>): Promise<AuditEntry>; // internal
}
