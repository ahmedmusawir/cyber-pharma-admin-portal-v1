# Workflow 01 — Types & Contract

For each entity in `DATA_CONTRACT.md` §4:
1. Create a TypeScript interface in `/src/types/`
2. One file per major entity OR consolidated `index.ts` for small projects
3. Match field names, optionality, enums exactly
4. Export from barrel `/src/types/index.ts`

Gate: `npx tsc --noEmit` clean. Zero Supabase imports in `/src/types/`.

If contract is ambiguous, ASK. Do not assume.
