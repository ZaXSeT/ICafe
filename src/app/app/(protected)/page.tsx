import { getSession } from "@/lib/auth-server";
import { Coffee, Search, Clock, ChevronRight, Bell } from "lucide-react";
import Link from "next/link";
import { FavoritesSection } from "@/components/features/FavoritesSection";

export default async function MobileAppDashboard() {
  const session = await getSession();

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-primary px-6 pt-10 pb-20 rounded-b-[2.5rem] relative">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium">Good morning,</p>
            <h1 className="text-white text-2xl font-bold font-heading">{session?.name?.split(" ")[0] || "Guest"}!</h1>
          </div>
          <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
          </button>
        </div>

        {/* Search Bar - overlaps the bottom of the header */}
        <div className="absolute left-6 right-6 -bottom-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-stone-200/50 p-2 flex items-center">
            <div className="w-10 h-10 flex items-center justify-center text-stone-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="What are you craving today?" 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 text-stone-800 placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pt-12 space-y-8">
        
        {/* ICafe Rewards Card */}
        <div className="bg-stone-900 rounded-3xl p-5 relative overflow-hidden shadow-xl shadow-stone-900/10">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Coffee className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-stone-400 text-xs font-semibold tracking-wider mb-1">ICAFE REWARDS</p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-white font-heading">240</span>
                <span className="text-stone-300 text-sm mb-1">Pts</span>
              </div>
            </div>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl transition-colors">
              Redeem
            </button>
          </div>
          <div className="mt-4 bg-stone-800 rounded-full h-1.5 w-full overflow-hidden">
            <div className="bg-primary w-[60%] h-full rounded-full"></div>
          </div>
          <p className="text-stone-500 text-[10px] mt-2 font-medium">60 pts more to Gold Tier</p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link href="/app/menu" className="flex items-center gap-4 bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl p-4 shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-transform">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-[15px]">Order Coffee</h3>
              <p className="text-amber-100/80 text-xs mt-0.5">Browse menu & add to cart</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60" />
          </Link>

          <Link href="/app/reservations" className="flex items-center gap-4 bg-gradient-to-r from-stone-800 to-stone-700 rounded-2xl p-4 shadow-lg shadow-stone-800/20 active:scale-[0.98] transition-transform">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-[15px]">Book a Table</h3>
              <p className="text-stone-400 text-xs mt-0.5">See live availability & reserve</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </Link>
        </div>

        {/* Favorites */}
        <FavoritesSection />

      </div>
    </div>
  );
}
