"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill, healthTone } from "@/components/mission-control/StatusPill";
import { missionDashboardService } from "@/services/mission-control";
import type { PlatformStats, GrowthPoint, OwnerSummary, StoreHealth } from "@/types/mission-control";

const healthLabel = (h: StoreHealth) =>
  h === "past_due" ? "Past due" : h === "suspended" ? "Suspended" : "Active";

// HIPAA-safe pulse only: COUNT/GROUP-BY. No claims/PHI, no "$ recovered".
export function DashboardPageContent() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [growth, setGrowth] = useState<GrowthPoint[] | null>(null);
  const [preview, setPreview] = useState<OwnerSummary[] | null>(null);

  useEffect(() => {
    missionDashboardService.getPlatformStats().then(setStats);
    missionDashboardService.getGrowth(6).then(setGrowth);
    missionDashboardService.getOwnersPreview(5).then(setPreview);
  }, []);

  const tiles = stats
    ? [
        { label: "Pharmacies", value: stats.totalPharmacies },
        { label: "Active subs", value: stats.activeSubs },
        { label: "Pending", value: stats.pendingInvites },
        { label: "Suspended", value: stats.suspendedAccounts },
      ]
    : null;

  const maxGrowth = growth && growth.length ? Math.max(...growth.map((g) => g.count)) : 1;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform pulse — PHI-free.</p>
      </header>

      {/* KPI tiles: 4 → 2 on mobile */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles
          ? tiles.map((t) => (
              <div key={t.label} className="border border-border bg-card p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t.label}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{t.value}</p>
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>

      {/* New-pharmacies bar chart (CSS bars — recharts not installed; token-driven) */}
      <div className="border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          New pharmacies
        </h2>
        {!growth ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="flex h-40 gap-3">
            {growth.map((g) => (
              <div key={g.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full bg-info/80"
                    style={{ height: `${Math.max(6, (g.count / maxGrowth) * 100)}%` }}
                    aria-label={`${g.label}: ${g.count}`}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{g.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Owners preview — needs-attention shortcut, NOT the full directory */}
      <div className="border border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Owners — needs attention
          </h2>
          <Link href="/owners" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {!preview ? (
          <div className="space-y-2 p-4 pt-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {preview.map((o) => (
              <li key={o.ownerId}>
                <Link
                  href={`/owners/${o.ownerId}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{o.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {o.storeCount} stores
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={healthTone(o.health)}>{healthLabel(o.health)}</Pill>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
