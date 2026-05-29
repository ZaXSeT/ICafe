"use client";

import { Coffee } from "lucide-react";

export function Marquee() {
  // Array of items to repeat
  const items = Array(10).fill(["DOPPIO", "GALAO", "CAPPUCCINO", "MOCHA"]).flat();

  return (
    <div className="w-full bg-foreground text-background py-4 overflow-hidden relative flex items-center border-y-4 border-background">
      <div className="flex whitespace-nowrap animate-marquee">
        {items.map((text, i) => (
          <div key={i} className="flex items-center mx-4">
            <span className="font-heading font-bold text-2xl tracking-widest">{text}</span>
            <span className="mx-6 text-background/80">☕</span>
          </div>
        ))}
      </div>
    </div>
  );
}
