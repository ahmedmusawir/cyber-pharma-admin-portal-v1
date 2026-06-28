# BUILD_CHECKLIST — operator-runnable

> Walk top to bottom at Verification (Sub-Phase 5). Tick each.

## Build
- [ ] `npm install` clean
- [ ] `npm run build` — zero type errors
- [ ] `tsc --noEmit` clean (no `any` in `/types`)

## Auth (REAL)
- [ ] Super admin can log in
- [ ] Non-super-admin denied by the server-side gate
- [ ] Auth is NOT mocked anywhere

## Screens (mock domain)
- [ ] login · dashboard · owners · owner detail · stores · store detail · onboarding queue · onboarding detail · audit log all render
- [ ] Owners door AND Stores door both reach the same store detail
- [ ] Empty/no-match → EmptyState everywhere; loading → skeletons

## Actions
- [ ] Suspend / Un-suspend / Send recovery / Resend invite / Restore-admin obey their UX rules
- [ ] Restore-admin requires the typed store name
- [ ] Approve requires a verification note; Reject captures a reason
- [ ] Every action writes a (mock) audit row; viewer shows it

## RED-list sweep (the important one)
- [ ] No add-member / create-user / invite-new — anywhere, even disabled
- [ ] No password field, no email entry/edit
- [ ] No billing / subscription / checkout / payment control
- [ ] No PHI / claims / "$ recovered"
- [ ] No grant-super-admin, no impersonation, no force-sync

## Theming & mobile
- [ ] Light + dark both pass; Slate contrast clean
- [ ] 375px holds on all 9 screens
