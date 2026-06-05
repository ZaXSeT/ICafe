"use client";

import { useState } from "react";
import { ShoppingBag, X, Minus, Plus, ChevronRight } from "lucide-react";
import { useCart } from "../providers/CartContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export function CartPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, updateQuantity, cartTotal, cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  if (cartCount === 0) return null;

  // Don't show the cart popup on the checkout/reservations page itself,
  // since the order summary will be displayed directly there.
  if (pathname === "/reservations") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Card */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/60 w-80 sm:w-96 mb-4 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h3 className="font-heading font-bold text-stone-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              Your Order
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-200/50 text-stone-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-4 space-y-4 bg-white scrollbar-hide">
            {items.map((cartItem) => (
              <div key={cartItem.menuItem.id} className="flex gap-3">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                  {cartItem.menuItem.image ? (
                    <Image
                      src={cartItem.menuItem.image}
                      alt={cartItem.menuItem.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">☕</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-semibold text-sm text-stone-800 truncate">
                    {cartItem.menuItem.name}
                  </h4>
                  <span className="text-amber-700 font-bold text-sm">
                    ${(cartItem.menuItem.price * cartItem.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/50 rounded-xl px-2">
                  <button
                    onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                    className="p-1 hover:text-amber-700 text-stone-500 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center text-stone-800">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                    className="p-1 hover:text-amber-700 text-stone-500 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-stone-100 bg-stone-50/50 space-y-4">
            <div className="flex justify-between items-center text-stone-800 font-bold">
              <span>Total</span>
              <span className="text-lg text-amber-700">${cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/checkout");
              }}
              className="w-full py-3 rounded-2xl bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-800 transition-colors active:scale-[0.98] shadow-md"
            >
              Proceed to Checkout
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-16 w-16 bg-amber-700 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-amber-800 transition-all hover:-translate-y-1 active:scale-95"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute top-0 right-0 bg-rose-500 text-white text-[11px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center border-2 border-[#FAF8F5]">
            {cartCount}
          </span>
        </button>
      )}
    </div>
  );
}
