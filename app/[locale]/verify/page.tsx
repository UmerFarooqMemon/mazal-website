"use client";

import { Suspense } from "react";
import VerifyCertificatePage from "@/components/certificates/VerifyCertificatePage";
import VerifyCertificateSkeleton from "@/components/skeletons/certificates/VerifyCertificateSkeleton";

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyCertificateSkeleton />}>
      <VerifyCertificatePage />
    </Suspense>
  );
}
