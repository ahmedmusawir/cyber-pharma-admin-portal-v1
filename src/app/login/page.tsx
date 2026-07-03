import { redirect } from "next/navigation";
import { getSuperAdminUser } from "@/services/mission-control/session";
import { LoginPageContent } from "./LoginPageContent";

// Standalone (no shell). If already a super-admin session, skip straight in.
export default async function LoginPage() {
  const user = await getSuperAdminUser();
  if (user) redirect("/dashboard");
  return <LoginPageContent />;
}
