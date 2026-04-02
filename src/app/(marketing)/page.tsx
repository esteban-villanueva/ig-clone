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
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* Gradient mesh background */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 10%, var(--landing-mesh-1) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, var(--landing-mesh-2) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at 10% 80%, var(--landing-mesh-3) 0%, transparent 50%),
            var(--landing-mesh-4)
          `,
        }}
      />

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
