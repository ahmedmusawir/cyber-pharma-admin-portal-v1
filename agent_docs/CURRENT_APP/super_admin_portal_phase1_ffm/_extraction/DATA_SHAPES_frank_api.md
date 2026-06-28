# DATA SHAPES — FRANK_API evidence (curated for MissionControl)

> Source: FRANK_API `models.py` (verbatim) + TRIANGULATION_DOC rebuild resolution.
> Scope: only the entities MissionControl reads. Evidence-labeled.

## EVIDENCE — `user_businesses` (the Owner/Member spine)
`models.py:306-351`. Junction table.
- `id` PK · `user_id` FK→users · `business_id` FK→businesses
- `role` String(50), default `'user'` — **values: `'admin'` or `'user'` only. No `'owner'`.**
- `is_primary` Boolean (one primary per user) · `joined_at`
- `UniqueConstraint(user_id, business_id)`

**Resolution:** Owner = a user with ≥1 row where `role='admin'`. Member = `role='user'`. Derived projection; no `owners` table.

## EVIDENCE — `users` / roles
`models.py:185-303`. In the rebuild, identity = Supabase `auth.users`; role flag moves to a server-controlled `user_roles` table.
- `is_super_admin` Boolean — platform flag; MUST have `business_id IS NULL`.
- `email` UNIQUE indexed · `username` UNIQUE (kept for desktop import).

## EVIDENCE — `businesses` (store)
`models.py:13-183`. Composite UK `(ncpdp, npi)`.
- `pharmacy_name`, `ncpdp`, `npi`, `state`, address fields, `npi`
- `status` — `'pending' | 'active' | 'suspended'`
- `subscription_status` — `active|trialing|past_due|canceled|unpaid|incomplete`
- Stripe fields embedded (`stripe_customer_id`, `current_period_end`, …)

## EVIDENCE — `pending_registrations` (onboarding)
`models.py:354-493`. Self-submitted via `register-pending`.
- identity: `ncpdp,npi,email (NOT NULL),pharmacy_name,phone,address*,city,state,zip,fax,contact_person*,pharmacy_license_number,pharmacist_license,country,pharmacy_software_system,role_in_pharmacy,mobile_number,website_url`
- converter: `activation_key`, `desktop_username`, **`is_desktop_converter`**, `business_id` (linked existing store)
- `status` default `'pending_verification'` — `pending_verification|approved|rejected|expired|completed`
- review: `verified_by_user_id`, `verified_at`, `verification_notes`
- invite: `activation_token` (7-day TTL), `activation_link_sent_at`
- **GAP:** the approve→email send is a TODO in Frank's code (`auth.py:990`) — Phase-2 net-new.

## EVIDENCE — audit
Append-only: `user_id, table_name, record_id, action, old_value, new_value, ip_address, created_at`.

## CLAIM — derived view-models
MissionControl never returns raw rows; it returns screen-shaped projections (see `DATA_CONTRACT.md` §3). The mapping from these tables to those projections is the contract.
