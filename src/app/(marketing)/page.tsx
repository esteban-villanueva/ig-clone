import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FloatingPhotoGrid } from "@/components/landing/FloatingPhotoGrid";
import { FeaturesPreview } from "@/components/landing/FeaturesPreview";

export default async function LandingPage() {
  // Server-side session check — redirect authenticated users to feed
  const session = await auth();
  if (session?.user?.id) {
    redirect("/feed");
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Content layers */}
      <LandingNavbar />

      {/* Hero + floating photos — relative container for absolute positioning */}
      <div className="relative">
        <FloatingPhotoGrid />
        <HeroSection />
      </div>

      {/* Features preview below the fold */}
      <FeaturesPreview />
    </div>
  );
}
