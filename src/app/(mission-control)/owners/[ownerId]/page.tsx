import { OwnerDetailPageContent } from "./OwnerDetailPageContent";

export default async function OwnerDetailPage({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  const { ownerId } = await params;
  return <OwnerDetailPageContent ownerId={ownerId} />;
}
