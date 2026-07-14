"use client";
import { useEffect, useState } from "react";

export default function CertificatesRequestSkeleton() {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    setIsRTL(pathSegments[1] === "ar");
  }, []);

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* Features Section - Desktop */}
          <div
            className={`hidden lg:flex flex-col justify-center ${isRTL ? "lg:order-2 items-end text-right" : "lg:order-1 items-start text-left"}`}
          >
            <div className="w-32 h-3 bg-gray-200 rounded mb-3 animate-pulse" />
            <div className="space-y-3 mb-6">
              <div className="w-3/4 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-1/2 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2 mb-8">
              <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-5 h-5 bg-gray-200 rounded-full shrink-0 animate-pulse" />
                  <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Form Skeleton */}
          <div
            className={`${isRTL ? "lg:order-1" : "lg:order-2"} lg:col-span-1`}
          >
            <div className="rounded-2xl border border-gray-200 p-8 bg-white">
              <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
                <div className="w-28 h-3 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse" />
              </div>

              <div className="space-y-5">
                <div>
                  <div className="w-12 h-3 bg-gray-200 rounded mb-1.5 animate-pulse inline-block" />
                  <div className="w-full h-11 bg-gray-100 rounded-xl" />
                </div>
                <div>
                  <div className="w-20 h-3 bg-gray-200 rounded mb-1.5 animate-pulse inline-block" />
                  <div className="w-full h-11 bg-gray-100 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="w-10 h-3 bg-gray-200 rounded mb-1.5 animate-pulse inline-block" />
                    <div className="w-full h-11 bg-gray-100 rounded-xl" />
                  </div>
                  <div>
                    <div className="w-10 h-3 bg-gray-200 rounded mb-1.5 animate-pulse inline-block" />
                    <div className="w-full h-11 bg-gray-100 rounded-xl" />
                  </div>
                </div>
                <div>
                  <div className="w-16 h-3 bg-gray-200 rounded mb-1.5 animate-pulse inline-block" />
                  <div className="w-full h-11 bg-gray-100 rounded-xl" />
                </div>
                <div>
                  <div className="w-20 h-3 bg-gray-200 rounded mb-1.5 animate-pulse inline-block" />
                  <div className="w-full h-24 bg-gray-100 rounded-xl" />
                </div>
                <div>
                  <div className="w-24 h-3 bg-gray-200 rounded mb-1.5 animate-pulse inline-block" />
                  <div className="w-full h-11 bg-gray-100 rounded-xl" />
                </div>
                <div className="flex items-center border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse shrink-0" />
                  <div className={`${isRTL ? "mr-3" : "ml-3"}`}>
                    <div className="w-24 h-4 bg-gray-200 rounded mb-1 animate-pulse" />
                    <div className="w-48 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <div className="px-5 pt-5">
                    <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex justify-center px-4 py-4">
                    <div className="w-64 h-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-full h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex justify-center">
                  <div className="w-64 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview & FAQ - Desktop */}
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-gray-200 p-8 bg-white mb-6 animate-pulse">
            <div className="w-48 h-6 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
