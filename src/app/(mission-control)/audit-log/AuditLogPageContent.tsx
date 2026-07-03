"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/mission-control/EmptyState";
import { Pill } from "@/components/mission-control/StatusPill";
import { DataTable, type DataTableColumn } from "@/components/mission-control/DataTable";
import { auditLogService } from "@/services/mission-control";
import type { AuditEntry } from "@/types/mission-control";

const humanizeAction = (a: AuditEntry["action"]) =>
  a.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const fmtTime = (iso: string) => new Date(iso).toLocaleString();

const columns: DataTableColumn<AuditEntry>[] = [
  { key: "time", header: "Time", cell: (e) => <span className="text-muted-foreground">{fmtTime(e.occurredAt)}</span> },
  { key: "actor", header: "Actor", cell: (e) => e.actorName },
  { key: "action", header: "Action", cell: (e) => humanizeAction(e.action) },
  { key: "target", header: "Target", primary: true, cell: (e) => <span className="font-medium">{e.target}</span> },
  {
    key: "result",
    header: "Result",
    align: "right",
    cell: (e) => (
      <Pill tone={e.result === "done" ? "success" : "destructive"}>{e.result}</Pill>
    ),
  },
];

// Read-only, append-only ledger. DataTable KIP (first home).
export function AuditLogPageContent() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    auditLogService.listEntries().then(setEntries);
  }, []);

  const loading = entries === null;
  const term = q.trim().toLowerCase();
  const filtered = (entries ?? []).filter(
    (e) =>
      !term ||
      e.actorName.toLowerCase().includes(term) ||
      e.target.toLowerCase().includes(term) ||
      e.action.toLowerCase().includes(term),
  );

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit log</h1>
          <p className="text-sm text-muted-foreground">Read-only history of every action.</p>
        </div>
        <Input
          type="search"
          placeholder="Search actor, target, action"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:w-72"
        />
      </header>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(e) => e.id}
          empty={
            <EmptyState
              icon={ScrollText}
              title={term ? "No matching entries" : "No audit entries yet"}
              action={term ? { label: "Clear search", onClick: () => setQ("") } : undefined}
            />
          }
        />
      )}
    </section>
  );
}
