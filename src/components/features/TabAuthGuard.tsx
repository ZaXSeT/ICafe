"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutStaff } from "@/app/actions/staff.actions";

export function TabAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const isActive = sessionStorage.getItem("tab_session_active");
    if (!isActive) {
      // This tab does not have an active session (e.g. it was newly opened)
      // Log out to clear the shared HTTP cookie, forcing login.
      logoutStaff().then(() => {
        router.push("/login");
      });
    }
  }, [router]);

  return null;
}
