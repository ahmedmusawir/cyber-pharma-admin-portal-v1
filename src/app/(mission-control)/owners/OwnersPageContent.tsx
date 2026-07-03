"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/mission-control/EmptyState";
import { Pill, healthTone } from "@/components/mission-control/StatusPill";
import { ownerDirectoryService } from "@/services/mission-control";
import type { OwnerSummary, StoreHealth } from "@/types/mission-control";

const healthLabel = (h: StoreHealth) =>
  h === "past_due" ? "Past due" : h === "suspended" ? "Suspended" : "Active";

function OwnerCard({ owner }: { owner: OwnerSummary }) {
  return (
    <Link
      href={`/owners/${owner.ownerId}`}
      className="flex flex-col gap-3 border border-border bg-card p-4 transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{owner.name}</p>
          <p className="truncate text-sm text-muted-foreground">{owner.email}</p>
        </div>
        <Pill tone={healthTone(owner.health)}>{healthLabel(owner.health)}</Pill>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm tabular-nums">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Stores</dt>
          <dd className="text-foreground">{owner.storeCount}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Members</dt>
          <dd className="text-foreground">{owner.memberCount ?? "—"}</dd>
        </div>
      </dl>
    </Link>
  );
}

export function OwnersPageContent() {
  const [owners, setOwners] = useState<OwnerSummary[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    ownerDirectoryService.listOwners().then(setOwners);
  }, []);

  const loading = owners === null;
  const term = q.trim().toLowerCase();
  const filtered = (owners ?? []).filter(
    (o) => !term || o.name.toLowerCase().includes(term) || o.email.toLowerCase().includes(term),
  );

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Owners</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "…" : `${owners!.length} across the platform`}
          </p>
        </div>
        <Input
          type="search"
          placeholder="Search name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-64"
        />
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={term ? "No owners match your search" : "No owners yet"}
          description={term ? "Try a different name or email." : undefined}
          action={term ? { label: "Clear search", onClick: () => setQ("") } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OwnerCard key={o.ownerId} owner={o} />
          ))}
        </div>
      )}
    </section>
  );
}
