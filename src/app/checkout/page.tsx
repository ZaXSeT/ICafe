"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";
import { useCart } from "@/components/providers/CartContext";
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { CreditCard, Wallet, Banknote, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  location: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  
  const [table, setTable] = useState<Table | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check authentication
    if (user === null) {
      toast.error("Login Required", { description: "Please sign in to continue." });
      router.push("/login");
      return;
    }

    // Get pending reservation from session storage
    const pendingTableStr = sessionStorage.getItem("icafe_pending_reservation");
    if (pendingTableStr) {
      try {
        setTable(JSON.parse(pendingTableStr));
      } catch (e) {
        console.error("Failed to parse pending reservation", e);
      }
    } else {
      toast.error("No table selected", { description: "Please select a table first." });
      router.push("/reservations");
    }
  }, [user, router]);

  const handleCheckout = async () => {
    if (!user || !table) return;

    setIsSubmitting(true);
    try {
      // 1. Update table status to RESERVED
      // We skip this if they don't have Firebase connected properly, but since
      // they connected the database, it will work.
      await setDoc(doc(db, "tables", table.id), {
        ...table,
        status: "RESERVED",
      }, { merge: true });

      // 2. Create reservation document with paymentMethod
      await addDoc(collection(db, "reservations"), {
        userId: user.uid,
        tableId: table.id,
        tableNumber: table.number,
        date: new Date(),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        guests: table.capacity,
        status: "CONFIRMED",
        paymentMethod: paymentMethod, // Added payment method
        notes: "",
        order: items.length > 0 ? {
          items: items.map(i => ({
            id: i.menuItem.id,
            name: i.menuItem.name,
            price: i.menuItem.price,
            quantity: i.quantity
          })),
          total: cartTotal
        } : null,
        createdAt: serverTimestamp(),
      });

      // 3. Clear cart and session storage
      clearCart();
      sessionStorage.removeItem("icafe_pending_reservation");
      
      // 4. Show success state
      setIsSuccess(true);
      toast.success("Order & Reservation Confirmed!", {
        description: "Your table is reserved and payment is selected.",
      });

      // 5. Redirect home after a few seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);

    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed", {
        description: "Please try again or contact our staff.",
      });
      setIsSubmitting(false);
    }
  };

  if (!table) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex-1 pt-32 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-4 text-stone-800">Checkout Successful!</h1>
          <p className="text-stone-600 mb-8">
            Your table <strong className="text-stone-900">T{table.number}</strong> has been reserved and your order is confirmed. Redirecting you home...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-28 pb-16 bg-stone-50/50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/reservations" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Reservations
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 text-stone-800">Checkout</h1>
          <p className="text-stone-500">Review your order and select a payment method.</p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column - Payment & Details */}
          <div className="md:col-span-7 lg:col-span-8 space-y-8">
            
            {/* Reservation Summary */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-stone-200">
              <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                Reservation Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-sm text-stone-500 mb-1">Table</p>
                  <p className="font-bold text-lg text-stone-800">T{table.number}</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-sm text-stone-500 mb-1">Guests</p>
                  <p className="font-bold text-lg text-stone-800">Up to {table.capacity}</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 col-span-2 sm:col-span-1">
                  <p className="text-sm text-stone-500 mb-1">Location</p>
                  <p className="font-bold text-stone-800">{table.location}</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 col-span-2 sm:col-span-1">
                  <p className="text-sm text-stone-500 mb-1">Time</p>
                  <p className="font-bold text-stone-800">Now</p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-stone-200">
              <h2 className="text-xl font-heading font-bold mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                {/* Cash */}
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "CASH" 
                    ? "border-primary bg-primary/5" 
                    : "border-stone-100 hover:border-stone-200 hover:bg-stone-50"
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="CASH"
                    checked={paymentMethod === "CASH"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                    paymentMethod === "CASH" ? "border-primary" : "border-stone-300"
                  }`}>
                    {paymentMethod === "CASH" && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <div className="bg-stone-100 p-2.5 rounded-xl mr-4 text-stone-600">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">Pay at Cashier</p>
                    <p className="text-xs text-stone-500">Pay with cash when you arrive</p>
                  </div>
                </label>

                {/* E-Wallet */}
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "EWALLET" 
                    ? "border-primary bg-primary/5" 
                    : "border-stone-100 hover:border-stone-200 hover:bg-stone-50"
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="EWALLET"
                    checked={paymentMethod === "EWALLET"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                    paymentMethod === "EWALLET" ? "border-primary" : "border-stone-300"
                  }`}>
                    {paymentMethod === "EWALLET" && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <div className="bg-stone-100 p-2.5 rounded-xl mr-4 text-stone-600">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">E-Wallet (QRIS)</p>
                    <p className="text-xs text-stone-500">Scan QR code at the counter</p>
                  </div>
                </label>

                {/* Credit Card */}
                <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "CARD" 
                    ? "border-primary bg-primary/5" 
                    : "border-stone-100 hover:border-stone-200 hover:bg-stone-50"
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                    paymentMethod === "CARD" ? "border-primary" : "border-stone-300"
                  }`}>
                    {paymentMethod === "CARD" && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                  <div className="bg-stone-100 p-2.5 rounded-xl mr-4 text-stone-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">Credit / Debit Card</p>
                    <p className="text-xs text-stone-500">Pay securely with your card</p>
                  </div>
                </label>

              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-stone-200 sticky top-28">
              <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>
              
              {items.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.menuItem.id} className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-medium text-stone-800">{item.menuItem.name}</p>
                          <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-stone-800">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-stone-100 pt-4 mb-8">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-stone-600">Total Amount</p>
                      <p className="font-heading font-bold text-2xl text-primary">${cartTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 mb-6">
                  <p className="text-stone-500 mb-2">No items in your order.</p>
                  <p className="text-sm text-stone-400">You are only reserving the table.</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Reservation"
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
