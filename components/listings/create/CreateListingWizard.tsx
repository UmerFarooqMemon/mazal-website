"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import Stepper, { type StepItem } from "@/components/private-deal/Stepper";
import PlatePriceFormStep from "./PlatePriceFormStep";
import BoostStep from "./BoostStep";
import GoLiveStep from "./GoLiveStep";

export type BoostTier = "silver" | "gold" | "diamond";

export interface CreateListingData {
  emirate: string;
  code: string;
  digits: string;
  hideCode: boolean;
  price: string;
  notes: string;
  ownershipFileName: string;
  boostTier: BoostTier;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

const INITIAL: CreateListingData = {
  emirate: "Dubai",
  code: "AA",
  digits: "777",
  hideCode: false,
  price: "68000",
  notes: "",
  ownershipFileName: "",
  boostTier: "silver",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardName: "",
};

type Step = 1 | 2 | 3;

export default function CreateListingWizard() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<CreateListingData>(INITIAL);
  const [loading, setLoading] = useState(false);

  const onChange = (patch: Partial<CreateListingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const steps: StepItem[] = useMemo(
    () => [
      {
        key: "plate",
        label: t("listings.step_plate_price"),
        status:
          step > 1 ? "completed" : step === 1 ? "current" : "upcoming",
      },
      {
        key: "boost",
        label: t("listings.step_fee_boost"),
        status:
          step > 2 ? "completed" : step === 2 ? "current" : "upcoming",
      },
      {
        key: "live",
        label: t("listings.step_go_live"),
        status: step === 3 ? "current" : "upcoming",
      },
    ],
    [step, t],
  );

  const eyebrow =
    step === 1
      ? t("listings.create_listing_eyebrow")
      : step === 2
        ? t("listings.featured_listing_eyebrow")
        : t("listings.go_live_eyebrow");

  const title =
    step === 1
      ? t("listings.publish_title")
      : step === 2
        ? t("listings.boost_title")
        : t("listings.publish_title");

  const description =
    step === 2 ? t("listings.boost_desc") : t("listings.publish_desc");

  const handleProceed = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success(t("listings.publish_success"));
      router.push(`/${locale}/marketplace`);
    } catch {
      toast.error(t("common.error_submission") || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-16">
      <div className="border-b border-[#E5E7EB] bg-[#FAFAF8]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10 pb-8">
          <p
            className={`text-xs font-bold uppercase tracking-[0.14em] text-[#0A3B9E] mb-3 ${isRTL ? "text-right" : "text-left"}`}
          >
            {eyebrow}
          </p>
          <h1
            className={`text-3xl md:text-4xl font-serif font-bold text-[#041443] leading-tight max-w-xl ${isRTL ? "text-right ml-auto" : "text-left"}`}
          >
            {title}
          </h1>
          <p
            className={`text-[#6B7280] text-base mt-3 max-w-2xl leading-relaxed ${isRTL ? "text-right ml-auto" : "text-left"}`}
          >
            {description}
          </p>
          <Stepper steps={steps} />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10">
        {step === 1 && (
          <PlatePriceFormStep
            data={data}
            onChange={onChange}
            onBack={() => router.push(`/${locale}/marketplace`)}
            onContinue={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <BoostStep
            data={data}
            onChange={onChange}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <GoLiveStep
            data={data}
            onChange={onChange}
            onBack={() => setStep(2)}
            onProceed={handleProceed}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
