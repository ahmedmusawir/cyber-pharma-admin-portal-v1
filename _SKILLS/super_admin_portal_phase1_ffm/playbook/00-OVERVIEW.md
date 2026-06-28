# 00 — OVERVIEW (Build Plan)

> The phase-by-phase plan for MissionControl Phase 1. Sub-phases are sequential; each ends at an operator approval gate. Adapted from `cyber_pharma_v1_phase1_ffm`.

## The run
| # | Sub-phase | File | Gate |
|---|---|---|---|
| 0 | Discovery | `01-DISCOVERY.md` | Discovery summary approved |
| 1 | Types | `02-TYPES.md` | Types compile, match DATA_CONTRACT |
| 2 | Services | `03-SERVICES.md` | 7 service interfaces stubbed |
| 3 | Mocks | `04-MOCKS.md` | Mock set covers all states |
| 4 | Components | `05-COMPONENTS.md` | 9 screens render; KIPs built |
| 5 | Verification | `06-VERIFICATION.md` | All hard gates green |
| 6 | Retrospective | `07-RETROSPECTIVE.md` | Lessons written honestly |

## Golden rules
- **Auth is real; domain is mocked.** The service layer is the only swap point.
- **Plan Mode at every boundary.** STOP and report; wait for "approved".
- **The RED list is law.** No forbidden control renders, even disabled.
- **Recon before build** (stark-recon) — verify the kit's actual state vs claims.
- Estimated effort: **1–2 sessions** (the kit gives auth + RBAC for free).
