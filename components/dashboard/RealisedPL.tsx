"use client";
import { DirhamAmount } from "@/components/ui";

export default function RealisedPL() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
        Realised P&L
      </div>
      <div className="text-4xl font-bold mb-1">
        <DirhamAmount amount={7_320_000} weight="bold" />
      </div>
      <div className="text-xs text-[#0A3B9E]">Last 12 months</div>
    </div>
  );
}
