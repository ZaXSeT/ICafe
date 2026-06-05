"use client";

import { useAuth } from "@/components/providers/AuthContext";
import { useRouter } from "next/navigation";
import { User, Mail, LogOut, ChevronRight, Shield, HelpCircle, Star } from "lucide-react";

export default function MobileProfilePage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/app/login");
  };

  const menuItems = [
    { label: "My Orders", icon: Star, href: "/app/orders" },
    { label: "Privacy Policy", icon: Shield, href: "/app/privacy" },
    { label: "Help & Support", icon: HelpCircle, href: "/app/help" },
  ];

  return (
    <div className="pb-6">
      {/* Profile Header */}
      <div className="bg-primary px-6 pt-10 pb-8 rounded-b-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold font-heading">
              {profile?.name || "User"}
            </h1>
            <p className="text-primary-foreground/70 text-sm flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {profile?.email || user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 mt-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-4 bg-white border border-stone-100 rounded-2xl p-4 shadow-sm hover:bg-stone-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600">
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 font-semibold text-stone-800 text-sm">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-6 mt-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 font-bold py-3.5 rounded-2xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <p className="text-center text-[10px] text-stone-400 mt-6">ICafe v1.0.0</p>
    </div>
  );
}
