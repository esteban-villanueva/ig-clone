import { Navbar } from "@/components/layout/Navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
