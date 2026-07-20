"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import PortfolioDetailView from "@/components/portfolio/PortfolioDetailView";
import {
  getPlateDetailMode,
  getPortfolioPlate,
} from "@/components/portfolio/data";

export default function PortfolioDetailPage() {
  const params = useParams<{ id: string; locale: string }>();
  const { locale } = useLocale();

  const plate = getPortfolioPlate(params.id);

  if (!plate) {
    notFound();
  }

  return (
    <PortfolioDetailView
      plate={plate}
      mode={getPlateDetailMode(plate)}
      backHref={`/${locale}/portfolio`}
    />
  );
}
