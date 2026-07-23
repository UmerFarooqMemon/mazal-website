import HomeV2Hero from "@/components/home-v2/HomeV2Hero";
import HomeV2Features from "@/components/home-v2/HomeV2Features";
import {
  HomeV2Watching,
  HomeV2Trending,
} from "@/components/home-v2/HomeV2Listings";
import HomeV2Escrow from "@/components/home-v2/HomeV2Escrow";
import HomeV2Partners from "@/components/home-v2/HomeV2Partners";
import HomeV2CTA from "@/components/home-v2/HomeV2CTA";

export default function HomeV2Page() {
  return (
    <div className="bg-[#f2faef]">
      <HomeV2Hero />
      <HomeV2Features />
      <HomeV2Watching />
      <HomeV2Trending />
      <HomeV2Escrow />
      <HomeV2Partners />
      <HomeV2CTA />
    </div>
  );
}
