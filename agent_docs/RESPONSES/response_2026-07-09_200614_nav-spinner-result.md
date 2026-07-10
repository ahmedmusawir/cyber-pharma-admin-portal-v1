# NAV PAGE-LOAD SPINNER — EXECUTION RESULT ✅

**Date:** 2026-07-09 20:06 · **Branch:** `phase-1-FFM-verify` · **Status:** COMPLETE — operator-confirmed live

## WHAT WAS ASKED
Spinner on nav-item page loads; sidebar stays static; spinner only in the right-side content region.
Mid-run operator override: use the operator-built `SpinnerLarge` (components/common), not a token spinner.

## CHANGES MADE
- `src/app/(mission-control)/loading.tsx` — NEW: route-group loading slot (hard loads / first paint);
  renders `SpinnerLarge` centered at min-h-[60vh]. Shell layout persists — page slot only.
- `src/components/mission-control/Shell.tsx` — nav clicks route through `startTransition(() => router.push(href))`;
  `isPending` swaps ONLY the content slot for the centered `SpinnerLarge`; rail / top bar never remount.
  Modifier/middle clicks keep native Link behavior. Drawer closes instantly on nav tap.

## WHY BOTH MECHANISMS (key discovery)
Live proof showed **Next 16 stale-page navigation semantics**: on client-side nav with stale prefetch data
(`staleTimes.dynamic = 0` default), the router keeps the OLD page visible while the RSC fetch is in flight —
`loading.tsx` never paints on sidebar clicks (verified: 2.5s-held fetch, URL and page unchanged the whole time).
So `loading.tsx` covers hard loads; the Shell `isPending` slot covers client navs. Same spinner, same placement.

## GATES
| Gate | Result |
|---|---|
| `tsc --noEmit` | CLEAN |
| `npm run build` | ✓ Compiled |
| `npm test` | 81/81, 11/11 suites (kit tests untouched) |
| Live proof (RSC fetch held 1.5s, prefetch aborted) | **5/5 PASS** |

Live proof detail: spinner visible in content region mid-nav (1280) · sidebar DOM node NOT remounted
(persist-marker survived) · zero spinner elements in the rail · spinner replaced by page content on arrival ·
375: drawer nav → drawer closes, spinner in content slot. Screenshots: spinner_midnav_1280_dark.png /
spinner_midnav_375_dark.png (scratchpad/shots). Operator confirmed live feel ("soooo perfect").

## THINGS I DIDN'T TOUCH
`SpinnerLarge.tsx` / `Spinner.tsx` (kit components — used as-is per direction) · all MC screens/services/mocks/
types · kit surfaces · tests.

## LEDGER ADDITIONS
- **Rule Zero-B operator exception:** SpinnerLarge carries hardcoded `fill-blue-600` / gray palette classes;
  operator explicitly directed its use (his component). Renders white-on-dark via its `dark:` classes. If it
  should read from tokens later, that's a FIX PHASE 2 / kit-perfection item.
- Retro lesson: **Next 16 loading.tsx does not fire on client-side navs with stale prefetch** — nav feedback
  needs a transition-pending pattern. Promote to kit doctrine (the kit shell should ship this).

## POTENTIAL CONCERNS
- None functional. `isPending` also flashes briefly when clicking the already-active nav item (router.push to
  same route) — sub-100ms, invisible in practice.
