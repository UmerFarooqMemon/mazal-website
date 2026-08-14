"use client";

import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button, DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import {
  dashPanel,
  useDashTheme,
} from "./theme";

export type CertificateRow = {
  id: string | number;
  emirate?: string;
  plate_code?: string;
  plate_digits: string;
  status: "Pending" | "Issued";
  askingPrice?: number;
  preview?: unknown;
};

export default function DashboardCertificatesPanel({
  rows,
  filter,
  onFilterChange,
  loading,
}: {
  rows: CertificateRow[];
  filter: "All" | "Pending" | "Issued";
  onFilterChange: (filter: "All" | "Pending" | "Issued") => void;
  loading?: boolean;
}) {
  const { t, locale } = useLocale();
  const {
    DASH_BORDER,
    DASH_BTN,
    DASH_MUTED,
    DASH_PILL,
    DASH_TAB,
    DASH_TEXT,
    DASH_SURFACE,
    DASH_GREEN,
  } = useDashTheme();

  const pendingCount = rows.filter((row) => row.status === "Pending").length;
  const issuedCount = rows.filter((row) => row.status === "Issued").length;
  const visible =
    filter === "All"
      ? rows
      : rows.filter((row) => row.status === filter);

  return (
    <section
      className={dashPanel}
      style={{ borderColor: DASH_BORDER, backgroundColor: DASH_SURFACE }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-6"
        style={{ borderColor: DASH_BORDER }}
      >
        <div className="text-start">
          <h2 className="font-serif text-2xl font-normal" style={{ color: DASH_TEXT }}>
            {t("dashboard.certificates_title")}
          </h2>
          <p className="mt-1 text-sm" style={{ color: DASH_MUTED }}>
            {t("dashboard.edit_reflected")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {(
            [
              { key: "All" as const, count: rows.length },
              { key: "Pending" as const, count: pendingCount },
              { key: "Issued" as const, count: issuedCount },
            ] as const
          ).map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onFilterChange(tab.key)}
                className="inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium"
                style={{
                  background: active ? DASH_TAB : DASH_SURFACE,
                  color: active ? "#ffffff" : DASH_TEXT,
                  borderColor: active ? "transparent" : DASH_BORDER,
                }}
              >
                {t(`certificates.${tab.key.toLowerCase()}`)}
              </button>
            );
          })}
          <Link href={`/${locale}/certificates/request`}>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              className="h-[38px] rounded-full px-5 text-sm font-medium"
              style={{ background: DASH_BTN }}
            >
              {t("dashboard.order_certificate")}
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-16 text-center text-sm" style={{ color: DASH_MUTED }}>
          {t("common.loading") || "Loading..."}
        </div>
      ) : visible.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10" style={{ color: DASH_MUTED }} />
          <p className="text-sm" style={{ color: DASH_MUTED }}>
            {t("dashboard.no_certificates")}
          </p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: DASH_BORDER }}>
          {visible.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-6 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="w-full max-w-[345px] text-start">
                <NumberPlateDisplay
                  plate_code={row.plate_code}
                  plate_digits={row.plate_digits}
                  emirate={row.emirate}
                  preview={row.preview as never}
                  crop="card"
                  wrapperClassName="w-full overflow-hidden"
                />
                {row.askingPrice != null && row.askingPrice > 0 && (
                  <p className="mt-4 text-[26px] font-bold leading-8 text-black">
                    <DirhamAmount amount={row.askingPrice} weight="bold" />
                  </p>
                )}
              </div>
              <div
                className="inline-flex h-9 min-w-[120px] items-center justify-center self-start rounded-xl px-4 text-xs font-medium sm:self-center"
                style={{
                  backgroundColor:
                    row.status === "Issued" ? `${DASH_GREEN}22` : DASH_PILL,
                  color: row.status === "Issued" ? DASH_GREEN : DASH_TEXT,
                }}
              >
                {row.status === "Issued"
                  ? t("certificates.issued")
                  : t("certificates.pending")}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
