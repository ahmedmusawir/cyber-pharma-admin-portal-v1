import { StoreDetailPageContent } from "./StoreDetailPageContent";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  return <StoreDetailPageContent storeId={storeId} />;
}
