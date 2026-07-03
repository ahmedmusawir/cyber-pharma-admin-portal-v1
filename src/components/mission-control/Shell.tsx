"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Store,
  ScrollText,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import ThemeToggler from "@/components/global/ThemeToggler";
import { cn } from "@/lib/utils";

// App shell: fixed 248px sidebar (brand · 5-nav · super-admin foot) + scrollable
// content. Login stands alone (no shell). ONE operator identity — no role branching.
// Nav order per UI_SPEC §2: Dashboard · Onboarding · Owners · Stores · Audit log.
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
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  const brand = (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center bg-primary text-sm font-bold text-primary-foreground">
        M
      </span>
      <span className="text-sm font-bold uppercase tracking-wide text-foreground">
        MissionControl
      </span>
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
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar (≥ md) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-card md:flex">
        <div className="p-4">{brand}</div>
        <nav className="flex-1 space-y-1 px-2 py-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 border-l-[3px] px-3 py-2 text-sm transition-colors",
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
        <div className="px-2 pb-2">
          <ThemeToggler />
        </div>
        {foot}
      </aside>

      {/* Mobile top bar + horizontal nav strip (< md) */}
      <div className="sticky top-0 z-30 border-b border-border bg-card md:hidden">
        <div className="flex items-center justify-between p-3">
          {brand}
          <ThemeToggler />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors",
                isActive(href)
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content region */}
      <main className="md:pl-[248px]">
        <div className="mx-auto max-w-6xl px-5 py-6">{children}</div>
      </main>
    </div>
  );
}
