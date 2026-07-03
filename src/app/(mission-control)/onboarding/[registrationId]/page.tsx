import { OnboardingDetailPageContent } from "./OnboardingDetailPageContent";

export default async function OnboardingDetailPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  return <OnboardingDetailPageContent registrationId={registrationId} />;
}
