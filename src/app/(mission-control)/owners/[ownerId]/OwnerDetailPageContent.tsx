"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/mission-control/EmptyState";
import { StoreCard } from "@/components/mission-control/StoreCard";
import { Pill, healthTone } from "@/components/mission-control/StatusPill";
import { ownerDirectoryService } from "@/services/mission-control";
import type { OwnerDetail, StoreHealth } from "@/types/mission-control";

const healthLabel = (h: StoreHealth) =>
  h === "past_due" ? "Past due" : h === "suspended" ? "Suspended" : "Active";

export function OwnerDetailPageContent({ ownerId }: { ownerId: string }) {
  const [owner, setOwner] = useState<OwnerDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    ownerDirectoryService.getOwner(ownerId).then(setOwner).catch(() => setNotFound(true));
  }, [ownerId]);

  if (notFound) {
    return <EmptyState title="Owner not found" description="This owner may have been removed." />;
  }

  return (
    <section className="space-y-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/owners">Owners</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{owner?.name ?? "…"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {!owner ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <div className="flex items-start justify-between gap-3 border border-border bg-card p-5">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{owner.name}</h1>
            <p className="truncate text-sm text-muted-foreground">{owner.email}</p>
          </div>
          <Pill tone={healthTone(owner.health)}>{healthLabel(owner.health)}</Pill>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Stores
        </h2>
        {!owner ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : owner.stores.length === 0 ? (
          <EmptyState icon={Store} title="No stores for this owner" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {owner.stores.map((s) => (
              <StoreCard key={s.storeId} store={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
