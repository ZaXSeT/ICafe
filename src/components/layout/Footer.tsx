import Link from "next/link";
import { Coffee } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/20 bg-background pt-12 md:pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">

        {/* Top: Logo + Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Coffee className="h-6 w-6 text-primary" />
              <span className="font-heading text-2xl font-bold tracking-tight">ICafe</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Artisanal coffee and exquisite pastries in a space designed for connection.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-heading text-base font-bold mb-4">Explore</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/menu" className="hover:text-primary transition-colors">Our Menu</Link></li>
              <li><Link href="/reservations" className="hover:text-primary transition-colors">Reservations</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading text-base font-bold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-heading text-base font-bold mb-4">Connect</h3>
            <div className="flex gap-4 mb-5">
              {/* Instagram */}
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              123 Artisan Ave<br />
              Coffee District, CA
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border/20 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ICafe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
