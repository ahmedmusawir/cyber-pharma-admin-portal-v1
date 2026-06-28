# MANIFEST — MissionControl Phase 1 FFM

> What's authored, what to sync from canonical, what you drop in. Read this before staging.

## ✅ Authored & complete (per-project)
- `_project/CLAUDE.md` — project spine
- `_project/APP_BRIEF.md` — rev 0.4
- `_project/DATA_CONTRACT.md` — v1.0
- `_project/UI_SPEC.md` — designer v1.1
- `_project/COMPONENT_MANIFEST.md` — designer v1.1
- `_design/DESIGN_BRIEF.md` — designer v1.1
- `_extraction/DATA_SHAPES_frank_api.md` — curated schema evidence
- Root `CLAUDE.md`, `README.md`, `AGENTS.md`, `GEMINI.md`
- `_design/README.md`, `_extraction/README.md`
- `playbook/00–07` — phase-tuned for MissionControl
- `verification/PHASE_GATES.md`, `BUILD_CHECKLIST.md`
- `skills/stark-frontend-first/SKILL.md` (canonical) + `CLAUDE.md` (pointer)

## 🔁 Sync from canonical `cyber_pharma_v1_phase1_ffm` (don't diverge)
- `skills/stark-frontend-first/workflow/` (00-discovery … 05-verification)
- `skills/stark-frontend-first/references/` (SERVICE_LAYER_PATTERNS, MOCK_DATA_PATTERNS, COMPONENT_CONVENTIONS, ANTI_PATTERNS)
- `skills/stark-frontend-first/templates/` (service / mock-data / types `.template.ts`)
- If your FFM playbook/verification have been revised since `cyber_pharma_v1_phase1`, **diff and swap** — the versions here are adapted from the baseline + the FFM_PLAYBOOK stubs.

## 📦 You drop in (binaries)
- `_design/` — token file (`globals.css`), the 8 hi-fi PNGs, `style_tile.png`, `_HTML/`, logos. (See `_design/README.md`.)

## ⚠️ Three reconciliation flags carried from DATA_CONTRACT §6 (decide before backend wiring)
1. `Member.jobTitle` — unbacked in Frank's schema (designs show pharmacist/technician). Kept graceful-empty.
2. Owner `name` source — recommend `contact_person` of primary store.
3. Store `state` on card — recommend a future filter, not a card field.

## Version
1.0 — 2026-06-20
