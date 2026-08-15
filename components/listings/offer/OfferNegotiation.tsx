"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Handshake, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { getLoginHref } from "@/lib/auth-redirect";
import DirhamText from "@/components/ui/DirhamText";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import OfferDealSummary from "./OfferDealSummary";
import {
  acceptOffer,
  buyListingAtAskingPrice,
  canTransactListing,
  counterOffer,
  endNegotiation,
  finalOffer,
  firstMarketplaceError,
  getListingDetail,
  getListingOffers,
  getMyOffers,
  isHiddenPlateCode,
  isListingReserved,
  isListingSold,
  MarketplaceRequestError,
  rejectOffer,
  resolveListingPreview,
  resolvePlateParts,
  startPurchaseFromOffer,
  submitOffer,
  withdrawOffer,
  type MarketplaceCounterOfferQuota,
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

type ComposeMode = "counter" | "final";

export default function OfferNegotiation() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const { getColor, counterOfferLimit } = useTheme();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [listing, setListing] = useState<MarketplaceListingDetail | null>(null);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [quota, setQuota] = useState<MarketplaceCounterOfferQuota | null>(null);
  const [draftAmount, setDraftAmount] = useState(0);
  const [counterAmount, setCounterAmount] = useState(0);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [composeMode, setComposeMode] = useState<ComposeMode>("counter");
  const [composeOpen, setComposeOpen] = useState(false);
  const [buyerFinal, setBuyerFinal] = useState(false);

  const isOwner = Boolean(listing?.is_owner);
  const isDirectListing =
    String(listing?.listing_type || "").toLowerCase() === "direct";
  const askingPrice = Number(listing?.asking_price) || 0;
  const canTransact = canTransactListing(listing?.status);
  const reserved = isListingReserved(listing?.status);
  const sold = isListingSold(listing?.status);
  const unavailableMessage = reserved
    ? t("listings.listing_reserved_message")
    : sold
      ? t("listings.listing_sold_message")
      : t("listings.listing_not_available");

  const deriveQuota = useCallback(
    (nextOffers: MarketplaceOffer[], limit: number) => {
      const pending = [...nextOffers]
        .reverse()
        .find((offer) => offer.status === "pending");
      const buyerId = pending?.buyer?.id;
      const used = nextOffers.filter(
        (offer) =>
          offer.initiated_by === "seller" || offer.is_seller_counter,
      ).length;
      // Prefer seller counters for the active buyer thread when known.
      const usedForBuyer =
        buyerId != null
          ? nextOffers.filter(
              (offer) =>
                (offer.initiated_by === "seller" || offer.is_seller_counter) &&
                offer.buyer?.id === buyerId,
            ).length
          : used;
      const remaining = Math.max(0, limit - usedForBuyer);
      const hasPendingFinal = nextOffers.some(
        (offer) => offer.status === "pending" && offer.is_final,
      );
      return {
        limit,
        used: usedForBuyer,
        remaining,
        can_counter: remaining > 0 && !hasPendingFinal,
        can_negotiate: !hasPendingFinal,
        has_pending_final: hasPendingFinal,
      } satisfies MarketplaceCounterOfferQuota;
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const listingResponse = await getListingDetail(params.id, locale);
      const nextListing = listingResponse.data.listing;
      setListing(nextListing);
      const price = Number(nextListing.asking_price) || 0;
      setDraftAmount(Math.max(1, Math.round(price * 0.95)));
      setCounterAmount(Math.max(1, Math.round(price * 0.98)));

      let nextOffers: MarketplaceOffer[] = [];
      let apiLimit = counterOfferLimit;

      if (nextListing.is_owner) {
        const offersResponse = await getListingOffers(params.id, locale);
        nextOffers = offersResponse.data.offers || [];
        if (typeof offersResponse.data.counter_offer_limit === "number") {
          apiLimit = offersResponse.data.counter_offer_limit;
        }
      } else {
        const offersResponse = await getMyOffers(locale);
        nextOffers = (offersResponse.data.offers || []).filter(
          (offer) => String(offer.listing_id) === String(params.id),
        );
      }

      setOffers(nextOffers);
      setQuota(deriveQuota(nextOffers, apiLimit));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load offers.",
      );
    } finally {
      setLoading(false);
    }
  }, [counterOfferLimit, deriveQuota, locale, params.id]);

  const handleListingConflict = async (error: unknown) => {
    if (error instanceof MarketplaceRequestError && error.status === 422) {
      toast.error(t("listings.listing_reserved_toast"));
      await load();
      return true;
    }
    return false;
  };

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

  const effectiveQuota = quota || {
    limit: counterOfferLimit,
    used: 0,
    remaining: counterOfferLimit,
    can_counter: true,
    can_negotiate: true,
    has_pending_final: false,
  };

  const hasPendingFinal =
    Boolean(latestPending?.is_final) || effectiveQuota.has_pending_final;
  const canNegotiate = effectiveQuota.can_negotiate && !hasPendingFinal;
  const canCounter = effectiveQuota.can_counter && canNegotiate;
  const hasReachedCounterLimit = effectiveQuota.remaining <= 0;

  const counterLimitMessage = t("offer.counter_limit_reached").replace(
    "{limit}",
    String(effectiveQuota.limit),
  );
  const finalLockedMessage =
    t("offer.final_locked") ||
    "A final offer is pending. Further negotiation is closed — accept or end the negotiation.";

  const canBuyerStartNegotiation =
    !isOwner &&
    canTransact &&
    listing?.can_make_offer !== false &&
    !latestPending &&
    !acceptedOffer &&
    canNegotiate;

  const canBuyAtAsking = canBuyerStartNegotiation && isDirectListing;

  const canBuyerCompose = canBuyerStartNegotiation;

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
    if (offer.is_final) {
      if (offer.is_seller_counter || offer.initiated_by === "seller") {
        return t("offer.seller_final");
      }
      return t("offer.buyer_final") || t("offer.final_offer");
    }
    if (offer.is_seller_counter || offer.initiated_by === "seller") {
      return `${t("offer.seller_counter")} # ${index + 1}`;
    }
    return `${t("offer.counter_offer")} # ${index + 1}`;
  };

  const applyQuotaFromResponse = (
    nextQuota?: MarketplaceCounterOfferQuota,
  ) => {
    if (nextQuota) setQuota(nextQuota);
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
      } catch (purchaseError) {
        if (await handleListingConflict(purchaseError)) return;
        router.push(
          `/${locale}/listings/${params.id}/checkout?role=buyer&price=${offerAmount(offer)}`,
        );
      }
    } catch (error) {
      if (await handleListingConflict(error)) return;
      toast.error(
        error instanceof Error ? error.message : "Failed to accept offer.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendBuyerOffer = async () => {
    if (!canNegotiate) {
      toast.error(finalLockedMessage);
      return;
    }
    if (draftAmount < 1) {
      toast.error(t("offer.invalid_amount") || "Enter a valid offer amount.");
      return;
    }
    setActionLoading(true);
    try {
      const response = await submitOffer(
        params.id,
        {
          amount: draftAmount,
          message: buyerFinal
            ? t("offer.final_offer") || "Final offer"
            : t("offer.counter_offer"),
          is_final: buyerFinal,
        },
        locale,
      );
      applyQuotaFromResponse(response.data.counter_offer_quota);
      toast.success(
        buyerFinal
          ? t("offer.final_sent") || "Final offer submitted successfully."
          : t("offer.sent_success") || "Offer submitted successfully.",
      );
      setComposeOpen(false);
      setBuyerFinal(false);
      await load();
    } catch (error) {
      if (await handleListingConflict(error)) return;
      toast.error(
        error instanceof Error ? error.message : "Failed to submit offer.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSellerCounter = async () => {
    if (!latestPending) return;
    if (composeMode === "counter" && !canCounter) {
      toast.error(
        hasPendingFinal ? finalLockedMessage : counterLimitMessage,
      );
      return;
    }
    if (counterAmount < 1) {
      toast.error(t("offer.invalid_amount") || "Enter a valid offer amount.");
      return;
    }
    setActionLoading(true);
    try {
      if (composeMode === "final") {
        const response = await finalOffer(
          latestPending.id,
          {
            amount: counterAmount,
            message: t("offer.seller_final") || "Final offer",
          },
          locale,
        );
        applyQuotaFromResponse(response.data.counter_offer_quota);
        toast.success(
          t("offer.final_sent") || "Final offer sent successfully.",
        );
      } else {
        const response = await counterOffer(
          latestPending.id,
          {
            amount: counterAmount,
            message: t("offer.seller_counter"),
            is_final: false,
          },
          locale,
        );
        applyQuotaFromResponse(response.data.counter_offer_quota);
        toast.success(
          t("offer.counter_sent") || "Counter offer sent successfully.",
        );
      }
      setShowCounterForm(false);
      setComposeMode("counter");
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

  const handleEndNegotiation = async (offer: MarketplaceOffer) => {
    setActionLoading(true);
    try {
      await endNegotiation(offer.id, locale);
      toast.success(t("offer.ended_success") || "Negotiation ended.");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to end negotiation.",
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

  const handleAcceptAsking = async () => {
    if (!isDirectListing || !canTransact) return;
    setActionLoading(true);
    try {
      const response = await buyListingAtAskingPrice(
        params.id,
        locale,
        askingPrice,
      );
      const purchase = response.data.purchase;
      const purchaseId = purchase?.id;
      router.push(
        `/${locale}/listings/${params.id}/checkout?role=buyer&price=${askingPrice}${
          purchaseId ? `&purchaseId=${purchaseId}` : ""
        }`,
      );
    } catch (error) {
      if (error instanceof MarketplaceRequestError && error.status === 401) {
        router.push(
          getLoginHref(
            locale,
            `/${locale}/listings/${params.id}/offer`,
          ),
        );
        return;
      }
      if (error instanceof MarketplaceRequestError && error.status === 422) {
        const amountError = firstMarketplaceError(error, ["amount"]);
        const listingError = firstMarketplaceError(error, ["listing"]);
        toast.error(
          amountError ||
            listingError ||
            firstMarketplaceError(error) ||
            t("listings.listing_reserved_toast"),
        );
        await load();
        return;
      }
      toast.error(
        firstMarketplaceError(error) || "Failed to start purchase.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openSellerForm = (mode: ComposeMode, offer: MarketplaceOffer) => {
    if (mode === "counter" && !canCounter) {
      toast.error(
        hasPendingFinal ? finalLockedMessage : counterLimitMessage,
      );
      return;
    }
    if (mode === "final" && !canNegotiate) {
      toast.error(finalLockedMessage);
      return;
    }
    setComposeMode(mode);
    setCounterAmount(Math.max(1, Math.round(offerAmount(offer) * 1.02)));
    setShowCounterForm(true);
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

        {!canTransact && !isOwner && (
          <p
            className="mb-8 rounded-xl border px-4 py-3 text-sm leading-relaxed text-center"
            style={{
              borderColor: getColor("border"),
              backgroundColor: getColor("surface"),
              color: getColor("secondaryText"),
            }}
          >
            {unavailableMessage}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-4">
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
              {!isOwner && canBuyerStartNegotiation && !composeOpen && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {canBuyAtAsking ? (
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        disabled={actionLoading}
                        onClick={handleAcceptAsking}
                      >
                        {t("offer.accept")}
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      style={{
                        borderColor: getColor("primary"),
                        color: getColor("primary"),
                      }}
                      leftIcon={<RefreshCw className="w-4 h-4" strokeWidth={2} />}
                      disabled={actionLoading || !canNegotiate}
                      onClick={() => {
                        if (!canNegotiate) {
                          toast.error(finalLockedMessage);
                          return;
                        }
                        setBuyerFinal(false);
                        setComposeOpen(true);
                      }}
                    >
                      {t("offer.negotiate")}
                    </Button>
                  </div>
                  {hasReachedCounterLimit && (
                    <p
                      className="text-xs text-start"
                      style={{ color: getColor("error") }}
                    >
                      {counterLimitMessage}
                    </p>
                  )}
                  {!hasReachedCounterLimit && effectiveQuota.used > 0 && (
                    <p
                      className="text-xs text-start"
                      style={{ color: getColor("mutedText") }}
                    >
                      {t("offer.counter_limit_remaining").replace(
                        "{remaining}",
                        String(effectiveQuota.remaining),
                      )}
                    </p>
                  )}
                </div>
              )}
              {!isOwner && hasPendingFinal && !canBuyerStartNegotiation && (
                <p
                  className="text-xs text-start"
                  style={{ color: getColor("error") }}
                >
                  {finalLockedMessage}
                </p>
              )}
            </div>

            {sortedOffers.map((offer, index) => {
              const isLatestPending = latestPending?.id === offer.id;
              const isSellerCounter =
                offer.is_seller_counter || offer.initiated_by === "seller";
              const isFinalPending = isLatestPending && Boolean(offer.is_final);

              return (
                <div
                  key={offer.id}
                  className="rounded-2xl border p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                  style={{
                    backgroundColor: getColor("surface"),
                    borderColor: offer.is_final
                      ? getColor("primary")
                      : getColor("border"),
                    opacity:
                      isLatestPending || offer.status === "accepted" ? 1 : 0.72,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3
                      className="text-xl font-serif font-bold text-start"
                      style={{ color: getColor("primaryText") }}
                    >
                      {offerTitle(offer, index)}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {offer.is_final && (
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: getColor("primary"),
                            color: "#fff",
                          }}
                        >
                          {t("offer.final_badge") || "Final"}
                        </span>
                      )}
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: getColor("primaryLight"),
                          color: getColor("secondaryText"),
                        }}
                      >
                        {offer.status_label || offer.status}
                      </span>
                    </div>
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
                    <div className="space-y-3">
                      {isFinalPending ? (
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
                            disabled={actionLoading}
                            onClick={() => handleEndNegotiation(offer)}
                          >
                            {t("offer.end_negotiation")}
                          </Button>
                        </div>
                      ) : (
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
                            disabled={actionLoading || !canCounter}
                            onClick={() => openSellerForm("counter", offer)}
                          >
                            {t("offer.negotiate")}
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            disabled={actionLoading || !canNegotiate}
                            onClick={() => openSellerForm("final", offer)}
                          >
                            {t("offer.final_offer") || "Final Offer"}
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
                      {hasReachedCounterLimit && !isFinalPending && (
                        <p
                          className="text-xs text-start"
                          style={{ color: getColor("error") }}
                        >
                          {counterLimitMessage}
                        </p>
                      )}
                      {isFinalPending && (
                        <p
                          className="text-xs text-start"
                          style={{ color: getColor("mutedText") }}
                        >
                          {finalLockedMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {isLatestPending && canBuyerActOn && (
                    <div className="space-y-3">
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
                        {isFinalPending ? (
                          <Button
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            disabled={actionLoading}
                            onClick={() => handleEndNegotiation(offer)}
                          >
                            {t("offer.end_negotiation")}
                          </Button>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                      {isFinalPending && (
                        <p
                          className="text-xs text-start"
                          style={{ color: getColor("mutedText") }}
                        >
                          {finalLockedMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {isLatestPending && canBuyerWithdrawOwn && (
                    <Button
                      variant="outline"
                      size="lg"
                      fullWidth
                      disabled={actionLoading}
                      onClick={() =>
                        offer.is_final
                          ? handleEndNegotiation(offer)
                          : handleWithdraw(offer)
                      }
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
                  {buyerFinal
                    ? t("offer.final_offer") || "Final Offer"
                    : t("offer.counter_offer")}
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
                <label
                  className="flex items-center gap-2 mb-4 text-sm cursor-pointer"
                  style={{ color: getColor("primaryText") }}
                >
                  <input
                    type="checkbox"
                    checked={buyerFinal}
                    onChange={(e) => setBuyerFinal(e.target.checked)}
                    className="size-4 rounded border"
                  />
                  {t("offer.mark_as_final") ||
                    "Mark as final offer (no further negotiation)"}
                </label>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    loading={actionLoading}
                    onClick={handleSendBuyerOffer}
                  >
                    {buyerFinal
                      ? t("offer.send_final") || "Send Final Offer"
                      : t("offer.send_offer")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      setComposeOpen(false);
                      setBuyerFinal(false);
                    }}
                  >
                    {t("listings.back") || "Back"}
                  </Button>
                </div>
              </div>
            )}

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
                  {composeMode === "final"
                    ? t("offer.seller_final")
                    : t("offer.seller_counter")}
                </h3>
                {composeMode === "final" && (
                  <p
                    className="text-sm mb-4"
                    style={{ color: getColor("secondaryText") }}
                  >
                    {t("offer.final_hint") ||
                      "After a final offer, the buyer can only accept or end negotiation."}
                  </p>
                )}
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
                    {composeMode === "final"
                      ? t("offer.send_final") || "Send Final Offer"
                      : t("offer.send_offer")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => {
                      setShowCounterForm(false);
                      setComposeMode("counter");
                    }}
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
              status={listing?.status}
              previouslySold={listing?.previously_sold}
              plate_code={resolvePlateParts(listing).code}
              plate_digits={resolvePlateParts(listing).digits}
              emirate={
                listing?.emirate_label?.toUpperCase() ||
                listing?.emirate ||
                "DUBAI"
              }
              plate_type={listing?.plate_type || undefined}
              plate_design={listing?.plate_design || undefined}
              preview={resolveListingPreview(listing)}
              hideCode={isHiddenPlateCode(listing)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
