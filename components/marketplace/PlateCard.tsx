"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "../../context/LocaleContext";

interface PlateCardProps {
  id: string | number;
  emirate: string;
  code: string;
  price: number;
  type: "DIRECT" | "AUCTION";
  views: number;
  seller: string;
  rating: number;
  isFavorite?: boolean;
  isBlurred?: boolean;
}

export default function PlateCard({
  id,
  emirate,
  code,
  price,
  type,
  views,
  seller,
  rating,
  isFavorite = false,
}: PlateCardProps) {
  const { locale } = useLocale();
  const isRTL = locale === "ar";

  // Format the price based on the locale (Arabic numerals for AR, English for EN)
  const formattedPrice = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-US",
    {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    },
  ).format(price);

  // Format views similarly
  const formattedViews = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-US",
  ).format(views);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(10,59,158,0.25)] hover:-translate-y-1.5 cursor-pointer min-h-70 flex flex-col">
      {/* Card Header: Type and Views */}
      <div
        className={`flex justify-between items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {type}
        </span>
        <div
          className={`flex items-center gap-1 text-gray-400 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {isFavorite ? (
            <svg
              className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          )}
          <span>{formattedViews}</span>
        </div>
      </div>
      <Link href={`/${locale}/listings/${id}`}>
        <div className="relative w-full aspect-2.5/1 mb-4 bg-white overflow-hidden">
          <Image
            src="/home-new.png"
            alt={`${emirate} ${code} Plate`}
            fill
            className="object-contain"
          />
        </div>
      </Link>

      {/* Price and Seller Information */}
      <div className="flex flex-col gap-1 mt-auto">
        {/* Price */}
        <div className="text-2xl text-center font-bold text-[#041443]">
          {formattedPrice}
        </div>

        {/* Seller and Rating */}
        <div
          className={`flex items-center justify-center gap-2 text-xs text-gray-400 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="font-medium text-gray-500">{seller}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="flex items-center gap-0.5">
            <svg
              className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {rating}
          </span>
        </div>
      </div>
    </div>
  );
}
