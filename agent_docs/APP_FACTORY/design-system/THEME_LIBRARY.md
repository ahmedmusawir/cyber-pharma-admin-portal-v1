# THEME LIBRARY — Cyber Pharma (and the factory pattern)

> **Reader:** Designer (me, in future labs) + Claudy.
> **Pairs with:** the **Handbook** (defines the token *contract*) and the **token file** (`TOKEN_FILE.md` — the live values). This doc is the *catalog*: named themes that each satisfy the contract.
> **Mental model:** the Handbook says *which tokens must exist*; the token file holds *the active values*; this library is the *menu* of complete value-sets you can drop in. Adding a theme never touches the contract — only values.

---

## 1. How a theme entry works

A theme = **one complete semantic token set** (every token the Handbook requires), in HSL-no-wrapper, activated by a class on `<html>`. Components never change; only the variables behind `bg-primary`, `bg-card`, etc. resolve differently. That's the whole "change values, not code" promise.

- **Light-base themes** live on `:root` (or a `.theme-*` override).
- **Dark-base themes** live on `.dark` (or `.dark.theme-*`).
- Full values for the two defaults are in `TOKEN_FILE.md §1`; the alternates are the small override blocks there.

---

## 2. The "Metro Warm" family (Cyber Pharma v1)

Shared across **all four** (these never change between modes — brand + meaning hold):

| | Value |
|---|---|
| Primary (brand) | coral `#f9704f` → `12 93% 64%` |
| Success (recovered) | green — `131 54% 40%` light / `142 69% 58%` dark |
| Destructive (money lost) | red — `2 67% 51%` light / `351 95% 71%` dark |
| Info (neutral count) | blue `#2f7ce0` → `214 74% 53%` |
| Warning (pending) | amber `#e8a008` → `41 93% 47%` |
| Typeface | Saira |
| Radius | `0` (Metro flat) |
| Labels | uppercase, tracked |

What changes between modes is **only the neutral surface stack**:

### 🟫 Mist — *default light*
- **Base:** light · **Background:** `#e2e5ea` (`217 16% 90%`) · **Surface:** `#ffffff`
- **Activate:** `:root` (default — no class)
- **Best for:** the everyday daytime view. Muted, easy on the eyes, looks intentional rather than glaring. **This is the recommended default.**

### 🌑 Slate — *default dark*
- **Base:** dark · **Background:** `#2e3440` (`220 16% 22%`) · **Surface:** `#2e3440`
- **Activate:** `class="dark"`
- **Best for:** low-light work, long sessions. Sophisticated gunmetal; coral pops hardest here.

### ⬜ Bright — *alternate light*
- **Base:** light · **Background:** `#ffffff` · **Surface:** `#ffffff`
- **Activate:** `class="theme-bright"`
- **Best for:** maximum contrast, print/export views, screenshots for decks. Crisp but can glare on big screens.

### ⬛ Dark-deep — *alternate dark*
- **Base:** dark · **Background:** `#191c24` (`224 18% 12%`) · **Surface:** `#23262f`
- **Activate:** `class="dark theme-deep"`
- **Best for:** OLED / focus mode / demo drama. Near-black; reserve for when you want the charts to glow.

**Phase 1 ships Mist + Slate** wired to the theme toggle. Bright and Dark-deep are catalogued and ready, not yet wired.

---

## 3. Adding a new theme (the repeatable process)

1. **Pick the neutral direction** — only the surface stack changes (background, card, muted, border, secondary). Brand + semantic stay fixed.
2. **Derive the full set** — every token the Handbook lists, light *and*/or dark base. Don't ship a partial theme.
3. **Contrast-check** — run `success`/`destructive` as small text against the new `card`; tune lightness until both clear WCAG AA. (This is the step a 4-color palette can't give you.)
4. **Add as a class** — a `.theme-*` override block in `globals.css`. Nothing else changes.
5. **Catalog it here** — name, base, background, "best for", activation class.
6. **Render the style tile in it** — eyeball light + dark before locking.

A new theme is ~30 minutes and zero component changes. That's the payoff.

---

## 4. Per-tenant brand themes (multi-tenant, future)

Cyber Pharma is multi-tenant. When a client wants their own brand color, it's the same mechanism scoped to a class:

```css
.theme-acme { --primary: <acme hsl>; --ring: <acme hsl>; --accent: <acme hsl>; }
```

- Swap **only** `--primary` / `--accent` / `--ring`. **Never** the semantic four — underpaid must read red for every client.
- Apply the class at the tenant boundary (layout reads the org's theme).
- This keeps a per-pharmacy brand a one-line addition, not a fork.

> Defer building this until multi-tenant brand theming is actually scoped (it's Phase 7-ish). The architecture above means it costs nothing to add later.

---

## 5. Quick reference — activation

| Theme | Class on `<html>` |
|---|---|
| Mist (light default) | *(none)* |
| Slate (dark default) | `dark` |
| Bright | `theme-bright` |
| Dark-deep | `dark theme-deep` |
| Tenant brand (future) | `theme-<tenant>` (+ `dark` if dark base) |

Full token values: `TOKEN_FILE.md`. Visual proof of all modes: the style tile + the OwedBook Mist/Slate/Dark artifacts in `_design/`.
