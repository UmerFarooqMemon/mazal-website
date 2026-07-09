"use client";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";

interface FeatureCardProps {
  variant: "primary" | "outline";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  href?: string;
  features?: string[];
  onClick?: () => void;
}

export default function FeatureCard({
  variant,
  icon,
  title,
  subtitle,
  description,
  buttonText,
  href,
  features,
  onClick,
}: FeatureCardProps) {
  const { locale } = useLocale();
  const isRTL = locale === "ar";
  const isPrimary = variant === "primary";

  return (
    <div
      className={`w-full h-full rounded-2xl p-6 shadow-sm transition flex flex-col ${
        isPrimary
          ? "bg-linear-to-br from-[#EEF2F8] to-white border border-[#0A3B9E]/20"
          : "bg-white border border-gray-200 hover:shadow-md"
      } ${isRTL ? "text-right" : "text-left"}`}
    >
      {/* Icon */}
      <div className={`flex mb-2 ${isRTL ? "justify-end" : "justify-start"}`}>
        <span className="text-[#0A3B9E]">{icon}</span>
      </div>

      {/* Title & Subtitle */}
      <h3 className="text-xl font-serif font-bold text-[#041443] mb-1">
        {title}
      </h3>
      <div className="text-[#0A3B9E] text-xs font-bold mb-4">{subtitle}</div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-6 leading-relaxed flex-1">
        {description}
      </p>

      {/* Button */}
      <div className="mb-4">
        {href ? (
          <Button
            variant={isPrimary ? "primary" : "outline"}
            size="lg"
            fullWidth
            className={`rounded-full ${!isPrimary ? "border-gray-300" : ""}`}
          >
            <Link href={`/${locale}${href}`} className="block w-full">
              {buttonText}
            </Link>
          </Button>
        ) : (
          <Button
            variant={isPrimary ? "primary" : "outline"}
            size="lg"
            fullWidth
            className={`rounded-full ${!isPrimary ? "border-gray-300" : ""}`}
            onClick={onClick}
          >
            {buttonText}
          </Button>
        )}
      </div>

      {/* Features - Below Button */}
      {features && (
        <ul className="text-xs text-gray-500 space-y-1.5">
          {features.map((feature, index) => (
            <li
              key={index}
              className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span className="text-[#0A3B9E] shrink-0">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
