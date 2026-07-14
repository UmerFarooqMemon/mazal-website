"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import FooterBottom from "@/components/layout/FooterBottom";

export function ConditionalHeader() {
  const pathname = usePathname();

  // Show header on all pages including auth
  return <Header />;
}

export function ConditionalFooter() {
  const pathname = usePathname();

  // Show footer on all pages including auth
  return <FooterBottom />;
}
