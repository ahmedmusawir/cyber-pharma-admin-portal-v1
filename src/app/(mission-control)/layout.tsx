import { redirect } from "next/navigation";
import { getSuperAdminUser } from "@/services/mission-control/session";
import { Shell } from "@/components/mission-control/Shell";

// REAL auth gate for every authenticated MissionControl screen. Uses the kit-real
// derivation (getSuperAdminUser → getUserRole() === 'superadmin'); non-super-admins
// (and anonymous) are sent to /login. Login stands OUTSIDE this group (no shell).
// Chosen over protectPage() because protectPage hardcodes a /auth redirect and does
// not yield the SuperAdminUser the shell foot needs — both satisfy the ruling.
export default async function MissionControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSuperAdminUser();
  if (!user) redirect("/login");

  return (
    <Shell user={{ displayName: user.displayName, email: user.email }}>
      {children}
    </Shell>
  );
}
