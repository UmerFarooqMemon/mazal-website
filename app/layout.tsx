import type { Metadata } from "next";
import "./globals.css";
import { Cairo, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mazal - UAE Plate Marketplace",
  description:
    "The UAE's trust-first marketplace for distinctive vehicle plates.",
  icons: {
    icon: "/api/favicon",
    shortcut: "/api/favicon",
    apple: "/api/favicon",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
