import { getStaffSession } from "@/app/actions/staff.actions";
import { redirect } from "next/navigation";
import { Coffee } from "lucide-react";
import { LogoutButton } from "@/components/features/LogoutButton";
import { TabAuthGuard } from "@/components/features/TabAuthGuard";

export default async function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();

  // If no session, they must login
  if (!session) {
    redirect("/pos/login");
  }

  return (
    <div className="h-screen flex flex-col bg-stone-50 overflow-hidden font-sans print:h-auto print:bg-white print:overflow-visible print:block">
      <TabAuthGuard />
      {/* POS Header */}
      <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-6 flex-shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-700 rounded-xl flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-heading font-bold text-[1.1rem] text-stone-800 leading-none tracking-wide">ICafe POS</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-stone-800 leading-tight">{session.name}</p>
            <p className="text-xs text-stone-500">{session.role}</p>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <LogoutButton mobile redirectTo="/pos/login" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative print:overflow-visible print:block">
        {children}
      </main>
    </div>
  );
}
