// MissionControl — Service layer barrel (the sole swap point).
//
// Exposes the 7 MOCK-BACKED domain services. Import from client or server:
//   import { ownerDirectoryService } from "@/services/mission-control";
//
// ⚠️ The REAL-auth session resolver (getSuperAdminUser) is deliberately NOT
// re-exported here — it imports next/headers (server-only) and must never be
// pulled into a client bundle (Run-001 boundary trap). Import it directly from
// "@/services/mission-control/session" in Server Components / route handlers.

export { missionDashboardService } from './missionDashboardService';
export { ownerDirectoryService } from './ownerDirectoryService';
export { storeDirectoryService } from './storeDirectoryService';
export { storeMemberService } from './storeMemberService';
export { supportActionService } from './supportActionService';
export { pendingRegistrationService } from './pendingRegistrationService';
export { auditLogService } from './auditLogService';
