// MissionControl — Super-admin session resolver (REAL auth — NOT mocked)
//
// server-only. Identity is the one domain object sourced from real Supabase in
// Phase 1 (DATA_CONTRACT §2, §7). Do NOT mock it; do NOT re-export from the
// mock-services barrel (next/headers must not enter a client bundle).
//
// is_super_admin RULING (operator-confirmed 2026-07-01):
//   CONCEPT  = DATA_CONTRACT's `is_super_admin`
//   IMPL     = kit-real `role === 'superadmin'` via getUserRole() on user_roles
// isSuperAdmin is DERIVED here — never hardcoded, never read from a (non-existent)
// is_super_admin column. A SuperAdminUser is returned ONLY when the derived check
// passes; otherwise null (login denied by the gate). The type's `isSuperAdmin: true`
// is thus a proof-carrying invariant: you only hold the object if the check passed.
//
// This module is server-only by construction: createClient imports next/headers,
// which Next refuses to bundle into a client component. (No 'server-only' package
// guard — it isn't a kit dependency, and adding one is out of this sub-phase's scope.)

import type { SuperAdminUser } from '@/types/mission-control';
import { createClient } from '@/utils/supabase/server';
import { getUserRole, AppRole } from '@/utils/get-user-role';

/**
 * Resolve the authenticated operator as a SuperAdminUser, or null.
 * Returns null when: not authenticated, or the derived role is not 'superadmin'.
 */
export async function getSuperAdminUser(): Promise<SuperAdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // DERIVED — the kit-real implementation of the is_super_admin concept.
  const role = await getUserRole(user.id);
  const isSuperAdmin = role === AppRole.SUPERADMIN;
  if (!isSuperAdmin) return null;

  // Display name: best-available from auth metadata (display-only; never a role
  // signal), falling back to the email local-part. Reading full_name for display
  // is kit-sanctioned; role is NEVER read from user_metadata.
  const metadataName =
    typeof user.user_metadata?.full_name === 'string'
      ? (user.user_metadata.full_name as string)
      : undefined;
  const email = user.email ?? '';
  const displayName = metadataName?.trim() || email.split('@')[0] || 'Operator';

  return {
    id: user.id,
    email,
    displayName,
    isSuperAdmin: true,
  };
}
