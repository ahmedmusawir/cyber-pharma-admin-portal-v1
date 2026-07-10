"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Store,
  ScrollText,
  LogOut,
  Menu,
  type LucideIcon,
} from "lucide-react";
import SpinnerLarge from "@/components/common/SpinnerLarge";
import ThemeToggler from "@/components/global/ThemeToggler";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// App shell. Login stands alone (no shell). ONE operator identity — no role
// branching. Nav order per UI_SPEC §2: Dashboard · Onboarding · Owners ·
// Stores · Audit log.
//
// Mobile-first contract (Rule Zero):
// - 375px: sticky top bar (brand · theme toggle · 44px hamburger). Nav lives in
//   a left slide-over drawer (w-3/4): brand head, the SAME 5 items (coral LEFT
//   accent active state per mobile PNGs), divider, super-admin foot + sign-out.
//   Drawer closes on backdrop tap, Escape, and navigation. Theme toggle stays
//   OUTSIDE the drawer (top level).
// - 768px (md): narrow rail (248px < 20rem) becomes persistent; top bar and
//   drawer disappear. Doctrine: UI-UX manual Rule Zero sidebar rule.
// - 1024px (lg): no shell change (content grids widen per screen).
// - Touch targets: hamburger and drawer items ≥ 44px.
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/onboarding", label: "Onboarding", icon: ClipboardCheck },
  { href: "/owners", label: "Owners", icon: Users },
  { href: "/stores", label: "Stores", icon: Store },
  { href: "/audit-log", label: "Audit log", icon: ScrollText },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Shell({
  user,
  children,
}: {
  user: { displayName: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Nav pending state. Next 16 keeps the OLD page visible during client-side
  // navigation (loading.tsx never paints when prefetch data is stale), so nav
  // clicks route through startTransition and isPending drives a spinner in the
  // content slot. loading.tsx still covers hard loads / first paint.
  const [isPending, startTransition] = useTransition();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Close-on-navigation: route change dismisses the mobile drawer.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function navigate(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    // Modifier / middle clicks keep native Link behavior (new tab etc.).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setDrawerOpen(false);
    startTransition(() => router.push(href));
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  // Brand: logo-color.svg is self-contained (coral tile + white drop) — safe on
  // both Mist and Slate. Wordmark is token-colored HTML (never logo-lockup.svg:
  // its baked dark text dies on dark).
  const brand = (
    <div className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-color.svg" alt="Cyber Pharma" className="h-8 w-8" />
      <div className="leading-tight">
        <p className="text-sm font-bold uppercase tracking-wide text-foreground">Cyber Pharma</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Mission Control
        </p>
      </div>
    </div>
  );

  const foot = (
    <div className="flex items-center gap-3 border-t border-border p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center bg-primary/15 text-xs font-bold text-primary">
        {initials(user.displayName)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{user.displayName}</p>
        <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
          Super Admin
        </p>
      </div>
      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        className="grid h-11 w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );

  const navLinks = (
    <nav className="flex-1 space-y-1 px-2 py-2">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={(e) => navigate(e, href)}
          className={cn(
            "flex items-center gap-3 border-l-[3px] px-3 py-2 text-sm transition-colors max-md:py-3",
            isActive(href)
              ? "border-primary bg-primary/10 font-medium text-primary"
              : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar (≥ md) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-card md:flex">
        <div className="p-4">{brand}</div>
        {navLinks}
        <div className="px-2 pb-2">
          <ThemeToggler />
        </div>
        {foot}
      </aside>

      {/* Mobile top bar (< md): brand · theme toggle · hamburger. Nav lives in the drawer. */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card p-3 md:hidden">
        {brand}
        <div className="flex items-center gap-1">
          <ThemeToggler />
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              aria-label="Open navigation"
              className="grid h-11 w-11 place-items-center text-foreground transition-colors hover:text-primary"
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent aria-describedby={undefined}>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="p-4">{brand}</div>
              {navLinks}
              {foot}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Content region — spinner replaces ONLY this slot while a nav is in
          flight; the rail / top bar never remount. */}
      <main className="md:pl-[248px]">
        <div className="mx-auto max-w-6xl px-5 py-6">
          {isPending ? (
            // Operator's kit spinner by explicit direction (Rule Zero-B
            // exception logged — hardcoded palette colors live inside it).
            <div className="grid min-h-[60vh] place-items-center">
              <SpinnerLarge />
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
