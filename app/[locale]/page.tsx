"use client";
import { useLocale } from "@/context/LocaleContext";
import HeroLeft from "../../components/home/HeroLeft";
import HeroRight from "../../components/home/HeroRight";
import FeaturesSection from "../../components/home/FeaturesSection";
import TrendingSection from "../../components/home/TrendingSection";
import EscrowSection from "../../components/home/EscrowSection";
import CTASection from "../../components/home/CTASection";

export default function HomePage() {
  const { locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <>
      {/* Section 1: The Hero - Soft & Elegant Background */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 overflow-hidden rounded-3xl shadow-sm mt-6 mb-12">
        {/* Background Image Layer - Softened & Desaturated */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-car.jpg"
            alt="Soft luxury car and desert background"
            className="w-full h-full object-cover object-center opacity-60 blur-[2px]"
          />
          <div className="absolute inset-0 bg-linear-to-b from-white/90 via-white/50 to-white/10"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
              isRTL ? "lg:grid-flow-dense" : ""
            }`}
          >
            {/* HeroLeft: On the Left for English, On the Right for Arabic */}
            <div
              className={`${isRTL ? "lg:col-start-2 lg:row-start-1" : "lg:col-start-1 lg:row-start-1"}`}
            >
              <HeroLeft />
            </div>

            {/* HeroRight: On the Right for English, On the Left for Arabic */}
            <div
              className={`${isRTL ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-2 lg:row-start-1"}`}
            >
              <HeroRight />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Advantages */}
      <FeaturesSection />

      {/* Section 3: Popular Plates */}
      <TrendingSection />

      {/* Section 4: The Trust */}
      <EscrowSection />

      {/* Section 5: CTA (added here) */}
      <CTASection />
    </>
  );
}
