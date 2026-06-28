# CLAUDE.md — MissionControl (Super Admin Portal) / Phase 1 FFM

> **You are reading the entry point to a portable Factory module.**
> This file is the navigation contract for any AI coding tool that opens this folder.
> Read this first. Everything else is referenced from here.

---

## What This Module Is

This is the **MissionControl (Super Admin Portal) — Phase 1 Frontend-First Module (FFM)**.

A portable Factory artifact for Phase 1 (frontend-first, mock-data) of the **MissionControl** build — the private, Cyberize-operated super-admin operations console that sits *above* the Cyber Pharma platform. PHI-free, billing-control-free, credential-free, creation-free.

- **Born from:** `cyber_pharma_v1_phase1_ffm` (the first successful Factory FFM).
- **Adapted for:** MissionControl — a **greenfield** internal tool (no source app; the Designer's output is the visual ground truth).
- **Owner:** Cyberize Group — Stark Industries App Factory.
- **Operator:** Tony Stark (Moose).
- **License:** Internal Factory tooling.

---

## What's Different About This FFM (vs the baseline)

| Aspect | Baseline (cyber_pharma_v1_phase1) | This FFM (MissionControl) |
|---|---|---|
| Variant | Greenfield (kit rebrand + landing) | Greenfield (full internal console) |
| Source app | Demo OwedBook screenshots | **None** — designs ARE the ground truth |
| `_design/` | Demo screenshots + tokens | 8 Stitch hi-fi screens + style tile + tokens |
| `_extraction/` | FRANK_API + demo extracts | FRANK_API **data-shapes only** (schema evidence) |
| Audience | Pharmacy customers | Cyberize operators (+ Heather) |
| Data scope | Own-store (RLS) | Platform-wide (super-admin) |
| Auth in Phase 1 | Real (kit-provided) | **Real** (do NOT mock); domain mocked |

---

## Vendor Neutrality

This module is **tool-agnostic**. Any AI coding tool that reads markdown can run it:

| Tool | Entry file |
|---|---|
| Claude Code (primary) | `CLAUDE.md` (this file) |
| Codex CLI | `AGENTS.md` → redirects here |
| Gemini CLI | `GEMINI.md` → redirects here |
| Windsurf / Cursor | `CLAUDE.md` directly |

Tool-specific steps (e.g. installing skills to `.claude/skills/`) are documented in `README.md`, not baked into doctrine.

---

## Reading Order (MANDATORY)

1. **This file** — navigation contract (module structure)
2. **`_project/CLAUDE.md`** — project spine (forbidden zones, tech stack, doctrine)
3. **`_project/APP_BRIEF.md`** — scope, hard gates, success criteria (rev 0.4)
4. **`_project/DATA_CONTRACT.md`** — types, service contracts, mock requirements (v1.0)
5. **`_project/UI_SPEC.md`** — screen behavior (v1.1)
6. **`_project/COMPONENT_MANIFEST.md`** — primitive map + KIPs to build first
7. **`playbook/00-OVERVIEW.md`** — the build plan
8. **Each phase file under `playbook/`** — on demand
9. **Skills** under `skills/` — auto-activate when triggers fire
10. **`_extraction/`** — referenced on demand for data-shape ambiguity
11. **`_design/`** — the visual ground truth (greenfield: this is canonical)

**Conflict resolution:** `DATA_CONTRACT.md` wins on data shapes · `UI_SPEC.md` wins on UI behavior · `_project/CLAUDE.md` wins on scope · this file wins on module structure · **APP_BRIEF hard gates + the RED list win over everything.** If two sources still conflict, **STOP and surface to the operator.**

---

## Folder Map

```
super_admin_portal_phase1_ffm/
├── CLAUDE.md                 ← this file (navigation contract)
├── README.md                 ← operator setup guide
├── AGENTS.md / GEMINI.md     ← CLI redirects
├── MANIFEST.md               ← what's done / to-swap / to-drop-in
├── _project/                 ← PER-PROJECT (authored)
│   ├── CLAUDE.md             ← project spine
│   ├── APP_BRIEF.md          ← scope + hard gates (rev 0.4)
│   ├── DATA_CONTRACT.md      ← types + service contracts (v1.0)
│   ├── UI_SPEC.md            ← screens + behavior (v1.1)
│   └── COMPONENT_MANIFEST.md ← primitive map + KIPs
├── _design/                  ← visual ground truth
│   ├── README.md             ← what to drop here
│   ├── DESIGN_BRIEF.md       ← designer brief (v1.1)
│   └── (OPERATOR DROPS: PNGs, _HTML/, tokens globals.css)
├── _extraction/              ← data-shape evidence
│   ├── README.md
│   └── DATA_SHAPES_frank_api.md  ← curated schema extract
├── skills/stark-frontend-first/  ← REUSABLE skill
├── playbook/                 ← REUSABLE phase build files (00–07)
└── verification/             ← REUSABLE gates + checklist
```

---

## Activation Contract

Stage this module at `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/` in the MissionControl starter-kit clone, point `PROJECT_POINTER.md` at it, then boot:

> You are Claudy, working on **MissionControl (Super Admin Portal)** under Tony Stark.
>
> BOOT SEQUENCE — read in this exact order, then STOP:
> 1. Read your global CLAUDE.md.
> 2. Read this repo's root CLAUDE.md.
> 3. Read `PROJECT_POINTER.md` at repo root.
> 4. Read the kit-level references it names (starter-kit-handbook, COMPONENT_REGISTRY).
> 5. Read `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/CLAUDE.md` and follow its Reading Order exactly.
> 6. Confirm skills present in `.claude/skills/`: frontend-design, skill-creator, webapp-testing, stark-frontend-first. If any missing, surface.
> 7. Produce a structured Sub-Phase 0 Discovery summary per `playbook/01-DISCOVERY.md`.
> 8. STOP and wait for "approved".
>
> Hard constraints during boot: NO code, NO file changes, Plan Mode applies to everything. Eyesight-aware: explanations before code. Karpathy Protocol: you are the hands, I am the architect.

---

## Forbidden Zones (Hard Stops)

These mirror `APP_BRIEF` §6 and the RED list. Claudy can verify each.

- ❌ **No member creation / invite-to-a-new-address** anywhere in the UI — not even disabled.
- ❌ **No password set/read field.** Recovery-trigger only.
- ❌ **No email-entry or email-edit field** — including the onboarding surface (the on-record email is display-only).
- ❌ **No delete-human control.** Suspend / soft-reject only.
- ❌ **No billing / subscription / checkout control or payment surface.** Sub status is a read-only pill.
- ❌ **No PHI / claims / OwedBook data / "$ recovered"** rendered or queried.
- ❌ **No grant-super-admin UI.** Console-only.
- ❌ **No impersonation / force-sync / suspend-whole-pharmacy** override powers.
- ❌ **No mocking of auth** (auth is REAL) and **no real domain CRUD** (domain is MOCKED).
- ❌ **No re-authoring kit-provided foundation** (auth, RBAC, RLS, user-CRUD). Extend, don't rebuild.
- ❌ **No API routes / Supabase migrations / SQL** beyond starter-kit defaults in Phase 1.

---

## Skill Inventory

| Skill | Source | Role |
|---|---|---|
| `stark-frontend-first` | ships in this FFM (`skills/`) | The frontend-first methodology — service layer, mocks, type-driven contracts |
| `frontend-design` | operator installs | Design-token / styling discipline |
| `skill-creator` | operator installs | Skill authoring (if KIPs need it) |
| `webapp-testing` | operator installs | Smoke / component testing in Verification |

> **Note:** the shipped `stark-frontend-first` here contains `SKILL.md` only. Its `workflow/`, `references/`, and `templates/` subfolders should be synced from the canonical copy in `cyber_pharma_v1_phase1_ffm/skills/` (see `MANIFEST.md`).

---

## What Is Reusable vs Per-Project

| Item | Reusable | Per-Project |
|---|---|---|
| Root `CLAUDE.md`, `README.md`, `AGENTS.md`, `GEMINI.md` | ✅ (minor edits) | |
| `_project/*` | | ✅ |
| `_design/*`, `_extraction/*` | | ✅ |
| `skills/stark-frontend-first/*` | ✅ | |
| `playbook/00–07` | ✅ (phase-tuned) | |
| `verification/*` | ✅ (gate updates per phase) | |

---

## Evolution Principle

Reusable parts (skill, playbook, verification) refine across runs; per-project parts are replaced wholesale. Lessons land in `playbook/RETROSPECTIVES/RUN_NNN_LESSONS.md` and feed the next FFM. Trickle-up: anything improved here propagates back to the canonical Factory tooling.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-20 | Initial FFM for MissionControl Phase 1. Per-project docs authored (APP_BRIEF rev 0.4, DATA_CONTRACT v1.0, designer UI_SPEC v1.1 + COMPONENT_MANIFEST v1.1). Reusable tooling adapted from `cyber_pharma_v1_phase1_ffm`. |
