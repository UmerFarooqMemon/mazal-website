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
  title = "Request Submitted",
  date,
  showDownload = false,
  previewUrl,
}: CertificateRequestCardProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  const statusColors = {
    Issued: "bg-green-50 text-green-700",
    Pending: "bg-orange-50 text-orange-700",
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
    >
      {/* Left Section */}
      <div
        className={`flex flex-col gap-1 ${isRTL ? "items-end text-right" : "items-start text-left"}`}
      >
        <span
          className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${statusColors[status]}`}
        >
          {status}
        </span>
        <h4 className="text-base font-medium text-[#041443] mt-1">{title}</h4>
        <p className="text-xs text-gray-500">{date}</p>
      </div>

      {/* Right Section */}
      <div
        className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {/* Plate Preview */}
        {previewUrl ? (
          <div className="relative w-27.5 h-9 shrink-0 rounded-md overflow-hidden border border-gray-200 bg-white">
            <Image
              src={previewUrl}
              alt="Plate Preview"
              fill
              className="object-contain p-0.5"
              sizes="110px"
              unoptimized
            />
          </div>
        ) : (
          <div className="bg-[#F3F4F8] border border-gray-200 rounded-lg py-2 px-3 flex items-center gap-1 shrink-0">
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

        {showDownload ? (
          <button className="flex items-center justify-center h-8 w-8 rounded-full text-[#0A3B9E] hover:bg-[#0A3B9E]/5 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href={`/${locale}/valuation/${id}`}
            className="text-xs text-[#0A3B9E] font-medium hover:underline whitespace-nowrap flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            {t("certificates.view_status") || "View Status"}
          </Link>
        )}
      </div>
    </div>
  );
}
