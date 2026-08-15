import AuctionCheckout from "@/components/auction/AuctionCheckout";

interface AuctionCheckoutPageProps {
  params: Promise<{ auctionId: string }>;
}

export default async function AuctionCheckoutPage({
  params,
}: AuctionCheckoutPageProps) {
  const { auctionId } = await params;

  return <AuctionCheckout listingId={auctionId} />;
}
