# _design/ — Operator Fills (Visual Ground Truth)

> **Greenfield:** there is no source app. These artifacts ARE the canonical visual reference. Claudy builds to them within the inherited token system.

## Already here
- `DESIGN_BRIEF.md` — the designer's brief (v1.1), with token decisions and rationale.

## What to drop here

### Required
1. **The token file** — the real `globals.css` (or token map) carrying the Mist + Slate CSS variables, Coral primary, Saira, radius 0. **This is the binding deliverable (Rule Zero-B).** Until it's here, Claudy uses the derived neutrals noted in the design brief — true them up against this file.
2. **The 8 hi-fi PNGs** (Stitch output), one per screen:
   `login`, `dashboard`, `owners_directory`, `owner_detail`, `stores_directory`, `store_detail`, `onboarding_queue`, `onboarding_detail`. (Mist or Slate variants as exported.)
3. **`style_tile.png`** — palette, type scale, pill system, button variants.

### Optional
4. **`_HTML/`** — the designer's near-buildable HTML reference (gold for Claudy at component time).
5. **Logo** — color SVG + mono SVG + favicon.

## How Claudy uses this folder
Read at component time (`playbook/05-COMPONENTS.md`). The PNGs are the layout/visual truth; the token file is the styling truth. If a screen implies a RED-list control, the design is wrong — STOP and surface.

## File naming
Lowercase, underscores, screen-named (`onboarding_detail_slate.png`). No spaces.
