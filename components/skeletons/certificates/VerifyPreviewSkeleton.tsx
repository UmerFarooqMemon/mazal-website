"use client";

import { useEffect, useState } from "react";
import CertificateCardSkeleton from "@/components/skeletons/certificates/CertificateCardSkeleton";

export default function VerifyPreviewSkeleton() {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    setIsRTL(pathSegments[1] === "ar");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Mobile */}
      <section className="md:hidden flex-1 flex flex-col px-6 pt-6 pb-8">
        <div
          className={`mb-6 ${isRTL ? "flex justify-end" : "flex justify-start"}`}
        >
          <div className="w-40 h-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <CertificateCardSkeleton />

        <div className="mt-10">
          <div className="h-px w-full mb-7 bg-gray-200" />
          <div
            className={`w-20 h-9 bg-gray-200 rounded-full animate-pulse ${isRTL ? "ml-auto" : ""}`}
          />
        </div>
      </section>

      {/* Desktop */}
      <section className="hidden md:flex flex-1 flex-col items-center px-6 lg:px-8 py-14 lg:py-16">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="w-56 lg:w-72 h-10 lg:h-12 bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="w-36 h-10 bg-gray-200 rounded-full animate-pulse mb-10" />

          <div className="w-full max-w-[896px]">
            <CertificateCardSkeleton />
          </div>

          <div className="mt-10 w-24 h-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </section>
    </div>
  );
}
