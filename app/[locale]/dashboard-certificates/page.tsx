"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import CertificateRequestCard from "@/components/dashboard/CertificateRequestCard";
import { FileText, Plus, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

export default function DashboardCertificatesPage() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, getGradient } = useTheme();
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Issued">(
    "All",
  );

  useEffect(() => {
    const fetchRequests = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/number-plates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        let list: any[] = [];
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
        setRequests(list);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token]);

  // Smart filtering
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border rounded-2xl p-5 animate-pulse"
                style={{ borderColor: getColor("border") }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-40 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Smart Empty State */
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
                plate_code={req.plate_code || "M"}
                plate_digits={req.plate_digits || "77"}
                status={getStatus(req)}
                title={t("certificates.request_submitted")}
                date={formatDate(req.created_at)}
                showDownload={getStatus(req) === "Issued"}
              />
            ))}
          </div>
        )}

        {/* Back */}
        <div className="mt-12">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border text-sm font-medium transition-colors shadow-sm"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: getColor("border"),
              color: getColor("secondaryText"),
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
