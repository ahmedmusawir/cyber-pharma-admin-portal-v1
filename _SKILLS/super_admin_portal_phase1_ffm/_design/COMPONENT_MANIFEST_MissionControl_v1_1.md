# COMPONENT MANIFEST — MissionControl

> **Version:** 1.1 · **Date:** 2026-06-20
> **Purpose:** Map every screen to its shadcn primitives and flag the KIPs to build first. Compose from kit primitives; do not author a parallel component library. Genuine gaps become KIPs.
> **Token rule:** every component reads semantic tokens (`bg-card`, `text-destructive`, `border-border`, `ring`). No numbered Tailwind colors.

---

## 1. Shared / Shell Components

| Component | Source | Notes |
|---|---|---|
| App shell (sidebar + content) | custom layout | sidebar 248px; nav = **5 items** (Dashboard / Onboarding / Owners / Stores / Audit log); active = coral tint + inset accent |
| Avatar | shadcn `Avatar` | initials; info-tinted bg |
| Badge (status pill / type badge) | shadcn `Badge` (variants) | success / warning / destructive / info; **type badge:** New=muted, Converter=info; uppercase tracked |
| Card | shadcn `Card` | flat (radius 0); 1px border; surface = `--card` |
| Button | shadcn `Button` | variants: primary (coral), outline, **fenced** (warning outline), **reject** (destructive outline) |
| Input + Label | shadcn `Input`, `Label` | bg = `--background`, border = `--input` |
| **Textarea** | shadcn `Textarea` | **new** — verification-notes + reject-reason; only inputs in the onboarding feature |
| Separator | shadcn `Separator` | dividers, header rules |
| Skeleton | shadcn `Skeleton` | loading state |
| AlertDialog | shadcn `AlertDialog` | Suspend/Un-suspend/recovery + Approve/Reject confirms |
| Dialog + Input | shadcn `Dialog` | Restore-admin typed store-name confirm |
| Toast | shadcn `Sonner`/`Toast` | action feedback (incl. invite-sent) |
| Breadcrumb | shadcn `Breadcrumb` | owner detail · store-detail lock · **onboarding-detail lock** |
| Read-only field grid | composition | label/value pairs; **onboarding identity block** (zero inputs by design) + owner/store headers |

---

## 2. Per-Screen Primitive Map

| Screen | Primitives | KIPs |
|---|---|---|
| Login | Card, Input, Label, Button, (Alert) | — |
| Dashboard | Card (KPI), Input, Avatar, Badge, list rows, Button, chart | — |
| **Onboarding queue** | Input, Badge (status + type), segmented filter (Button group), Skeleton | **DataTable**, **EmptyState**, (MultiSelect future) |
| **Onboarding detail** | Breadcrumb, Badge, **read-only field grid**, **Textarea**, Button (primary + reject), AlertDialog, Toast, info callout | — |
| Owners directory | Card, Avatar, Badge, Input, Skeleton | **EmptyState** |
| Owner detail | Breadcrumb, Avatar, Badge, Card, Skeleton | **EmptyState** |
| Stores directory | Card, Badge, Input, Skeleton | **EmptyState** |
| Store detail | Breadcrumb, Avatar, Badge, Button, AlertDialog, Dialog+Input, Toast, Separator | — |
| Audit log | Input, Badge, Skeleton | **DataTable**, **EmptyState**, (MultiSelect future) |

**Chart note:** Dashboard bars → recharts `BarChart` styled to `--info` for real data; thin wrapper so the token color flows through.

---

## 3. KIPs (build these first)

### KIP-1 · DataTable  *(priority: high — two homes now)*
- **Need:** read-only tabular data with consistent header/row treatment; the kit ships no opinionated table.
- **Build on:** shadcn `Table` + (optional) `@tanstack/react-table` for sort/paginate.
- **Spec:** column config (label, width, align, cell renderer); tabular-nums; sticky header; token-driven; responsive — collapses to stacked blocks at ≤760px, header hidden, primary cell first. Cell renderers must support **badge/pill cells** (status + type).
- **First homes:** **Audit log + Onboarding queue** (proven across both — read-only ledger and a filtered pending queue).

### KIP-2 · EmptyState  *(priority: high)*
- **Need:** a consistent "nothing here / no matches" surface; a blank region is unacceptable.
- **Build on:** composition (icon + heading + subtext + optional action slot).
- **Spec:** props `{ icon, title, description?, action? }`; muted-foreground; centered; optional "Clear search".
- **First homes:** Owners / Stores / Owner-detail / **Onboarding queue** empty + no-match.

### KIP-3 · MultiSelect  *(priority: medium — future filtering)*
- **Need:** multi-value filtering (Audit log by action/actor; Onboarding by status/type beyond the single segment; future directory filters).
- **Build on:** shadcn `Popover` + `Command` + checkable items; selected as removable `Badge` chips.
- **Spec:** props `{ options, selected, onChange, placeholder }`; keyboard-navigable; token-driven chips; flat.
- **First home:** Audit log / Onboarding filter bar (Phase 2).

---

## 4. Build-First Order (for Claudy)

1. **Tokens** (`globals.*` + Tailwind map) — delivered.
2. **Shell + shared primitives** (Avatar, Badge variants + type badge, Card, Button variants, Input, **Textarea**, read-only field grid).
3. **KIP-2 EmptyState** + **KIP-1 DataTable** — unblock directories, audit log, and onboarding queue.
4. **Screens** in dependency order: Login → Owners (canonical) → Stores → Owner detail → Store detail → Dashboard → Audit log → **Onboarding queue → Onboarding detail**.
5. **KIP-3 MultiSelect** — deferred to the first filtering need.

---

## 5. Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-06-09 | Initial manifest from the seven locked designs. |
| 1.1 | 2026-06-20 | Added the two **Onboarding** screens to the primitive map; **DataTable** marked second-home-proven (Audit log + Onboarding queue); added **Textarea** (verification-notes / reject-reason — the only onboarding inputs), the **type badge** (New/Converter), and the **read-only field grid**; shell nav now 5 items; build order extended. |
