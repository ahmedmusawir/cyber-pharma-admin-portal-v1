# FFM Sub-Phase 4 — COMPONENTS · Chunk 1/3 (Foundation + Login + Owners)

> Status: IN PROGRESS (Components not complete — more chunks follow). Gates for this chunk: tsc CLEAN · build GREEN.
> Generated: 2026-07-02 14:10:20.

## Blocker found + resolved: token layer was NOT on disk
`tailwind.config.ts` mapped `hsl(var(--…))` but `globals.scss` had **no `:root`/`.dark` token block** — every semantic token (`--background/--card/--border/--radius/--muted-foreground/--destructive/…`) was undefined, despite COMPONENT_MANIFEST listing tokens "delivered (step 1)". A doc-vs-disk drift. **Installed the delivered token layer from the design ground truth** (`_design/.../style_tile.html`): Metro Warm — Mist `:root` / Slate `.dark`, Coral `--primary: 12 93% 64%` (brand only), semantic-four success/warning/info, `--radius: 0`. Added success/warning/info (+ popover) to the Tailwind color map; wired **Saira** via `next/font`.

## Built this chunk
**Foundation**
- `globals.scss` — Metro Warm token block (`:root` Mist + `.dark` Slate) + `body` bg/text.
- `tailwind.config.ts` — added `success`/`warning`/`info` colors.
- `app/layout.tsx` — **dark default** (`<html class="dark">` for dark first paint, no flash; `next-themes defaultTheme="dark" enableSystem={false}`, toggle kept); Saira font; MissionControl metadata.

**Primitives (dependency-free; no network `shadcn add`)**
- `ui/skeleton.tsx`, `ui/separator.tsx`, `ui/breadcrumb.tsx` (uses installed `@radix-ui/react-slot`).
- `ui/alert-dialog.tsx` — built on the installed `@radix-ui/react-dialog` (kit ships no `@radix-ui/react-alert-dialog`; avoids a new dep). role="alertdialog", no outside/esc dismiss, Action/Cancel.

**KIPs + shared**
- `mission-control/EmptyState.tsx` (KIP-2) — icon + title + description + optional clear-search.
- `mission-control/DataTable.tsx` (KIP-1) — generic, token-driven, sticky header, tabular-nums; **responsive**: desktop `<Table>`, mobile stacked blocks (header hidden, `primary` cell first).
- `mission-control/StatusPill.tsx` — `Pill` + domain→tone/label mappers (health/account/sub/registration/type). Coral never a status.

**Shell + auth + first screen**
- `mission-control/Shell.tsx` — 248px sidebar, **5-nav** (Dashboard·Onboarding·Owners·Stores·Audit log), **coral active tint + 3px inset accent**, ThemeToggler, **single super-admin identity at the foot** (no role branching), sign-out; mobile top strip (accent → bottom border).
- `app/(mission-control)/layout.tsx` — REAL auth gate: `getSuperAdminUser()` (kit-real `getUserRole()==='superadmin'`) → `redirect('/login')` if not super-admin; renders Shell with the resolved identity. (Chosen over `protectPage` which hardcodes `/auth` and yields no user object — both satisfy the ruling.)
- `app/login/{page.tsx,LoginPageContent.tsx}` — standalone (no shell) **real** Supabase login via kit `/api/auth/login`; super-admin only (non-super-admins signed out + denied); `.catch()` chains per kit gotcha. Already-authed super-admin → `/dashboard`.
- `app/(mission-control)/owners/{page.tsx,OwnersPageContent.tsx}` — **canonical** screen: card grid (3→2→1), search (client-filter), health pill, graceful member/last-activity slots, Skeleton loading, EmptyState no-match → drills to `/owners/[ownerId]`.

## Gates (this chunk)
- `npx tsc --noEmit` → **CLEAN**.
- `npm run build` → **GREEN** (`✓ Compiled successfully`, TypeScript passed). `/login` + `/owners` render (dynamic `ƒ` — auth resolves server-side).
- RED-list self-audit → clean; the only password/email hits are the operator's OWN login field (legitimate real auth, not user-management).
- Boundary: `session.ts` (server-only via next/headers) is NOT in the client-imported services barrel.

## Deviations flagged
1. Installed the token layer (was missing on disk) — from the delivered style tile, not invented.
2. Primitives hand-authored dependency-free instead of `npx shadcn add` (offline sandbox; avoids new Radix packages). Same API surface, token-driven.
3. Gate uses `getSuperAdminUser()` not `protectPage` (route-correct /login redirect + yields the identity).

## Remaining (next chunks) — STOP before Verification
- Chunk 2: Stores directory · Owner detail · Store detail (roster + GREEN actions + fenced restore-admin + breadcrumb lock).
- Chunk 3: Dashboard (KPI tiles + chart + owners preview) · Audit log (DataTable) · Onboarding queue (DataTable + filters) · Onboarding detail (read-only identity + note/reason).
- Then final full-build route check across all 9 screens + Components report.

## Ledger (noted)
- Add `server-only` package at the next dep-hygiene pass.
