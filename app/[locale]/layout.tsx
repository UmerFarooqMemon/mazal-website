import { LocaleProvider } from "@/context/LocaleContext";
import { ThemeProvider } from "@/context/ThemeContext";
import LayoutProviders from "@/components/providers/LayoutProviders";
import {
  ConditionalHeader,
  ConditionalFooter,
} from "@/components/layout/ConditionalLayout";
import { Toaster } from "react-hot-toast";
import { getLocaleDir, normalizeLocale } from "@/lib/locale";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = normalizeLocale(locale);
  const dir = getLocaleDir(validLocale);

  return (
    <div
      dir={dir}
      lang={validLocale}
      data-locale-root
    >
      <LocaleProvider initialLocale={validLocale}>
        <ThemeProvider>
          <LayoutProviders>
          <Toaster
            position="bottom-center"
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
          </LayoutProviders>
        </ThemeProvider>
      </LocaleProvider>
    </div>
  );
}
