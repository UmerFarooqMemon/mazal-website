"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import AuctionPageHero from "@/components/auction/AuctionPageHero";
import AddPlateForm from "@/components/auction/AddPlateForm";

export default function AddAuctionPlatePage() {
  const { locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <AuctionPageHero />
        </div>
      </section>

      <section
        className="px-4 sm:px-6 lg:px-8 pb-16"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, #F2F8F3 40px, #F2F8F3 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <AddPlateForm
            onBack={() => router.push(`/${locale}/auctions`)}
            onContinue={() => router.push(`/${locale}/auctions`)}
          />
        </div>
      </section>
    </div>
  );
}
