"use client";

import { Suspense } from "react";
import VerifyCertificatePage from "@/components/certificates/VerifyCertificatePage";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FBFAF7]">
          <div className="h-8 w-8 rounded-full border-2 border-[#0A2F94] border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyCertificatePage />
    </Suspense>
  );
}
