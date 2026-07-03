// MissionControl — Status Vocabularies (DATA_CONTRACT §1)
//
// Single source of truth for every pill/badge in the UI. Defined once, imported
// everywhere. String-literal unions (NOT TS enums) to match the contract 1:1.
//
// Derivation logic (StoreHealth precedence, pill→variant mapping) is NOT modeled
// here — types are shapes only. The service layer computes StoreHealth; the UI
// never re-derives it. See DATA_CONTRACT §1 for the rules.

// Member/user account state (NOT the same as UserBusiness.role).
export type AccountStatus = 'active' | 'suspended' | 'invite_pending';

// Per-business permission role (Frank: user_businesses.role). Only two values —
// there is NO 'owner' value. An Owner is a derived projection (a user holding
// 'admin' on ≥1 store), not a role. See DATA_CONTRACT §0.
export type MemberRole = 'admin' | 'user';

// Business lifecycle (Frank: businesses.status).
export type BusinessStatus = 'pending' | 'active' | 'suspended';

// Stripe subscription mirror (Frank: businesses.subscription_status). Read-only
// pulse in this app — never a control surface (RED list).
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete';

// Derived single pill for store cards (precedence: suspended > past_due > active).
export type StoreHealth = 'active' | 'past_due' | 'suspended';

// Onboarding (Frank: pending_registrations.status).
export type RegistrationStatus =
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'completed';

// Onboarding row type (Frank: pending_registrations.is_desktop_converter).
export type RegistrationType = 'new' | 'converter';
