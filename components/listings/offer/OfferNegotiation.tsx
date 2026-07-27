"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Handshake, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import DirhamText from "@/components/ui/DirhamText";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import OfferDealSummary from "./OfferDealSummary";
import {
  acceptOffer,
  counterOffer,
  getListingDetail,
  getListingOffers,
  getMyOffers,
  rejectOffer,
  startPurchaseFromOffer,
  submitOffer,
  withdrawOffer,
  type MarketplaceListingDetail,
  type MarketplaceOffer,
} from "@/services/marketplace";

function formatInput(amount: number) {
  return amount.toLocaleString("en-AE");
}

function parseAmount(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function offerAmount(offer: MarketplaceOffer) {
  return Number(offer.amount) || 0;
}

export default function OfferNegotiation() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const { getColor } = useTheme();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [listing, setListing] = useState<MarketplaceListingDetail | null>(null);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [draftAmount, setDraftAmount] = useState(0);
  const [counterAmount, setCounterAmount] = useState(0);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const isOwner = Boolean(listing?.is_owner);
  const askingPrice = listing?.asking_price || 0;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const listingResponse = await getListingDetail(params.id, locale);
      const nextListing = listingResponse.data.listing;
      setListing(nextListing);
      setDraftAmount(Math.max(1, Math.round(nextListing.asking_price * 0.95)));
      setCounterAmount(Math.max(1, Math.round(nextListing.asking_price * 0.98)));

      if (nextListing.is_owner) {
        const offersResponse = await getListingOffers(params.id, locale);
        setOffers(offersResponse.data.offers || []);
      } else {
        const offersResponse = await getMyOffers(locale);
        setOffers(
          (offersResponse.data.offers || []).filter(
            (offer) => String(offer.listing_id) === String(params.id),
          ),
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load offers.",
      );
    } finally {
      setLoading(false);
    }
  }, [locale, params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const sortedOffers = useMemo(
    () =>
      [...offers].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [offers],
  );

  const latestPending = useMemo(
    () =>
      [...sortedOffers]
        .reverse()
        .find((offer) => offer.status === "pending") || null,
    [sortedOffers],
  );

  const acceptedOffer = useMemo(
    () => sortedOffers.find((offer) => offer.status === "accepted") || null,
    [sortedOffers],
  );

  const canBuyerCompose =
    !isOwner &&
    listing?.can_make_offer !== false &&
    !latestPending &&
    !acceptedOffer;

  const canSellerActOn =
    isOwner &&
    latestPending &&
    latestPending.initiated_by !== "seller" &&
    !latestPending.is_seller_counter;

  const canBuyerActOn =
    !isOwner &&
    latestPending &&
    (latestPending.initiated_by === "seller" ||
      latestPending.is_seller_counter);

  const canBuyerWithdrawOwn =
    !isOwner &&
    latestPending &&
    latestPending.initiated_by !== "seller" &&
    !latestPending.is_seller_counter;

  const offerTitle = (offer: MarketplaceOffer, index: number) => {
    if (offer.is_seller_counter || offer.initiated_by === "seller") {
      return `${t("offer.seller_counter")} # ${index + 1}`;
    }
    return `${t("offer.counter_offer")} # ${index + 1}`;
  };

  const handleSellerAccept = async (offer: MarketplaceOffer) => {
    setActionLoading(true);
    try {
      await acceptOffer(offer.id, locale);
      toast.success(t("offer.accepted_success") || "Offer accepted.");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept offer.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const goToCheckout = async (offer: MarketplaceOffer) => {
    setActionLoading(true);
    try {
      if (offer.status !== "accepted") {
        await acceptOffer(offer.id, locale);
      }
      try {
        const purchase = await startPurchaseFromOffer(offer.id, locale);
        const purchaseId = purchase.data.purchase?.id;
        router.push(
          `/${locale}/listings/${params.id}/checkout?role=buyer&price=${offerAmount(offer)}${
            purchaseId ? `&purchaseId=${purchaseId}` : ""
          }`,
        );
      } catch {
        router.push(
          `/${locale}/listings/${params.id}/checkout?role=buyer&price=${offerAmount(offer)}`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept offer.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendBuyerOffer = async () => {
    if (draftAmount < 1) {
      toast.error(t("offer.invalid_amount") || "Enter a valid offer amount.");
      return;
    }
    setActionLoading(true);
    try {
      await submitOffer(
        params.id,
        { amount: draftAmount, message: t("offer.counter_offer") },
        locale,
      );
      toast.success(t("offer.sent_success") || "Offer submitted successfully.");
      setComposeOpen(false);
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit offer.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSellerCounter = async () => {
    if (!latestPending) return;
    if (counterAmount < 1) {
      toast.error(t("offer.invalid_amount") || "Enter a valid offer amount.");
      return;
    }
    setActionLoading(true);
    try {
      await counterOffer(
        latestPending.id,
        { amount: counterAmount, message: t("offer.seller_counter") },
        locale,
      );
      toast.success(
        t("offer.counter_sent") || "Counter offer sent successfully.",
      );
      setShowCounterForm(false);
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send counter.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (offer: MarketplaceOffer) => {
    setActionLoading(true);
    try {
      await rejectOffer(offer.id, locale);
      toast.success(t("offer.rejected_success") || "Offer rejected.");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject offer.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (offer: MarketplaceOffer) => {
    setActionLoading(true);
    try {
      await withdrawOffer(offer.id, locale);
      toast.success(t("offer.withdrawn_success") || "Offer withdrawn.");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to withdraw offer.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptAsking = () => {
    router.push(
      `/${locale}/listings/${params.id}/checkout?role=buyer&price=${askingPrice}`,
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-10 text-start">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold normal-case tracking-normal px-3 py-1 rounded-full mb-4"
            style={{
              backgroundColor: getColor("primaryLight"),
              color: getColor("secondaryText"),
            }}
          >
            <Handshake className="w-3.5 h-3.5" strokeWidth={2} />
            {t("offer.badge")}
          </span>
          <h1
            className="text-4xl md:text-[42px] font-serif font-bold leading-tight mb-3"
            style={{ color: getColor("primaryText") }}
          >
            {isOwner
              ? t("offer.seller_title") || "Manage Offers"
              : t("offer.title")}
          </h1>
          <p
            className="text-sm md:text-base max-w-2xl leading-relaxed"
            style={{ color: getColor("mutedText") }}
          >
            {isOwner
              ? t("offer.seller_subtitle") ||
                "Review buyer offers, send a counter, or accept to move into escrow checkout."
              : t("offer.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-4">
            {/* Listing asking price card */}
            <div
              className="rounded-2xl border p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              style={{
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
              }}
            >
              <h3
                className="text-xl font-serif font-bold mb-4 text-start"
                style={{ color: getColor("primaryText") }}
              >
                {t("offer.listing_offer")}
              </h3>
              <label
                className="block text-xs font-medium mb-2 text-start"
                style={{ color: getColor("mutedText") }}
              >
                <DirhamText text={t("offer.asking_price")} />
              </label>
              <input
                type="text"
                value={formatInput(askingPrice)}
                disabled
                className="w-full h-12 rounded-xl border px-4 text-sm outline-none mb-4 text-start"
                style={{
                  backgroundColor: getColor("primaryLight"),
                  borderColor: getColor("border"),
                  color: getColor("primaryText"),
                }}
              />
              {!isOwner && canBuyerCompose && !composeOpen && (
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={handleAcceptAsking}
                  >
                    {t("offer.accept")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    style={{
                      borderColor: getColor("primary"),
                      color: getColor("primary"),
                    }}
                    leftIcon={<RefreshCw className="w-4 h-4" strokeWidth={2} />}
                    onClick={() => setComposeOpen(true)}
                  >
                    {t("offer.negotiate")}
                  </Button>
                </div>
              )}
            </div>

            {/* Offer history */}
            {sortedOffers.map((offer, index) => {
              const isLatestPending = latestPending?.id === offer.id;
              const isSellerCounter =
                offer.is_seller_counter || offer.initiated_by === "seller";

              return (
                <div
                  key={offer.id}
                  className="rounded-2xl border p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                  style={{
                    backgroundColor: getColor("surface"),
                    borderColor: getColor("border"),
                    opacity: isLatestPending || offer.status === "accepted" ? 1 : 0.72,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3
                      className="text-xl font-serif font-bold text-start"
                      style={{ color: getColor("primaryText") }}
                    >
                      {offerTitle(offer, index)}
                    </h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0"
                      style={{
                        backgroundColor: getColor("primaryLight"),
                        color: getColor("secondaryText"),
                      }}
                    >
                      {offer.status_label || offer.status}
                    </span>
                  </div>

                  <label
                    className="block text-xs font-medium mb-2 text-start"
                    style={{ color: getColor("mutedText") }}
                  >
                    <DirhamText
                      text={
                        isSellerCounter
                          ? t("offer.asking_offer")
                          : t("offer.your_offer")
                      }
                    />
                  </label>
                  <input
                    type="text"
                    value={formatInput(offerAmount(offer))}
                    disabled
                    className="w-full h-12 rounded-xl border px-4 text-sm outline-none mb-4 text-start"
                    style={{
                      backgroundColor: getColor("primaryLight"),
                      borderColor: getColor("border"),
                      color: getColor("primaryText"),
                    }}
                  />

                  {isLatestPending && canSellerActOn && !showCounterForm && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        loading={actionLoading}
                        onClick={() => handleSellerAccept(offer)}
                      >
                        {t("offer.accept")}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        style={{
                          borderColor: getColor("primary"),
                          color: getColor("primary"),
                        }}
                        leftIcon={
                          <RefreshCw className="w-4 h-4" strokeWidth={2} />
                        }
                        onClick={() => {
                          setCounterAmount(
                            Math.max(1, Math.round(offerAmount(offer) * 1.02)),
                          );
                          setShowCounterForm(true);
                        }}
                      >
                        {t("offer.negotiate")}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        disabled={actionLoading}
                        onClick={() => handleReject(offer)}
                      >
                        {t("offer.reject") || "Reject"}
                      </Button>
                    </div>
                  )}

                  {isLatestPending && canBuyerActOn && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        loading={actionLoading}
                        onClick={() => goToCheckout(offer)}
                      >
                        {t("offer.accept")}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        disabled={actionLoading}
                        onClick={() => handleReject(offer)}
                      >
                        {t("offer.reject") || "Reject"}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        disabled={actionLoading}
                        onClick={() => handleWithdraw(offer)}
                      >
                        {t("offer.end_negotiation")}
                      </Button>
                    </div>
                  )}

                  {isLatestPending && canBuyerWithdrawOwn && (
                    <Button
                      variant="outline"
                      size="lg"
                      fullWidth
                      disabled={actionLoading}
                      onClick={() => handleWithdraw(offer)}
                    >
                      {t("offer.end_negotiation")}
                    </Button>
                  )}

                  {offer.status === "accepted" && !isOwner && (
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={actionLoading}
                      onClick={() => goToCheckout(offer)}
                    >
                      {t("offer.continue_checkout") || "Continue to checkout"}
                    </Button>
                  )}
                </div>
              );
            })}

            {/* Buyer compose new offer */}
            {!isOwner && composeOpen && canBuyerCompose && (
              <div
                className="rounded-2xl border p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                style={{
                  backgroundColor: getColor("surface"),
                  borderColor: getColor("border"),
                }}
              >
                <h3
                  className="text-xl font-serif font-bold mb-4"
                  style={{ color: getColor("primaryText") }}
                >
                  {t("offer.counter_offer")}
                </h3>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: getColor("mutedText") }}
                >
                  <DirhamText text={t("offer.your_offer")} />
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatInput(draftAmount)}
                  onChange={(e) => setDraftAmount(parseAmount(e.target.value))}
                  className="w-full h-12 rounded-xl border px-4 text-sm outline-none mb-4"
                  style={{
                    backgroundColor: getColor("surface"),
                    borderColor: getColor("border"),
                    color: getColor("primaryText"),
                  }}
                />
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    loading={actionLoading}
                    onClick={handleSendBuyerOffer}
                  >
                    {t("offer.send_offer")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setComposeOpen(false)}
                  >
                    {t("listings.back") || "Back"}
                  </Button>
                </div>
              </div>
            )}

            {/* Seller counter form */}
            {isOwner && showCounterForm && latestPending && (
              <div
                className="rounded-2xl border p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                style={{
                  backgroundColor: getColor("surface"),
                  borderColor: getColor("border"),
                }}
              >
                <h3
                  className="text-xl font-serif font-bold mb-4"
                  style={{ color: getColor("primaryText") }}
                >
                  {t("offer.seller_counter")}
                </h3>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: getColor("mutedText") }}
                >
                  <DirhamText text={t("offer.asking_offer")} />
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatInput(counterAmount)}
                  onChange={(e) =>
                    setCounterAmount(parseAmount(e.target.value))
                  }
                  className="w-full h-12 rounded-xl border px-4 text-sm outline-none mb-4"
                  style={{
                    backgroundColor: getColor("surface"),
                    borderColor: getColor("border"),
                    color: getColor("primaryText"),
                  }}
                />
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    loading={actionLoading}
                    onClick={handleSellerCounter}
                  >
                    {t("offer.send_offer")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setShowCounterForm(false)}
                  >
                    {t("listings.back") || "Back"}
                  </Button>
                </div>
              </div>
            )}

            {isOwner && sortedOffers.length === 0 && (
              <p
                className="text-sm py-8 text-center"
                style={{ color: getColor("mutedText") }}
              >
                {t("offer.no_offers") || "No offers yet on this listing."}
              </p>
            )}
          </div>

          <div className="lg:col-span-2 sticky top-24">
            <OfferDealSummary
              askingPrice={askingPrice}
              plate_code={listing?.plate_code || ""}
              plate_digits={listing?.plate_digits || ""}
              emirate={
                listing?.emirate_label?.toUpperCase() ||
                listing?.emirate ||
                "DUBAI"
              }
              plate_type={listing?.plate_type || undefined}
              plate_design={listing?.plate_design || undefined}
              hideCode={listing?.hide_code || listing?.code_hidden}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
