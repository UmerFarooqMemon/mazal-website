"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import FooterBottom from "@/components/layout/FooterBottom";

export function ConditionalHeader() {
  const pathname = usePathname();

  // Auth pages - no header (work with both /en/ and /ar/)
  const authPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-code",
    "/reset-password",
    "/password-updated",
  ];

  const isAuthPage = authPaths.some((path) => pathname.includes(path));

  if (isAuthPage) return null;

  return <Header />;
}

export function ConditionalFooter() {
  const pathname = usePathname();

  const authPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-code",
    "/reset-password",
    "/password-updated",
  ];

  const isAuthPage = authPaths.some((path) => pathname.includes(path));

  if (isAuthPage) return null;

  return <FooterBottom />;
}
