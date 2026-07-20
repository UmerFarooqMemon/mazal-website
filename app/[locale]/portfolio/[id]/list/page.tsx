import { redirect } from "next/navigation";

/** Legacy route — redirects to unified detail page */
export default async function PortfolioListRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(`/${locale}/portfolio/${id}`);
}
