// templates/types.template.ts
//
// COPY this file into /src/types/<EntityName>.ts and adapt.
// One interface per major entity. Match DATA_CONTRACT field-for-field.

export interface EntityName {
  // primary key
  id: string;

  // example fields — replace with actual fields from DATA_CONTRACT
  name: string;
  email: string;

  // optional fields — match the contract's optionality
  description?: string;

  // timestamps (almost always present)
  created_at: string;
  updated_at: string;
}

// If the entity has an enum field:
export type EntityStatus = 'active' | 'inactive' | 'pending';

// If the entity is composed of others:
import type { OtherEntity } from './OtherEntity';

export interface EntityWithRelation {
  entity: EntityName;
  other: OtherEntity | null;
  is_special: boolean;
}
