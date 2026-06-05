"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";
import { useCart } from "@/components/providers/CartContext";
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { CreditCard, Wallet, Banknote, ArrowLeft, Loader2, CheckCircle2, ShoppingBag, UtensilsCrossed, Package } from "lucide-react";
import Link from "next/link";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  location: string;
}

type OrderType = "DINE_IN" | "TAKEAWAY";

const PAYMENT_METHODS = [
  { id: "CASH", label: "Pay at Cashier", desc: "Pay with cash when you arrive", icon: Banknote },
  { id: "EWALLET", label: "E-Wallet (QRIS)", desc: "Scan QR code at the counter", icon: Wallet },
  { id: "CARD", label: "Credit / Debit Card", desc: "Pay securely with your card", icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isInApp = pathname.startsWith("/app");
  const { user, profile } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  
  const [table, setTable] = useState<Table | null>(null);
  const [orderType, setOrderType] = useState<OrderType>("TAKEAWAY");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user === null) {
      toast.error("Login Required", { description: "Please sign in to continue." });
      router.push(isInApp ? "/app/login" : "/login");
      return;
    }

    if (items.length === 0 && !isSuccess) {
      toast.error("Cart is empty", { description: "Add items before checking out." });
      router.push(isInApp ? "/app/menu" : "/menu");
      return;
    }

    // Check for pending table reservation
    const pendingTableStr = sessionStorage.getItem("icafe_pending_reservation");
    if (pendingTableStr) {
      try {
        setTable(JSON.parse(pendingTableStr));
        setOrderType("DINE_IN");
      } catch {}
    }
  }, [user, router, isInApp, items.length, isSuccess]);

  const handleCheckout = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // If dine-in with table, reserve the table
      if (orderType === "DINE_IN" && table) {
        await setDoc(doc(db, "tables", table.id), {
          ...table,
          status: "RESERVED",
        }, { merge: true });
      }

      // Create order document
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        customerName: profile?.name || "Guest",
        orderType,
        tableId: table?.id || null,
        tableNumber: table?.number || null,
        paymentMethod,
        status: "CONFIRMED",
        items: items.map(i => ({
          id: i.menuItem.id,
          name: i.menuItem.name,
          price: i.menuItem.price,
          quantity: i.quantity,
        })),
        subtotal: cartTotal,
        tax: +(cartTotal * 0.1).toFixed(2),
        total: +(cartTotal * 1.1).toFixed(2),
        createdAt: serverTimestamp(),
      });

      // Also create reservation record if dine-in
      if (orderType === "DINE_IN" && table) {
        await addDoc(collection(db, "reservations"), {
          userId: user.uid,
          tableId: table.id,
          tableNumber: table.number,
          date: new Date(),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          guests: table.capacity,
          status: "CONFIRMED",
          paymentMethod,
          createdAt: serverTimestamp(),
        });
      }

      clearCart();
      sessionStorage.removeItem("icafe_pending_reservation");
      setIsSuccess(true);

      toast.success("Order Confirmed!", {
        description: orderType === "TAKEAWAY" ? "Your takeaway order is being prepared." : `Table T${table?.number} reserved.`,
      });

      setTimeout(() => {
        router.push(isInApp ? "/app" : "/");
      }, 3000);

    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed", { description: "Please try again or contact our staff." });
      setIsSubmitting(false);
    }
  };

  // ─── Success Screen ───
  if (isSuccess) {
    return (
      <div className="flex-1 pt-32 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-3 text-stone-800">Order Confirmed!</h1>
          <p className="text-stone-600 mb-2">
            {orderType === "TAKEAWAY"
              ? "Your takeaway order is being prepared. Pick it up at the counter!"
              : <>Your table <strong className="text-stone-900">T{table?.number}</strong> has been reserved.</>
            }
          </p>
          <p className="text-stone-400 text-sm">Redirecting you home...</p>
        </div>
      </div>
    );
  }

  const taxAmount = +(cartTotal * 0.1).toFixed(2);
  const grandTotal = +(cartTotal * 1.1).toFixed(2);

  // ─── Checkout Form ───
  return (
    <div className="flex-1 pt-20 sm:pt-28 pb-16 bg-stone-50/50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href={isInApp ? "/app/cart" : "/menu"} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-4 sm:mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="mb-5 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-1 text-stone-800">Checkout</h1>
          <p className="text-stone-500 text-sm sm:text-base">Review your order and complete your purchase.</p>
        </div>

        <div className="grid md:grid-cols-12 gap-5 sm:gap-8 lg:gap-12">
          
          {/* Left Column */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4 sm:space-y-8">
            
            {/* Order Type Selection */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-sm border border-stone-200">
              <h2 className="text-sm sm:text-xl font-heading font-bold mb-3 sm:mb-6 text-stone-600 sm:text-stone-800 uppercase sm:normal-case tracking-wider sm:tracking-normal">Order Type</h2>
              <div className="flex gap-2 sm:grid sm:grid-cols-2 sm:gap-4">
                <button
                  onClick={() => { setOrderType("TAKEAWAY"); setTable(null); }}
                  className={`flex items-center gap-2 sm:flex-col sm:gap-3 px-4 py-2.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex-1 ${
                    orderType === "TAKEAWAY"
                      ? "border-primary bg-primary/5"
                      : "border-stone-100 hover:border-stone-200"
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                    orderType === "TAKEAWAY" ? "bg-primary text-primary-foreground" : "bg-stone-100 text-stone-500"
                  }`}>
                    <Package className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <span className="font-bold text-stone-800 text-sm sm:text-sm">Takeaway</span>
                </button>

                <button
                  onClick={() => setOrderType("DINE_IN")}
                  className={`flex items-center gap-2 sm:flex-col sm:gap-3 px-4 py-2.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex-1 ${
                    orderType === "DINE_IN"
                      ? "border-primary bg-primary/5"
                      : "border-stone-100 hover:border-stone-200"
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                    orderType === "DINE_IN" ? "bg-primary text-primary-foreground" : "bg-stone-100 text-stone-500"
                  }`}>
                    <UtensilsCrossed className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <span className="font-bold text-stone-800 text-sm sm:text-sm">Dine In</span>
                </button>
              </div>

              {orderType === "DINE_IN" && (
                <div className="mt-3 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-xl sm:rounded-2xl">
                  {table ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-stone-800">Table T{table.number} — {table.location}</p>
                        <p className="text-[10px] sm:text-xs text-stone-500">Up to {table.capacity} guests</p>
                      </div>
                      <Link href={isInApp ? "/app/reservations" : "/reservations"} className="text-primary text-xs font-bold hover:underline">
                        Change
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-stone-600">No table selected (optional)</p>
                      <Link href={isInApp ? "/app/reservations" : "/reservations"} className="text-primary text-xs font-bold hover:underline">
                        Book Table
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-sm border border-stone-200">
              <h2 className="text-sm sm:text-xl font-heading font-bold mb-3 sm:mb-6 text-stone-600 sm:text-stone-800 uppercase sm:normal-case tracking-wider sm:tracking-normal">Payment</h2>
              <div className="space-y-2 sm:space-y-3">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <label key={pm.id} className={`flex items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? "border-primary bg-primary/5"
                        : "border-stone-100 hover:border-stone-200 hover:bg-stone-50"
                    }`}>
                      <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 ${paymentMethod === pm.id ? "border-primary" : "border-stone-300"}`}>
                        {paymentMethod === pm.id && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full" />}
                      </div>
                      <div className="bg-stone-100 p-2 sm:p-2.5 rounded-lg sm:rounded-xl mr-3 sm:mr-4 text-stone-600 flex-shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-800 text-xs sm:text-sm">{pm.label}</p>
                        <p className="text-[10px] sm:text-xs text-stone-500 hidden sm:block">{pm.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-stone-200 sticky top-28">
              <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Order Summary
              </h2>
              
              {items.length > 0 && (
                <>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.menuItem.id} className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 text-sm truncate">{item.menuItem.name}</p>
                          <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-stone-800 text-sm flex-shrink-0">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-stone-100 pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Tax (10%)</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                      <p className="font-bold text-stone-800">Total</p>
                      <p className="font-heading font-bold text-2xl text-primary">${grandTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleCheckout}
                disabled={isSubmitting || items.length === 0}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  `Place Order — $${grandTotal.toFixed(2)}`
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
