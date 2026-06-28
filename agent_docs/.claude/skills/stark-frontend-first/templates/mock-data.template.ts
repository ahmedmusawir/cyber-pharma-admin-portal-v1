// templates/mock-data.template.ts
//
// COPY this file into /src/mocks/<domain>.ts and adapt.
//
// PHASE 1 TEST FIXTURES — DELETABLE
//
// These fixtures exist for tests only. Components do NOT import these.
// When the entity has real backend support, mocks may remain for test data or be removed.

import type { EntityName } from '@/types';

export const mockEntity1: EntityName = {
  id: 'mock-entity-id-001',
  name: 'Test Entity 1',
  email: 'entity1@test.cyberpharma.local',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockEntity2: EntityName = {
  id: 'mock-entity-id-002',
  name: 'Test Entity 2',
  email: 'entity2@test.cyberpharma.local',
  created_at: '2026-01-02T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
};

export const mockEntities: EntityName[] = [mockEntity1, mockEntity2];

// Empty state fixture (for empty-state UI tests):
export const mockEntitiesEmpty: EntityName[] = [];
