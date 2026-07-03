"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// KIP-1 · DataTable. Read-only tabular data with consistent header/row treatment;
// token-driven; tabular-nums; sticky header. Responsive: collapses to stacked
// blocks at <md — header hidden, the `primary` cell surfaces first (UI_SPEC §3).
// First homes: Audit log + Onboarding queue.
export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  className?: string;
  primary?: boolean; // surfaced first on the mobile stacked block
  cell: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  className?: string;
}

const alignClass = (align?: "left" | "right" | "center") =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  empty,
  className,
}: DataTableProps<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary);

  return (
    <div className={className}>
      {/* Desktop / tablet ≥ md */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              {columns.map((c) => (
                <TableHead
                  key={c.key}
                  className={cn("text-[11px] uppercase tracking-wide", alignClass(c.align), c.className)}
                >
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="tabular-nums">
            {rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn(alignClass(c.align), c.className)}>
                    {c.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile < md — stacked blocks; header hidden, primary cell first */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li
            key={getRowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              "border border-border bg-card p-4",
              onRowClick && "cursor-pointer",
            )}
          >
            <div className="mb-2 text-sm font-semibold text-foreground">{primary.cell(row)}</div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm tabular-nums">
              {rest.map((c) => (
                <React.Fragment key={c.key}>
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {c.header}
                  </dt>
                  <dd className="text-right text-foreground">{c.cell(row)}</dd>
                </React.Fragment>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
