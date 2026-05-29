"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const tables = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  status: [3, 7, 10].includes(i + 1) ? "booked" : "available",
}));

const timeSlots = ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM"];

export default function NewReservationPage() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("12:00 PM");

  return (
    <div className="min-h-screen pt-20 pb-24 flex flex-col items-center bg-background px-4">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8 md:mb-12 pt-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-3">Book a Table</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Select an available table for today.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-background border border-border/30 rounded-2xl md:rounded-[2rem] p-6 md:p-10 shadow-xl">

        {/* Time Selection */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-lg font-bold mb-4 text-foreground">1. Pick a Time</h2>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3.5 px-4 rounded-xl text-sm font-bold transition-all border-2 
                  ${selectedTime === time
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border/40 bg-background text-foreground hover:border-primary/50"
                  }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Table Selection */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-lg font-bold mb-4 text-foreground">2. Select Table Number</h2>
          <div className="grid grid-cols-4 gap-3">
            {tables.map((table) => {
              const isSelected = selectedTable === table.id;
              const isAvailable = table.status === "available";

              return (
                <button
                  key={table.id}
                  disabled={!isAvailable}
                  onClick={() => setSelectedTable(table.id)}
                  className={`
                    relative h-16 sm:h-20 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all border-2
                    ${!isAvailable
                      ? "opacity-50 cursor-not-allowed border-transparent bg-foreground/5 text-muted-foreground"
                      : isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-md scale-105"
                        : "border-border/40 bg-background text-foreground hover:border-primary/50 active:scale-95"}
                  `}
                >
                  <span className="font-heading text-xl sm:text-2xl font-bold leading-none">{table.number}</span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold mt-1 opacity-70">
                    {isAvailable ? "Free" : "Booked"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          disabled={!selectedTable}
          className="w-full h-12 sm:h-14 rounded-full text-base font-bold shadow-xl flex items-center justify-center gap-2 bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-98 transition-all"
        >
          {selectedTable
            ? <>Confirm Table {selectedTable} <ArrowRight className="w-4 h-4" /></>
            : "Select a Table to Continue"
          }
        </button>
      </div>
    </div>
  );
}
