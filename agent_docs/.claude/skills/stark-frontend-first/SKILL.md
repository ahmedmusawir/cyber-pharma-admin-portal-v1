---
name: stark-frontend-first
description: Build the frontend of a Next.js application using a service layer with mock data as the sole swap point for later backend integration. Use this skill when a project is in frontend-first phase, when authoring a foundation skeleton (Phase 1 of a multi-phase build), or when the project's FFM declares mock-data mode. Enforces service layer discipline, mock data conventions, type-driven contracts, and forbids backend code authoring for entities not yet in scope.
---

# Stark Frontend-First Skill

You are building the frontend of a Next.js app. For entities in scope, the backend either does not exist yet, or won't be extended in this phase, and you will not author backend code for them. Your output is a fully functional UI behind a mocked service layer — designed so that swapping to a real backend later requires zero changes to components.

This skill is the methodology. Read CLAUDE.md first for doctrine and activation rules.

## Phase Sequence

Frontend-first work proceeds in six phases. Do not skip phases. Do not reorder.

```
0. Discovery  →  1. Types & Contract  →  2. Service Layer  →  3. Mock Data  →  4. Components  →  5. Verification
```

Each phase has a verification gate. Do not advance until the gate passes.

For Cyber Pharma v1 Phase 1, an additional Phase 6 (Retrospective) closes the FFM. See the FFM's `playbook/` for the sub-phase-by-sub-phase walkthrough.

---

## Phase 0 — Discovery

**Goal:** Orient yourself in the project before touching any code.

**Steps:**

1. Read `RECOVERY.md` if it exists. If you're resuming a session, you know where to pick up.
2. Read the FFM's `_project/APP_BRIEF.md` for what this project's phase is.
3. Read `_project/DATA_CONTRACT.md` for data shapes.
4. Read `_project/UI_SPEC.md` for screens and behavior.
5. Read `_project/CLAUDE.md` for project-specific overrides.
6. Read project root `CLAUDE.md` for global overrides.
7. Inspect existing code: `/app`, `/components`, `/services`, `/types`, `/mocks` if any.
8. If a starter kit is in use, identify what it provides (auth, RBAC, layout) and what's left to build.

**Verification gate:** You can answer these without guessing:
- What is this app?
- Who uses it?
- What screens does it have in this phase?
- What data shapes flow through it in this phase?
- What's already built vs what's missing?

If you cannot answer, ASK the operator before proceeding.

---

## Phase 1 — Types & Contract

**Goal:** Establish the type contract that both mock and real implementations will satisfy.

**Steps:**

1. Read `DATA_CONTRACT.md` carefully.
2. For each entity in the contract, create a TypeScript interface in `/src/types/`.
3. One file per major entity (`/src/types/User.ts`) OR one `index.ts` with all types if the project is small.
4. Match field names exactly. Match optionality exactly. Match enums exactly.
5. If `DATA_CONTRACT.md` is ambiguous about a field's type or nullability, ASK — do not assume.
6. Export everything cleanly from `/src/types/index.ts`.

**Verification gate:** `npx tsc --noEmit` exits clean. Zero Supabase imports in `/src/types/`.

---

## Phase 2 — Service Layer

**Goal:** Wrap the starter kit's backend (or any future backend) in domain-named service methods. Components call services. Services own the data access.

**Steps:**

1. For each service interface in `DATA_CONTRACT.md` §5 (or equivalent), create a file in `/src/services/`.
2. Implement methods that wrap the underlying data source. For Cyber Pharma v1 Phase 1, this is the starter kit's Supabase auth flow.
3. Return shapes that exactly match the types from Phase 1.
4. Handle errors cleanly — throw typed errors, don't return null on failure unless the contract specifies it.
5. Write service contract tests in `/src/services/__tests__/`. Verify each method returns the correct shape.
6. Verify no component imports Supabase directly: `grep -rn "from '@supabase" src/components/ src/app/`

**Verification gate:** Service tests pass. Grep for Supabase imports in components returns zero. The `protectPage` (or equivalent) server action uses the service layer.

---

## Phase 3 — Mock Data

**Goal:** Generate test fixtures for service-layer testing and component-layer testing.

**Steps:**

1. For each entity that needs a test fixture, create one in `/src/mocks/`.
2. Fixtures must satisfy the type from Phase 1 (compile-checked).
3. Cover the role/state variations needed (admin user, member user, superadmin user, unauthenticated).
4. Document the file as DELETABLE at the top.
5. Verify no component imports from `/src/mocks/`.

**Verification gate:** All fixtures type-check. Zero component imports of mocks. Service tests use fixtures.

---

## Phase 4 — Components

**Goal:** Build UI per `UI_SPEC.md`. Components call services, render data, handle empty/loading/error states.

**Steps:**

1. Scaffold the design system first (Tailwind tokens, CSS variables, brand assets).
2. Apply brand tokens before screen work.
3. Build placeholder pages where the spec calls for them.
4. Brand the inherited auth screens (do NOT rewrite the auth logic).
5. Build role-gated layouts using `protectPage`.
6. Verify error boundaries exist in every route group.
7. Build access-denied page.
8. Write component tests for new components.

**Verification gate:** All routes navigable. Role gates hold (manual walkthrough). Brand applied. Error boundaries present. Tests pass.

---

## Phase 5 — Verification

**Goal:** Verify the foundation is solid. Run the full test suite. Deploy. Walk through manually. Check all hard gates.

**Steps:**

1. Run unit tests, integration tests, E2E tests.
2. Run `npx tsc --noEmit`.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Manual smoke walkthrough (operator does this with you guiding).
6. Verify env var fail-closed (break env, confirm app refuses to start).
7. Grep checks for security smells (`user_metadata.is_*`, `superadmin-add-user`, `dangerouslySetInnerHTML`).
8. Deploy to staging (Cloud Run).
9. Verify all hard gates from APP_BRIEF.
10. Update RECOVERY.md.

**Verification gate:** All hard gates green. Deploy live. Smoke walkthrough complete.

---

## Worked Example — Service Layer Wrapping Starter Kit Auth

The starter kit ships `/src/utils/supabase/server.ts` with a `createClient()` function. You wrap it in `/src/services/auth.ts`:

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
    user: {
      id: user.id,
      email: user.email!,
      created_at: user.created_at,
      updated_at: user.updated_at ?? user.created_at,
    },
    role,
    is_super_admin: role === 'superadmin',
  };
}
```

Then in a server component:

```tsx
// src/app/(admin)/admin-portal/page.tsx
import { getCurrentUser } from '@/services/auth';

export default async function AdminPortal() {
  const auth = await getCurrentUser();
  // Use auth, never call Supabase directly here
}
```

The component knows nothing about Supabase. If you later swap Supabase for another auth provider, you change `/src/services/auth.ts` only. The component stays the same.

---

## Anti-Patterns (Block These)

- Component imports `@supabase/supabase-js` or `@supabase/ssr` → STOP
- Component reads from `/src/mocks/` → STOP
- Role read from `user_metadata` → STOP (security regression)
- `superadmin-add-user` route exists → DELETE
- Component invents a field not in DATA_CONTRACT → STOP, update contract first
- "Just for testing" mock data ends up in production import paths → STOP
- Skipping Plan Mode because "it's small" → STOP

---

## When You're Done

The skill's job is complete when:

- All sub-phases passed their verification gates
- No anti-patterns triggered
- Hard gates from APP_BRIEF all green
- Operator approved the run for retrospective

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial methodology for Cyberize Run 001 |
| 1.0-cp1 | 2026-06-03 | Adapted for Cyber Pharma v1 Phase 1 (greenfield foundation skeleton) |
