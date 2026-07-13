import { Cairo, Inter } from "next/font/google";
import { LocaleProvider } from "@/context/LocaleContext";
import { ThemeProvider } from "@/context/ThemeContext";
import {
  ConditionalHeader,
  ConditionalFooter,
} from "@/components/layout/ConditionalLayout";
import { Toaster } from "react-hot-toast";

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
        <ThemeProvider>
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                padding: "16px",
                fontSize: "14px",
              },
            }}
          />
          <div className="min-h-screen flex flex-col">
            <ConditionalHeader />
            <main className="grow">{children}</main>
            <ConditionalFooter />
          </div>
        </ThemeProvider>
      </LocaleProvider>
    </div>
  );
}
