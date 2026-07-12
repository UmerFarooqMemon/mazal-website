"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { Download, Eye } from "lucide-react";

type RequestStatus = "Pending" | "Issued";

interface CertificateRequestCardProps {
  id: string | number;
  emirate?: string;
  plate_code?: string;
  plate_digits?: string;
  status: RequestStatus;
  title?: string;
  date: string;
  showDownload?: boolean;
  previewUrl?: string;
}

export default function CertificateRequestCard({
  id,
  emirate = "DUBAI",
  plate_code = "M",
  plate_digits = "777",
  status,
  title,
  date,
  showDownload = false,
  previewUrl,
}: CertificateRequestCardProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  const statusConfig = {
    Issued: {
      backgroundColor: "#E8FFE2",
      color: "#015C14",
      label: t("certificates.issued"),
    },
    Pending: {
      backgroundColor: "#FFF4E2",
      color: "#93651B",
      label: t("certificates.pending"),
    },
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      {/* ============ MOBILE LAYOUT ============ */}
      <div
        className="flex flex-col sm:hidden gap-3"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Badge + Title + Date */}
        <div className="flex flex-col gap-1.5">
          <span
            className="inline-flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: config.backgroundColor,
              color: config.color,
            }}
          >
            {config.label}
          </span>
          <h4 className="text-sm font-medium text-[#041443]">
            {title || t("certificates.request_submitted")}
          </h4>
          <p className="text-[10px] text-gray-500">{date}</p>
        </div>

        {/* Plate + Action */}
        <div className="flex items-center justify-between gap-3">
          {/* Plate */}
          {previewUrl ? (
            <div className="relative w-25 h-8 shrink-0 rounded-md overflow-hidden border border-gray-200 bg-white">
              <Image
                src={previewUrl}
                alt={t("certificates.plate_preview") || "Plate"}
                fill
                className="object-contain p-0.5"
                sizes="100px"
                unoptimized
              />
            </div>
          ) : (
            <div className="bg-[#F3F4F8] border border-gray-200 rounded-lg py-1.5 px-2.5 shrink-0">
              <div className="text-center">
                <div className="text-[6px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                  {emirate}
                </div>
                <div className="flex items-center gap-0.5 text-[11px] font-serif font-bold text-[#0A3B9E] leading-none">
                  <span>{plate_code}</span>
                  <span className="text-gray-300 font-light text-[10px]">
                    |
                  </span>
                  <span>{plate_digits}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action */}
          {showDownload ? (
            <button className="flex items-center justify-center h-9 w-9 rounded-full text-[#0A3B9E] bg-[#0A3B9E]/5 hover:bg-[#0A3B9E]/10 transition-colors shrink-0">
              <Download className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={`/${locale}/valuation/${id}`}
              className="text-[11px] text-[#0A3B9E] font-medium hover:underline whitespace-nowrap flex items-center gap-1 shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              {t("certificates.view_status")}
            </Link>
          )}
        </div>
      </div>

      {/* ============ DESKTOP LAYOUT ============ */}
      <div
        className={`hidden sm:flex items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {/* Left Side: Badge + Text */}
        <div
          className={`flex flex-col gap-1.5 ${isRTL ? "items-end text-right" : "items-start text-left"}`}
        >
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold"
            style={{
              backgroundColor: config.backgroundColor,
              color: config.color,
            }}
          >
            {config.label}
          </span>
          <h4 className="text-sm sm:text-base font-medium text-[#041443]">
            {title || t("certificates.request_submitted")}
          </h4>
          <p className="text-[10px] sm:text-xs text-gray-500">{date}</p>
        </div>

        {/* Right Side: Plate + Action */}
        <div
          className={`flex items-center gap-3 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {/* Plate */}
          {previewUrl ? (
            <div className="relative w-27.5 h-9 shrink-0 rounded-md overflow-hidden border border-gray-200 bg-white">
              <Image
                src={previewUrl}
                alt={t("certificates.plate_preview") || "Plate"}
                fill
                className="object-contain p-0.5"
                sizes="110px"
                unoptimized
              />
            </div>
          ) : (
            <div className="bg-[#F3F4F8] border border-gray-200 rounded-lg py-2 px-3 shrink-0">
              <div className="text-center">
                <div className="text-[7px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                  {emirate}
                </div>
                <div className="flex items-center gap-1 text-xs font-serif font-bold text-[#0A3B9E] leading-none">
                  <span>{plate_code}</span>
                  <span className="text-gray-300 font-light">|</span>
                  <span>{plate_digits}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action */}
          {showDownload ? (
            <button className="flex items-center justify-center h-8 w-8 rounded-full text-[#0A3B9E] hover:bg-[#0A3B9E]/5 transition-colors shrink-0">
              <Download className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={`/${locale}/valuation/${id}`}
              className="text-xs text-[#0A3B9E] font-medium hover:underline whitespace-nowrap flex items-center gap-1 shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              {t("certificates.view_status")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
