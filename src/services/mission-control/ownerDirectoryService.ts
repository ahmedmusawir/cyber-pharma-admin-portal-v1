// MissionControl — OwnerDirectoryService (mock-backed, DATA_CONTRACT §4)
//
// Owner is a derived projection (a user holding 'admin' on ≥1 store). This mock
// reads pre-derived OwnerSummary/OwnerDetail from the store; the real service
// later computes the projection from user_businesses. Read-only.

import type { OwnerDirectoryService } from '@/types/mission-control';
import { mockDb } from '@/mocks/mission-control/store';

export const ownerDirectoryService: OwnerDirectoryService = {
  async listOwners(params) {
    const q = params?.search?.trim().toLowerCase();
    if (!q) return [...mockDb.owners];
    return mockDb.owners.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q),
    );
  },

  async getOwner(ownerId) {
    const detail = mockDb.ownerDetailsById[ownerId];
    if (!detail) throw new Error(`Owner not found: ${ownerId}`);
    return detail;
  },
};
