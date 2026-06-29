# Phase 1 Pre-Flight Hygiene — Execution & Verification Result

> Generated: 2026-06-29 13:43:37 · Status: **EXECUTED** (plan approved) · Verification reported below.

## ✅ EXECUTION — what changed

**A. Clean-deletes (all zero-consumer, verified):**
- `src/services/jsonsrvPostServices.ts`
- `src/store/useJsonsrvPostStore.ts`
- `src/components/jsonsrv/{PostsTable,PostPagination,PostDeleteModal}.tsx` → dir removed
- `src/utils/jsonSrv/jsonsrvUtils.ts` → dir removed
- `src/app/api/ghl/hooktest/route.ts` → `hooktest/` + `ghl/` dirs removed
- `src/app/api/auth/logout/route-1.ts` (left `route.ts` intact ✓)
- `src/app/layout-org.tsx`

**B. tsconfig packaging:** added `"agent_docs/**"` and `"_SKILLS/**"` to `tsconfig.json` `"exclude"`.

**C. Schema dedup:** deleted `docs/setup.sql` (byte-identical dup); kept `supabase/setup.sql` canonical (4660 B) + `docs/migration_add_profiles.sql` (4596 B, untouched).

**NOT touched (as scoped):** store/auth source, get-user-role.ts, DashboardCard.tsx, posts cascade, /users, /admin-booking, /booking, booking components, package.json/deps, types/posts.ts, components/ui/*.

---

## 🔬 VERIFICATION

### `npm run build` → ✅ PASS
- `✓ Compiled successfully` · TypeScript clean · 22/22 static pages.
- Route table: **23 → 22 routes**. The only delta is `/api/ghl/hooktest` removed (expected). All product routes intact.

### `npm test` → ⚠️ MIXED (pre-existing env failure, NOT from this cleanup)
```
Test Suites: 5 failed, 6 passed, 11 total
Tests:       42 passed, 42 total   (0 assertion failures)
```
- **5 suites fail to *initialize*** (not assertion failures) with:
  `TypeError: this._moduleMocker.clearMocksOnScope is not a function` (in `jest-runtime` `resetModules`).
- Failing suites: `superadmin/SuperadminPortalPageContent`, `admin/AddMemberForm`,
  `superadmin/EditUserForm`, `superadmin/AddUserForm`, + one more component suite.

### Causation analysis — this cleanup is NOT responsible
1. **Version skew:** `jest-mock@30.4.1` vs `jest-runtime`/`@jest/core`/`jest-cli@30.4.2`.
   `jest-runtime@30.4.2`'s `resetModules` (triggered by `clearMocks: true` in `jest.config.js:10`)
   calls `clearMocksOnScope`, a method present only in `jest-mock@30.4.2`. Installed 30.4.1 lacks it
   → the exact TypeError. Pure node_modules mismatch.
2. My uncommitted change set (`git status`) contains **no test file, no `jest.config.js`, no `jest.setup.ts`** —
   only demo deletes + tsconfig + bookkeeping markdown.
3. The 5 failing suites reference **zero** deleted files (grep confirmed).

**Conclusion:** the cleanup introduced **zero regressions**. The 5-suite failure is a pre-existing
Jest version-skew in the installed dependency tree. The handbook's "81 tests / 0 failures" baseline (§7)
is stale/unverifiable in the current environment — it was a CLAIM, never re-run this session.

### Recommended fix (OUT OF SCOPE this pass — needs approval; touches deps)
Align jest-mock to the runtime version, e.g. `npm i -D jest-mock@30.4.2` (or pin all jest packages to one
minor and regenerate `package-lock.json`). This is a dependency change, explicitly out of scope for the
pre-flight pass — flagging for a separate authorized dep-hygiene task.

---

## Gate status
- Hygiene cleanup: **complete & build-verified.**
- Test suite: **blocked by a pre-existing env issue**, not this change. Awaiting your call on whether to
  open a dep-hygiene task to restore a green `npm test` before closing the gate.
