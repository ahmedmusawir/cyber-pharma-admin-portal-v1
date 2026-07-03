// MissionControl — PendingRegistrationService (mock-backed, DATA_CONTRACT §4)
//
// Acts ONLY on existing self-submitted records. LOAD-BEARING invariants:
//   • approve/reject NEVER accept an email argument (frozen signatures) — the
//     activation invite goes only to the email already ON the record.
//   • Approve/Reject are valid ONLY on 'pending_verification' rows.
//   • Approve requires a non-empty verification note; Reject a non-empty reason.
//   • Reject is a SOFT status flip — the record is retained, never deleted.
// No create, no email entry, no payment surface anywhere here.

import type { PendingRegistrationService } from '@/types/mission-control';
import { mockDb, MOCK_ACTOR_NAME } from '@/mocks/mission-control/store';
import { auditLogService } from './auditLogService';

const DEFAULT_STATUS = 'pending_verification' as const;

export const pendingRegistrationService: PendingRegistrationService = {
  async listPending(params) {
    const status = params?.status ?? DEFAULT_STATUS;
    const type = params?.type;
    const q = params?.search?.trim().toLowerCase();

    return mockDb.registrations.filter((r) => {
      if (r.status !== status) return false;
      if (type && r.type !== type) return false;
      if (q) {
        const hit =
          r.pharmacyName.toLowerCase().includes(q) ||
          r.ncpdp.toLowerCase().includes(q) ||
          r.npi.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  },

  async getPending(registrationId) {
    const detail = mockDb.registrationDetailsById[registrationId];
    if (!detail) throw new Error(`Registration not found: ${registrationId}`);
    return detail;
  },

  async approve({ registrationId, verificationNote }) {
    // Required verification note.
    if (!verificationNote?.trim()) {
      return { ok: false, message: 'A verification note is required to approve' };
    }

    const summary = mockDb.registrations.find(
      (r) => r.registrationId === registrationId,
    );
    const detail = mockDb.registrationDetailsById[registrationId];

    // Only pending_verification rows may be approved.
    if (!summary || summary.status !== 'pending_verification') {
      const audit = await auditLogService.append({
        actorName: MOCK_ACTOR_NAME,
        action: 'approved_registration',
        target: summary?.pharmacyName ?? registrationId,
        result: 'failed',
      });
      return {
        ok: false,
        message: summary
          ? 'Only pending registrations can be approved'
          : `Registration not found: ${registrationId}`,
        auditId: audit.id,
      };
    }

    // State: pending_verification → approved. Invite fired (mock) to the ON-RECORD
    // email — read from the record, NEVER supplied by the operator.
    summary.status = 'approved';
    if (detail) detail.status = 'approved';
    const inviteDestination = detail?.email ?? 'the email on record';

    const audit = await auditLogService.append({
      actorName: MOCK_ACTOR_NAME,
      action: 'approved_registration',
      target: summary.pharmacyName,
      result: 'done',
    });
    return {
      ok: true,
      message: `Approved — activation invite sent to ${inviteDestination}`,
      auditId: audit.id,
    };
  },

  async reject({ registrationId, reason }) {
    // Required reason.
    if (!reason?.trim()) {
      return { ok: false, message: 'A reason is required to reject' };
    }

    const summary = mockDb.registrations.find(
      (r) => r.registrationId === registrationId,
    );
    const detail = mockDb.registrationDetailsById[registrationId];

    if (!summary || summary.status !== 'pending_verification') {
      const audit = await auditLogService.append({
        actorName: MOCK_ACTOR_NAME,
        action: 'rejected_registration',
        target: summary?.pharmacyName ?? registrationId,
        result: 'failed',
      });
      return {
        ok: false,
        message: summary
          ? 'Only pending registrations can be rejected'
          : `Registration not found: ${registrationId}`,
        auditId: audit.id,
      };
    }

    // Soft flip — record retained, never deleted.
    summary.status = 'rejected';
    if (detail) detail.status = 'rejected';

    const audit = await auditLogService.append({
      actorName: MOCK_ACTOR_NAME,
      action: 'rejected_registration',
      target: summary.pharmacyName,
      result: 'done',
    });
    return { ok: true, message: 'Registration rejected', auditId: audit.id };
  },
};
