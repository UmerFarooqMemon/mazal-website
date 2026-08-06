"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Gift, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, CountryPhoneInput, Input } from "@/components/ui";
import {
  acceptGift,
  createGiftFromPurchase,
  getMyGifts,
  getMyPurchases,
  type MarketplaceGift,
  type MarketplacePurchase,
} from "@/services/marketplace";
import {
  hasNationalPhoneDigits,
  isValidCountryPhoneNumber,
  toE164FromPhoneDigits,
} from "@/lib/phone-validation";

type GiftTab = "received" | "sent" | "create" | "accept";

export default function BuyerGiftsPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();
  const [tab, setTab] = useState<GiftTab>("received");
  const [gifts, setGifts] = useState<MarketplaceGift[]>([]);
  const [purchases, setPurchases] = useState<MarketplacePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [acceptCode, setAcceptCode] = useState("");
  const [phoneFieldError, setPhoneFieldError] = useState<string | undefined>();
  const [createForm, setCreateForm] = useState({
    purchaseId: "",
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    recipientPhoneIso: "ae",
    recipientPhoneDial: "+971",
    message: "",
  });

  const giftablePurchases = useMemo(
    () => purchases.filter((purchase) => purchase.can_gift),
    [purchases],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const role = tab === "sent" || tab === "create" ? "sent" : "received";
      const [giftsResponse, purchasesResponse] = await Promise.all([
        getMyGifts(locale, role === "sent" ? "sent" : "received"),
        getMyPurchases(locale, "buyer"),
      ]);
      setGifts(giftsResponse.data.gifts || []);
      setPurchases(purchasesResponse.data.purchases || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("marketplace.gifts_load_error") || "Failed to load gifts.",
      );
    } finally {
      setLoading(false);
    }
  }, [locale, t, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAccept = async () => {
    const code = acceptCode.trim();
    if (!code) {
      toast.error(
        t("marketplace.gift_code_required") || "Invitation code is required.",
      );
      return;
    }
    setSubmitting(true);
    try {
      await acceptGift(code, locale);
      toast.success(
        t("marketplace.gift_accepted") || "Gift accepted successfully.",
      );
      setAcceptCode("");
      setTab("received");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to accept gift.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.purchaseId) {
      toast.error(
        t("marketplace.gift_purchase_required") ||
          "Select a purchase to gift.",
      );
      return;
    }
    if (!createForm.recipientName.trim()) {
      toast.error(
        t("marketplace.gift_name_required") || "Recipient name is required.",
      );
      return;
    }
    if (!createForm.recipientEmail.trim()) {
      toast.error(
        t("marketplace.gift_email_required") ||
          "Recipient email is required.",
      );
      return;
    }
    if (
      hasNationalPhoneDigits(
        createForm.recipientPhone,
        createForm.recipientPhoneDial,
      )
    ) {
      if (
        !isValidCountryPhoneNumber(
          createForm.recipientPhone,
          createForm.recipientPhoneIso,
        )
      ) {
        const phoneError =
          t("common.phone_length_invalid") ||
          "Enter the full phone number for the selected country.";
        setPhoneFieldError(phoneError);
        toast.error(phoneError);
        return;
      }
    }
    setPhoneFieldError(undefined);

    setSubmitting(true);
    try {
      const response = await createGiftFromPurchase(
        createForm.purchaseId,
        {
          recipient_name: createForm.recipientName.trim(),
          recipient_email: createForm.recipientEmail.trim(),
          recipient_phone: hasNationalPhoneDigits(
            createForm.recipientPhone,
            createForm.recipientPhoneDial,
          )
            ? toE164FromPhoneDigits(createForm.recipientPhone) || undefined
            : undefined,
          message: createForm.message.trim() || undefined,
        },
        locale,
      );

      const emailed = response.data.invitation_email_sent;
      const code =
        response.data.invitation_code ||
        response.data.gift?.invitation_code ||
        "";

      toast.success(
        emailed
          ? t("marketplace.gift_created_emailed") ||
              "Gift created. Invitation emailed to the recipient."
          : t("marketplace.gift_created_code") ||
              "Gift created. Share the invitation code as a fallback.",
      );

      if (code && !emailed) {
        toast.success(`${t("marketplace.gift_invitation_code") || "Code"}: ${code}`);
      }

      setCreateForm({
        purchaseId: "",
        recipientName: "",
        recipientEmail: "",
        recipientPhone: "",
        recipientPhoneIso: "ae",
        recipientPhoneDial: "+971",
        message: "",
      });
      setPhoneFieldError(undefined);
      setTab("sent");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create gift.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { key: GiftTab; label: string }[] = [
    {
      key: "received",
      label: t("marketplace.gifts_tab_received") || "Received",
    },
    { key: "sent", label: t("marketplace.gifts_tab_sent") || "Sent" },
    { key: "create", label: t("marketplace.gifts_tab_create") || "Send gift" },
    { key: "accept", label: t("marketplace.gifts_tab_accept") || "Accept" },
  ];

  if (themeLoading || localeLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: getColor("background") }}
      />
    );
  }

  return (
    <div
      className="min-h-screen pb-16"
      style={{ backgroundColor: getColor("background") }}
    >
      <div
        className="border-b"
        style={{
          borderColor: getColor("border"),
          backgroundColor: getColor("background"),
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Gift
              className="w-4 h-4"
              style={{ color: getColor("primary") }}
            />
            <p
              className="text-xs font-bold uppercase tracking-[0.14em]"
              style={{ color: getColor("primary") }}
            >
              {t("marketplace.gifts_eyebrow") || "Gifts"}
            </p>
          </div>
          <h1
            className="text-3xl md:text-4xl font-serif font-bold"
            style={{ color: getColor("primaryText") }}
          >
            {t("marketplace.gifts_title") || "Plate gifts"}
          </h1>
          <p
            className="mt-2 text-base max-w-2xl"
            style={{ color: getColor("secondaryText") }}
          >
            {t("marketplace.gifts_subtitle") ||
              "Send a funded purchase as a gift, or accept an invitation with your email account."}
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-8">
        <div
          className="inline-flex flex-wrap rounded-full border p-1 mb-8 gap-1"
          style={{
            borderColor: getColor("border"),
            backgroundColor: getColor("primaryLight"),
          }}
        >
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                tab === item.key
                  ? { backgroundColor: getColor("primary"), color: "#fff" }
                  : { color: getColor("secondaryText") }
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: getColor("error") }}>
            {error}
          </p>
        )}

        {(tab === "received" || tab === "sent") && (
          <div className="space-y-3">
            {loading ? (
              <p style={{ color: getColor("secondaryText") }}>
                {t("common.loading") || "Loading..."}
              </p>
            ) : gifts.length === 0 ? (
              <div
                className="rounded-[20px] border px-6 py-10 text-center"
                style={{
                  backgroundColor: getColor("surface"),
                  borderColor: getColor("border"),
                }}
              >
                <p style={{ color: getColor("secondaryText") }}>
                  {t("marketplace.gifts_empty") || "No gifts yet."}
                </p>
              </div>
            ) : (
              gifts.map((gift) => (
                <div
                  key={gift.id}
                  className="rounded-[20px] border px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  style={{
                    backgroundColor: getColor("surface"),
                    borderColor: getColor("border"),
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="font-medium"
                      style={{ color: getColor("primaryText") }}
                    >
                      {gift.purchase?.display_plate ||
                        `#${gift.purchase_id}`}
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: getColor("secondaryText") }}
                    >
                      {tab === "sent"
                        ? gift.recipient_email || gift.recipient_name
                        : gift.sender?.name || t("marketplace.gift_from_sender")}
                    </p>
                    {gift.message && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: getColor("mutedText") }}
                      >
                        {gift.message}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: getColor("primaryLight"),
                      color: getColor("primary"),
                    }}
                  >
                    {gift.status_label || gift.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "accept" && (
          <div
            className="rounded-[20px] border p-6 md:p-8 max-w-xl"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: getColor("border"),
            }}
          >
            <h2
              className="text-2xl font-serif mb-2"
              style={{ color: getColor("primaryText") }}
            >
              {t("marketplace.gift_accept_title") || "Accept a gift"}
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: getColor("secondaryText") }}
            >
              {t("marketplace.gift_accept_subtitle") ||
                "Enter the invitation code from your email. Your logged-in email must match the invite."}
            </p>
            <Input
              label={t("marketplace.gift_invitation_code") || "Invitation code"}
              value={acceptCode}
              onChange={(e) => setAcceptCode(e.target.value)}
              placeholder="ABCD12EF34GH"
            />
            <Button
              variant="primary"
              size="md"
              className="mt-5"
              onClick={() => void handleAccept()}
              disabled={submitting}
            >
              {submitting
                ? t("common.loading") || "Loading..."
                : t("marketplace.gift_accept_cta") || "Accept gift"}
            </Button>
          </div>
        )}

        {tab === "create" && (
          <div
            className="rounded-[20px] border p-6 md:p-8 max-w-xl space-y-4"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: getColor("border"),
            }}
          >
            <h2
              className="text-2xl font-serif mb-1"
              style={{ color: getColor("primaryText") }}
            >
              {t("marketplace.gift_create_title") || "Gift a purchase"}
            </h2>
            <p
              className="text-sm mb-2"
              style={{ color: getColor("secondaryText") }}
            >
              {t("marketplace.gift_create_subtitle") ||
                "Only custody-funded purchases can be gifted. The invitation code is emailed to the recipient."}
            </p>

            <div>
              <label
                className="block text-[11px] font-medium mb-2"
                style={{ color: getColor("secondaryText") }}
              >
                {t("marketplace.gift_select_purchase") || "Purchase"}
              </label>
              <select
                value={createForm.purchaseId}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    purchaseId: e.target.value,
                  }))
                }
                className="w-full rounded-xl border bg-white py-3 px-4 text-sm outline-none"
                style={{
                  borderColor: getColor("border"),
                  color: getColor("primaryText"),
                }}
              >
                <option value="">
                  {t("marketplace.gift_select_purchase_placeholder") ||
                    "Select a purchase"}
                </option>
                {giftablePurchases.map((purchase) => (
                  <option key={purchase.id} value={String(purchase.id)}>
                    {purchase.listing?.display_plate || `#${purchase.id}`}
                  </option>
                ))}
              </select>
              {giftablePurchases.length === 0 && (
                <p
                  className="text-xs mt-2"
                  style={{ color: getColor("mutedText") }}
                >
                  {t("marketplace.gift_no_purchases") ||
                    "No giftable purchases available yet."}
                </p>
              )}
            </div>

            <Input
              label={t("marketplace.gift_recipient_name") || "Recipient name"}
              value={createForm.recipientName}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  recipientName: e.target.value,
                }))
              }
            />
            <Input
              label={t("marketplace.gift_recipient_email") || "Recipient email"}
              type="email"
              value={createForm.recipientEmail}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  recipientEmail: e.target.value,
                }))
              }
              placeholder="sara@example.com"
            />
            <CountryPhoneInput
              label={t("marketplace.gift_recipient_phone") || "Phone (optional)"}
              country={createForm.recipientPhoneIso}
              value={createForm.recipientPhone}
              onChange={(recipientPhone, meta) => {
                setPhoneFieldError(undefined);
                setCreateForm((prev) => ({
                  ...prev,
                  recipientPhone,
                  recipientPhoneIso: meta.countryIso,
                  recipientPhoneDial: meta.dialCode,
                }));
              }}
              error={phoneFieldError}
            />
            <div>
              <label
                className="block text-[11px] font-medium mb-2"
                style={{ color: getColor("secondaryText") }}
              >
                {t("marketplace.gift_message") || "Message (optional)"}
              </label>
              <textarea
                value={createForm.message}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-xl border bg-white py-3 px-4 text-sm resize-none outline-none"
                style={{
                  borderColor: getColor("border"),
                  color: getColor("primaryText"),
                }}
              />
            </div>

            <div
              className="flex items-start gap-2 rounded-xl border px-4 py-3"
              style={{
                borderColor: `${getColor("primary")}33`,
                backgroundColor: `${getColor("primary")}0D`,
              }}
            >
              <Mail
                className="w-4 h-4 mt-0.5 shrink-0"
                style={{ color: getColor("primary") }}
              />
              <p
                className="text-sm"
                style={{ color: getColor("secondaryText") }}
              >
                {t("marketplace.gift_email_notice") ||
                  "Recipient email is required. The invitation code is emailed automatically."}
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => void handleCreate()}
              disabled={submitting || giftablePurchases.length === 0}
            >
              {submitting
                ? t("common.loading") || "Loading..."
                : t("marketplace.gift_create_cta") || "Send gift invitation"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
