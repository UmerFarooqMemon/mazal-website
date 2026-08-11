"use client";

import { Sparkles } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { DirhamAmount } from "@/components/ui";

export default function RealisedPL() {
  const { t } = useLocale();

  return (
    <div className="rounded-2xl border border-[#d9dee6] bg-[#010f51] p-6 text-[#fbfaf6]">
      <div className="flex items-center gap-2 text-xs uppercase text-[#e0ae57]">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
        {t("dashboard.realised_pl")}
      </div>
      <div className="mt-2 font-serif text-4xl font-semibold">
        <DirhamAmount amount={7_320_000} weight="bold" />
      </div>
      <p className="mt-1 text-sm text-[#fbfaf6]/90">{t("dashboard.net_fees")}</p>
      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
        <div>
          <div className="font-serif text-base">14</div>
          <div className="text-xs text-[#fbfaf6]/80">{t("dashboard.sold")}</div>
        </div>
        <div>
          <div className="font-serif text-base">63%</div>
          <div className="text-xs text-[#fbfaf6]/80">
            {t("dashboard.win_rate")}
          </div>
        </div>
        <div>
          <div className="font-serif text-base">8.4m</div>
          <div className="text-xs text-[#fbfaf6]/80">
            {t("dashboard.avg_hold")}
          </div>
        </div>
      </div>
    </div>
  );
}
