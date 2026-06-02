"use client";

import { LogOut } from "lucide-react";
import { logoutStaff } from "@/app/actions/staff.actions";

export function LogoutButton({ mobile }: { mobile?: boolean }) {
  const handleLogout = async () => {
    await logoutStaff();
    // Force a hard navigation to bypass Next.js client-side router caching
    // This ensures the middleware correctly rewrites the path to the Admin PIN login
    window.location.href = "/login";
  };

  if (mobile) {
    return (
      <button onClick={handleLogout} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Sign Out">
        <LogOut className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-medium">
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}
