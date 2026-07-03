// MissionControl — SupportActionService (mock-backed, DATA_CONTRACT §4)
//
// The member-scoped GREEN writes. Every method emits an AuditEntry via
// auditLogService.append. Mock state changes mutate the in-memory roster.
//
// Hard boundaries (RED list — enforced by ABSENCE of any such method):
//   • no create/invite-new-address • no password set/read • no email edit
//   • no delete-human (suspend only) • no billing.
// sendPasswordRecovery is a recovery *trigger* (APP_BRIEF §5.4), never a password field.

import type {
  SupportActionService,
  ActionResult,
  Member,
} from '@/types/mission-control';
import { mockDb, MOCK_ACTOR_NAME } from '@/mocks/mission-control/store';
import { auditLogService } from './auditLogService';

// A human may hold rows on several stores; account-level actions touch all rows.
function findMemberRows(userId: string): Member[] {
  return Object.values(mockDb.membersByStoreId)
    .flat()
    .filter((m) => m.userId === userId);
}

function label(rows: Member[], fallback: string): string {
  return rows[0]?.name ?? fallback;
}

export const supportActionService: SupportActionService = {
  async suspendUser(userId) {
    const rows = findMemberRows(userId);
    rows.forEach((m) => {
      m.accountStatus = 'suspended';
      delete m.inviteStatus;
    });
    const audit = await auditLogService.append({
      actorName: MOCK_ACTOR_NAME,
      action: 'suspended_member',
      target: label(rows, userId),
      result: rows.length ? 'done' : 'failed',
    });
    return {
      ok: rows.length > 0,
      message: rows.length
        ? `${label(rows, userId)} suspended`
        : 'Member not found',
      auditId: audit.id,
    };
  },

  async unsuspendUser(userId) {
    const rows = findMemberRows(userId);
    rows.forEach((m) => {
      m.accountStatus = 'active';
    });
    const audit = await auditLogService.append({
      actorName: MOCK_ACTOR_NAME,
      action: 'unsuspended_member',
      target: label(rows, userId),
      result: rows.length ? 'done' : 'failed',
    });
    return {
      ok: rows.length > 0,
      message: rows.length
        ? `${label(rows, userId)} reactivated`
        : 'Member not found',
      auditId: audit.id,
    };
  },

  async sendPasswordRecovery(userId) {
    // Recovery TRIGGER only — no password is ever set or read. No state change.
    const rows = findMemberRows(userId);
    const audit = await auditLogService.append({
      actorName: MOCK_ACTOR_NAME,
      action: 'sent_recovery',
      target: label(rows, userId),
      result: 'done',
    });
    return {
      ok: true,
      message: `Recovery email sent to ${rows[0]?.email ?? 'the account on record'}`,
      auditId: audit.id,
    };
  },

  async resendInvite(userId) {
    // Resend of an EXISTING invite — never an invite to a new address.
    const rows = findMemberRows(userId);
    const audit = await auditLogService.append({
      actorName: MOCK_ACTOR_NAME,
      action: 'resent_invite',
      target: label(rows, userId),
      result: 'done',
    });
    return { ok: true, message: 'Invite resent', auditId: audit.id };
  },

  // Fenced: store-scoped, admin-only, typed store-name confirm, loud audit row.
  async restoreAdmin({ userId, storeId, typedStoreNameConfirm }) {
    const store = mockDb.storeDetailsById[storeId];

    // Invariant 1: the typed store name must match exactly (UI also validates).
    if (!store || store.name !== typedStoreNameConfirm) {
      const audit = await auditLogService.append({
        actorName: MOCK_ACTOR_NAME,
        action: 'restored_admin',
        target: store?.name ?? storeId,
        result: 'failed',
      });
      const message: ActionResult['message'] = store
        ? 'Store-name confirmation did not match'
        : `Store not found: ${storeId}`;
      return { ok: false, message, auditId: audit.id };
    }

    // Mock state: re-activate/create ONE user_businesses admin row for (user, store).
    const roster = (mockDb.membersByStoreId[storeId] ??= []);
    const existing = roster.find((m) => m.userId === userId);
    if (existing) {
      existing.role = 'admin';
      existing.accountStatus = 'active';
    } else {
      roster.push({
        userId,
        name: userId,
        email: '',
        role: 'admin',
        accountStatus: 'active',
      });
    }

    const audit = await auditLogService.append({
      actorName: MOCK_ACTOR_NAME,
      action: 'restored_admin',
      target: `${existing?.name ?? userId} @ ${store.name}`,
      result: 'done',
    });
    return {
      ok: true,
      message: `Admin restored for ${existing?.name ?? 'user'} at ${store.name}`,
      auditId: audit.id,
    };
  },
};
