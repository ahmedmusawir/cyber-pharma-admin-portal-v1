"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Sheet — left slide-over panel on @radix-ui/react-dialog (hand-authored, offline,
 * same pattern as alert-dialog.tsx). Radix supplies focus trap, Escape close,
 * backdrop dismiss, body scroll lock, portal, and role="dialog" aria-modal.
 *
 * Mobile-first contract (Rule Zero):
 * - 375px: panel slides in from the left at w-3/4 over a dimmed backdrop.
 * - 768px (md): panel widens to w-1/2 (unreachable while the nav rail is
 *   persistent at md+ — kept per approved spec for future breakpoint shifts).
 * - 1024px (lg): no change; callers hide the trigger where a rail persists.
 * - Touch targets: close button is a 44px hit area.
 *
 * Left-side only by design (MissionControl needs nothing else). Reconcile with
 * the starter kit's blessed sheet.tsx at the next kit-sync (ledger note).
 */
const Sheet = DialogPrimitive.Root;

const SheetTrigger = DialogPrimitive.Trigger;

const SheetClose = DialogPrimitive.Close;

const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      /* installed radix version hides siblings via aria-hidden but omits the
         aria-modal attribute itself; stamp it — the dialog IS modal. */
      aria-modal="true"
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-3/4 flex-col border-r border-border bg-card shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:w-1/2",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Close navigation"
        className="absolute right-1 top-2 grid h-11 w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="h-5 w-5" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetOverlay, SheetPortal };
