"use client";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { Download } from "lucide-react";

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
  downloadUrl?: string;
  preview?: any;
}

export default function CertificateRequestCard({
  id,
  emirate = "DUBAI",
  plate_code = "",
  plate_digits = "",
  status,
  title,
  date,
  showDownload = false,
  downloadUrl,
  preview,
}: CertificateRequestCardProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor } = useTheme();

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
      className="rounded-2xl p-4 shadow-sm overflow-hidden"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
        borderWidth: "1px",
      }}
    >
      {/* Desktop: 3 columns */}
      <div className={`hidden sm:flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
        {/* Column 1: Badge + Title + Date */}
        <div
          className={`flex flex-col gap-1.5 shrink-0 ${isRTL ? "items-end text-right" : "items-start text-left"}`}
          style={{ minWidth: "120px", maxWidth: "180px" }}
        >
          <span
            className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: config.backgroundColor,
              color: config.color,
            }}
          >
            {config.label}
          </span>
          <h4
            className="text-sm font-medium"
            style={{ color: getColor("primaryText") }}
          >
            {title || t("certificates.request_submitted")}
          </h4>
          <p
            className="text-[10px]"
            style={{ color: getColor("secondaryText") }}
          >
            {date}
          </p>
        </div>

        {/* Column 2: Plate */}
        <div className="flex-1">
          <NumberPlateDisplay
            plate_code={plate_code}
            plate_digits={plate_digits}
            emirate={emirate}
            preview={preview}
            crop="card"
            wrapperClassName="w-full overflow-hidden flex-1"
          />
        </div>

        {/* Column 3: Action */}
        <div className="shrink-0">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center justify-center h-9 w-9 rounded-full transition-colors"
              style={{
                color: getColor("primary"),
                backgroundColor: `${getColor("primary")}10`,
              }}
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <span
          className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[10px] font-bold mb-2"
          style={{
            backgroundColor: config.backgroundColor,
            color: config.color,
          }}
        >
          {config.label}
        </span>
        <NumberPlateDisplay
          plate_code={plate_code}
          plate_digits={plate_digits}
          emirate={emirate}
          preview={preview}
          crop="card"
        />
        <div
          className={`flex items-center justify-between mt-2 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ position: "relative", zIndex: 10 }}
        >
          <p
            className="text-[9px]"
            style={{ color: getColor("secondaryText") }}
          >
            {date}
          </p>
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center justify-center h-8 w-8 rounded-full transition-colors relative"
              style={{
                color: getColor("primary"),
                backgroundColor: `${getColor("primary")}10`,
                zIndex: 11,
              }}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
