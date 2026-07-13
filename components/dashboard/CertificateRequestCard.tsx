"use client";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import PlateWithOverlay from "@/components/ui/PlateWithOverlay";
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
  const { getColor } = useTheme();

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
    <div
      className="rounded-2xl p-4 shadow-sm"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
        borderWidth: "1px",
      }}
    >
      {/* ============ 3 COLUMNS LAYOUT - ALL DEVICES ============ */}
      <div
        className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {/* Column 1: Badge + Title + Date */}
        <div
          className={`flex flex-col gap-1.5 shrink-0 ${isRTL ? "items-end text-right" : "items-start text-left"}`}
          style={{ minWidth: "120px", maxWidth: "180px" }}
        >
          <span
            className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold"
            style={{
              backgroundColor: config.backgroundColor,
              color: config.color,
            }}
          >
            {config.label}
          </span>
          <h4
            className="text-xs sm:text-sm font-medium"
            style={{ color: getColor("primaryText") }}
          >
            {title || t("certificates.request_submitted")}
          </h4>
          <p
            className="text-[9px] sm:text-[10px]"
            style={{ color: getColor("secondaryText") }}
          >
            {date}
          </p>
        </div>

        {/* Column 2: Plate - Centered */}
        <div className="flex-1 flex justify-center items-center">
          <PlateWithOverlay
            plate_code={plate_code}
            plate_digits={plate_digits}
            emirate={emirate}
            isMobile={false}
            width={isRTL ? 140 : 140}
          />
        </div>

        {/* Column 3: Action */}
        <div className="shrink-0">
          {showDownload ? (
            <button
              className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-colors"
              style={{
                color: getColor("primary"),
                backgroundColor: `${getColor("primary")}10`,
              }}
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          ) : (
            <Link
              href={`/${locale}/valuation/${id}`}
              className="text-[10px] sm:text-xs font-medium hover:underline whitespace-nowrap flex items-center gap-1"
              style={{ color: getColor("primary") }}
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {t("certificates.view_status")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
