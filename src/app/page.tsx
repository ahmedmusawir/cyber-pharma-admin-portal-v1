import { redirect } from "next/navigation";

// FIX PHASE 1: MissionControl is the whole app — / rehomes to /dashboard.
// Lives at the app root (OUTSIDE the (public) group) so no layout chrome or
// loading.tsx boundary can paint before the redirect: Next emits a true
// HTTP 307, zero flash. Anonymous visitors bounce /dashboard → /login via
// the (mission-control) layout gate (no auth logic here). Kit demo home
// (HomePageContent) is intentionally left on disk for FIX PHASE 2 cleanup.
export const dynamic = "force-dynamic";

const Home = () => {
  redirect("/dashboard");
};

export default Home;
