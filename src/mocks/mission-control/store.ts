// MissionControl — Mock data store (SEEDED · DATA_CONTRACT §5)
//
// The in-memory mock the service layer reads/mutates. Every renderable state
// exists here; dashboard stats are DERIVED from the seed below (not hand-typed)
// so the numbers provably add up. PHI-free by construction: pharmacy/store/owner/
// member flavor only — no claims, no "$ recovered", no patient data anywhere.
//
// Sole later swap point: real Supabase wiring replaces the service bodies; this
// file is deleted in one commit.

import type {
  BusinessStatus,
  SubscriptionStatus,
  StoreHealth,
  OwnerSummary,
  OwnerDetail,
  StoreSummary,
  StoreDetail,
  Member,
  PendingRegistrationSummary,
  PendingRegistrationDetail,
  AuditEntry,
  PlatformStats,
  GrowthPoint,
} from '@/types/mission-control';

// The acting operator label written into audit rows. Phase 2 threads the real
// session displayName (from getSuperAdminUser); the mock uses a constant.
export const MOCK_ACTOR_NAME = 'MissionControl Operator';

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE SEED (business-shaped) — everything else is projected/derived from this.
// ─────────────────────────────────────────────────────────────────────────────

interface OwnerMeta {
  ownerId: string;
  name: string;
  email: string;
  lastActivityAt?: string;
}

interface SeedStore {
  storeId: string;
  name: string;
  ownerId: string; // owner OF RECORD (denormalized on the business)
  ncpdp: string;
  npi: string;
  state: string;
  businessStatus: BusinessStatus;
  subscriptionStatus: SubscriptionStatus;
  roster: Member[]; // people attached to this store (admins + users)
}

// Owners of record (the "admin user" projection targets). Grace is the locked-out
// case — owner of record for sto-ivy but currently holds NO active admin row.
const owners: OwnerMeta[] = [
  { ownerId: 'own-marcus', name: 'Marcus Webb', email: 'marcus.webb@cedarrx.example', lastActivityAt: '2026-06-30T14:12:00Z' },
  { ownerId: 'own-rosa', name: 'Rosa Delgado', email: 'rosa@pineridgerx.example', lastActivityAt: '2026-06-28T09:40:00Z' },
  { ownerId: 'own-omar', name: 'Omar Haddad', email: 'omar.haddad@aspenpharm.example', lastActivityAt: '2026-06-21T17:05:00Z' },
  { ownerId: 'own-tina', name: 'Tina Cho', email: 'tina.cho@lotusrx.example', lastActivityAt: '2026-07-01T08:15:00Z' },
  { ownerId: 'own-lena', name: 'Lena Park', email: 'lena.park@fernvalley.example', lastActivityAt: '2026-06-25T11:30:00Z' },
  { ownerId: 'own-grace', name: 'Grace Kim', email: 'grace.kim@ivylanerx.example', lastActivityAt: '2026-05-19T13:00:00Z' },
];

const ownerById: Record<string, OwnerMeta> = Object.fromEntries(
  owners.map((o) => [o.ownerId, o]),
);

// Roster row helpers (keep the seed readable).
const admin = (userId: string, name: string, email: string, jobTitle?: string): Member => ({
  userId, name, email, role: 'admin', jobTitle, accountStatus: 'active', lastLoginAt: '2026-06-30T12:00:00Z',
});
const active = (userId: string, name: string, email: string, jobTitle?: string): Member => ({
  userId, name, email, role: 'user', jobTitle, accountStatus: 'active', lastLoginAt: '2026-06-29T10:00:00Z',
});
const suspended = (userId: string, name: string, email: string, jobTitle?: string): Member => ({
  userId, name, email, role: 'user', jobTitle, accountStatus: 'suspended', lastLoginAt: '2026-05-02T10:00:00Z',
});
const invited = (userId: string, name: string, email: string): Member => ({
  userId, name, email, role: 'user', accountStatus: 'invite_pending', inviteStatus: 'pending',
});

const seedStores: SeedStore[] = [
  // Marcus — multi-store owner (5 stores; all healthy).
  {
    storeId: 'sto-cedar', name: 'Cedar Pharmacy', ownerId: 'own-marcus',
    ncpdp: '1470324', npi: '1063511111', state: 'OH',
    businessStatus: 'active', subscriptionStatus: 'active',
    roster: [
      admin('own-marcus', 'Marcus Webb', 'marcus.webb@cedarrx.example', 'Pharmacist'),
      active('usr-anita', 'Anita Flores', 'anita.flores@cedarrx.example', 'Pharmacist'),
      suspended('usr-ben', 'Ben Cole', 'ben.cole@cedarrx.example', 'Technician'),
      invited('usr-carol', 'Carol Behn', 'carol.behn@cedarrx.example'),
    ],
  },
  {
    storeId: 'sto-birch', name: 'Birch Drugs', ownerId: 'own-marcus',
    ncpdp: '1470325', npi: '1063512222', state: 'OH',
    businessStatus: 'active', subscriptionStatus: 'active',
    roster: [admin('own-marcus', 'Marcus Webb', 'marcus.webb@cedarrx.example'), active('usr-dan', 'Dan Rivera', 'dan.rivera@birchdrugs.example')],
  },
  {
    storeId: 'sto-elm', name: 'Elm Street Rx', ownerId: 'own-marcus',
    ncpdp: '1470326', npi: '1063513333', state: 'IN',
    businessStatus: 'active', subscriptionStatus: 'trialing',
    roster: [admin('own-marcus', 'Marcus Webb', 'marcus.webb@cedarrx.example'), active('usr-ellen', 'Ellen Yu', 'ellen.yu@elmrx.example')],
  },
  {
    storeId: 'sto-maple', name: 'Maple Care Pharmacy', ownerId: 'own-marcus',
    ncpdp: '1470327', npi: '1063514444', state: 'IN',
    businessStatus: 'active', subscriptionStatus: 'active',
    roster: [admin('own-marcus', 'Marcus Webb', 'marcus.webb@cedarrx.example')],
  },
  {
    storeId: 'sto-oak', name: 'Oakwood Pharmacy', ownerId: 'own-marcus',
    ncpdp: '1470328', npi: '1063515555', state: 'MI',
    businessStatus: 'active', subscriptionStatus: 'canceled',
    roster: [admin('own-marcus', 'Marcus Webb', 'marcus.webb@cedarrx.example')],
  },

  // Rosa — 2 stores, one past_due → owner health past_due.
  {
    storeId: 'sto-pine', name: 'Pine Ridge Pharmacy', ownerId: 'own-rosa',
    ncpdp: '2581470', npi: '1063516666', state: 'TX',
    businessStatus: 'active', subscriptionStatus: 'active',
    roster: [admin('own-rosa', 'Rosa Delgado', 'rosa@pineridgerx.example', 'Pharmacist'), active('usr-fred', 'Fred Nash', 'fred.nash@pineridgerx.example')],
  },
  {
    storeId: 'sto-willow', name: 'Willow Bend Rx', ownerId: 'own-rosa',
    ncpdp: '2581471', npi: '1063517777', state: 'TX',
    businessStatus: 'active', subscriptionStatus: 'past_due',
    roster: [admin('own-rosa', 'Rosa Delgado', 'rosa@pineridgerx.example'), active('usr-gina', 'Gina Alvarez', 'gina.alvarez@willowbend.example')],
  },

  // Omar — 2 stores, one suspended → owner health suspended.
  {
    storeId: 'sto-aspen', name: 'Aspen Pharmacy', ownerId: 'own-omar',
    ncpdp: '3692581', npi: '1063518888', state: 'CO',
    businessStatus: 'active', subscriptionStatus: 'active',
    roster: [admin('own-omar', 'Omar Haddad', 'omar.haddad@aspenpharm.example', 'Pharmacist'), active('usr-hank', 'Hank Boyd', 'hank.boyd@aspenpharm.example')],
  },
  {
    storeId: 'sto-spruce', name: 'Spruce Health Mart', ownerId: 'own-omar',
    ncpdp: '3692582', npi: '1063519999', state: 'CO',
    businessStatus: 'suspended', subscriptionStatus: 'active',
    roster: [admin('own-omar', 'Omar Haddad', 'omar.haddad@aspenpharm.example'), suspended('usr-nadia', 'Nadia Okafor', 'nadia.okafor@sprucehm.example', 'Technician')],
  },

  // Tina — single store, healthy.
  {
    storeId: 'sto-lotus', name: 'Lotus Community Pharmacy', ownerId: 'own-tina',
    ncpdp: '4703692', npi: '1063510001', state: 'CA',
    businessStatus: 'active', subscriptionStatus: 'active',
    roster: [admin('own-tina', 'Tina Cho', 'tina.cho@lotusrx.example', 'Pharmacist'), active('usr-jane', 'Jane Ito', 'jane.ito@lotusrx.example')],
  },

  // Lena — single store, unpaid → past_due health (covers the 'unpaid' branch).
  {
    storeId: 'sto-fern', name: 'Fern Valley Pharmacy', ownerId: 'own-lena',
    ncpdp: '5814703', npi: '1063510002', state: 'WA',
    businessStatus: 'active', subscriptionStatus: 'unpaid',
    roster: [admin('own-lena', 'Lena Park', 'lena.park@fernvalley.example', 'Pharmacist'), invited('usr-karl', 'Karl Mensah', 'karl.mensah@fernvalley.example')],
  },

  // Grace — owner of record for sto-ivy but LOCKED OUT (no active admin row).
  // She sits on the roster as a plain 'user' → restore-admin has a real target.
  {
    storeId: 'sto-ivy', name: 'Ivy Lane Pharmacy', ownerId: 'own-grace',
    ncpdp: '6925814', npi: '1063510003', state: 'AZ',
    businessStatus: 'active', subscriptionStatus: 'active',
    roster: [active('own-grace', 'Grace Kim', 'grace.kim@ivylanerx.example', 'Owner (locked out)'), active('usr-liam', 'Liam Novak', 'liam.novak@ivylanerx.example')],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DERIVATION (service-side computation; the UI never re-derives).
// ─────────────────────────────────────────────────────────────────────────────

const PAST_DUE_SUBS: SubscriptionStatus[] = ['past_due', 'unpaid', 'incomplete'];

function deriveHealth(s: SeedStore): StoreHealth {
  if (s.businessStatus === 'suspended') return 'suspended';
  if (PAST_DUE_SUBS.includes(s.subscriptionStatus)) return 'past_due';
  return 'active';
}

function worstHealth(healths: StoreHealth[]): StoreHealth {
  if (healths.includes('suspended')) return 'suspended';
  if (healths.includes('past_due')) return 'past_due';
  return 'active';
}

const storeSummaries: StoreSummary[] = seedStores.map((s) => ({
  storeId: s.storeId,
  name: s.name,
  ownerId: s.ownerId,
  ownerName: ownerById[s.ownerId].name,
  ncpdp: s.ncpdp,
  npi: s.npi,
  state: s.state,
  memberCount: s.roster.length,
  health: deriveHealth(s),
}));

const storeDetailsById: Record<string, StoreDetail> = Object.fromEntries(
  seedStores.map((s) => [
    s.storeId,
    {
      storeId: s.storeId,
      name: s.name,
      ownerId: s.ownerId,
      ownerName: ownerById[s.ownerId].name,
      ownerEmail: ownerById[s.ownerId].email,
      ncpdp: s.ncpdp,
      npi: s.npi,
      state: s.state,
      subscriptionStatus: s.subscriptionStatus,
      members: s.roster,
    } satisfies StoreDetail,
  ]),
);

const membersByStoreId: Record<string, Member[]> = Object.fromEntries(
  seedStores.map((s) => [s.storeId, s.roster]),
);

// Owner projection: storeCount = businesses owned OF RECORD; health = worst-of.
const ownerSummaries: OwnerSummary[] = owners.map((o) => {
  const theirStores = storeSummaries.filter((s) => s.ownerId === o.ownerId);
  return {
    ownerId: o.ownerId,
    name: o.name,
    email: o.email,
    storeCount: theirStores.length,
    memberCount: theirStores.reduce((n, s) => n + s.memberCount, 0),
    health: worstHealth(theirStores.map((s) => s.health)),
    lastActivityAt: o.lastActivityAt,
  };
});

const ownerDetailsById: Record<string, OwnerDetail> = Object.fromEntries(
  ownerSummaries.map((o) => [
    o.ownerId,
    {
      ownerId: o.ownerId,
      name: o.name,
      email: o.email,
      health: o.health,
      stores: storeSummaries.filter((s) => s.ownerId === o.ownerId),
    } satisfies OwnerDetail,
  ]),
);

// Dashboard stats — DERIVED from the seed so every number is backed by data.
const allRosterRows: Member[] = seedStores.flatMap((s) => s.roster);
const distinct = (rows: Member[]) => new Set(rows.map((m) => m.userId)).size;

const platformStats: PlatformStats = {
  totalPharmacies: seedStores.length,
  totalOwners: owners.length,
  totalMembers: distinct(allRosterRows.filter((m) => m.role === 'user')),
  activeSubs: seedStores.filter((s) => s.subscriptionStatus === 'active' || s.subscriptionStatus === 'trialing').length,
  pastDueSubs: seedStores.filter((s) => PAST_DUE_SUBS.includes(s.subscriptionStatus)).length,
  canceledSubs: seedStores.filter((s) => s.subscriptionStatus === 'canceled').length,
  pendingInvites: distinct(allRosterRows.filter((m) => m.accountStatus === 'invite_pending')),
  suspendedAccounts: distinct(allRosterRows.filter((m) => m.accountStatus === 'suspended')),
};

// New pharmacies over 6 months. Sum equals totalPharmacies (no decorative total).
const growth: GrowthPoint[] = [
  { label: 'Jan', count: 1 },
  { label: 'Feb', count: 1 },
  { label: 'Mar', count: 2 },
  { label: 'Apr', count: 2 },
  { label: 'May', count: 3 },
  { label: 'Jun', count: 3 },
]; // Σ = 12 = totalPharmacies

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING — pending registrations (both types × all statuses).
// ─────────────────────────────────────────────────────────────────────────────

const registrationSummaries: PendingRegistrationSummary[] = [
  { registrationId: 'reg-101', pharmacyName: 'Summit Pharmacy', ncpdp: '7036925', npi: '1770000001', contactPerson: 'Dev Anand', submittedAt: '2026-06-30T15:00:00Z', type: 'new', status: 'pending_verification' },
  { registrationId: 'reg-102', pharmacyName: 'Harborview Drugs', ncpdp: '7036926', npi: '1770000002', contactPerson: 'Priya Nair', submittedAt: '2026-06-29T12:30:00Z', type: 'new', status: 'pending_verification' },
  { registrationId: 'reg-103', pharmacyName: 'Lakeside Rx', ncpdp: '7036927', npi: '1770000003', contactPerson: 'Sam Ortiz', submittedAt: '2026-06-28T09:00:00Z', type: 'converter', status: 'pending_verification' },
  { registrationId: 'reg-104', pharmacyName: 'Grandview Pharmacy', ncpdp: '7036928', npi: '1770000004', contactPerson: 'Mona Reyes', submittedAt: '2026-06-20T10:00:00Z', type: 'new', status: 'approved' },
  { registrationId: 'reg-105', pharmacyName: 'Meadowbrook Pharmacy', ncpdp: '7036929', npi: '1770000005', contactPerson: 'Ike Bello', submittedAt: '2026-06-18T14:20:00Z', type: 'converter', status: 'rejected' },
  { registrationId: 'reg-106', pharmacyName: 'Riverside Pharmacy', ncpdp: '7036930', npi: '1770000006', contactPerson: 'Lars Vogt', submittedAt: '2026-05-15T11:00:00Z', type: 'new', status: 'expired' },
  { registrationId: 'reg-107', pharmacyName: 'Cliffside Rx', ncpdp: '7036931', npi: '1770000007', contactPerson: 'Ada Cole', submittedAt: '2026-05-10T08:45:00Z', type: 'converter', status: 'completed' },
];

const registrationDetailsById: Record<string, PendingRegistrationDetail> = Object.fromEntries(
  registrationSummaries.map((r) => {
    const base: PendingRegistrationDetail = {
      registrationId: r.registrationId,
      pharmacyName: r.pharmacyName,
      ncpdp: r.ncpdp,
      npi: r.npi,
      pharmacyLicense: `PH-${r.ncpdp}`,
      pharmacistLicense: `RPH-${r.npi.slice(-5)}`,
      contactPerson: r.contactPerson,
      roleInPharmacy: 'Pharmacist in Charge',
      email: `${r.contactPerson.split(' ')[0].toLowerCase()}@${r.pharmacyName.toLowerCase().replace(/[^a-z]/g, '')}.example`,
      phone: '555-0100',
      mobile: '555-0111',
      fax: '555-0122',
      website: `https://${r.pharmacyName.toLowerCase().replace(/[^a-z]/g, '')}.example`,
      address: '100 Main St, Springfield, OH 45501',
      pharmacySoftware: 'PioneerRx',
      submittedAt: r.submittedAt,
      type: r.type,
      status: r.status,
    };
    // Converter rows carry desktop username + linked (migrated) business ref.
    if (r.type === 'converter') {
      base.desktopUsername = `${r.contactPerson.split(' ')[0].toLowerCase()}.desktop`;
      base.linkedBusiness = { businessId: 'sto-oak', name: 'Oakwood Pharmacy' };
    }
    return [r.registrationId, base];
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT — seeded history covering EVERY AuditAction (7). Live actions append more.
// ─────────────────────────────────────────────────────────────────────────────

const seedAudit: AuditEntry[] = [
  { id: 'aud-1', occurredAt: '2026-06-27T09:00:00Z', actorName: MOCK_ACTOR_NAME, action: 'suspended_member', target: 'Ben Cole', result: 'done' },
  { id: 'aud-2', occurredAt: '2026-06-26T16:30:00Z', actorName: MOCK_ACTOR_NAME, action: 'unsuspended_member', target: 'Dan Rivera', result: 'done' },
  { id: 'aud-3', occurredAt: '2026-06-25T10:15:00Z', actorName: MOCK_ACTOR_NAME, action: 'sent_recovery', target: 'Anita Flores', result: 'done' },
  { id: 'aud-4', occurredAt: '2026-06-24T13:45:00Z', actorName: MOCK_ACTOR_NAME, action: 'resent_invite', target: 'Carol Behn', result: 'done' },
  { id: 'aud-5', occurredAt: '2026-06-23T11:05:00Z', actorName: MOCK_ACTOR_NAME, action: 'restored_admin', target: 'Grace Kim @ Ivy Lane Pharmacy', result: 'done' },
  { id: 'aud-6', occurredAt: '2026-06-20T10:30:00Z', actorName: MOCK_ACTOR_NAME, action: 'approved_registration', target: 'Grandview Pharmacy', result: 'done' },
  { id: 'aud-7', occurredAt: '2026-06-18T14:25:00Z', actorName: MOCK_ACTOR_NAME, action: 'rejected_registration', target: 'Meadowbrook Pharmacy', result: 'done' },
];

// ─────────────────────────────────────────────────────────────────────────────
// The mutable store the services read/mutate. Shape unchanged from the seam.
// ─────────────────────────────────────────────────────────────────────────────

export const mockDb = {
  owners: ownerSummaries,
  ownerDetailsById,
  stores: storeSummaries,
  storeDetailsById,
  membersByStoreId,
  registrations: registrationSummaries,
  registrationDetailsById,
  audit: [...seedAudit],
  platformStats,
  growth,
};
