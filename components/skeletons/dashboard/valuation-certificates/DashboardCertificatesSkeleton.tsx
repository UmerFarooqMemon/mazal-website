"use client";
import { useEffect, useState } from "react";
import CertificateRequestCardSkeleton from "./DashboardCertificateRequestCardSkeleton";

export default function DashboardCertificatesSkeleton() {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    setIsRTL(pathSegments[1] === "ar");
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className={`mb-8 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="w-20 h-3 bg-gray-200 rounded mb-1 animate-pulse" />
          <div className="w-56 h-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* New Request Button */}
        <div className="mb-8">
          <div className="rounded-2xl p-5 bg-gray-200 animate-pulse">
            <div
              className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div className="w-10 h-10 bg-gray-300 rounded-full shrink-0" />
              <div className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                <div className="w-32 h-4 bg-gray-300 rounded mb-1" />
                <div className="w-48 h-3 bg-gray-300 rounded" />
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full shrink-0" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          className={`flex flex-wrap gap-2 mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {[1, 2, 3].map((tab) => (
            <div
              key={tab}
              className="w-20 h-9 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Certificate Cards */}
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((card) => (
            <CertificateRequestCardSkeleton key={card} />
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <div className="w-24 h-9 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
