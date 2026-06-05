"use client";

import { useCart } from "@/components/providers/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function MobileCartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-stone-300" />
        </div>
        <h2 className="text-xl font-heading font-bold text-stone-800 mb-2">Your cart is empty</h2>
        <p className="text-sm text-stone-500 mb-6">Add some delicious items from our menu!</p>
        <Link
          href="/app/menu"
          className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          Browse Menu <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-heading font-bold text-stone-800">Your Cart</h1>
        <p className="text-sm text-stone-500 mt-1">{cartCount} item{cartCount > 1 ? "s" : ""}</p>
      </div>

      <div className="px-6 space-y-3">
        {items.map((item) => (
          <div key={item.menuItem.id} className="bg-white rounded-2xl border border-stone-100 p-3 flex items-center gap-3 shadow-sm">
            <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-stone-100 flex-shrink-0">
              {item.menuItem.image ? (
                <Image src={item.menuItem.image} alt={item.menuItem.name} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-stone-800 text-sm truncate">{item.menuItem.name}</h3>
              <p className="text-primary font-bold text-sm mt-0.5">
                ${(item.menuItem.price * item.quantity).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.quantity === 1 ? (
                <button
                  onClick={() => removeFromCart(item.menuItem.id)}
                  className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-sm font-bold text-stone-800 w-5 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="px-6 mt-6">
        <div className="bg-stone-900 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-stone-300 text-sm">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-300 text-sm">
            <span>Tax (10%)</span>
            <span>${(cartTotal * 0.1).toFixed(2)}</span>
          </div>
          <div className="border-t border-stone-700 pt-3 flex justify-between text-white font-bold">
            <span>Total</span>
            <span>${(cartTotal * 1.1).toFixed(2)}</span>
          </div>
          <Link
            href="/app/checkout"
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-center block hover:bg-primary/90 transition-colors mt-2"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
