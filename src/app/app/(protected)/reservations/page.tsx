"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, MapPin, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "AVAILABLE" | "RESERVED" | "OUT_OF_SERVICE";
  location: string;
}

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-amber-500",
  RESERVED: "bg-stone-500",
  OUT_OF_SERVICE: "bg-stone-300",
};

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

export default function MobileReservationsPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fallbackTimeout = setTimeout(() => {
      if (isMounted) {
        setTables(MOCK_TABLES);
        setLoading(false);
      }
    }, 3000);

    const unsubscribe = onSnapshot(
      collection(db, "tables"),
      (snapshot) => {
        clearTimeout(fallbackTimeout);
        if (!isMounted) return;

        if (snapshot.empty) {
          setTables(MOCK_TABLES);
        } else {
          const tableData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Table[];

          const mergedTables = MOCK_TABLES.map(mockTable => {
            const firestoreTable = tableData.find(t => t.id === mockTable.id);
            return firestoreTable ? { ...mockTable, ...firestoreTable } : mockTable;
          });

          mergedTables.sort((a, b) => a.number - b.number);
          setTables(mergedTables);
        }
        setLoading(false);
      },
      () => {
        clearTimeout(fallbackTimeout);
        if (!isMounted) return;
        setTables(MOCK_TABLES);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      unsubscribe();
    };
  }, []);

  const handleBookTable = (table: Table) => {
    if (table.status !== "AVAILABLE") return;

    if (selectedTable?.id === table.id) {
      // Confirm booking
      sessionStorage.setItem("icafe_pending_reservation", JSON.stringify(table));
      router.push("/app/cart");
      toast.success(`Table #${table.number} selected! Proceed to checkout.`);
    } else {
      setSelectedTable(table);
    }
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <Link href="/app" className="text-stone-400 hover:text-stone-600 transition-colors mb-3 flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-heading font-bold text-stone-800">Reserve a Table</h1>
        <p className="text-sm text-stone-500 mt-1">Real-time availability</p>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 px-6 mb-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <span className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase">Live updates</span>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center gap-4 px-6 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] text-stone-500 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[10px] text-stone-500 font-medium">Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-300" />
              <span className="text-[10px] text-stone-500 font-medium">N/A</span>
            </div>
          </div>

          <div className="px-4 grid grid-cols-2 gap-3">
            {tables.map((table) => {
              const isAvailable = table.status === "AVAILABLE";
              const isReserved = table.status === "RESERVED";
              const isSelected = selectedTable?.id === table.id;

              return (
                <div
                  key={table.id}
                  className={`relative border-2 rounded-2xl p-4 transition-all duration-200 ${
                    isSelected
                      ? "bg-white border-primary shadow-lg ring-4 ring-primary/10 -translate-y-1"
                      : isAvailable
                      ? "bg-white border-transparent shadow-sm hover:shadow-md cursor-pointer active:scale-[0.97]"
                      : "bg-stone-50 border-stone-100 cursor-not-allowed"
                  }`}
                  onClick={() => isAvailable && handleBookTable(table)}
                >
                  {/* Reserved overlay badge */}
                  {isReserved && (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Reserved
                    </div>
                  )}
                  {table.status === "OUT_OF_SERVICE" && (
                    <div className="absolute top-2 right-2 bg-stone-200 text-stone-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Closed
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-lg font-heading font-black ${isAvailable ? "text-stone-800" : "text-stone-400"}`}>
                      #{table.number}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isAvailable ? "bg-amber-500 animate-pulse" : isReserved ? "bg-red-400" : "bg-stone-300"
                    }`} />
                  </div>

                  <div className={`space-y-1.5 mb-3 ${!isAvailable ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity} seats</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                      <MapPin className="w-3 h-3" />
                      <span>{table.location}</span>
                    </div>
                  </div>

                  {isAvailable ? (
                    <button className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-amber-700 text-white"
                    }`}>
                      {isSelected ? "Confirm →" : "Book"}
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-stone-100 text-center text-xs font-bold text-stone-400 border border-stone-200/50">
                      Unavailable
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
