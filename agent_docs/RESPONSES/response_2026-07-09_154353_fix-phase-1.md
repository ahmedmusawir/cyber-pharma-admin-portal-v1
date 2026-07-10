# FIX PHASE 1 — Investigation + Plan (PENDING_APPROVAL)

**Date:** 2026-07-09 15:43:53 · **Branch:** `phase-1-FFM-verify` · **Mode:** Plan Mode (read-only performed)
**Scope:** root access flow + mobile-nav rebuild + branding. Kit cleanup = FIX PHASE 2 (nothing kit-side deleted in this pass).

---

## STEP 1 — INVESTIGATION FINDINGS

### 0. Doctrine source discrepancy (flag)

Task said "UI_UX_BUILDING_MANUAL v1.3 dropped into agent_docs/". On disk there is only
`agent_docs/APP_FACTORY/UI-UX-BUILDING-MANUAL_v1_2.md` (v1.2, dated June 2, mtime 2026-06-26).
No v1.3 anywhere under agent_docs/ (searched by name and by content). **I investigated against v1.2.**
If v1.3 exists elsewhere with changed doctrine, drop it in before execution — the sections I used
(RULE ZERO, breakpoints, sidebar rule) read exactly like what the task quoted, so I expect no delta.

Doctrine captured (v1.2):
- RULE ZERO: mobile-first, 375 canonical; breakpoints 375 / 768 md / 1024 lg; verify all three.
- Sidebar rule (line 43): slide-over below the breakpoint where the rail fits — **`md` (768) for narrow nav**,
  `lg` for wide rails (≥ ~20rem). Hamburger trigger mandatory below; rail absent at mobile with no trigger = automatic failure.
- Touch targets ≥ 44px; no controls hidden at mobile that exist at desktop.

### 1. Root flow — what `/` renders today

- `/` is served by `src/app/(public)/page.tsx` → renders `HomePageContent` = **kit demo page**
  ("Stark SaaS Starter Demo Events", picsum lorem cards). Wrong front door for a client-facing deploy.
- There is NO `src/app/page.tsx`; the (public) group page owns `/`. Therefore the rehome is an EDIT of
  `(public)/page.tsx` — adding a root `page.tsx` would be a route conflict.
- `(mission-control)/layout.tsx:15-16` — real gate confirmed: `getSuperAdminUser()` → `if (!user) redirect("/login")`.
  Proven live in G2. **Plan confirmed: `/` → `redirect("/dashboard")`; anonymous chain `/` → `/dashboard` → `/login`. No new auth logic.**

### 2. Mobile shell — built vs designed

**Built** (`src/components/mission-control/Shell.tsx:122-145`): sticky top bar (brand + ThemeToggler) over a
**horizontal scrollable tab strip** (5 items, bottom-accent active). No hamburger. No drawer.
**No super-admin foot / sign-out at mobile at all** — a control that exists at desktop is absent at mobile =
standing Rule Zero violation independent of the pattern question. Strip items are py-2 (~36px) — under 44px target.

**Mobile PNGs** (`_design/MOBILE/`, 11 files):
- `owners_canonical_mobile.png` (closed): top bar — mark + "MissionControl" left, **hamburger right**. No strip.
- `owners_mobile_menu_open.png` (open): panel with brand row + **X top-right**; 5 stacked nav items; active item
  (Owners) = coral tint bg + coral text + **coral LEFT accent bar**; divider; **"Super admin" foot row**.
  The open panel spans **full width** and drops from the top, content visible below it.
- No theme toggle visible in either mobile PNG top bar.

**Deltas vs built:** hamburger vs strip (whole pattern), drawer menu vs none, foot present vs missing,
left-accent vs bottom-accent active state.

**Were the mobile PNGs consulted during the original shell build? — Honest answer: NO.**
Evidence: PNGs staged in commit `d74a638` (2026-06-28); Shell built in `3dec959` (2026-07-03) — the PNGs sat on
disk five days before the build. The build instead followed **UI_SPEC v1.1 §3's written rule**: "Sidebar →
horizontal scrollable top strip; active accent moves to bottom border." So it wasn't invented from nothing — it
followed spec TEXT while ignoring the canonical visual ground truth (FFM CLAUDE.md: `_design/` is canonical for
greenfield). The UI_SPEC-text-vs-PNG conflict existed and was never surfaced. That's the miss, and it's mine to own.

**Consequence:** UI_SPEC v1.1 §3 (top strip) and §2 (accent "bottom on mobile") are now confirmed drift vs
PNGs + manual doctrine. PNGs win on look, manual wins on behavior. **Not editing UI_SPEC this pass** (scope
discipline) — logged as a ledger item for a UI_SPEC v1.2 correction.

### 3. Sidebar rail classification

248px = 15.5rem < ~20rem → **narrow nav rail** → doctrine default: **persistent at md (768)+, slide-over below**.
Current Shell already splits at md — breakpoint stays, only the sub-md pattern changes.
PNG disagreement: none — only MOBILE (375) and DESKTOP PNG sets exist; no tablet PNGs to contradict md persistence.
Note: with the rail persistent at md+, the drawer's `md:w-1/2` (task spec B) is unreachable in practice —
included anyway (costs nothing, covers any future breakpoint shift).
PNG-vs-directive delta (flagged): PNG open-menu reads as a full-width top drop-down; the task + doctrine mandate a
**left slide-over w-3/4**. Task acknowledged the PNGs and still specified the drawer → task/doctrine wins on
behavior; PNG wins on the menu's look (item styling, accent, foot).

### 4. Branding audit (evidence, not guess)

Theme backgrounds from `globals.scss`: Mist light `--background: 217 16% 90%` (≈ #e2e5eb) ·
Slate dark `--background: 220 16% 22%` (≈ #2f3441). Card surfaces sit near these.

| Asset | Content | On Mist (light) | On Slate (dark) | Verdict |
|---|---|---|---|---|
| `logo-color.svg` | coral #F9704F tile + white drop (self-contained bg) | ✅ tile pops | ✅ tile pops | **USE — theme-proof.** Coral ≈ token primary (hsl 12 93% 64%) — on-brand |
| `logo-mono.svg` | drop only, `fill="currentColor"` | ⚠️ | ⚠️ | Only safe **inlined** (inherits text color). As `<img src>` currentColor → **black** → invisible on Slate. Copy to public, do not use as <img> |
| `logo-lockup.svg` | tile + drop + baked text `#1B2024` | ✅ | ❌ **near-black text on dark = dead** | **Do NOT use in UI** (app is dark-default). Copy to public only |
| `favicon-512.png` | 512×512 RGB, coral tile + white drop | ✅ | ✅ | Legible at 16px per brand_preview. **USE** |

**Proposal:** ONE variant everywhere — `logo-color.svg` (login card, desktop rail head, drawer head), no
dark/light swap needed because the tile carries its own background. All wordmark text rendered as HTML with
semantic tokens (theme-aware), never the baked-text lockup.

Current brand surfaces to replace: "M" primary-square + "MissionControl" text at `Shell.tsx:61-70` (rail + reused
in mobile bar) and `LoginPageContent.tsx:63-75` ("M" + "MissionControl / Super Admin Console").
Favicon today: kit default `src/app/favicon.ico`; `public/` has only next.svg/vercel.svg. No ImageMagick on this
machine → PNG→ICO conversion unavailable → use Next's `app/icon.png` convention (auto-wired, takes precedence in
modern browsers). Fallback pre-authorized by task ("replace kit default"): overwrite `favicon.ico` bytes if the
live walk shows the old icon winning.

---

## STEP 2 — 📋 PLAN

### A. ROOT REHOME
1. `src/app/(public)/page.tsx` → replace body with `redirect("/dashboard")` (next/navigation). —
   `/` stops rendering the kit demo; anonymous → `/login` via the existing MC gate; super-admin → `/dashboard`.
   `HomePageContent.tsx` stays on disk untouched (kit surface — FIX PHASE 2).

### B. MOBILE NAV — doctrine drawer
2. CREATE `src/components/ui/sheet.tsx` — slide-over primitive on the **installed** `@radix-ui/react-dialog`
   (same hand-authored-offline pattern as alert-dialog). Radix supplies for free: focus trap, **Escape close,
   backdrop tap close, body scroll lock, `role="dialog"` `aria-modal`**, portal. Styling: fixed left panel,
   `w-3/4 md:w-1/2`, bg-card, border-r, slide-in animation, close (X) button.
3. `Shell.tsx` mobile region rebuild (< md only; desktop rail logic untouched):
   - Top bar: brand left · **ThemeToggler + hamburger right** (toggle OUTSIDE the drawer, top level — task
     directive; flagged that mobile PNGs show no toggle at all, but Rule Zero forbids hiding a desktop control).
   - Hamburger: `h-11 w-11` (44px), `aria-label="Open navigation"`, `aria-expanded`, Menu icon.
   - **Horizontal tab strip DELETED** (replaced, not kept — it's the improvisation being fixed).
   - Drawer content: brand head + X · same 5 NAV items, stacked, `py-3` (≥44px), active = coral tint + coral
     text + **left** 3px accent (per PNG, not UI_SPEC's "bottom on mobile") · divider · **same super-admin foot
     + sign-out as the rail** (fixes the missing-at-mobile Rule Zero breach).
   - Dismissal: backdrop / Escape (radix) + **close-on-navigation** (pathname change → close).
   - Nothing stripped at mobile that exists at desktop (Rule Zero).

### C. BRANDING
4. Copy to `public/`: `logo-color.svg`, `logo-mono.svg`, `logo-lockup.svg`, `favicon-512.png`.
5. Copy `favicon-512.png` → `src/app/icon.png` (Next favicon convention). Kit `favicon.ico` left in place this
   pass; **fallback if it wins in the live walk: overwrite favicon.ico** (task-authorized "replace kit default").
6. `LoginPageContent.tsx` card head: `logo-color.svg` (h-10 w-10 img, alt "Cyber Pharma") + **"Cyber Pharma v1"**
   over **"Mission Control"** (token-colored HTML text).
7. `Shell.tsx` brand block (rail head, mobile top bar, drawer head — one shared `brand` node): `logo-color.svg`
   (h-8 w-8) + **"Cyber Pharma"** over **"Mission Control"**.

### FILES TO MODIFY
- `src/app/(public)/page.tsx` — becomes redirect('/dashboard')
- `src/components/mission-control/Shell.tsx` — brand block; mobile strip → hamburger + drawer
- `src/app/login/LoginPageContent.tsx` — branding block on the card

### FILES TO CREATE
- `src/components/ui/sheet.tsx` — slide-over primitive (radix dialog)
- `public/logo-color.svg`, `public/logo-mono.svg`, `public/logo-lockup.svg`, `public/favicon-512.png` — asset copies
- `src/app/icon.png` — favicon (copy of favicon-512.png)

### FILES I WILL NOT TOUCH
- `(public)/HomePageContent.tsx`, `(admin)`, `(members)`, `(superadmin)`, `(auth)`, `template`, `error` — kit surfaces, FIX PHASE 2
- `src/app/favicon.ico` — kit file; superseded via icon.png (fallback overwrite only if live walk shows it winning)
- All MC screens, services, mocks, types — out of scope
- All tests — kit tests NOT touched; 81/81 must hold as-is
- `UI_SPEC_MissionControl_v1_1.md` — drift flagged to ledger, corrected in its own pass
- `src/app/layout.tsx` — icon.png convention needs no metadata change

### ASSUMPTIONS
1. Manual v1.2 on disk == the "v1.3" doctrine the task quotes (sections match verbatim); v1.3 file missing.
2. Left slide-over w-3/4 (task/doctrine) overrides the PNG's full-width top-drop look; PNG governs menu-item look.
3. "Cyber Pharma v1" wording exactly as written for the login card; rail/drawer say "Cyber Pharma" / "Mission Control".
4. Theme toggle visible in the mobile top bar is intended (PNGs omit it; Rule Zero + task directive keep it).
5. `md:w-1/2` on the drawer is intentionally dead code while the rail persists at md+ (kept per explicit spec).

### RISKS
- Browser favicon caching can mask the new icon in the live walk (hard-reload / cache-bust to verify).
- Radix dialog default animations are fade/zoom — slide-over needs custom keyframes (already have tailwindcss-animate patterns in ui/dialog.tsx to copy from).
- `(public)/layout.tsx` may wrap `/` with kit navbar chrome — irrelevant once the page is a redirect (redirect fires before render).

### POST-APPROVAL VERIFICATION (as tasked)
`npm run build` + `tsc` + `npm test` (81/81 holds) → live walk at 375 / 768 / desktop widths, dark AND light,
screenshots side-by-side vs design PNGs → confirm live: anonymous `/` → `/login`; super-admin `/` → `/dashboard`;
branding on login card + rail + drawer both themes; favicon updated; drawer a11y (Escape, backdrop, focus trap,
scroll lock, close-on-nav, aria-expanded).

**→ Awaiting approval. No files modified (session log + this mirror only).**
