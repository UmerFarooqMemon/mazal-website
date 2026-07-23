import { notFound } from "next/navigation";
import HomeV2PlateDetailView from "@/components/home-v2/HomeV2PlateDetailView";
import { getHomeV2PlateById } from "@/components/home-v2/plates-data";

type PlateDetailPageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function HomeV2PlateDetailPage({
  params,
}: PlateDetailPageProps) {
  const { id } = await params;
  const plate = getHomeV2PlateById(id);

  if (!plate) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f2faef]">
      <HomeV2PlateDetailView plate={plate} />
    </div>
  );
}
