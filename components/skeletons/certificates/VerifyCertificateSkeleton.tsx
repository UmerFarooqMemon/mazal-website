"use client";

import { useEffect, useState } from "react";
import CertificateCardSkeleton from "@/components/skeletons/certificates/CertificateCardSkeleton";

export default function VerifyCertificateSkeleton() {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    setIsRTL(pathSegments[1] === "ar");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFAF7]">
      {/* Mobile: Form */}
      <section className="md:hidden flex-1 flex flex-col px-6 pt-6 pb-8 bg-white">
        <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
          <div
            className={`w-40 h-3 bg-gray-200 rounded mb-3 animate-pulse ${isRTL ? "ml-auto" : ""}`}
          />
          <div
            className={`w-full max-w-[300px] h-8 bg-gray-200 rounded-lg animate-pulse mb-2 ${isRTL ? "ml-auto" : ""}`}
          />
          <div
            className={`w-2/3 max-w-[220px] h-8 bg-gray-200 rounded-lg animate-pulse ${isRTL ? "ml-auto" : ""}`}
          />
        </div>

        <div
          className={`w-10 h-3 bg-gray-200 rounded mb-1.5 animate-pulse ${isRTL ? "ml-auto" : ""}`}
        />
        <div className="w-full h-11 bg-gray-100 rounded-lg border border-gray-200 animate-pulse" />
        <div className="mt-5 w-full h-12 bg-gray-200 rounded-full animate-pulse" />

        <div className="mt-auto pt-16">
          <div className="h-px w-full mb-7 bg-gray-200" />
          <div
            className={`w-20 h-9 bg-gray-200 rounded-full animate-pulse ${isRTL ? "ml-auto" : ""}`}
          />
        </div>
      </section>

      {/* Desktop */}
      <div className="hidden md:block flex-1">
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-14 lg:py-16 flex flex-col items-center text-center">
            <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="w-full max-w-xl h-12 lg:h-14 bg-gray-200 rounded-lg animate-pulse mb-3" />
            <div className="w-full max-w-md h-12 lg:h-14 bg-gray-200 rounded-lg animate-pulse mb-4" />
            <div className="w-80 max-w-full h-6 bg-gray-200 rounded animate-pulse mb-10" />
            <div className="w-64 max-w-full h-5 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="w-full max-w-[680px] h-16 bg-gray-100 rounded-full border border-gray-200 animate-pulse" />
          </div>
        </section>

        <section className="px-6 lg:px-8 py-14 lg:py-16">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-36 h-10 bg-gray-200 rounded-full animate-pulse mb-10" />
            <div className="w-full max-w-[896px]">
              <CertificateCardSkeleton />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
