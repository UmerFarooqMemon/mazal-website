"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Handshake, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import DirhamText from "@/components/ui/DirhamText";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import OfferDealSummary from "./OfferDealSummary";
import {
  getListingDetail,
  submitOffer,
  type MarketplaceListingDetail,
} from "@/services/marketplace";

type OfferCardKind =
  | "listing"
  | "buyer_counter"
  | "seller_counter"
  | "seller_final";

interface OfferRound {
  id: string;
  kind: OfferCardKind;
  title: string;
  fieldLabel: string;
  amount: number;
  editable: boolean;
  primaryAction: "accept" | "send";
  secondaryAction?: "negotiate" | "end";
}

function formatInput(amount: number) {
  return amount.toLocaleString("en-AE");
}

function parseAmount(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export default function OfferNegotiation() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [resolvedAskingPrice, setResolvedAskingPrice] = useState(680000);
  const [listing, setListing] = useState<MarketplaceListingDetail | null>(null);
  const [visibleCount, setVisibleCount] = useState(1);
  const [ended, setEnded] = useState(false);

  const [rounds, setRounds] = useState<OfferRound[]>([
    {
      id: "listing",
      kind: "listing",
      title: t("offer.listing_offer"),
      fieldLabel: t("offer.asking_price"),
      amount: 680000,
      editable: false,
      primaryAction: "accept",
      secondaryAction: "negotiate",
    },
    {
      id: "c1",
      kind: "buyer_counter",
      title: `${t("offer.counter_offer")} #1`,
      fieldLabel: t("offer.your_offer"),
      amount: 650000,
      editable: true,
      primaryAction: "send",
    },
    {
      id: "s1",
      kind: "seller_counter",
      title: `${t("offer.seller_counter")} #1`,
      fieldLabel: t("offer.asking_offer"),
      amount: 670000,
      editable: false,
      primaryAction: "accept",
      secondaryAction: "negotiate",
    },
    {
      id: "c2",
      kind: "buyer_counter",
      title: `${t("offer.counter_offer")} #2`,
      fieldLabel: t("offer.your_offer"),
      amount: 655000,
      editable: true,
      primaryAction: "send",
    },
    {
      id: "final",
      kind: "seller_final",
      title: t("offer.seller_final"),
      fieldLabel: t("offer.your_offer"),
      amount: 660000,
      editable: false,
      primaryAction: "accept",
      secondaryAction: "end",
    },
  ]);

  useEffect(() => {
    getListingDetail(params.id, locale)
      .then((response) => {
        const asking = response.data.listing.asking_price;
        setListing(response.data.listing);
        setResolvedAskingPrice(asking);
        setRounds((prev) =>
          prev.map((round) => {
            if (round.kind === "listing") {
              return { ...round, amount: asking };
            }
            if (round.kind === "buyer_counter" && round.id === "c1") {
              return {
                ...round,
                amount: Math.max(1, Math.round(asking * 0.95)),
              };
            }
            if (round.kind === "seller_counter") {
              return {
                ...round,
                amount: Math.max(1, Math.round(asking * 0.98)),
              };
            }
            if (round.kind === "buyer_counter" && round.id === "c2") {
              return {
                ...round,
                amount: Math.max(1, Math.round(asking * 0.96)),
              };
            }
            if (round.kind === "seller_final") {
              return {
                ...round,
                amount: Math.max(1, Math.round(asking * 0.97)),
              };
            }
            return round;
          }),
        );
      })
      .catch(() => {
        // Keep fallback mock data
      });
  }, [locale, params.id]);

  const visibleRounds = useMemo(
    () => rounds.slice(0, visibleCount),
    [rounds, visibleCount],
  );

  const updateAmount = (id: string, amount: number) => {
    setRounds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, amount } : r)),
    );
  };

  const handleNegotiate = (index: number) => {
    if (ended) return;
    if (index === visibleCount - 1 && visibleCount < rounds.length) {
      setVisibleCount((count) => Math.min(rounds.length, count + 1));
    }
  };

  const handleEndNegotiation = () => {
    setEnded(true);
    toast.success(t("offer.ended_success") || "Negotiation ended.");
    router.push(`/${locale}/listings/${params.id}`);
  };

  const handleSendOffer = async (round: OfferRound, index: number) => {
    if (round.amount < 1) {
      toast.error(t("offer.invalid_amount") || "Enter a valid offer amount.");
      return;
    }

    setSubmittingId(round.id);
    try {
      await submitOffer(
        params.id,
        { amount: round.amount, message: round.title },
        locale,
      );
      toast.success(t("offer.sent_success") || "Offer submitted successfully.");
      if (index === visibleCount - 1 && visibleCount < rounds.length) {
        setVisibleCount((count) => Math.min(rounds.length, count + 1));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit offer.",
      );
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className={`mb-10 ${isRTL ? "text-right" : "text-left"}`}>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
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
            {t("offer.title")}
          </h1>
          <p
            className="text-sm md:text-base max-w-2xl leading-relaxed"
            style={{ color: getColor("mutedText") }}
          >
            {t("offer.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div
            className={`lg:col-span-3 space-y-4 ${isRTL ? "lg:col-start-3 lg:row-start-1" : ""}`}
          >
            {visibleRounds.map((round, index) => {
              const isLatest = index === visibleRounds.length - 1 && !ended;
              return (
                <div
                  key={round.id}
                  className="rounded-2xl border p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                  style={{
                    backgroundColor: getColor("surface"),
                    borderColor: getColor("border"),
                    opacity: isLatest || ended ? 1 : 0.72,
                  }}
                >
                  <h3
                    className={`text-xl font-serif font-bold mb-4 ${isRTL ? "text-right" : "text-left"}`}
                    style={{ color: getColor("primaryText") }}
                  >
                    {round.title}
                  </h3>

                  <label
                    className={`block text-xs font-medium mb-2 ${isRTL ? "text-right" : "text-left"}`}
                    style={{ color: getColor("mutedText") }}
                  >
                    <DirhamText text={round.fieldLabel} />
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatInput(round.amount)}
                    disabled={!round.editable || !isLatest || ended}
                    onChange={(e) =>
                      updateAmount(round.id, parseAmount(e.target.value))
                    }
                    className={`w-full h-12 rounded-xl border px-4 text-sm outline-none mb-4 ${isRTL ? "text-right" : "text-left"}`}
                    style={{
                      backgroundColor:
                        round.editable && isLatest
                          ? getColor("surface")
                          : getColor("primaryLight"),
                      borderColor: getColor("border"),
                      color: getColor("primaryText"),
                    }}
                  />

                  {isLatest && !ended && (
                    <>
                      {round.primaryAction === "send" ? (
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          disabled={submittingId === round.id}
                          onClick={() => handleSendOffer(round, index)}
                        >
                          {submittingId === round.id
                            ? t("common.loading") || "Loading..."
                            : t("offer.send_offer")}
                        </Button>
                      ) : (
                        <div
                          className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                        >
                          <Button
                            variant="primary"
                            size="lg"
                            className="flex-1"
                            onClick={() =>
                              router.push(
                                `/${locale}/listings/${params.id}/checkout?role=buyer&price=${round.amount}`,
                              )
                            }
                          >
                            {t("offer.accept")}
                          </Button>
                          {round.secondaryAction === "negotiate" && (
                            <Button
                              variant="outline"
                              size="lg"
                              className={`flex-1 ${isRTL ? "flex-row-reverse" : ""}`}
                              style={{
                                borderColor: getColor("primary"),
                                color: getColor("primary"),
                              }}
                              leftIcon={
                                <RefreshCw className="w-4 h-4" strokeWidth={2} />
                              }
                              onClick={() => handleNegotiate(index)}
                            >
                              {t("offer.negotiate")}
                            </Button>
                          )}
                          {round.secondaryAction === "end" && (
                            <Button
                              variant="outline"
                              size="lg"
                              className="flex-1"
                              style={{
                                borderColor: getColor("border"),
                                color: getColor("primaryText"),
                              }}
                              onClick={handleEndNegotiation}
                            >
                              {t("offer.end_negotiation")}
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className={`lg:col-span-2 sticky top-24 ${isRTL ? "lg:col-start-1 lg:row-start-1" : ""}`}
          >
            <OfferDealSummary
              askingPrice={resolvedAskingPrice}
              plate_code={listing?.plate_code || "A"}
              plate_digits={listing?.plate_digits || "777"}
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
