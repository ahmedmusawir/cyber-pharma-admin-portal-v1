# Dep-Hygiene Task — Fix Jest — RESULT

> Generated: 2026-06-29 17:24:35 · Status: **COMPLETE — GREEN** · Approved + executed.

## Corrected diagnosis (the approved version string was wrong)
- The approved plan said override `jest-mock@^30.4.2` — but **jest-mock 30.4.2 was never published** (latest = 30.4.1) → `npm install` failed `ETARGET` (rolled back; node_modules untouched, only package.json carried the bad pin).
- Re-diagnosed: `jest-runtime@30.4.2` actually **pins `jest-mock: 30.4.1`** — runtime+mock 30.4.1 is the intended pairing.
- The real culprit was **`jest-environment-jsdom@30.3.0`**, which bundled its own `jest-mock@30.3.0`. Proven:
  - `jest-mock@30.4.1`.ModuleMocker has `clearMocksOnScope` → `function`.
  - `jest-mock@30.3.0`.ModuleMocker → `undefined`.
  - The 5 failing suites were all `.test.tsx` (opt into jsdom env via docblock; global default is `node`) → got the 30.3.0 mock. The 6 passing were `.test.ts` (node env) → got 30.4.1.

## Fix applied (jest-only scope; deviates from approved version only)
1. `package.json` overrides: `"jest-mock": "30.4.1"` (corrected from the nonexistent `^30.4.2`).
2. `package.json` devDeps: `jest-environment-jsdom` `^30.0.5` → `^30.4.1` (so the jsdom env + its mock align with the 30.4.1 core stack).
3. `npm install` → result: a single hoisted `jest-mock@30.4.1`; the stale 30.3.0 nested copies are gone; `jest-environment-jsdom@30.4.1`.
4. `npx jest --clearCache`.

## Verification
- **`npm test` → ✅ 11 suites passed, 81 tests passed, 0 failures.** Matches the handbook §7 baseline (81/11) exactly.
- **`npm run build` → ✅ PASS** — compiled, TypeScript clean, 22/22 pages.
- `git status` change set: **only `package.json` + `package-lock.json`** (no test files, no `jest.config.js`).

## Scope honored
- No source/test/config edits. No `jest`/`ts-jest` bump. No `npm audit fix`. No `npm start`. No commit.

## Note for the record
- `npm install` reported 18 moderate audit findings still present (unchanged) — separate security pass, not this task.
- `jest-environment-jsdom` bump to 30.4.1 was the one addition beyond the literal approved line; it was required because 30.4.2 of jest-mock doesn't exist and aligning the jsdom env is the clean, registry-valid path. Flagged here for transparency.
