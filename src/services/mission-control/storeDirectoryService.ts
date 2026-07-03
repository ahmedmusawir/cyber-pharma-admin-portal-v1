// MissionControl — StoreDirectoryService (mock-backed, DATA_CONTRACT §4)
//
// Lists/searches all stores platform-wide + returns a store detail header.
// StoreHealth is pre-derived by the mock (service computes; UI never re-derives).

import type { StoreDirectoryService } from '@/types/mission-control';
import { mockDb } from '@/mocks/mission-control/store';

export const storeDirectoryService: StoreDirectoryService = {
  async listStores(params) {
    const q = params?.search?.trim().toLowerCase();
    if (!q) return [...mockDb.stores];
    // search by name or NCPDP (UI_SPEC §7.7)
    return mockDb.stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.ncpdp.toLowerCase().includes(q),
    );
  },

  async getStore(storeId) {
    const detail = mockDb.storeDetailsById[storeId];
    if (!detail) throw new Error(`Store not found: ${storeId}`);
    return detail;
  },
};
