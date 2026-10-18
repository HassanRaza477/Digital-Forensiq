import ForensicSidebar from "@/components/ForensicSidebar";

export default function ForensicImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-canvas min-h-screen">
      <ForensicSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}