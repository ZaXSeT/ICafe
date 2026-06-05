import { getStaffSession } from "@/app/actions/staff.actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { LayoutDashboard, Coffee, Users, TerminalSquare } from "lucide-react";
import { LogoutButton } from "@/components/features/LogoutButton";
import { TabAuthGuard } from "@/components/features/TabAuthGuard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();

  // If no session, they must login on this subdomain
  if (!session) {
    redirect("/admin/login");
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isLocal = host.includes("localhost");
  const sessionStr = encodeURIComponent(JSON.stringify(session));
  const posUrl = isLocal ? `http://pos.localhost:3000/auth-handoff?session=${sessionStr}` : `https://pos.${host.replace("admin.", "")}`;

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <TabAuthGuard />
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-stone-800">Admin Panel</h2>
        </div>
        
        <div className="p-4 flex-1 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Sales & Orders</span>
          </Link>
          <Link href="/menu" className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
            <Coffee className="w-5 h-5" />
            <span className="font-medium">Menu Items</span>
          </Link>
          {session.role === "OWNER" && (
            <Link href="/staff" className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
              <Users className="w-5 h-5" />
              <span className="font-medium">Staff Accounts</span>
            </Link>
          )}
          <div className="my-4 border-t border-stone-100" />
          <a href={posUrl} className="flex items-center gap-3 px-4 py-3 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors">
            <TerminalSquare className="w-5 h-5" />
            <span className="font-medium">Launch POS</span>
          </a>
        </div>

        <div className="p-4 border-t border-stone-100">
          <div className="mb-4 px-4">
            <p className="text-sm text-stone-500">Logged in as</p>
            <p className="font-semibold text-stone-800">{session.name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 font-medium inline-block mt-1">
              {session.role}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-heading font-bold text-lg text-stone-800">Admin Panel</h2>
          <LogoutButton mobile />
        </div>
        
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
