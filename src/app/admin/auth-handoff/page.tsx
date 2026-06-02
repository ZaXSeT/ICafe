"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setStaffSession } from "@/app/actions/staff.actions";

export default function AdminAuthHandoff() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const syncSession = async () => {
      const sessionStr = searchParams.get("session");
      if (sessionStr) {
        try {
          const session = JSON.parse(decodeURIComponent(sessionStr));
          await setStaffSession(session);
        } catch (e) {
          console.error("Failed to parse handoff session", e);
        }
      }
      router.push("/"); // Redirect to admin dashboard
    };

    syncSession();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-stone-500 font-medium animate-pulse">Syncing session...</p>
    </div>
  );
}
