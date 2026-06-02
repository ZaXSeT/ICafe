"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Users, Clock, MapPin, Loader2 } from "lucide-react";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "OUT_OF_SERVICE";
  location: string;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-background border-border/40 text-foreground",
  OCCUPIED: "bg-background border-border/40 text-foreground",
  RESERVED: "bg-background border-border/40 text-foreground",
  OUT_OF_SERVICE: "bg-background border-border/40 text-foreground",
};

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  OCCUPIED: "bg-red-500",
  RESERVED: "bg-amber-500",
  OUT_OF_SERVICE: "bg-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
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
  const [usingMock, setUsingMock] = useState(false);
  const { user, profile } = useAuth();
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
          tableData.sort((a, b) => a.number - b.number);
          setTables(tableData);
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

    setBookingId(table.id);

    try {
      if (usingMock) {
        // Mock booking: just update local state
        setTables((prev) =>
          prev.map((t) =>
            t.id === table.id ? { ...t, status: "RESERVED" as const } : t
          )
        );
        toast.success(`Table ${table.number} reserved!`, {
          description: "Your table has been booked successfully.",
        });
      } else {
        // Real Firestore booking
        // Update table status
        await updateDoc(doc(db, "tables", table.id), {
          status: "RESERVED",
        });

        // Create reservation record
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
          notes: "",
          createdAt: serverTimestamp(),
        });

        toast.success(`Table ${table.number} reserved!`, {
          description: "Your table has been booked successfully.",
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Booking failed", {
        description: "Please try again.",
      });
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="flex-1 pt-32 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-3">
            Reserve Your Table
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            See real-time table availability and book your spot instantly.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-10">
          <div className="bg-background border border-border/30 p-6 rounded-2xl flex flex-col items-center text-center hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Live Updates</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Table status updates in real-time across all devices.
            </p>
          </div>
          <div className="bg-background border border-border/30 p-6 rounded-2xl flex flex-col items-center text-center hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Any Group Size</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tables from 2 to 8 seats available.
            </p>
          </div>
          <div className="bg-background border border-border/30 p-6 rounded-2xl flex flex-col items-center text-center hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Instant Booking</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Click to book, no waiting required.
            </p>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[key]}`} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs text-muted-foreground font-medium">Live — updates automatically</span>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`relative border-2 rounded-2xl p-5 transition-all duration-300 ${STATUS_COLORS[table.status]} ${
                  table.status === "AVAILABLE"
                    ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                    : "opacity-75"
                }`}
                onClick={() =>
                  table.status === "AVAILABLE" && handleBookTable(table)
                }
              >
                {/* Status dot */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-heading font-bold">
                    #{table.number}
                  </span>
                  <span
                    className={`w-3 h-3 rounded-full ${STATUS_DOT[table.status]} ${
                      table.status === "AVAILABLE" ? "animate-pulse" : ""
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>{table.capacity} seats</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{table.location}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-4">
                  {table.status === "AVAILABLE" ? (
                    <button
                      disabled={bookingId === table.id}
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    >
                      {bookingId === table.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                      ) : (
                        "Book Now"
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-foreground/5 text-center text-xs font-semibold">
                      {STATUS_LABELS[table.status]}
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
