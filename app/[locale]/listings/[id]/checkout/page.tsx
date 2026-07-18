import MarketplaceCheckout from "@/components/listings/checkout/MarketplaceCheckout";

interface MarketplaceCheckoutPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string; price?: string }>;
}

export default async function MarketplaceCheckoutPage({
  params,
  searchParams,
}: MarketplaceCheckoutPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const parsedPrice = Number(query.price);
  const agreedPrice =
    Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : 12_500_000;
  const initialRole = query.role === "seller" ? "seller" : "buyer";

  return (
    <MarketplaceCheckout
      listingId={id}
      initialRole={initialRole}
      agreedPrice={agreedPrice}
    />
  );
}
