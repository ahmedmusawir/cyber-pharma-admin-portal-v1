# Service Layer Patterns

## The Sole Swap Point Rule

Components NEVER:
- Import Supabase clients
- Call `fetch()` to backend APIs
- Read from mock files

Components ALWAYS:
- Call domain-named service methods
- Receive data shaped by `/src/types/`

## Wrapping Starter Kit Auth

```ts
// src/services/auth.ts
import { createClient } from '@/utils/supabase/server';
import type { AuthenticatedUser } from '@/types';
import { resolveRole } from './role';

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const role = await resolveRole(user.id);
  return {
    user: { id: user.id, email: user.email!, created_at: user.created_at, updated_at: user.updated_at ?? user.created_at },
    role,
    is_super_admin: role === 'superadmin',
  };
}
```

## Role Service (Security-Critical)

```ts
// src/services/role.ts
export async function resolveRole(userId: string): Promise<AppRole | null> {
  const supabase = await createClient();
  // READ FROM user_roles TABLE ONLY — never user_metadata
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  return data?.role ?? null;
}
```

## Component Calling Service

```tsx
// CORRECT
import { getCurrentUser } from '@/services/auth';
export default async function AdminPortal() {
  const auth = await getCurrentUser();
  // ...
}
```

```tsx
// WRONG — direct Supabase
import { createBrowserClient } from '@supabase/ssr';
'use client';
export function AdminPortal() {
  const supabase = createBrowserClient(...);  // ❌
}
```

## The Swap Test

Ask: if I replaced Supabase with a different auth provider tomorrow, would my components need any changes?

If yes — you broke the pattern. Move that code into the service layer.

If no — pattern intact.
