// MissionControl — Types barrel (Phase 1 FFM).
// Consume via `import type { ... } from "@/types/mission-control"`.
// Pure type surface: status vocabularies (§1), identity + view-models (§2–§3),
// and the 7 frozen service contracts (§4). No runtime, no logic.

// §1 — Status vocabularies
export type {
  AccountStatus,
  MemberRole,
  BusinessStatus,
  SubscriptionStatus,
  StoreHealth,
  RegistrationStatus,
  RegistrationType,
} from './status';

// §2–§3 — Identity + view-models + shared action result
export type {
  SuperAdminUser,
  OwnerSummary,
  OwnerDetail,
  StoreSummary,
  StoreDetail,
  Member,
  PendingRegistrationSummary,
  PendingRegistrationDetail,
  PlatformStats,
  GrowthPoint,
  AuditAction,
  AuditEntry,
  ActionResult,
} from './entities';

// §4 — Service contracts (the sole swap point)
export type {
  MissionDashboardService,
  OwnerDirectoryService,
  StoreDirectoryService,
  StoreMemberService,
  SupportActionService,
  PendingRegistrationService,
  AuditLogService,
} from './services';
