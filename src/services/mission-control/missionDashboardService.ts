// MissionControl — MissionDashboardService (mock-backed, DATA_CONTRACT §4)
//
// HIPAA-safe pulse: COUNT/GROUP-BY projections only. Never claims/PHI, no "$ recovered".

import type { MissionDashboardService } from '@/types/mission-control';
import { mockDb } from '@/mocks/mission-control/store';

export const missionDashboardService: MissionDashboardService = {
  async getPlatformStats() {
    return { ...mockDb.platformStats };
  },

  async getGrowth(months) {
    return mockDb.growth.slice(-months);
  },

  async getOwnersPreview(limit) {
    // recent / needs-attention preview — NOT the full directory
    return mockDb.owners.slice(0, limit);
  },
};
