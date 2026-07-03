"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/mission-control/EmptyState";
import {
  Pill,
  registrationTone,
  registrationLabel,
  typeTone,
} from "@/components/mission-control/StatusPill";
import { DataTable, type DataTableColumn } from "@/components/mission-control/DataTable";
import { pendingRegistrationService } from "@/services/mission-control";
import type {
  PendingRegistrationSummary,
  RegistrationStatus,
  RegistrationType,
} from "@/types/mission-control";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: RegistrationStatus; label: string }[] = [
  { value: "pending_verification", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

const TYPE_TABS: { value: "all" | RegistrationType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "converter", label: "Converter" },
];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString();

export function OnboardingQueuePageContent() {
  const router = useRouter();
  const [status, setStatus] = useState<RegistrationStatus>("pending_verification");
  const [type, setType] = useState<"all" | RegistrationType>("all");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<PendingRegistrationSummary[] | null>(null);

  useEffect(() => {
    setRows(null);
    pendingRegistrationService
      .listPending({
        status,
        type: type === "all" ? undefined : type,
        search: q.trim() || undefined,
      })
      .then(setRows);
  }, [status, type, q]);

  const columns: DataTableColumn<PendingRegistrationSummary>[] = [
    { key: "pharmacy", header: "Pharmacy", primary: true, cell: (r) => <span className="font-medium">{r.pharmacyName}</span> },
    { key: "ncpdp", header: "NCPDP", cell: (r) => r.ncpdp },
    { key: "npi", header: "NPI", cell: (r) => r.npi },
    { key: "contact", header: "Contact", cell: (r) => r.contactPerson },
    { key: "submitted", header: "Submitted", cell: (r) => <span className="text-muted-foreground">{fmtDate(r.submittedAt)}</span> },
    { key: "type", header: "Type", cell: (r) => <Pill tone={typeTone(r.type)}>{r.type}</Pill> },
    { key: "status", header: "Status", align: "right", cell: (r) => <Pill tone={registrationTone(r.status)}>{registrationLabel(r.status)}</Pill> },
  ];

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboarding</h1>
          <p className="text-sm text-muted-foreground">Pending pharmacy registrations awaiting review.</p>
        </div>
        <Input
          type="search"
          placeholder="Search name / NCPDP / NPI"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-72"
        />
      </header>

      <div className="flex flex-wrap items-center gap-4">
        {/* status segments (default Pending) */}
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setStatus(t.value)}
              className={cn(
                "border-b-2 px-3 py-1.5 text-sm transition-colors",
                status === t.value
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* type filter */}
        <div className="flex gap-1">
          {TYPE_TABS.map((t) => (
            <Button
              key={t.value}
              variant={type === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => setType(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {rows === null ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.registrationId}
          onRowClick={(r) => router.push(`/onboarding/${r.registrationId}`)}
          empty={
            <EmptyState
              icon={ClipboardCheck}
              title="Nothing here"
              description="No registrations match these filters."
            />
          }
        />
      )}
    </section>
  );
}
