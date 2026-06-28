# _project/CLAUDE.md — MissionControl / Phase 1 / Project Spine

> **Project-specific direction.** Read AFTER the module-root `CLAUDE.md`, BEFORE the playbook.

---

## Project Identity

- **Project:** MissionControl (Super Admin Portal) — a standalone, private operations console above the Cyber Pharma platform.
- **Phase:** 1 of 1 (this is a single-phase frontend-first build; backend wiring is post-FFM work).
- **Repos in scope:** the MissionControl starter-kit clone only. NOT the Cyber Pharma main repo.
- **Source:** Cyberize Next.js + Supabase starter kit (ships SSR auth, RBAC, RLS, working superadmin/admin user-CRUD).
- **Mission of this phase:** stand up the full MissionControl frontend against **mock domain data** behind a typed service layer, with **real** Supabase auth gating, so every screen, action, and state is demonstrable and the only later swap point is the service layer.

---

## Hero Outcome

> **A Cyberize operator logs into a private, PHI-free console, navigates Owners → Stores → Members and the Onboarding queue, and performs every safe support action — suspend, recover, resend, restore-admin, approve/reject — each confirmed, audited, and reversible, with no way in the UI to create an account, hold a credential, touch money, or see PHI.**

---

## Forbidden Zones (Hard Stops — Phase 1)

**Identity & credentials**
- No member/user creation. No invite-to-a-new-address. No password set/read. No email entry or edit (anywhere, incl. onboarding). No grant-super-admin.

**Money**
- No billing/subscription control. No checkout/payment surface (incl. the onboarding approval). Sub status is a read-only pill only.

**Data**
- No PHI / claims / OwedBook operational data / "$ recovered". No delete-human (suspend or soft-reject only). No member-profile edits beyond the fenced store-scoped restore-admin.

**Power**
- No impersonation / "log in as". No force-sync. No suspend-whole-pharmacy.

**Build discipline**
- Auth is REAL — do not mock it. Domain is MOCKED — do not wire real Supabase domain CRUD. No API routes, Supabase migrations, or SQL beyond kit defaults. Do not re-author kit-provided auth / RBAC / RLS / user-CRUD — extend it.

> **The one-line test for any new control:** *Does it act on a record that already exists, without holding a credential, touching money, or showing PHI?* If no — it's forbidden. If you find yourself reframing a request to make it fit — STOP and surface.

---

## Tech Stack (Phase 1)

| Layer | Tech | Note |
|---|---|---|
| Framework | Next.js (App Router) | kit-provided |
| Auth (REAL) | Supabase SSR; `is_super_admin` server gate | NOT mocked |
| AuthZ | RBAC + RLS; roles in `user_roles` (never `user_metadata`) | kit-provided |
| Styling | Tailwind 3.4.1 + semantic tokens (Mist/Slate, Coral, Saira, flat) | inherit Cyber Pharma main tokens |
| Components | ShadCN primitives + DataTable/EmptyState KIPs | see COMPONENT_MANIFEST |
| State | Zustand | kit-provided |
| Build mode | frontend-first: service layer + mocks | sole swap point |

---

## The Three-Noun Model (the spine of the data)

- **Business (store)** — the real pharmacy. Carries a subscription. (`businesses`)
- **User** — one auth identity. Connects to stores via the junction. (Supabase `auth.users` + `user_roles`)
- **UserBusiness (junction)** — `(user_id, business_id, role)`, `role ∈ {'admin','user'}`. **There is no `'owner'` role** — an **Owner is a user holding `'admin'` on ≥1 store** (derived projection; no `owners` table). Super-admin is the orthogonal platform flag in `user_roles.is_super_admin`.

See `DATA_CONTRACT.md` §0 for the full resolution.

---

## Access Decision (recorded)

**Heather (Frank's employee) is a super admin for v1** — Coach-approved 2026-06-20, provisional. Revisit only if Frank narrows it. The onboarding surface is built self-contained so a scoped *onboarder role* can be fenced around it later without rework. For this build, treat the operator as super-admin.

---

## Greenfield Note

There is no source app. The `_design/` artifacts are the **canonical visual ground truth** — build to them, within the inherited token system. Where a design implies a RED-list capability, the design is wrong, not the gate: STOP and surface.

---

## Conflict Resolution (project-level)

APP_BRIEF hard gates + RED list win over everything. Then: DATA_CONTRACT (data shapes) → UI_SPEC (behavior) → this spine (scope) → root CLAUDE.md (structure). Two sources still disagree → STOP, surface to operator. Never silently resolve.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-20 | Initial project spine, authored last per FFM doctrine (informed by APP_BRIEF rev 0.4 + DATA_CONTRACT v1.0 + UI_SPEC v1.1). |
