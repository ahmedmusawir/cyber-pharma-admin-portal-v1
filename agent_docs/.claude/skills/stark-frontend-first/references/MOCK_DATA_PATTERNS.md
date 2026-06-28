# Mock Data Patterns

## Phase 1 Has Minimal Mocks

For Cyber Pharma v1 Phase 1, mocks exist for:
- Auth role fixtures (admin, member, superadmin, unauthenticated)

That's it. No Frank-domain mocks. No OwedBook data. No PBM data. Those are Phase 2+.

## Type Conformance Mandatory

Every fixture must satisfy its type exactly:

```ts
// src/mocks/auth.ts
import type { AuthenticatedUser } from '@/types';

export const mockAdminUser: AuthenticatedUser = {  // type-annotated
  user: {
    id: 'mock-admin-id-001',
    email: 'admin@test.cyberpharma.local',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  role: 'admin',
  is_super_admin: false,
};
```

If TypeScript complains, the mock is wrong — fix the mock, don't loosen the type.

## Document Deletability

Top of every mock file:

```ts
// PHASE 1 TEST FIXTURES — DELETABLE
// These exist for tests only. Components do NOT import these.
// When entities they mock have real backend, mocks may be deleted or kept for test data only.
```

## Component Imports Forbidden

```bash
# This grep must always return zero matches
grep -rn "from '@/mocks" src/components/ src/app/
```

If a component imports a mock, that's a service-layer violation. Fix by:
1. Moving the data source decision into the service
2. Having the service return the mock during dev/test
3. The component still only calls the service

## Realistic But Identifiable

Mock data should look real enough that UI rendering doesn't break — but identifiable as mock so it can't be confused with production data:

- Email domain: `test.cyberpharma.local` (`.local` is non-routable, safe)
- IDs: `mock-<role>-id-<NNN>` (visibly fake)
- Dates: round timestamps (`2026-01-01T00:00:00Z`)
