"use client";
import { useEffect, useState } from "react";

export default function DashboardCertificateRequestCardSkeleton() {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    setIsRTL(pathSegments[1] === "ar");
  }, []);

  return (
    <div className="rounded-2xl p-4 bg-white border border-gray-200 animate-pulse">
      <div
        className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        {/* Badge + Title + Date */}
        <div
          className={`flex flex-col gap-1.5 shrink-0 ${isRTL ? "items-end" : "items-start"}`}
          style={{ minWidth: "120px", maxWidth: "180px" }}
        >
          <div className="w-16 h-5 bg-gray-200 rounded-full" />
          <div className="w-28 h-4 bg-gray-200 rounded" />
          <div className="w-20 h-3 bg-gray-200 rounded" />
        </div>

        {/* Plate */}
        <div className="flex-1 flex justify-center items-center">
          <div className="w-32 h-12 bg-gray-200 rounded" />
        </div>

        {/* Action */}
        <div className="shrink-0">
          <div className="w-16 h-3 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
