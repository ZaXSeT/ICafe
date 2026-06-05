"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Coffee, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const navItems = [
    { name: "Home", href: "/app", icon: Home },
    { name: "Menu", href: "/app/menu", icon: Coffee },
    { name: "Cart", href: "/app/cart", icon: ShoppingBag, badge: cartCount },
    { name: "Profile", href: "/app/profile", icon: User },
  ];

  return (
    <div className="bg-white border-t border-stone-200 pb-[env(safe-area-inset-bottom)] flex-shrink-0 relative z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors relative ${
                isActive ? "text-primary" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? "font-bold" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
