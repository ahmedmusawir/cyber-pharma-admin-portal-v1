import { cn } from "@/lib/utils";
import type {
  StoreHealth,
  AccountStatus,
  SubscriptionStatus,
  RegistrationStatus,
  RegistrationType,
} from "@/types/mission-control";

// Semantic four (UI_SPEC §2): success=active/recovered/approved · warning=past-due/
// pending/invite · destructive=suspended/rejected · info=neutral counts + converter.
// Coral (brand) is NEVER a status. Pills = token-tinted bg + token text, flat, uppercase.
export type PillTone = "success" | "warning" | "destructive" | "info" | "muted";

const TONE: Record<PillTone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  info: "bg-info/15 text-info",
  muted: "bg-muted text-muted-foreground",
};

export function Pill({
  tone,
  children,
  className,
}: {
  tone: PillTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ── domain → tone/label mappers (single source; screens don't re-derive) ──
export const healthTone = (h: StoreHealth): PillTone =>
  h === "suspended" ? "destructive" : h === "past_due" ? "warning" : "success";

export const accountTone = (s: AccountStatus): PillTone =>
  s === "suspended" ? "destructive" : s === "invite_pending" ? "warning" : "success";

export const accountLabel = (s: AccountStatus): string =>
  s === "invite_pending" ? "Invite pending" : s === "suspended" ? "Suspended" : "Active";

export const subTone = (s: SubscriptionStatus): PillTone =>
  s === "active" || s === "trialing"
    ? "success"
    : s === "canceled"
      ? "destructive"
      : "warning";

export const registrationTone = (s: RegistrationStatus): PillTone => {
  switch (s) {
    case "approved":
    case "completed":
      return "success";
    case "rejected":
      return "destructive";
    case "expired":
      return "muted";
    default:
      return "warning"; // pending_verification
  }
};

export const registrationLabel = (s: RegistrationStatus): string =>
  s === "pending_verification" ? "Pending" : s.charAt(0).toUpperCase() + s.slice(1);

// Onboarding type badge: New = muted, Converter = info (COMPONENT_MANIFEST §1).
export const typeTone = (t: RegistrationType): PillTone => (t === "converter" ? "info" : "muted");
