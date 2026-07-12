"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import Button from "@/components/ui/Button";

export default function PasswordUpdatedPage() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  // Show success toast on page load
  useEffect(() => {
    toast.success(t("common.password_updated_title"), {
      style: {
        background: "#E8FFE2",
        color: "#015C14",
        border: "1px solid #86D98F",
      },
      icon: "",
      duration: 3000,
    });
  }, [t]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-4xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/auth/auth-logo.png"
              alt="Mazal Logo"
              width={130}
              height={45}
              className="object-contain h-auto"
            />
          </div>

          {/* Celebration Emoji */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
              <span className="text-5xl sm:text-6xl">🎉</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#041443] mb-3">
            {t("common.password_updated_title")}
          </h1>
          <p className="text-gray-500 text-sm sm:text-[15px] mb-8 leading-relaxed px-2">
            {t("common.password_updated_desc")}
          </p>

          {/* CTA Button */}
          <Link href={`/${locale}/login`} className="block">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="rounded-full text-base"
            >
              {t("common.continue_to_sign_in")}
            </Button>
          </Link>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              // href={`/${locale}`}
              href=""
              className="text-sm text-gray-400 hover:text-[#0A3B9E] transition-colors"
            >
              {t("common.back_to_home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
