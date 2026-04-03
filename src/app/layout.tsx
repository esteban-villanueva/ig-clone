import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

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

export const metadata: Metadata = {
  title: "Ig Clone",
  description: "A minimal Instagram clone built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-transparent">
        {/* Global Mesh Gradient Background */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: -1,
            background: `
              radial-gradient(ellipse 80% 60% at 20% 10%, var(--landing-mesh-1, oklch(0.96 0.04 70)) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 20%, var(--landing-mesh-2, oklch(0.95 0.03 350)) 0%, transparent 55%),
              radial-gradient(ellipse 70% 60% at 10% 80%, var(--landing-mesh-3, oklch(0.96 0.02 280)) 0%, transparent 50%),
              var(--landing-mesh-4, oklch(1 0 0))
            `,
          }}
          aria-hidden="true"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
