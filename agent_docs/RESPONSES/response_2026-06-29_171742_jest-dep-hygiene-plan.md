# Dep-Hygiene Task — Fix Jest (restore green `npm test`)

> Generated: 2026-06-29 17:17:42 · Status: **PENDING_APPROVAL** (touches deps + lockfile) · Not executed.

## Root cause (verified)
- `npm test` → 5 suites fail to init: `TypeError: this._moduleMocker.clearMocksOnScope is not a function`.
- Hoisted `node_modules/jest-mock` = **30.4.1**; `jest-runtime@30.4.2`'s `resetModules` (fired by
  `clearMocks: true` in `jest.config.js:10`) calls `clearMocksOnScope`, a method present only in
  **jest-mock 30.4.2**.
- Why 30.4.1 won: `@types/jest@30.0.0 → expect@30.4.1 → jest-mock@30.4.1` is hoisted to the top; the rest
  of the core stack (`jest`/`@jest/core`/`jest-runtime`/`jest-cli`) is 30.4.2. Upstream range was too loose
  to force the match.
- Installed copies: `jest-mock` 30.4.1 (hoisted) + 30.3.0 (nested under jest-environment-jsdom×2).

## PLAN (recommended: surgical override)

**Step 1 — package.json `overrides`:** add `jest-mock` pinned to the runtime's minor, alongside existing postcss:
```jsonc
"overrides": {
  "postcss": "^8.5.10",
  "jest-mock": "^30.4.2"
}
```
This forces every `jest-mock` in the tree to ≥30.4.2, giving the hoisted ModuleMocker the `clearMocksOnScope`
method `jest-runtime@30.4.2` calls. Minimal, deterministic, reversible.

**Step 2 — install:** `npm install` (rewrites `package-lock.json` + node_modules tree for jest-mock only).

**Step 3 — clear stale jest cache:** `npx jest --clearCache` (avoid a cached-transform false signal).

**Step 4 — verify:**
- `npm test` → expect 11/11 suites run, full assertion baseline green.
- `npm run build` → confirm the override didn't disturb the build (should stay green; build doesn't use jest).

## Scope / guardrails
- **Only** touches `package.json` (`overrides` block) + `package-lock.json` (+ node_modules install).
- Does NOT bump `jest`, `jest-environment-jsdom`, `ts-jest`, or any non-jest dependency.
- Does NOT touch source, tests, or jest.config.js.
- No `npm audit fix`, no `npm start`.

## Assumptions
1. Forcing `jest-mock` to ^30.4.2 globally is compatible with the 30.3.0/30.4.1 sibling `@jest/*` packages
   (patch-compatible within the major; jest-mock 30.4.2 only *adds* the method). If any suite then throws a
   *different* version-skew error, the fallback is to align the whole stack (bump `jest` +
   `jest-environment-jsdom` to 30.4.2 exact) — I'd stop and re-report before doing that.
2. A rewritten `package-lock.json` is acceptable (it will show jest-mock churn).

## Risks
- Low. Override is additive; if tests still fail it fails loudly and reversibly (revert package.json +
  `npm install`). Worst case = same red we have now, no new breakage.

## Optional follow-up (NOT in this task unless you say so)
- `jest-environment-jsdom@30.3.0` lags the 30.4.x core — harmless today; could be aligned later.
- 18 moderate `npm audit` findings (separate security pass).

🛑 Stopping — awaiting approval to run Steps 1–4.
