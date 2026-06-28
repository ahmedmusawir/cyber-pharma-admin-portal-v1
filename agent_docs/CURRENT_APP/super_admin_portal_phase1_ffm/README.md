# README — MissionControl (Super Admin Portal) Phase 1 FFM

> Operator setup guide. For Tony (Moose). Audio-friendly; explanations before any commands.

## What This Is

A portable Factory module that tells Claudy exactly what to build for **MissionControl** Phase 1 — the private super-admin console — and what never to touch. Frontend-first: real auth, mocked domain, service layer as the only later swap point.

## Quick Start

1. **Stage the module** into your MissionControl starter-kit clone:
   ```bash
   cp -r super_admin_portal_phase1_ffm <kit>/agent_docs/CURRENT_APP/
   ```
2. **Fill `_design/`** — drop the 8 Stitch PNGs, the `_HTML/` build-refs, and the real token file (`globals.css` / token map) per `_design/README.md`.
3. **Verify `_extraction/`** — the curated `DATA_SHAPES_frank_api.md` is already here; add full FRANK_API extracts only if Claudy asks.
4. **Sync the skill subfolders** — copy `workflow/`, `references/`, `templates/` from the canonical `cyber_pharma_v1_phase1_ffm/skills/stark-frontend-first/` (this FFM ships `SKILL.md` only — see `MANIFEST.md`).
5. **Install skills** into `.claude/skills/`: `frontend-design`, `skill-creator`, `webapp-testing`, `stark-frontend-first` (then `rm -rf /tmp/anthropic-skills`).
6. **Point the kit at this module** — set `PROJECT_POINTER.md` at repo root to `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/`.
7. **Verify the stack builds** (`npm install && npm run build`), then `claude` and paste the boot prompt from `CLAUDE.md` → Activation Contract.

## The Run (sub-phases)

Per `playbook/`: 0 Discovery → 1 Types → 2 Services → 3 Mocks → 4 Components → 5 Verification → 6 Retrospective. Claudy stops at each boundary and waits for "approved".

## Operator Cheat Sheet

- **Forbidden-zone violation:** "STOP. You touched a forbidden zone. Read `_project/CLAUDE.md` and tell me which one." Then recover.
- **Skipped a gate:** "STOP. Roll back unapproved work. Re-read the playbook for this sub-phase and re-propose."
- **Resume after interruption:** "Read `RECOVERY.md`, then the FFM `CLAUDE.md`, report the last completed sub-phase, propose the next, STOP."

## Sequencing Note

This FFM is **Phase 1 only** (frontend-first). Real Supabase domain wiring, Stripe mirror, audit persistence, and the activation-invite send are **post-FFM** work. Don't let scope creep pull them in.

## Credits

Designed by the Architect (Claude/Jarvis) for Stark Industries App Factory. Operated by Tony Stark (Moose). Born from `cyber_pharma_v1_phase1_ffm`.

## Version

1.0 — 2026-06-20
