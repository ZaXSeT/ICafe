"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Users, Clock, MapPin, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartContext";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "AVAILABLE" | "RESERVED" | "OUT_OF_SERVICE";
  location: string;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "shadow-sm border-transparent",
  RESERVED: "bg-stone-50/50 border-stone-200",
  OUT_OF_SERVICE: "bg-stone-100 border-stone-200",
};

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-amber-500",
  RESERVED: "bg-stone-500",
  OUT_OF_SERVICE: "bg-stone-300",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  OUT_OF_SERVICE: "Out of Service",
};

// Mock tables data as fallback when Firestore has no tables seeded
const MOCK_TABLES: Table[] = [
  { id: "table-1", number: 1, capacity: 2, status: "AVAILABLE", location: "Window" },
  { id: "table-2", number: 2, capacity: 2, status: "AVAILABLE", location: "Window" },
  { id: "table-3", number: 3, capacity: 4, status: "AVAILABLE", location: "Main Floor" },
  { id: "table-4", number: 4, capacity: 4, status: "AVAILABLE", location: "Main Floor" },
  { id: "table-5", number: 5, capacity: 6, status: "AVAILABLE", location: "Patio" },
  { id: "table-6", number: 6, capacity: 2, status: "AVAILABLE", location: "Bar" },
  { id: "table-7", number: 7, capacity: 8, status: "AVAILABLE", location: "Private Room" },
  { id: "table-8", number: 8, capacity: 4, status: "AVAILABLE", location: "Patio" },
];

export default function ReservationsPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [usingMock, setUsingMock] = useState(false);
  const { user, profile } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();

  // Real-time listener for tables
  useEffect(() => {
    let isMounted = true;
    
    // Add a timeout in case Firestore is hanging (e.g., database not created yet)
    const fallbackTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn("Firestore connection timed out, using mock data.");
        setTables(MOCK_TABLES);
        setUsingMock(true);
        setLoading(false);
      }
    }, 3000);

    const unsubscribe = onSnapshot(
      collection(db, "tables"),
      (snapshot) => {
        clearTimeout(fallbackTimeout);
        if (!isMounted) return;
        
        if (snapshot.empty) {
          // No tables in Firestore, use mock data
          setTables(MOCK_TABLES);
          setUsingMock(true);
        } else {
          const tableData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Table[];
          
          // Merge with mock tables to ensure all tables are always displayed
          // even if only some are seeded in Firestore
          const mergedTables = MOCK_TABLES.map(mockTable => {
            const firestoreTable = tableData.find(t => t.id === mockTable.id);
            return firestoreTable ? { ...mockTable, ...firestoreTable } : mockTable;
          });

          mergedTables.sort((a, b) => a.number - b.number);
          setTables(mergedTables);
          setUsingMock(false);
        }
        setLoading(false);
      },
      (error) => {
        clearTimeout(fallbackTimeout);
        if (!isMounted) return;
        
        console.error("Error listening to tables:", error);
        setTables(MOCK_TABLES);
        setUsingMock(true);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      unsubscribe();
    };
  }, []);

  const handleBookTable = async (table: Table) => {
    if (!user) {
      toast.error("Login Required", {
        description: "Please sign in to book a table.",
      });
      router.push("/login");
      return;
    }

    if (table.status !== "AVAILABLE") {
      toast.error("Table unavailable", {
        description: "This table is already reserved or occupied.",
      });
      return;
    }

    // If it's already selected, go to checkout
    if (selectedTable?.id === table.id) {
      if (items.length === 0) {
        toast.error("Cart is empty", {
          description: "Please order at least one menu item to reserve a table.",
        });
        return;
      }
      
      setBookingId(table.id); // Show loader just in case
      sessionStorage.setItem("icafe_pending_reservation", JSON.stringify(table));
      router.push("/checkout");
    } else {
      // Just select it
      setSelectedTable(table);
    }
  };

  return (
    <div className="flex-1 pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-stone-800 leading-snug md:leading-tight">
            Reserve Your Table
          </h1>
          <p className="text-base md:text-lg text-stone-600 font-medium mt-2">
            See real-time table availability and book your spot instantly.
          </p>
        </div>

        {/* Order Summary (If Cart is not empty) */}
        {items.length > 0 && (
          <div className="bg-white border-2 border-amber-700/20 rounded-3xl p-6 md:p-8 mb-12 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-stone-800">Your Order Summary</h2>
                <p className="text-sm text-stone-500">Select a table below to checkout with your order.</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-stone-800 text-sm bg-stone-100 px-2 py-1 rounded-md">{item.quantity}x</span>
                    <span className="text-stone-700 font-medium text-sm">{item.menuItem.name}</span>
                  </div>
                  <span className="text-stone-600 text-sm font-semibold">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-stone-100">
              <span className="font-bold text-stone-800">Total to pay at cafe</span>
              <span className="text-2xl font-bold text-amber-700">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        )}



        {/* Status Legend */}
        <div className="flex flex-wrap gap-6 justify-center mb-10 bg-white/50 py-4 px-6 rounded-full border border-stone-200/50 backdrop-blur-sm mx-auto w-fit">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2.5 text-sm font-medium">
              <span className={`w-3 h-3 rounded-full shadow-sm ${STATUS_DOT[key]}`} />
              <span className="text-stone-600">{label}</span>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
          <span className="text-sm text-stone-500 font-semibold tracking-wide uppercase">Live — updates automatically</span>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-amber-700" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`group relative bg-white border-2 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 transition-all duration-300 flex flex-col ${STATUS_COLORS[table.status]} ${
                  selectedTable?.id === table.id
                    ? "border-primary shadow-lg ring-4 ring-primary/10 -translate-y-1.5"
                    : table.status === "AVAILABLE"
                    ? "hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-1.5 cursor-pointer border-transparent"
                    : "opacity-75 border-stone-100"
                }`}
                onClick={() =>
                  table.status === "AVAILABLE" && handleBookTable(table)
                }
              >
                {/* Status dot */}
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <span className="text-xl md:text-3xl font-heading font-black text-stone-800">
                    #{table.number}
                  </span>
                  <span
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full shadow-sm ${STATUS_DOT[table.status]} ${
                      table.status === "AVAILABLE" ? "animate-pulse" : ""
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="space-y-1 md:space-y-2 mb-4 md:mb-6">
                  <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-stone-600">
                    <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-stone-400" />
                    <span>{table.capacity} <span className="hidden sm:inline">seats</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-stone-600">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-stone-400" />
                    <span className="truncate">{table.location}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-auto pt-2">
                  {table.status === "AVAILABLE" ? (
                    <button
                      disabled={bookingId === table.id}
                      className={`w-full py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-white text-xs md:text-sm font-bold hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex justify-center items-center gap-1.5 md:gap-2 ${
                        selectedTable?.id === table.id
                          ? "bg-primary hover:bg-primary/90 shadow-primary/20"
                          : "bg-amber-700 hover:bg-amber-800"
                      }`}
                    >
                      {bookingId === table.id ? (
                        <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                      ) : selectedTable?.id === table.id ? (
                        "Checkout →"
                      ) : (
                        "Book"
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 md:py-3.5 rounded-xl md:rounded-2xl bg-stone-100 text-center text-xs md:text-sm font-bold text-stone-500 border border-stone-200/50">
                      {table.status === "OUT_OF_SERVICE" ? "N/A" : STATUS_LABELS[table.status]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
