"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Handshake, RefreshCw } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import OfferDealSummary from "./OfferDealSummary";

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

  const askingPrice = 680000;

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

  const updateAmount = (id: string, amount: number) => {
    setRounds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, amount } : r)),
    );
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
            {rounds.map((round) => (
              <div
                key={round.id}
                className="rounded-2xl border p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                style={{
                  backgroundColor: getColor("surface"),
                  borderColor: getColor("border"),
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
                  {round.fieldLabel}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatInput(round.amount)}
                  disabled={!round.editable}
                  onChange={(e) =>
                    updateAmount(round.id, parseAmount(e.target.value))
                  }
                  className={`w-full h-12 rounded-xl border px-4 text-sm outline-none mb-4 ${isRTL ? "text-right" : "text-left"}`}
                  style={{
                    backgroundColor: round.editable
                      ? getColor("surface")
                      : getColor("primaryLight"),
                    borderColor: getColor("border"),
                    color: getColor("primaryText"),
                  }}
                />

                {round.primaryAction === "send" ? (
                  <Button variant="primary" size="lg" fullWidth>
                    {t("offer.send_offer")}
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
                      >
                        {t("offer.end_negotiation")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            className={`lg:col-span-2 sticky top-24 ${isRTL ? "lg:col-start-1 lg:row-start-1" : ""}`}
          >
            <OfferDealSummary askingPrice={askingPrice} />
          </div>
        </div>
      </div>
    </div>
  );
}
