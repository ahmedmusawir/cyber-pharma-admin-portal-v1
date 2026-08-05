# RECON — MissionControl Navbar/Auth Architecture Audit

**Date:** 2026-08-05 18:11 · **Branch:** `navbar-fix-1` (clean) · **Mode:** READ-ONLY — zero files modified
**Context:** Cyber Pharma "navbar saga" root-cause — audit MissionControl for the same kit DNA.

---

## VERDICT SUMMARY

| # | Pattern | Verdict |
|---|---------|---------|
| 1 | Client-resolved identity | **NO** — identity is server-resolved and passed down as props |
| 2 | Global overlay spinner | **NO** — spinner is content-slot-scoped; shell never covered |
| 3 | Store-sourced role | **NO** — no auth store exists; zero client role reads |

MissionControl does **not** carry the navbar-saga DNA. It appears the kit patterns were already excised during FIX PHASE 1/2 and the nav-spinner work (2026-07-09/10).

---

## PATTERN 1 — CLIENT-RESOLVED IDENTITY: **NO**

- The only shell component is `src/components/mission-control/Shell.tsx`. It is `"use client"` but receives `user` as a **required prop** (`Shell.tsx:59-63`) — it never fetches identity.
- Identity is resolved **server-side** in the route-group layout: `src/app/(mission-control)/layout.tsx:15-16` — `const user = await getSuperAdminUser(); if (!user) redirect("/login");` — then passed to `<Shell user={...}>` (`layout.tsx:19`).
- `getSuperAdminUser()` (`src/services/mission-control/session.ts:28-40`) is server-only by construction (imports `@/utils/supabase/server` → `next/headers`); it calls `supabase.auth.getUser()` + derives role via `getUserRole()`.
- **No client-side `supabase.auth.getUser()` anywhere.** Grep for `supabase.auth` in client code: hits only in API routes (`login/logout/confirm/route.ts`), middleware, and the server session service. `src/utils/supabase/client.ts` (createBrowserClient) has **zero consumers** — matches the RECOVERY.md ruling ("client.ts + admin.ts KEPT, zero-consumer blessed Phase-2 infra — will look dead to recons").
- `Shell.tsx`'s `useState`/`useEffect` usage is drawer-open state (`Shell.tsx:68`) and close-on-navigation (`Shell.tsx:77-79`) — not identity.
- **navLinks:** `NAV` is a module-level constant (`Shell.tsx:41-47`); `navLinks` renders unconditionally (`Shell.tsx:133-152`). It can never render empty — there is no user-null window.
- **`!user` fallback branches inside authed chrome:** exactly one `!user` branch in the whole app — the server redirect at `layout.tsx:16`, which is the gate itself, not chrome fallback. No `user ?` / `user &&` conditional rendering in any component.

## PATTERN 2 — GLOBAL OVERLAY: **NO**

- **`fixed inset-0` grep:** 3 hits, all Radix/shadcn modal backdrops — `ui/dialog.tsx:24`, `ui/alert-dialog.tsx:23`, `ui/sheet.tsx:39`. None are navigation spinners.
- **`NavigationSpinner` / `useNavSpinner` / `LinkPendingProbe` / `NavSpinner`:** zero hits.
- **Root layout** (`src/app/layout.tsx`) mounts only `ThemeProvider` + `Toaster` — nothing that covers the shell on navigation.
- **The nav spinner that DOES exist is slot-scoped by design** (this was the 2026-07-09 nav-spinner task):
  - Client navs: `Shell.tsx:73` `useTransition` → `isPending` swaps **only the content slot** (`Shell.tsx:190-201` — `<main>` renders `SpinnerLarge` instead of `children`; comment at `Shell.tsx:188-189`: "spinner replaces ONLY this slot… the rail / top bar never remount"). Nav clicks route through `startTransition(() => router.push(href))` (`Shell.tsx:86`).
  - Hard loads: `src/app/(mission-control)/loading.tsx` — **route-group-scoped**, sits inside `(mission-control)/` so Next swaps only the page slot beneath the persistent Shell. It is the **only** `loading.tsx` in the app (no root-level one, so no boundary can cover the shell; also per `src/app/page.tsx` comment, the root redirect deliberately sits outside any loading boundary for zero-flash 307).

## PATTERN 3 — STORE-SOURCED ROLE: **NO**

- **No `useAuthStore` or any Zustand store exists.** Grep for `useAuthStore`, `from 'zustand'`, `localStorage`, `persist`: zero application hits (`persistSession: false` in `admin.ts:25` is the Supabase admin client, unrelated).
- `zustand@^4.5.4` is still in `package.json:45` but has **zero imports** — a known dep-hygiene leftover, already on the RECOVERY.md queued list ("dep-hygiene pass owns ALL package removals: … zustand …").
- **No component reads role/isAdmin/isSuperadmin to gate render.** Role is derived once, server-side (`session.ts:36-38`, `role === AppRole.SUPERADMIN`), and the returned `SuperAdminUser` carries `isSuperAdmin: true` as a proof-carrying invariant — you only hold the object if the check passed. Shell displays the static label "Super Admin" (`Shell.tsx:119`) but takes no role prop and does no branching ("ONE operator identity — no role branching", `Shell.tsx:21-22`).

## LAYOUT TREE MAP

```
src/app/
├── layout.tsx                      ROOT — no Navbar, no guard (fonts/theme/toaster only)
├── page.tsx                        / → force-dynamic 307 redirect → /dashboard (no auth logic, no chrome)
├── not-found.tsx
├── login/page.tsx                  NO shell — inverse guard: getSuperAdminUser() → redirect /dashboard if session
└── (mission-control)/
    ├── layout.tsx                  ★ THE ONLY Navbar mount (Shell) + THE auth gate
    ├── loading.tsx                 route-group-scoped spinner (page slot only)
    └── dashboard/ onboarding/ owners/ stores/ audit-log/ (+3 [param] details)
```

- **Route groups mounting a Navbar: 1** — `(mission-control)/layout.tsx` mounts `Shell` for all 8 authed screens. Login and root are chrome-free.
- **Guard per mount:** the gate runs in that same single layout. `protectPage()` is **not used** — deliberately (comment `layout.tsx:8-9`: "protectPage hardcodes a /auth redirect and does not yield the SuperAdminUser the shell foot needs"). Grep confirms `protectPage` exists only in comments (login/logout route cache-purge notes) — no live definition/call.
- **Does the guard return user/role or discard them? It RETURNS AND USES them.** `getSuperAdminUser()` yields `{ id, email, displayName, isSuperAdmin: true }`; the layout passes `displayName` + `email` into `Shell` for the sidebar foot (`layout.tsx:19`). Role is consumed inside the resolver (superadmin-or-null); nothing downstream needs to re-derive it.
- Middleware (`src/utils/supabase/middleware.ts:36-37`) refreshes the session only ("don't redirect — let layouts handle auth") — no duplicate gate, no discarded identity.

## OBSERVATIONS (non-findings, for the record)

- `zustand` in package.json with zero imports — already owned by the queued dep-hygiene pass.
- `src/utils/supabase/client.ts` zero-consumer — pre-blessed Phase-2 infra, per prior ruling. Not dead code to a recon that reads RECOVERY.md.
- The architecture here is the **fixed** shape of the navbar saga: server-resolved identity → props, slot-scoped pending UI, no client role store. If Cyber Pharma's fix converged on this pattern, MissionControl is already there.

**READ-ONLY CONFIRMED — no files modified. STOPPING per instruction; awaiting scope ruling.**
