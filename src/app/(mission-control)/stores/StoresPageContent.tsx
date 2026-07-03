"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/mission-control/EmptyState";
import { StoreCard } from "@/components/mission-control/StoreCard";
import { storeDirectoryService } from "@/services/mission-control";
import type { StoreSummary } from "@/types/mission-control";

export function StoresPageContent() {
  const [stores, setStores] = useState<StoreSummary[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    storeDirectoryService.listStores().then(setStores);
  }, []);

  const loading = stores === null;
  const term = q.trim().toLowerCase();
  // Search by name or NCPDP (UI_SPEC §7.7).
  const filtered = (stores ?? []).filter(
    (s) => !term || s.name.toLowerCase().includes(term) || s.ncpdp.toLowerCase().includes(term),
  );

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stores</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "…" : `${stores!.length} across the platform`}
          </p>
        </div>
        <Input
          type="search"
          placeholder="Search name or NCPDP"
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
          icon={Store}
          title={term ? "No stores match your search" : "No stores yet"}
          description={term ? "Try a different name or NCPDP." : undefined}
          action={term ? { label: "Clear search", onClick: () => setQ("") } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <StoreCard key={s.storeId} store={s} />
          ))}
        </div>
      )}
    </section>
  );
}
