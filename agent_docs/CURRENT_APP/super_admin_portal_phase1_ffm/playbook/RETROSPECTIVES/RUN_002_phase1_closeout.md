# RUN 002 — MissionControl Phase 1 · CLOSE-OUT RETROSPECTIVE

> **FFM Sub-Phase 6, final artifact — this closes Phase 1.** 2026-07-10 18:52.
> Extends (does not replace) `RUN_002_missioncontrol_phase1_lessons.md` (2026-07-03), which
> closed the FFM *build*. Since then Phase 1 also absorbed FIX PHASE 1 (root rehome, mobile
> drawer, branding), the nav spinner, and FIX PHASE 2 (kit-surface recon + 100-path cleanup).
> This file consolidates the whole phase, with file references throughout. Honest, not a victory lap.

**Phase 1 final state:** 9 MC screens · 7 typed mock services · real Supabase super-admin gate ·
route table pure MC (`/` → `/dashboard`, `/login`, 8 authed screens, `api/auth/{login,logout,confirm}`) ·
tsc/build green · 2 suites / 8 tests (infra) · live walk 15/15 · operator visual pass ("pristine") ·
committed & pushed on `phase-1-cleanup`.

---

## 1. Phantom-primitive drift — the handbook described code that didn't exist

The kit handbook claimed `src/utils/app-role.ts`, `AppShellPage.tsx`, and `useAuthStore` derived
flags (`isAdmin/isSuperadmin/isMember`). **None existed on disk.** Recon's Day-0 sweep (verify every
handbook-named file; `cat` the store and compare shapes) caught all three before one FFM line was
authored against them — authoring against the flags would have shipped `undefined` reads, and a
value-import of `AppRole` into a client component would have bundled `next/headers` and broken
`next build`.

- Caught: `agent_docs/RECON/RECON_cyber-pharma_phase1_2026-06-28.md` (Day-0 section)
- Consequence honored throughout build: `agent_docs/RESPONSES/response_2026-07-01_145425_discovery.md`;
  detail in `RUN_002_missioncontrol_phase1_lessons.md` §3a
- Epilogue from FIX PHASE 2: `useAuthStore` itself turned out to be kit-curriculum-only — MC never
  consumed it, and it was deleted with the kill list
  (`response_2026-07-10_131658_fix2-recon.md` S-1; disk wins, twice).
- **Kit-handbook correction OWED (open):** strike or build the three claims; handbook v1.0 → v1.1.

## 2. `is_super_admin` — column-vs-role reconciliation (concept vs kit-real)

DATA_CONTRACT §2 described a `user_roles.is_super_admin` boolean. The kit's actual table has
`role` (enum superadmin/admin/member) — no such column. Operator ruling (2026-07-01):
**`is_super_admin` is the CONCEPT; `role === 'superadmin'` via `getUserRole()` is the
IMPLEMENTATION.** `SuperAdminUser.isSuperAdmin: true` is proof-carrying — the resolver
(`src/services/mission-control/session.ts`) returns the object only when the derived check passes,
else `null`. No code ever referenced the phantom column; verified live at every gate since.

- Ruling + implementation: `response_2026-07-02_105136_services.md`; lessons §3b; ruling comments
  live in `src/services/mission-control/session.ts` and `src/types/mission-control/entities.ts`.
- **Kit-handbook PROMOTION candidate:** state the canonical super-admin check
  (`getUserRole() === 'superadmin'`) explicitly, so no future FFM re-derives it or authors the
  phantom column.

## 3. Spec-text vs design-binary — the hamburger lesson (NEW named conflict class)

UI_SPEC §3 (text) specified a top-strip text nav for mobile. The delivered mobile PNGs
(`_design/MOBILE/`, staged 2026-06-28) showed a hamburger + left slide-over drawer with coral LEFT
item accents. The Shell (built 2026-07-03) followed the **spec text**; the PNGs were never
consulted; the conflict surfaced only in FIX PHASE 1 (2026-07-09) when the operator saw the phone
rendering. Ruling: PNG governs item look, doctrine slide-over; drawer rebuilt; UI_SPEC v1.2
correction ledgered.

- Plan/result: `response_2026-07-09_154353_fix-phase-1.md`, `response_2026-07-09_165454_fix-phase-1-result.md`
- **FFM PLAYBOOK CHANGE:** "spec-text vs design-binary" is a **named conflict class**. Discovery
  (playbook `01-DISCOVERY.md`) must DIFF the spec text against every delivered design binary
  (PNG/HTML tile) and surface disagreements as flags — a spec sentence and a picture are two claims
  about the same surface, and they drift independently. Text is not automatically senior.

## 4. jest-mock / jsdom version skew — clones born with a broken test suite

Fresh clone: 5 suites failed to initialize (`clearMocksOnScope is not a function`) —
`jest-environment-jsdom@30.3.0` bundled a stale `jest-mock@30.3.0` missing a method
`jest-runtime@30.4.2` calls. First fix attempt (`jest-mock@^30.4.2`) hit ETARGET — **that version
was never published**; re-diagnosed and pinned `jest-mock: 30.4.1` (override) +
`jest-environment-jsdom ^30.4.1` → 81/81. Meta-lesson: on ETARGET, re-diagnose against the
registry; don't assume "bump up."

- Plan/result: `response_2026-06-29_171742_jest-dep-hygiene-plan.md`,
  `response_2026-06-29_172435_jest-dep-hygiene-result.md`; pins visible in `package.json` overrides.
- **Kit PROMOTION (high value):** ship these pins in the starter kit `package.json` so every clone
  starts green. A broken baseline suite on clone is a silent tax on every run.

## 5. Cleanup lessons (FIX PHASE 2, 2026-07-10)

All references: recon `response_2026-07-10_131658_fix2-recon.md` · plan
`response_2026-07-10_135116_fix2-cleanup-plan.md` · result
`response_2026-07-10_182815_fix2-cleanup-result.md`.

- **S-8 — multi-line-import grep miss (anti-pattern):** the first import trace used
  `^import.*from` and missed every multi-line import (`} from "..."` on a later line) — falsely
  orphaning `ui/breadcrumb` and `ui/alert-dialog`, both MC-critical. Corrected pattern: match bare
  `from ["']...["']` anywhere. Had the kill list shipped from the first map, cleanup would have
  deleted load-bearing files and the tsc gate would have been the last line of defense.
  → stark-recon PLAYBOOK fix owed.
- **README non-code blind spot:** a `.ts/.tsx`-scoped trace cannot see non-code files. Step-2
  count came up 59 vs the expected 58 — `src/__tests__/superadmin/README.md`, invisible to the
  recon. Enumerate-then-delete caught it safely (whole-dir assumption covered it). Doctrine:
  **kill lists ship as file enumerations, and the executor re-enumerates before `rm`** — counts
  from arithmetic are hypotheses, counts from `find` are facts. (Proven thrice: 102 → 101 on
  recount, → 99 after rulings, → 100 on disk.)
- **Stale `.next/` cache trap:** first post-deletion tsc failed on *generated* route validators
  referencing deleted pages — zero `src/` errors. Clear the build cache, re-gate, then trust the
  fresh build's regenerated validators as the real gate. Expected mechanics, not a defect; budget
  for it in any route-deletion workflow.
- **The exact-count test gate:** "npm test = 2 suites / 8 tests EXACTLY" (predicted by the recon's
  test map §4) is a far stronger predicate than "tests pass" — it proves the deletion touched
  precisely the predicted coverage and nothing else. Post-cleanup baselines should always be
  predicted counts, not green/red.
- **Retarget-before-delete:** the recon found exactly ONE live seam from a KEEP surface into the
  kill list (`LoginPageContent.tsx:113` → `/auth`), and plan-mode research found a second
  (`api/auth/confirm` failure redirect → `/error`, flag F-1). Both were surgically retargeted
  as **Step 1, before any deletion** — so the tree was never in a state where a live page linked
  a 404. Doctrine: hunt inbound references from KEEP → DELETE first; surgery precedes demolition.
- **Infra-vs-curriculum KEEP doctrine (new):** kit surfaces divide into *curriculum* (demo
  portals, posts cascade, example forms — DELETE on zero consumers) and *blessed infra*
  (`utils/supabase/client.ts`, `admin.ts` — KEPT by ruling despite zero consumers, Phase-2-certain).
  A pure consumer-count rule cannot make this distinction; it's an operator ruling class. Corollary:
  zero-consumer KEEPs will look dead to every future recon — see §8-a.

## 6. Response Logging: pilot → global doctrine (CLAUDE.md v3.1)

Mirroring every plan/report/verification to `agent_docs/RESPONSES/` BEFORE printing graduated from
a session rule to CLAUDE.md v3.1 protocol. **What made it stick:** (1) crash resilience proved
real — plans survived CLI restarts across the phase; (2) the durable artifact was correctable in
place when I was wrong (the "Supabase unreachable" false alarm — fixed in the file, not lost in
scrollback); (3) the 20-artifact trail (`RESPONSES/` 2026-06-29 → 2026-07-10) became the recon's
and this retro's citation base — every decision has a timestamped file; (4) zero-clipboard operator
review in VS Code. The complementary split held: session file = status transitions; RESPONSES =
full artifacts. Both writes, every time.

## 7. KIT-SHED SKILL INPUTS

The future **kit-shed** skill (strip kit curriculum from a clone, keep blessed infra) assembles
from these artifacts:

| Artifact (filename) | Feeds skill component |
|---|---|
| `agent_docs/RECON/RECON_cyber-pharma_phase1_2026-06-28.md` | **manifest** — baseline kit inventory: what a fresh clone contains, named surfaces |
| `agent_docs/RESPONSES/response_2026-07-10_131658_fix2-recon.md` | **manifest** — DELETE/KEEP/COUPLED classification schema + the MC-style dependency-manifest format (§3); **workflow** — the consumer-trace method (full import-edge extraction incl. multi-line, per-surface reverse-deps, href/redirect map, test map §4, dep map §5) |
| `agent_docs/RESPONSES/response_2026-07-10_135116_fix2-cleanup-plan.md` | **workflow** — sequencing doctrine: baseline pin → surgery-before-delete → cascades-whole with per-step gates → exact-count predicates → live walk; the F-1 flag-and-rule pattern for seams found in plan-mode research |
| `agent_docs/RESPONSES/response_2026-07-10_182815_fix2-cleanup-result.md` | **examples** — a complete proven run (gates, 15/15 walk table, discrepancy handling); **anti-patterns** — stale `.next/` validators, self-matching pkill |
| `playbook/RETROSPECTIVES/RUN_002_phase1_closeout.md` (this file) | **anti-patterns** — S-8 grep miss, README blind spot, count-by-arithmetic; **doctrine** — infra-vs-curriculum ruling class, retarget-before-delete, enumerate-then-delete |
| `playbook/RETROSPECTIVES/RUN_002_missioncontrol_phase1_lessons.md` | **doctrine** — Day-0 doc-vs-disk sweep as the skill's precondition (a kit-shed against an unrecon'd clone repeats the phantom-primitive failure) |

## 8. What I flag that wasn't asked (seen from inside the run)

- **a) Zero-consumer KEEPs need a durable marker.** `client.ts` and `admin.ts` are kept by a
  ruling that lives in session logs — every future recon will re-flag them as orphans and someone
  will re-litigate. Propose: a one-line header comment convention
  (`// BLESSED INFRA — kept unconsumed by ruling 2026-07-10; Phase-2 consumer expected`) or a
  small `KEEP_MANIFEST.md`. The kit-shed skill should emit this marker as part of its output.
- **b) The curl live walk proves routes, not pixels.** W6/W7 200s verified the server; MC screens
  render client-side behind skeletons, so rendered correctness rode on the operator's visual pass
  (which is what actually said "pristine"). Phase 1's own lesson (§4 of the 07-03 retro: the blank
  chart passed three green gates) says never let the curl walk masquerade as the visual gate.
  kit-shed and future verifications should list them as two distinct gates.
- **c) Dead scripts cost operator time within hours.** The `test:e2e` fossil confused the operator
  the same evening the cleanup shipped. Dep-hygiene passes should prune **scripts and configs**,
  not just packages — a dead script is a UX bug in the repo.
- **d) MC has zero unit coverage — inherited, not introduced.** The kit's 81 tests covered kit
  surfaces; the FFM added none for MC screens (verification was live-gate based). Post-cleanup
  that truth is just visible (2 suites / 8 tests, infra-only). Owed: an MC test-buildout task
  before Phase 2 makes the service layer real — the swap needs a net.
- **e) The refresh-token log noise** (`AuthApiError: refresh_token_not_found` on stale cookies) is
  kit-inherited and benign, but every clone's operator will ask about it, as ours did. Kit
  promotion: swallow that specific error in the `getUser()` path (treat as signed-out, don't log).
- **f) The three-layer enforcement model worked as designed, repeatedly.** Recon caught the docs
  lying (layer: ground truth); gates caught the stale-cache and count discrepancies (layer:
  mechanical); the operator caught the false Supabase alarm and made the infra-vs-curriculum calls
  no rule could (layer: human). No layer was redundant this phase. Keep all three.

---

🥄 *Phase 1 closed. The kit gave auth for free; recon kept us from authoring against its lies —
then a second recon dismantled the kit's own scaffolding without breaking a pane of glass. The app
IS MissionControl now. Next: staging, client eyes, Phase 2.*
