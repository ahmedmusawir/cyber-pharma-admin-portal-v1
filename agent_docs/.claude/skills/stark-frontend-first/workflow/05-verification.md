# Workflow 05 — Verification

Run in this order:
1. `npm test` (Vitest unit + integration)
2. `npm run test:e2e` (Playwright)
3. `npx tsc --noEmit`
4. `npm run lint`
5. `npm run build` (if cache stale: `rm -rf .next && npm run build`)
6. Manual smoke walkthrough (both apps, all roles)
7. Env var fail-closed test (break env, confirm app refuses to start)
8. Security smell greps:
   - `user_metadata.is_*` → 0 matches
   - `superadmin-add-user` → 0 matches
   - `dangerouslySetInnerHTML` → 0 matches
   - Supabase imports in components → 0 matches
9. Deploy to Cloud Run (both apps)
10. Verify all hard gates from APP_BRIEF
11. Update RECOVERY.md

Do not declare "done" until every step passes.
