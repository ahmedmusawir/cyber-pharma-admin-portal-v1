# Anti-Patterns

## Security Anti-Patterns (Phase 1 Critical)

### Reading Role From user_metadata

```ts
// ❌ WRONG — vulnerability (TONY_DEMO smell)
const isAdmin = user.user_metadata?.is_super_admin;

// ✅ CORRECT — server-controlled
const role = await resolveRole(user.id); // reads from user_roles table
```

### The superadmin-add-user Route

```ts
// ❌ WRONG — leftover from TONY_DEMO, vulnerability
// src/app/api/superadmin/superadmin-add-user/route.ts

// ✅ CORRECT — delete on sight
// Grep confirms zero matches
```

### Env Vars Warn-And-Continue

```ts
// ❌ WRONG — soft fail
if (!process.env.SUPABASE_URL) {
  console.warn('SUPABASE_URL missing');
}

// ✅ CORRECT — fail closed
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL required');
  // or process.exit(1) in startup code
}
```

## Service Layer Anti-Patterns

### Direct Supabase In Components

```tsx
// ❌ WRONG
'use client';
import { createBrowserClient } from '@supabase/ssr';
export function Foo() {
  const supabase = createBrowserClient(...);  // breaks swap point
}

// ✅ CORRECT
import { getCurrentUser } from '@/services/auth';
export async function Foo() {
  const auth = await getCurrentUser();
}
```

### Mock Imports In Components

```tsx
// ❌ WRONG — components NEVER import mocks
import { mockAdminUser } from '@/mocks/auth';
export function Foo() {
  return <Header user={mockAdminUser} />;  // production code with mock import
}

// ✅ CORRECT — mocks live in tests only
// Component calls service, service decides mock vs real
```

## Type Anti-Patterns

### Using `any`

```ts
// ❌ WRONG
function process(data: any) { ... }

// ✅ CORRECT
function process(data: unknown) {
  if (typeof data === 'string') { ... }  // narrow first
}
```

### Inventing Fields

```ts
// ❌ WRONG — field not in DATA_CONTRACT
export const mockUser = {
  ...,
  display_name: 'Tony Stark',  // invented
};

// ✅ CORRECT — type-conform, update contract first if needed
```

## Phase Scope Anti-Patterns

### Scope Creep Into Phase 2

```tsx
// ❌ WRONG — building OwedBook in Phase 1
export function AdminPortal() {
  return <OwedBookView data={...} />;  // Phase 2 work
}

// ✅ CORRECT — placeholder only
export function AdminPortal() {
  return <p>Coming in Phase 2</p>;
}
```

### Schema Work In Phase 1

```sql
-- ❌ WRONG — creating Frank-domain tables in Phase 1
CREATE TABLE businesses (...);  -- Phase 3 work

-- ✅ CORRECT — Phase 1 uses only starter kit tables (auth.users, user_roles)
```

## Process Anti-Patterns

### Skipping Plan Mode

```
❌ AI: "Going to add a quick fix..."  *writes code*

✅ AI: "🔵 ENTERING PLAN MODE. Proposed change: ..."  *waits for approval*
```

### Declaring Done Without Verification

```
❌ "All tests pass."  (no output shown)

✅ "All tests pass. Output:
    ✓ src/services/__tests__/auth.test.ts (5)
    ✓ src/services/__tests__/role.test.ts (4)
    Test Files  2 passed (2)
    Tests       9 passed (9)"
```

### Silent Fixes To Security Smells

```
❌ Just remove the user_metadata.is_super_admin line

✅ Remove the line + log finding to agent_docs/security/SECURITY_FINDINGS.md
```

### Bundling Work Into One Sweep Commit On main

```
❌ git add -A && git commit -m "phase complete"   # on main: code + docs + design bundled

✅ Feature-branch cluster checkpoints, scoped messages, deliberate merge:
   git switch phase2.2-admin-portal-1     # never the default branch
   git commit -m "fix(navbar): ..."       # code
   git commit -m "docs: close ..."        # docs
   # merge to main is its own deliberate step, never a working-tree sweep
```

> **HARD GATE — this recurred (Phase 2.1 → Phase 2.2, the VM-crash / uncommitted-bundling family).** A lesson that recurs means advice isn't holding it. On a `phase*` branch, refuse a bundled sweep to `main`; require cluster-scoped commits on the feature branch. Cross-ref: Skipping Plan Mode (above) — both are "move fast, skip the discipline" failures.
