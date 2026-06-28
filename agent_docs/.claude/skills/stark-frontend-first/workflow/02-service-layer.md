# Workflow 02 — Service Layer

For each interface in `DATA_CONTRACT.md` §5:
1. Create a file in `/src/services/`
2. Wrap the underlying data source (starter kit auth for Phase 1)
3. Return shapes matching the types from Workflow 01
4. Throw typed errors; do not return null unless contract specifies
5. Write contract tests in `/src/services/__tests__/`

Critical:
- Read roles from `user_roles` table ONLY (never `user_metadata`)
- Do NOT modify starter kit's `/src/utils/supabase/*` — wrap, don't rewrite

Gate: service tests pass. `grep -rn "from '@supabase" src/components/ src/app/` returns zero.
