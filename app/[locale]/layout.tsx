import { Cairo, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LocaleProvider } from "@/context/LocaleContext";

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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const validLocale = locale === "ar" ? "ar" : "en";

  return (
    <div className={validLocale === "ar" ? cairo.className : inter.className}>
      <LocaleProvider initialLocale={validLocale}>
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
          <Header />
          <main className="grow">{children}</main>
          <Footer />
        </div>
      </LocaleProvider>
    </div>
  );
}
