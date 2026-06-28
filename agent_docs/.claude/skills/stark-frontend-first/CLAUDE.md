# stark-frontend-first — CLAUDE.md

> **Skill Type:** Agent Skill (auto-loads when project is in frontend-first mode)
> **Owner:** Stark Industries AI App Factory
> **Version:** 1.0 | June 2026 (adapted from Cyberize Run 001, May 2026)

---

## Mission Brief

You are operating in a Factory project that is in **Frontend-First Phase**. This means:

- The frontend is being built BEFORE the backend (or, for Phase 1 of a multi-phase build, ahead of feature schema work)
- All data is mocked behind a service layer
- The service layer is the **sole swap point** for backend later
- UI components NEVER talk to data sources directly
- Backend doesn't exist yet (or doesn't exist for the entities in scope), and you DO NOT author backend code for those entities

For Cyber Pharma v1 Phase 1 specifically: the starter kit ships with Supabase auth. That auth IS the backend Phase 1 uses. You wrap it in a service layer but DO NOT extend it. Frank-domain backend (13 tables) is Phase 3's job.

---

## When This Skill Activates

This skill activates when ANY of the following are true:

- Project root CLAUDE.md declares `phase: frontend-first` or `mode: mock-data`
- An FFM exists at `agent_docs/current_app/` and the FFM's `_project/CLAUDE.md` says frontend-first
- A `/src/mocks/` folder exists or is intended
- The operator says "build the frontend first" or "mock data only" or "service layer mode"
- The project is a foundation skeleton phase of a multi-phase build (Phase 1 of Cyber Pharma)

If unsure whether the skill applies, ASK the operator before proceeding.

---

## Folder Layout

```
stark-frontend-first/
├── CLAUDE.md                              ← you are here
├── SKILL.md                               ← methodology (read after CLAUDE.md)
├── workflow/
│   ├── 00-discovery.md                    ← project orientation
│   ├── 01-types-and-contract.md           ← types and data contract
│   ├── 02-service-layer.md                ← service layer scaffolding
│   ├── 03-mock-data.md                    ← mock data generation
│   ├── 04-components.md                   ← component build
│   └── 05-verification.md                 ← gate checks before declaring done
├── references/
│   ├── SERVICE_LAYER_PATTERNS.md          ← swap-point examples, do/don't
│   ├── MOCK_DATA_PATTERNS.md              ← realistic mock generation
│   ├── COMPONENT_CONVENTIONS.md           ← Shadcn + Tailwind + Zustand
│   └── ANTI_PATTERNS.md                   ← failure modes to avoid
└── templates/
    ├── service.template.ts                ← starter service file
    ├── mock-data.template.ts              ← starter mock data file
    └── types.template.ts                  ← starter type definition
```

Workflow files run in order. References are pulled by SKILL.md when relevant. Templates are copied and adapted into the target project.

---

## Reading Order

When activated:

1. Read THIS file (CLAUDE.md) for doctrine — done by now
2. Read `SKILL.md` for the v2-formatted methodology
3. Pull workflow files in order as you execute phases
4. Pull references on demand when phase needs them

---

## Doctrine (Non-Negotiable)

These rules apply through the entire skill execution. Violations are surfacing-required.

### 1. Plan Mode Before Code

Before any file creation, modification, or refactor:

- Enter Plan Mode
- Write plan to session file as PENDING_APPROVAL
- Present plan in CLI
- Wait for operator approval ("approved", "go", "do it")
- Execute only what was approved

This inherits from the global Stark CLAUDE.md. This skill does NOT override Plan Mode — it operates within it.

### 2. The Service Layer Is The Only Swap Point

UI components NEVER:
- Import Supabase clients
- Call `fetch()` directly to backend APIs
- Read from a database
- Talk to mock data files directly

UI components ALWAYS:
- Call domain-named service methods (`authService.signIn()`, `roleService.resolveRole()`)
- Receive data shaped by `/types`

When the backend extends later, **only `/services` files change**. Components stay untouched. This is the success metric.

### 3. Types Are The Contract

Every data shape that flows through the app has a type in `/src/types/`. Types are derived from `DATA_CONTRACT.md`. If you find yourself inventing a field while building UI, STOP — that field must be added to the data contract first.

Both mock and real implementations satisfy the same type interface. The type is what makes the swap safe.

### 4. Mock Data Is Temporary

Mock data lives in `/src/mocks/`. Every mock file is deletable. When the entity it mocks has real backend support, the mock is removed.

Mock data must:
- Match the data contract field-for-field
- Be realistic enough for tests
- Cover loading, empty, error, and edge states (where applicable)
- Never become permanent

### 5. UI Must Survive Backend Replacement Unchanged

This is the test. If extending the backend forces you to change a component, you broke the pattern.

### 6. Backend Code Is Forbidden In This Phase (For Phase 1)

For Cyber Pharma v1 Phase 1, you DO NOT:
- Write API route handlers in `/app/api/` beyond starter kit defaults
- Author Supabase migrations beyond what starter kit ships
- Write SQL for Frank-domain tables
- Configure RLS policies (Phase 3)
- Touch auth backend logic beyond what the starter kit provides
- Generate database schemas for Frank-domain entities

If a feature requires backend work, flag it: **"This feature needs Phase 3 schema work. Out of scope for Phase 1. Recommend: log to Phase 3 backlog."**

### 7. Eyesight-Aware Communication

Explanations come BEFORE code blocks. The operator listens to audio playback during eye rest — no surprises. This inherits from global Stark CLAUDE.md.

### 8. Surgical Changes

Touch only what you must. Don't refactor adjacent code. Don't "improve" working code. Don't remove comments you don't understand.

---

## Operator Override Protocol

The operator can override any rule in this skill EXCEPT:

- Plan Mode requirement (this is global, not skill-local)
- The backend-code-forbidden rule (the entire skill premise)

Override syntax: operator says "override [rule X] because [reason]." You acknowledge, you proceed, you note the override in the session file.

If operator says "build the backend too," that's not an override — that's a phase transition. Tell them: "This means we're leaving frontend-first phase. Want me to flag the transition and update CLAUDE.md at project root?"

---

## Anti-Patterns (Failure Signals)

If you catch yourself doing any of these, STOP and surface:

- About to write a `fetch('/api/...')` call in a component
- About to import `@supabase/supabase-js` in a component
- About to read from `/src/mocks/` inside a component
- About to invent a field that's not in `DATA_CONTRACT.md`
- About to skip Plan Mode "because it's just mock data"
- About to declare the frontend "done" without error boundaries
- About to mark the sub-phase complete without verifying role gates manually
- About to keep mock infrastructure that "might be useful later"
- About to read role from `user_metadata` (security regression)
- About to leave a `superadmin-add-user` route alive (vulnerability)

---

## Success Criteria

This skill's phase is complete when ALL are true:

- All pages from `UI_SPEC.md` are navigable
- All data flows through the service layer (zero direct Supabase calls in components)
- Error states are implemented for every route group
- Mobile responsiveness is verified
- All types match `DATA_CONTRACT.md` exactly
- Smoke walkthrough passes for all role-gated routes
- A `BACKEND_SWAP_NOTES.md` exists at project root documenting what each service method will need from the real backend (for Phase 1: notes future Phase 3+ work)

When complete, the FFM is ready for retrospective. That sub-phase is operator-driven.

---

## Evolution Principle

When this skill stumbles on a real project, the operator and you together update this CLAUDE.md or the workflow files. The skill grows from real usage, not theoretical perfection. Every project run is a chance to make the next run sharper.

Findings worth capturing:
- A new anti-pattern → add to ANTI_PATTERNS.md
- A new service layer trick → add to SERVICE_LAYER_PATTERNS.md
- A new gotcha for a specific stack → add to references/
- A skill rule that conflicts with reality → revise the rule, version-bump

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial skill compiled for Cyberize Run 001 conversion |
| 1.0-cp1 | 2026-06-03 | Adapted for Cyber Pharma v1 Phase 1. Greenfield-aware language. Phase 3 backend forbidden zone added. |

---

*Part of the Stark Industries AI App Factory skill ecosystem.*
