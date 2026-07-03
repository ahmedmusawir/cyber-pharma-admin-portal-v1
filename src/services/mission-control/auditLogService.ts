// MissionControl — AuditLogService (mock-backed, DATA_CONTRACT §4)
//
// append() is the internal write every GREEN action calls; listEntries() is the
// read the Audit log viewer consumes. Mock: rows live in the in-memory store.

import type { AuditLogService, AuditEntry } from '@/types/mission-control';
import { mockDb } from '@/mocks/mission-control/store';

export const auditLogService: AuditLogService = {
  async listEntries(params) {
    const rows = [...mockDb.audit].sort((a, b) =>
      b.occurredAt.localeCompare(a.occurredAt),
    );
    const q = params?.search?.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (e) =>
        e.actorName.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q),
    );
  },

  async append(entry) {
    const row: AuditEntry = {
      ...entry,
      id: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
    };
    mockDb.audit.push(row);
    return row;
  },
};
