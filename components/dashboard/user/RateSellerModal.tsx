"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";
import {
  MarketplaceRequestError,
  rateSeller,
} from "@/services/marketplace";
import { DASH_BORDER, DASH_BTN, DASH_MUTED, DASH_TEXT } from "./theme";

export default function RateSellerModal({
  open,
  purchaseId,
  onClose,
  onRated,
}: {
  open: boolean;
  purchaseId: number | null;
  onClose: () => void;
  onRated?: () => void;
}) {
  const { t, locale } = useLocale();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(0);
      setHover(0);
      setComment("");
      setSubmitting(false);
    }
  }, [open, purchaseId]);

  if (!open) return null;

  const submit = async () => {
    if (!purchaseId || !rating || submitting) return;
    setSubmitting(true);
    try {
      const trimmed = comment.trim();
      await rateSeller(
        purchaseId,
        {
          rating,
          ...(trimmed ? { comment: trimmed.slice(0, 2000) } : {}),
        },
        locale,
      );
      toast.success(t("dashboard.rating_thanks") || "Thanks for your rating.");
      onRated?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof MarketplaceRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : t("dashboard.rating_failed");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="relative w-full max-w-[482px] rounded-2xl bg-white p-8 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 text-[#545e6f] hover:text-[#081123]"
          aria-label={t("common.close") || "Close"}
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          className="font-serif text-[28px] font-semibold leading-8"
          style={{ color: DASH_TEXT }}
        >
          {t("dashboard.rate_seller_title")}
        </h2>
        <p className="mt-3 text-sm leading-5" style={{ color: DASH_MUTED }}>
          {t("dashboard.rate_seller_body")}
        </p>

        <div className="mt-6 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = (hover || rating) >= value;
            return (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(value)}
                className="p-0.5"
                aria-label={`${value}`}
              >
                <Star
                  className="h-7 w-7"
                  fill={active ? "#e0ae57" : "none"}
                  color={active ? "#e0ae57" : "#d9dee6"}
                />
              </button>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder={t("dashboard.rate_seller_placeholder")}
          className="mt-6 w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
          style={{ borderColor: DASH_BORDER, color: DASH_TEXT }}
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="primary"
            disabled={!rating || submitting || !purchaseId}
            onClick={submit}
            className="h-11 flex-1 rounded-full text-base font-medium"
            style={{ background: DASH_BTN }}
          >
            {submitting
              ? t("common.loading") || "Loading..."
              : t("dashboard.submit_rating")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onClose}
            className="h-11 flex-1 rounded-full border-[#d9dee6] text-base font-medium text-[#081123]"
          >
            {t("dashboard.no_thanks")}
          </Button>
        </div>
      </div>
    </div>
  );
}
