"use client";

import Link from "next/link";
import { Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/reservations", label: "Reservations" },
    { href: "/about", label: "Our Story" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "bg-background/90 backdrop-blur-md shadow-sm h-16" : "bg-transparent h-20"
        }`}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105" onClick={() => setMobileOpen(false)}>
            <Coffee className="h-6 w-6 text-primary" />
            <span className="font-heading text-2xl font-bold tracking-tight text-foreground translate-y-[2px]">ICafe</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 bg-foreground/5 border border-border/30 px-8 py-2.5 rounded-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link
              href="/reservations/new"
              className="bg-primary text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-full shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
            >
              Book a Table
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-foreground/5 transition-colors z-50"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Menu */}
      <div
        className={`fixed inset-0 z-40 bg-background flex flex-col transition-all duration-500 ease-in-out md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-6 pb-10">
          {/* Nav Links */}
          <nav className="flex flex-col gap-2 flex-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-4xl font-heading font-bold text-foreground py-4 border-b border-border/20 hover:text-primary transition-all duration-300 ${
                  mobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Bottom CTA */}
          <div className="flex flex-col gap-3 mt-8">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center border-2 border-foreground/20 text-foreground font-bold py-4 rounded-2xl hover:border-primary hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/reservations/new"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center bg-primary text-primary-foreground font-bold py-4 rounded-2xl shadow-lg hover:bg-primary/90 transition-colors"
            >
              Book a Table
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
