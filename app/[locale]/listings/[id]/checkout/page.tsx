import MarketplaceCheckout from "@/components/listings/checkout/MarketplaceCheckout";

interface MarketplaceCheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketplaceCheckoutPage({
  params,
}: MarketplaceCheckoutPageProps) {
  const { id } = await params;

  return <MarketplaceCheckout listingId={id} />;
}
