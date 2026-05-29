import { Calendar, Users, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReservationsPage() {
  return (
    <div className="flex-1 flex flex-col justify-center pt-16 pb-8 md:pt-6 md:pb-6">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Reserve Your Table</h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Experience our artisanal coffee and warm atmosphere. Book a table ahead of time to guarantee your spot.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
            <Calendar className="w-10 h-10 text-primary mb-3" />
            <h3 className="font-heading font-bold text-xl mb-2">Pick a Date</h3>
            <p className="text-muted-foreground text-sm">Plan ahead up to 14 days in advance.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
            <Users className="w-10 h-10 text-primary mb-3" />
            <h3 className="font-heading font-bold text-xl mb-2">Party Size</h3>
            <p className="text-muted-foreground text-sm">Accommodating groups from 1 to 8 people.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
            <Clock className="w-10 h-10 text-primary mb-3" />
            <h3 className="font-heading font-bold text-xl mb-2">Choose a Time</h3>
            <p className="text-muted-foreground text-sm">Flexible booking slots throughout the day.</p>
          </div>
        </div>

        <Link href="/reservations/new" className="inline-flex items-center justify-center rounded-full text-base px-8 py-3.5 bg-primary text-primary-foreground font-bold shadow-xl hover:bg-primary/90 transition-colors">
          Start Booking
        </Link>
      </div>
    </div>
  );
}
