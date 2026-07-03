# FFM Sub-Phase 4 — COMPONENTS · COMPLETE (all 9 screens)

> Status: **COMPLETE — awaiting approval before Sub-Phase 5 (Verification).**
> Generated: 2026-07-02 15:10:10 · Gates: tsc CLEAN · full build GREEN (9 routes) · RED-clean · baseline 81/81.

## Build order delivered (as approved)
shadcn primitives → KIP-2 EmptyState + KIP-1 DataTable → shell + dark default → screens in dep order:
**Login → Owners (canonical) → Stores → Owner detail → Store detail → Dashboard → Audit log → Onboarding queue → Onboarding detail.**

## Routes (all 9 render; from `npm run build`)
`/login` · `/dashboard` · `/owners` · `/owners/[ownerId]` · `/stores` · `/stores/[storeId]` · `/onboarding` · `/onboarding/[registrationId]` · `/audit-log`. Kit routes untouched and still present.

## Foundation
- **Token layer installed** (was absent on disk despite manifest "delivered"): Metro Warm from the delivered `style_tile.html` — Mist `:root` / Slate `.dark`, Coral `--primary:12 93% 64%` (brand only), semantic-four (success/warning/info), `--radius:0`. Added success/warning/info to Tailwind; wired **Saira**.
- **Dark default**: `<html class="dark">` (dark first paint, no flash) + `next-themes defaultTheme="dark" enableSystem={false}`; ThemeToggler kept on every nav surface.

## Primitives (dependency-free — no network `shadcn add`, no new packages)
`ui/skeleton.tsx`, `ui/separator.tsx`, `ui/breadcrumb.tsx` (installed `@radix-ui/react-slot`), `ui/alert-dialog.tsx` (built on installed `@radix-ui/react-dialog`; role=alertdialog, no outside/esc dismiss).

## KIPs + shared
- **DataTable** (KIP-1): generic, token-driven, sticky header, tabular-nums; responsive — desktop `<Table>`, mobile stacked blocks (header hidden, `primary` cell first). Homes: Audit log + Onboarding queue.
- **EmptyState** (KIP-2): icon + title + description + optional clear-search. Homes: Owners/Stores/Owner-detail/Onboarding.
- **StatusPill**: `Pill` + domain→tone/label mappers. Coral is never a status.
- **Shell**: 248px sidebar, 5-nav (Dashboard·Onboarding·Owners·Stores·Audit log), coral active tint + 3px inset accent, single super-admin foot (no role branching), sign-out; mobile top strip.
- **StoreCard**: shared by Stores directory + Owner detail (design-once).

## Auth (REAL) & the ruling
- `(mission-control)/layout.tsx` gate: `getSuperAdminUser()` → kit-real `getUserRole()==='superadmin'` → `redirect('/login')` if not. Renders Shell with the resolved identity. (Chosen over `protectPage` — which hardcodes `/auth` and returns no user; both satisfy the ruling.)
- `/login`: real Supabase via kit `/api/auth/login`; super-admin only (others signed out + denied); `.catch()` chains. The ONLY password field in the app (operator's own auth).

## Screen highlights
- **Owners / Stores**: card grid 3→2→1, client-search, health pill, Skeleton, EmptyState.
- **Owner detail**: breadcrumb + owner band + reused store cards.
- **Store detail**: always-visible breadcrumb **lock** (Stores › Owner › Store), read-only header (sub pill), roster with per-status GREEN actions (active→Send recovery/Suspend · invite_pending→Resend · suspended→Un-suspend), **fenced restore-admin** (typed store-name confirm, disabled until exact match). AlertDialog confirms name the person; toasts + refetch.
- **Dashboard**: 4 KPI tiles + **CSS bar chart** (recharts not installed — dependency-free, token `bg-info`) + owners preview (needs-attention, links to detail — NOT the directory).
- **Audit log**: read-only DataTable (Time·Actor·Action·Target·Result), search.
- **Onboarding queue**: DataTable + status segments (default Pending) + type filter + search; row → detail.
- **Onboarding detail**: breadcrumb lock, header (type + status), **fully read-only identity block**, invite-destination callout (email **displayed, not editable**), verification-note Textarea (Approve disabled until non-empty), reject-reason Textarea. Only inputs in the feature = note + reason.

## Gates
- `npx tsc --noEmit` → **CLEAN**.
- `npm run build` → **GREEN** (compiled, TypeScript passed, all 9 routes).
- **RED-list whole-tree audit** → clean (only hit is a PHI-absence *comment*); password/email inputs exist **only** in login.
- **Baseline `npm test`** → **81/81** (shared token/layout edits didn't break kit tests).
- Per-screen RED self-audits run after each chunk (not deferred to the end).

## Deviations flagged (for your call)
1. **Token layer installed** from the delivered style tile (was missing on disk) — not invented.
2. **Primitives hand-authored** dependency-free instead of `npx shadcn add` (offline sandbox; no new Radix deps).
3. **CSS bar chart** instead of recharts (not installed; avoids a dependency). COMPONENT_MANIFEST named recharts.
4. **Restore-admin = per-member action** (offered on non-admin members) rather than the designer's provisional store-level control — this matches the brief's per-(user,store) intent. **Design open decision #5** — confirm.
5. **Shared root layout** now defaults dark + Saira **app-wide** (affects kit demo routes too). Intended (the app IS MissionControl), but flagging the blast radius.
6. Pills rendered **uppercase-tracked** per Metro doctrine (design open decision #7).

## NOT done (Sub-Phase 5 Verification — next, needs approval)
- No browser run / real-auth login walk / light+dark real-screen pass / 375px pass yet. That's Verification (gates G1–G12). Components stopped at build+tsc+tests+static RED audit.

## Ledger (noted)
- Add `server-only` package at the next dep-hygiene pass.

🛑 STOP — Sub-Phase 4 (Components) complete. Awaiting approval before Sub-Phase 5 (Verification).
