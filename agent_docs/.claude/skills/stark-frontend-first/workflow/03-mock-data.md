# Workflow 03 — Mock Data

For each test fixture needed:
1. Create in `/src/mocks/`
2. Type-conform exactly (compile-checked)
3. Document file as DELETABLE at top
4. Use in service and component tests

For Phase 1, this is minimal — just auth role fixtures (admin, member, superadmin, unauthenticated).

NO Frank-domain mocks in Phase 1.

Gate: fixtures type-check. Zero component imports of `/src/mocks/`.
