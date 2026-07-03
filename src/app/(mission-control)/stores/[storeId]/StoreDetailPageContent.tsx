"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/mission-control/EmptyState";
import { Pill, accountTone, accountLabel, subTone } from "@/components/mission-control/StatusPill";
import { useToast } from "@/components/ui/use-toast";
import { storeDirectoryService, supportActionService } from "@/services/mission-control";
import type { StoreDetail, Member, SubscriptionStatus, ActionResult } from "@/types/mission-control";

const subLabel = (s: SubscriptionStatus): string =>
  ({
    active: "Active",
    trialing: "Trialing",
    past_due: "Past due",
    canceled: "Canceled",
    unpaid: "Unpaid",
    incomplete: "Incomplete",
  })[s];

type ConfirmKind = "suspend" | "unsuspend" | "recovery";

export function StoreDetailPageContent({ storeId }: { storeId: string }) {
  const { toast } = useToast();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; member: Member } | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Member | null>(null);
  const [typedName, setTypedName] = useState("");

  const refetch = useCallback(() => {
    storeDirectoryService.getStore(storeId).then(setStore).catch(() => setNotFound(true));
  }, [storeId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function run(result: Promise<ActionResult>) {
    const r = await result;
    toast({
      title: r.message,
      variant: r.ok ? "default" : "destructive",
    });
    if (r.ok) refetch();
  }

  if (notFound) {
    return <EmptyState title="Store not found" description="This store may have been removed." />;
  }

  const confirmCopy = confirm
    ? {
        suspend: {
          title: `Suspend ${confirm.member.name}?`,
          desc: "They lose access to their store until reactivated.",
          action: "Suspend",
        },
        unsuspend: {
          title: `Reactivate ${confirm.member.name}?`,
          desc: "Access is restored immediately.",
          action: "Reactivate",
        },
        recovery: {
          title: "Send password recovery?",
          desc: `A recovery email will be sent to ${confirm.member.email}. No password is ever set or read here.`,
          action: "Send recovery",
        },
      }[confirm.kind]
    : null;

  return (
    <section className="space-y-5">
      {/* Always-visible context lock (safety rail against wrong-store actions) */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/stores">Stores</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {store ? (
              <BreadcrumbLink asChild>
                <Link href={`/owners/${store.ownerId}`}>{store.ownerName}</Link>
              </BreadcrumbLink>
            ) : (
              <span className="text-muted-foreground">…</span>
            )}
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{store?.name ?? "…"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Read-only store header */}
      {!store ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-foreground">{store.name}</h1>
            <Pill tone={subTone(store.subscriptionStatus)}>
              Sub · {subLabel(store.subscriptionStatus)}
            </Pill>
          </div>
          <Separator className="my-4" />
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Field label="Owner">
              <Link href={`/owners/${store.ownerId}`} className="text-foreground hover:text-primary">
                {store.ownerName}
              </Link>
            </Field>
            <Field label="NCPDP">{store.ncpdp}</Field>
            <Field label="NPI">{store.npi}</Field>
            <Field label="State">{store.state ?? "—"}</Field>
          </dl>
        </div>
      )}

      {/* Member roster */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Members
        </h2>
        {!store ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : store.members.length === 0 ? (
          <EmptyState title="No members on this store" />
        ) : (
          <ul className="flex flex-col gap-2">
            {store.members.map((m) => (
              <li
                key={m.userId}
                className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center bg-primary/15 text-xs font-bold text-primary">
                    {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {m.name}
                      <span className="ml-2 text-[11px] font-normal uppercase tracking-wide text-muted-foreground">
                        {m.role === "admin" ? "Admin" : "Member"}
                      </span>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={accountTone(m.accountStatus)}>{accountLabel(m.accountStatus)}</Pill>

                  {m.accountStatus === "active" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirm({ kind: "recovery", member: m })}
                      >
                        Send recovery
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setConfirm({ kind: "suspend", member: m })}
                      >
                        Suspend
                      </Button>
                    </>
                  )}
                  {m.accountStatus === "invite_pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => run(supportActionService.resendInvite(m.userId))}
                    >
                      Resend invite
                    </Button>
                  )}
                  {m.accountStatus === "suspended" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirm({ kind: "unsuspend", member: m })}
                    >
                      Un-suspend
                    </Button>
                  )}
                  {/* Fenced restore-admin — offered to members without admin role */}
                  {m.role === "user" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-warning text-warning"
                      onClick={() => {
                        setRestoreTarget(m);
                        setTypedName("");
                      }}
                    >
                      Restore admin
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm dialog (suspend / un-suspend / recovery) */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmCopy?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmCopy?.desc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirm) return;
                const { kind, member } = confirm;
                if (kind === "suspend") run(supportActionService.suspendUser(member.userId));
                else if (kind === "unsuspend") run(supportActionService.unsuspendUser(member.userId));
                else run(supportActionService.sendPasswordRecovery(member.userId));
              }}
            >
              {confirmCopy?.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fenced restore-admin — typed store-name confirm */}
      <Dialog open={!!restoreTarget} onOpenChange={(o) => !o && setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore admin access</DialogTitle>
            <DialogDescription>
              Grants <span className="font-medium text-foreground">{restoreTarget?.name}</span> the
              admin role for this one store. Type the store name{" "}
              <span className="font-medium text-foreground">{store?.name}</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-store">Store name</Label>
            <Input
              id="confirm-store"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={store?.name}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!store || typedName.trim() !== store.name}
              onClick={() => {
                if (!store || !restoreTarget) return;
                run(
                  supportActionService.restoreAdmin({
                    userId: restoreTarget.userId,
                    storeId: store.storeId,
                    typedStoreNameConfirm: typedName.trim(),
                  }),
                );
                setRestoreTarget(null);
              }}
            >
              Restore admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
