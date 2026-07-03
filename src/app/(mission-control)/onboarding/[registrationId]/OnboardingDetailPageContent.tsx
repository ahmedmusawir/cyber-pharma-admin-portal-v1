"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { EmptyState } from "@/components/mission-control/EmptyState";
import {
  Pill,
  registrationTone,
  registrationLabel,
  typeTone,
} from "@/components/mission-control/StatusPill";
import { useToast } from "@/components/ui/use-toast";
import { pendingRegistrationService } from "@/services/mission-control";
import type { PendingRegistrationDetail } from "@/types/mission-control";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

// The only onboarding write surface. Identity block is 100% read-only; the ONLY
// inputs in the feature are the verification note and the reject reason. The
// activation email is DISPLAYED, never editable — this keeps the feature off the
// RED list (no email entry, no credential, no payment).
export function OnboardingDetailPageContent({ registrationId }: { registrationId: string }) {
  const { toast } = useToast();
  const [reg, setReg] = useState<PendingRegistrationDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const refetch = useCallback(() => {
    pendingRegistrationService.getPending(registrationId).then(setReg).catch(() => setNotFound(true));
  }, [registrationId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (notFound) {
    return <EmptyState title="Registration not found" />;
  }

  async function onApprove() {
    const r = await pendingRegistrationService.approve({ registrationId, verificationNote: note });
    toast({ title: r.message, variant: r.ok ? "default" : "destructive" });
    if (r.ok) {
      setNote("");
      refetch();
    }
  }

  async function onReject() {
    const r = await pendingRegistrationService.reject({ registrationId, reason });
    toast({ title: r.message, variant: r.ok ? "default" : "destructive" });
    if (r.ok) {
      setReason("");
      refetch();
    }
  }

  const isPending = reg?.status === "pending_verification";

  return (
    <section className="space-y-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/onboarding">Onboarding</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{reg?.pharmacyName ?? "…"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {!reg ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-card p-5">
            <h1 className="text-2xl font-bold text-foreground">{reg.pharmacyName}</h1>
            <div className="flex items-center gap-2">
              <Pill tone={typeTone(reg.type)}>{reg.type}</Pill>
              <Pill tone={registrationTone(reg.status)}>{registrationLabel(reg.status)}</Pill>
            </div>
          </div>

          {/* Read-only identity block (zero inputs by design) */}
          <div className="border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pharmacy identity
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Field label="NCPDP" value={reg.ncpdp} />
              <Field label="NPI" value={reg.npi} />
              <Field label="Pharmacy license" value={reg.pharmacyLicense} />
              <Field label="Pharmacist license" value={reg.pharmacistLicense} />
              <Field label="Contact" value={reg.contactPerson} />
              <Field label="Role" value={reg.roleInPharmacy} />
              <Field label="Phone" value={reg.phone} />
              <Field label="Mobile" value={reg.mobile} />
              <Field label="Fax" value={reg.fax} />
              <Field label="Website" value={reg.website} />
              <Field label="Software" value={reg.pharmacySoftware} />
              <Field label="Address" value={reg.address} />
              {reg.type === "converter" && (
                <>
                  <Field label="Desktop username" value={reg.desktopUsername} />
                  <Field label="Linked business" value={reg.linkedBusiness?.name} />
                </>
              )}
            </dl>
          </div>

          {/* Operator review — only on pending_verification */}
          {isPending ? (
            <div className="border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Operator review
              </h2>

              {/* Invite destination — DISPLAY ONLY, never editable */}
              <div className="mb-4 flex items-start gap-2 border border-border bg-muted/40 p-3 text-sm">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-foreground">
                    Activation invite is sent to{" "}
                    <span className="font-medium">{reg.email}</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    On-record address · not editable
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note">Verification note (required to approve)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What did you verify? (NCPDP, license, identity…)"
                />
              </div>

              <Separator className="my-4" />

              <div className="flex flex-wrap gap-2">
                <Button disabled={!note.trim()} onClick={() => setApproveOpen(true)}>
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive"
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </Button>
              </div>
            </div>
          ) : (
            <p className="border border-border bg-card p-4 text-sm text-muted-foreground">
              This registration is {registrationLabel(reg.status).toLowerCase()}; no actions are
              available.
            </p>
          )}
        </>
      )}

      {/* Approve confirm */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve {reg?.pharmacyName}?</AlertDialogTitle>
            <AlertDialogDescription>
              An activation invite will be sent to the on-record email. The pharmacy sets its own
              password in the main app — no credential is created here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onApprove}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject confirm — reason required */}
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject {reg?.pharmacyName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This is a soft rejection — the record is retained, never deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason (required)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this being rejected?"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onReject}
              className={!reason.trim() ? "pointer-events-none opacity-50" : undefined}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
