# _extraction/ — Data-Shape Evidence (Hybrid Repurpose)

> **Why this folder for a greenfield app:** MissionControl has no source UI to extract, but its data shapes are real — they come from the FRANK_API rebuild schema. This folder holds that **data-shape evidence only**, not UI extracts.

## Already here
- `DATA_SHAPES_frank_api.md` — curated extract of the exact tables/columns MissionControl reads, lifted from FRANK_API `models.py` + the Triangulation Doc. This is the evidence behind `DATA_CONTRACT.md`.

## What Claudy uses it for
Read **on demand** (not at boot) when a data shape in `DATA_CONTRACT.md` is ambiguous and needs grounding in Frank's real schema. The DATA_CONTRACT is authoritative; this is the evidence trail.

## Optional adds
If deeper questions arise, drop the full `FRANK_API-02-ARCHITECTURE-MAP.md` and `TRIANGULATION_DOC.md` here. Not required for the build — the curated extract covers the 9 screens.
