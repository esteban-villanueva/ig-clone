import type { Metadata } from "next";

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
    <div>
      {children}
    </div>
  );
}
