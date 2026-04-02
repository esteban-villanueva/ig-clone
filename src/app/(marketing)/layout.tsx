import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";

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
  title: "IG clone · Tu espacio para compartir todo lo que sos",
  description:
    "Más que una red social — un espacio donde tus fotos, momentos e historia se conectan con las personas que importan.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${fraunces.variable} ${dmSans.variable}`}>
      {children}
    </div>
  );
}
