import Link from "next/link";
import { Pill, healthTone } from "@/components/mission-control/StatusPill";
import type { StoreSummary, StoreHealth } from "@/types/mission-control";

// Shared store card — Stores directory + Owner detail both render it (design-once).
const healthLabel = (h: StoreHealth) =>
  h === "past_due" ? "Past due" : h === "suspended" ? "Suspended" : "Active";

export function StoreCard({ store }: { store: StoreSummary }) {
  return (
    <Link
      href={`/stores/${store.storeId}`}
      className="flex flex-col gap-3 border border-border bg-card p-4 transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{store.name}</p>
          <p className="truncate text-sm text-muted-foreground">{store.ownerName}</p>
        </div>
        <Pill tone={healthTone(store.health)}>{healthLabel(store.health)}</Pill>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm tabular-nums">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">NCPDP</dt>
          <dd className="text-foreground">{store.ncpdp}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Members</dt>
          <dd className="text-foreground">{store.memberCount}</dd>
        </div>
      </dl>
    </Link>
  );
}
