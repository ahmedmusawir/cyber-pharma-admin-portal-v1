"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

// REAL Supabase auth (kit /api/auth/login), gated on the super-admin role. This
// is the operator's own login — the ONLY password field in the app (managing
// other users never exposes one). Non-super-admins are denied and signed out.
export function LoginPageContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // .catch() chains, not try/catch (kit gotcha: dev overlay intercepts throws).
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    if (!res) {
      setError("Could not reach the server. Try again.");
      setLoading(false);
      return;
    }

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(result.error || "Login failed.");
      setLoading(false);
      return;
    }

    // Real role from the auth response. Console is super-admin only.
    if (result.data?.role !== "superadmin") {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      setError("This console is restricted to super admins.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center bg-primary text-sm font-bold text-primary-foreground">
            M
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-foreground">
              MissionControl
            </p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Super Admin Console
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <a href="/auth" className="hover:text-foreground">
            Forgot password?
          </a>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            No PHI in this console
          </span>
        </div>
      </div>
    </div>
  );
}
