// MissionControl — StoreMemberService (mock-backed, DATA_CONTRACT §4)
//
// Reads a single store's member roster. Read-only; available safe actions are
// derived by the UI from each Member.accountStatus, not stored here.

import type { StoreMemberService } from '@/types/mission-control';
import { mockDb } from '@/mocks/mission-control/store';

export const storeMemberService: StoreMemberService = {
  async listMembers(storeId) {
    return [...(mockDb.membersByStoreId[storeId] ?? [])];
  },
};
