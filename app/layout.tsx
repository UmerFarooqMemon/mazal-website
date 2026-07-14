import type { Metadata } from "next";
import "./globals.css";
import { Inter, Fraunces } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mazal - UAE Plate Marketplace",
  description:
    "The UAE's trust-first marketplace for distinctive vehicle plates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
