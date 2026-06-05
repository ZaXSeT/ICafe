import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default async function MobileAppProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/app/login");
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto relative bg-stone-50">
        {children}
      </main>
      <MobileBottomNav />
    </>
  );
}
