import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white text-slate-900 relative selection:bg-black selection:text-white">
        {/* Ultra Minimalist Background */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-white to-white" />

        <Sidebar />
        
        <main className="md:ml-72 min-h-screen p-8 relative z-10">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
