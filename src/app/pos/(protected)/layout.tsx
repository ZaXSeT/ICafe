import { getStaffSession } from "@/app/actions/staff.actions";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/features/LogoutButton";
import { TabAuthGuard } from "@/components/features/TabAuthGuard";

export default async function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isLocal = host.includes("localhost");
  const adminLoginUrl = isLocal ? "http://pos.localhost:3000/login" : `https://${host}/login`;
  const sessionStr = session ? encodeURIComponent(JSON.stringify(session)) : "";
  const adminUrl = isLocal 
    ? `http://admin.localhost:3000/auth-handoff?session=${sessionStr}` 
    : `https://admin.${host.replace("pos.", "")}/auth-handoff?session=${sessionStr}`;

  // If no session, they must login
  if (!session) {
    redirect(adminLoginUrl);
  }

  return (
    <div className="h-screen flex flex-col bg-stone-50 overflow-hidden font-sans print:h-auto print:bg-white print:overflow-visible print:block">
      <TabAuthGuard />
      {/* POS Header */}
      <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-6 flex-shrink-0 print:hidden">
        <div className="flex items-center gap-6">
          <a href={adminUrl} className="text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-2 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </a>
          <div className="w-px h-6 bg-stone-200" />
          <h1 className="font-heading font-bold text-[1.1rem] text-stone-800 leading-none tracking-wide -mt-0.5">ICafe POS</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-stone-800 leading-tight">{session.name}</p>
            <p className="text-xs text-stone-500">{session.role}</p>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <LogoutButton mobile />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative print:overflow-visible print:block">
        {children}
      </main>
    </div>
  );
}
