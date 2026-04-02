import { Fraunces, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} ${dmSans.variable} relative flex flex-col min-h-screen`}
      style={{ fontFamily: "var(--font-dm-sans), sans-serif", backgroundColor: "#fdfdfd" }}
    >
      {/* Background gradient mesh */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 10%, oklch(0.96 0.04 70) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, oklch(0.95 0.03 350) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at 10% 80%, oklch(0.96 0.02 280) 0%, transparent 50%),
            rgba(255,255,255,0.8)
          `,
        }}
      />
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
