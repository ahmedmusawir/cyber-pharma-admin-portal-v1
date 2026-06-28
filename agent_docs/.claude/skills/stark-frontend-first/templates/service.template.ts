// templates/service.template.ts
//
// COPY this file into /src/services/<domain>.ts and adapt.
// Services are the sole swap point between mock and real data sources.

import { createClient } from '@/utils/supabase/server';
import type { EntityName } from '@/types';

/**
 * Get a single entity by ID.
 * Wraps the Supabase query. Components do NOT call Supabase directly.
 */
export async function getEntity(id: string): Promise<EntityName | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('entity_name')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  
  // Shape data to match the EntityName type.
  // If Supabase returns extra fields, drop them. Components only see what the type allows.
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * List entities. Returns array of EntityName.
 */
export async function listEntities(): Promise<EntityName[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('entity_name')
    .select('*');
  
  if (error || !data) return [];
  
  return data.map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

// Add update, delete, create methods following the same pattern.
// THROW typed errors on unexpected failures (not return null).
