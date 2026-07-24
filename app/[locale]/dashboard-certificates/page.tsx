"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Plus, Sparkles } from "lucide-react";
import { Button, BackButton } from "@/components/ui";
import CertificateRequestCard from "@/components/dashboard/CertificateRequestCard";
import DashboardCertificatesSkeleton from "@/components/skeletons/dashboard/valuation-certificates/DashboardCertificatesSkeleton";
import DashboardCertificateRequestCardSkeleton from "@/components/skeletons/dashboard/valuation-certificates/DashboardCertificateRequestCardSkeleton";

export default function DashboardCertificatesPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, getGradient, loading: themeLoading } = useTheme();
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Issued">(
    "All",
  );
  const [previewMap, setPreviewMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchAll = async () => {
      const [optionsRes, platesRes] = await Promise.allSettled([
        fetch("/api/number-plates/options").then((r) => r.json()),
        token
          ? fetch("/api/number-plates", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json())
          : Promise.resolve(null),
      ]);

      let previewMap: Record<string, any> = {};
      if (optionsRes.status === "fulfilled") {
        const options = optionsRes.value?.data;
        for (const em of options?.emirates || []) {
          for (const v of em?.variants || []) {
            if (v.key && v.preview) {
              previewMap[v.key] = v.preview;
              previewMap[`${v.plate_type}_${v.plate_design}`] = v.preview;
            }
          }
        }
      }

      let list: any[] = [];
      if (platesRes.status === "fulfilled" && platesRes.value) {
        const result = platesRes.value;
        if (
          result.data?.number_plates &&
          Array.isArray(result.data.number_plates)
        ) {
          list = result.data.number_plates;
        } else if (Array.isArray(result.data)) {
          list = result.data;
        } else if (Array.isArray(result)) {
          list = result;
        }
      }

      setRequests(list);
      setPreviewMap(previewMap);
      setLoading(false);
    };
    fetchAll();
  }, [token]);

  const pendingCount = requests.filter((req: any) => {
    const s = req.status?.toLowerCase() || "";
    return !["completed", "approved", "issued"].includes(s);
  }).length;

  const issuedCount = requests.filter((req: any) => {
    const s = req.status?.toLowerCase() || "";
    return ["completed", "approved", "issued"].includes(s);
  }).length;

  const filteredRequests =
    activeTab === "All"
      ? requests
      : requests.filter((req: any) => {
          const s = req.status?.toLowerCase() || "";
          if (activeTab === "Pending")
            return !["completed", "approved", "issued"].includes(s);
          else return ["completed", "approved", "issued"].includes(s);
        });

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatus = (req: any): "Pending" | "Issued" => {
    const s = req.status?.toLowerCase() || "";
    return ["completed", "approved", "issued"].includes(s)
      ? "Issued"
      : "Pending";
  };

  if (themeLoading || localeLoading) {
    return <DashboardCertificatesSkeleton />;
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className={`mb-8 ${isRTL ? "text-right" : "text-left"}`}>
          <div
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ color: getColor("mutedText") }}
          >
            {t("dashboard.dashboard_label") || "DASHBOARD"}
          </div>
          <h1
            className="text-4xl font-serif font-bold"
            style={{ color: getColor("primaryText") }}
          >
            {t("certificates.requests_title")}
          </h1>
        </div>

        {/* Fancy New Request Button */}
        <Link href={`/${locale}/certificates/request`} className="block mb-8">
          <div
            className={`rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ background: getGradient("primaryButton") }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-white font-semibold text-sm">
                {t("certificates.order_valuation")}
              </p>
              <p className="text-white/70 text-xs mt-0.5">
                {t("certificates.order_valuation_desc") ||
                  "Get your plate valued by our experts"}
              </p>
            </div>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Plus
                className="w-4 h-4"
                style={{ color: getColor("primaryButton") }}
              />
            </div>
          </div>
        </Link>

        {/* Smart Filter Tabs with Counts */}
        <div
          className={`flex flex-wrap gap-2 mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {[
            { key: "All", count: requests.length },
            { key: "Pending", count: pendingCount },
            { key: "Issued", count: issuedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="px-5 py-2 rounded-full text-sm font-medium border transition-colors"
              style={{
                backgroundColor:
                  activeTab === tab.key
                    ? getColor("primary")
                    : getColor("surface"),
                color:
                  activeTab === tab.key ? "#FFFFFF" : getColor("secondaryText"),
                borderColor:
                  activeTab === tab.key
                    ? getColor("primary")
                    : getColor("border"),
              }}
            >
              {t(`certificates.${tab.key.toLowerCase()}`)}
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                style={{
                  backgroundColor:
                    activeTab === tab.key
                      ? "rgba(255,255,255,0.2)"
                      : getColor("primaryLight"),
                  color:
                    activeTab === tab.key
                      ? "#FFFFFF"
                      : getColor("secondaryText"),
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <DashboardCertificateRequestCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <FileText
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: getColor("mutedText") }}
            />
            <p className="mb-2" style={{ color: getColor("mutedText") }}>
              {activeTab === "All"
                ? t("certificates.no_requests")
                : activeTab === "Pending"
                  ? t("certificates.no_pending")
                  : t("certificates.no_issued")}
            </p>
            {activeTab === "Issued" &&
              issuedCount === 0 &&
              pendingCount > 0 && (
                <p
                  className="text-xs mb-6"
                  style={{ color: getColor("mutedText") }}
                >
                  {t("certificates.pending_hint")}
                </p>
              )}
            {activeTab === "All" && (
              <Link href={`/${locale}/certificates/request`}>
                <Button variant="primary" className="rounded-full mt-4">
                  <Plus className="w-4 h-4" />
                  <span className="ml-2">
                    {t("certificates.order_valuation")}
                  </span>
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredRequests.map((req: any) => (
              <CertificateRequestCard
                key={req.id}
                id={req.id}
                emirate={req.emirate_label || req.emirate || "DUBAI"}
                plate_code={req.plate_code || ""}
                plate_digits={req.plate_digits || ""}
                status={getStatus(req)}
                title={t("certificates.request_submitted")}
                date={formatDate(req.created_at)}
                showDownload={getStatus(req) === "Issued"}
                downloadUrl={req.valuation_certificate_url}
                preview={
                  previewMap[req.plate_variant] ||
                  previewMap[`${req.plate_type}_${req.plate_design}`] ||
                  req.preview
                }
              />
            ))}
          </div>
        )}

        {/* Back — Arabic (RTL): bottom-left; English (LTR): bottom-left */}
        <div className={`mt-12 flex ${isRTL ? "justify-end" : "justify-start"}`}>
          <BackButton href={`/${locale}`}>{t("common.back")}</BackButton>
        </div>
      </div>
    </div>
  );
}
