"use client";
import { useEffect, useState } from "react";

interface AuthSkeletonProps {
  locale?: string;
  type?:
    | "login"
    | "register"
    | "forgot-password"
    | "verify-code"
    | "reset-password"
    | "password-updated";
}

export default function AuthSkeleton({
  locale = "en",
  type = "login",
}: AuthSkeletonProps) {
  const [currentLocale, setCurrentLocale] = useState(locale);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    const urlLocale = pathSegments[1];
    if (urlLocale === "ar" || urlLocale === "en") {
      setCurrentLocale(urlLocale);
    }
  }, []);

  const isRTL = currentLocale === "ar";

  // Simple card skeleton for small auth pages
  const SimpleCardSkeleton = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-200 bg-white relative animate-pulse">
        {/* Close button */}
        {type !== "password-updated" && (
          <div
            className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} h-9 w-9 bg-gray-200 rounded-lg`}
          />
        )}
        {children}
      </div>
    </div>
  );

  // Logo skeleton
  const LogoSkeleton = () => (
    <div className="flex justify-center mb-8 pt-4">
      <div className="w-28 h-10 bg-gray-200 rounded-lg" />
    </div>
  );

  // Badge skeleton
  const BadgeSkeleton = ({ center = false }: { center?: boolean }) => (
    <div
      className={`flex items-center gap-2 mb-4 ${center ? "justify-center" : ""} ${isRTL ? "flex-row-reverse" : ""}`}
    >
      <div className="w-4 h-4 bg-gray-200 rounded" />
      <div className="w-24 h-3 bg-gray-200 rounded" />
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-100"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {type === "login" ? (
        /* Login Layout */
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-stretch gap-0 rounded-3xl overflow-hidden shadow-2xl bg-white">
          <div
            className={`hidden lg:flex w-full lg:w-1/2 bg-linear-to-br from-gray-200 to-gray-300 animate-pulse items-center justify-center p-12 ${isRTL ? "lg:order-2" : "lg:order-1"}`}
          >
            <div className="w-full max-w-sm space-y-6">
              <div className="w-32 h-6 bg-white/40 rounded-full" />
              <div className="space-y-3">
                <div className="w-3/4 h-10 bg-white/40 rounded-xl" />
                <div className="w-1/2 h-10 bg-white/40 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="w-2/3 h-4 bg-white/40 rounded" />
                <div className="w-1/2 h-4 bg-white/40 rounded" />
              </div>
              <div className="w-full h-48 bg-white/30 rounded-2xl mt-8" />
            </div>
          </div>
          <div
            className={`w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 ${isRTL ? "lg:order-1" : "lg:order-2"}`}
          >
            <div className="w-full max-w-md mx-auto animate-pulse">
              <LogoSkeleton />
              <div
                className={`flex items-center justify-between mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                </div>
                <div
                  className={`flex rounded-full border border-gray-200 p-0.5 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-16 h-7 bg-gray-200 rounded-full" />
                  <div className="w-16 h-7" />
                </div>
              </div>
              <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                <div className="w-48 h-8 bg-gray-200 rounded-lg inline-block" />
              </div>
              <div className={`${isRTL ? "text-right" : "text-left"} mb-8`}>
                <div className="w-72 h-4 bg-gray-200 rounded inline-block" />
              </div>
              <div className="space-y-5">
                <div>
                  <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                    <div className="w-20 h-3 bg-gray-200 rounded inline-block" />
                  </div>
                  <div className="w-full h-12 bg-gray-100 rounded-xl" />
                </div>
                <div>
                  <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                    <div className="w-16 h-3 bg-gray-200 rounded inline-block" />
                  </div>
                  <div className="w-full h-12 bg-gray-100 rounded-xl" />
                </div>
                <div
                  className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="w-24 h-3 bg-gray-200 rounded" />
                  </div>
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                </div>
                <div className="w-full h-12 bg-gray-200 rounded-xl" />
                <div className="flex justify-center gap-2 pt-2">
                  <div className="w-20 h-3 bg-gray-200 rounded" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : type === "register" ? (
        /* Register Layout */
        <div className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl bg-white grid grid-cols-1 lg:grid-cols-2">
          <div
            className={`p-6 sm:p-8 lg:p-12 ${isRTL ? "lg:order-2" : "lg:order-1"}`}
          >
            <div className="w-full max-w-md mx-auto animate-pulse">
              <LogoSkeleton />
              <div
                className={`flex items-center justify-between mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                </div>
                <div className="w-32 h-3 bg-gray-200 rounded" />
              </div>
              <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                <div className="w-56 h-8 bg-gray-200 rounded-lg inline-block" />
              </div>
              <div className={`${isRTL ? "text-right" : "text-left"} mb-8`}>
                <div className="w-80 h-4 bg-gray-200 rounded inline-block" />
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div
                      className={`${isRTL ? "text-right" : "text-left"} mb-2`}
                    >
                      <div className="w-16 h-3 bg-gray-200 rounded inline-block" />
                    </div>
                    <div className="w-full h-12 bg-gray-100 rounded-xl" />
                  </div>
                  <div>
                    <div
                      className={`${isRTL ? "text-right" : "text-left"} mb-2`}
                    >
                      <div className="w-16 h-3 bg-gray-200 rounded inline-block" />
                    </div>
                    <div className="w-full h-12 bg-gray-100 rounded-xl" />
                  </div>
                </div>
                <div>
                  <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                    <div className="w-20 h-3 bg-gray-200 rounded inline-block" />
                  </div>
                  <div className="w-full h-12 bg-gray-100 rounded-xl" />
                </div>
                <div>
                  <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                    <div className="w-20 h-3 bg-gray-200 rounded inline-block" />
                  </div>
                  <div className="w-full h-12 bg-gray-100 rounded-xl" />
                </div>
                <div>
                  <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                    <div className="w-16 h-3 bg-gray-200 rounded inline-block" />
                  </div>
                  <div className="w-full h-12 bg-gray-100 rounded-xl" />
                </div>
                <div
                  className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-4 h-4 bg-gray-200 rounded mt-0.5 shrink-0" />
                  <div className="w-3/4 h-8 bg-gray-200 rounded" />
                </div>
                <div className="w-full h-12 bg-gray-200 rounded-xl" />
                <div className="flex justify-center gap-2 pt-2">
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                  <div className="w-20 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
          <div
            className={`hidden lg:flex bg-linear-to-br from-gray-200 to-gray-300 animate-pulse items-center justify-center p-12 ${isRTL ? "lg:order-1" : "lg:order-2"}`}
          >
            <div className="w-full max-w-sm space-y-6">
              <div className="w-32 h-6 bg-white/40 rounded-full" />
              <div className="space-y-3">
                <div className="w-3/4 h-10 bg-white/40 rounded-xl" />
                <div className="w-1/2 h-10 bg-white/40 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="w-2/3 h-4 bg-white/40 rounded" />
                <div className="w-1/2 h-4 bg-white/40 rounded" />
              </div>
              <div className="w-full h-48 bg-white/30 rounded-2xl mt-8" />
            </div>
          </div>
        </div>
      ) : type === "password-updated" ? (
        /* Password Updated Skeleton */
        <SimpleCardSkeleton>
          <LogoSkeleton />
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-200 rounded-full" />
          </div>
          <div className="text-center mb-3">
            <div className="w-48 h-8 bg-gray-200 rounded-lg inline-block" />
          </div>
          <div className="text-center mb-8">
            <div className="w-64 h-4 bg-gray-200 rounded inline-block mb-2" />
            <div className="w-48 h-4 bg-gray-200 rounded inline-block" />
          </div>
          <div className="w-full h-12 bg-gray-200 rounded-full" />
          <div className="flex justify-center mt-4">
            <div className="w-24 h-3 bg-gray-200 rounded" />
          </div>
        </SimpleCardSkeleton>
      ) : type === "verify-code" ? (
        /* Verify Code Skeleton */
        <SimpleCardSkeleton>
          <LogoSkeleton />
          <BadgeSkeleton center />
          <div className="text-center mb-2">
            <div className="w-32 h-8 bg-gray-200 rounded-lg inline-block" />
          </div>
          <div className="text-center mb-6">
            <div className="w-56 h-4 bg-gray-200 rounded inline-block" />
          </div>
          <div className="flex justify-center gap-1.5 sm:gap-2 mb-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-10 h-11 sm:w-11 sm:h-12 bg-gray-100 rounded-lg"
              />
            ))}
          </div>
          <div className="w-full h-12 bg-gray-200 rounded-xl mb-5" />
          <div className="text-center space-y-2">
            <div className="w-40 h-3 bg-gray-200 rounded inline-block" />
            <div className="w-48 h-3 bg-gray-200 rounded mx-auto" />
          </div>
        </SimpleCardSkeleton>
      ) : type === "reset-password" ? (
        /* Reset Password Skeleton */
        <SimpleCardSkeleton>
          <LogoSkeleton />
          <BadgeSkeleton />
          <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
            <div className="w-48 h-8 bg-gray-200 rounded-lg inline-block" />
          </div>
          <div className={`${isRTL ? "text-right" : "text-left"} mb-8`}>
            <div className="w-64 h-4 bg-gray-200 rounded inline-block" />
          </div>
          <div className="space-y-5">
            <div>
              <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                <div className="w-24 h-3 bg-gray-200 rounded inline-block" />
              </div>
              <div className="w-full h-12 bg-gray-100 rounded-xl" />
            </div>
            <div>
              <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                <div className="w-28 h-3 bg-gray-200 rounded inline-block" />
              </div>
              <div className="w-full h-12 bg-gray-100 rounded-xl" />
            </div>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-3 h-3 bg-gray-200 rounded" />
                  <div className="w-32 h-3 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="w-full h-12 bg-gray-200 rounded-xl" />
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-28 h-3 bg-gray-200 rounded" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
        </SimpleCardSkeleton>
      ) : (
        /* Forgot Password Skeleton */
        <SimpleCardSkeleton>
          <LogoSkeleton />
          <BadgeSkeleton />
          <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
            <div className="w-48 h-8 bg-gray-200 rounded-lg inline-block" />
          </div>
          <div className={`${isRTL ? "text-right" : "text-left"} mb-8`}>
            <div className="w-full h-4 bg-gray-200 rounded mb-2" />
            <div className="w-3/4 h-4 bg-gray-200 rounded" />
          </div>
          <div className="space-y-5">
            <div>
              <div className={`${isRTL ? "text-right" : "text-left"} mb-2`}>
                <div className="w-24 h-3 bg-gray-200 rounded inline-block" />
              </div>
              <div className="w-full h-12 bg-gray-100 rounded-xl" />
            </div>
            <div className="w-full h-12 bg-gray-200 rounded-xl" />
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-28 h-3 bg-gray-200 rounded" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
        </SimpleCardSkeleton>
      )}
    </div>
  );
}
