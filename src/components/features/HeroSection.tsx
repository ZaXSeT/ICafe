"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] w-full flex items-center overflow-hidden bg-background">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-20 pb-10 w-full">

        {/* Left: Typography — min-w-0 prevents overflow from grid cell */}
        <div className="flex flex-col justify-center text-left order-2 lg:order-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-w-0"
          >
            <h1 className="font-heading font-bold tracking-tight text-foreground leading-[1.1] text-[clamp(2.8rem,5vw,4.5rem)]">
              Sip <br />
              <span className="text-primary italic">perfection.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-5 text-base md:text-lg text-muted-foreground max-w-md"
          >
            Experience artisanal coffee and exquisite pastries in a space designed for connection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/reservations/new"
              className="inline-flex items-center justify-center h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 hover:-translate-y-1 transition-all"
            >
              Book a Table <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-full border-2 border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-all"
            >
              Explore Menu
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">4.9 · 200+ happy customers</span>
          </motion.div>
        </div>

        {/* Right: Hero Image */}
        <motion.div
          className="relative h-[50vw] max-h-[420px] sm:max-h-[500px] lg:max-h-none lg:h-[80vh] w-full rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl order-1 lg:order-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <Image
            src="/images/cafe_hero.png"
            alt="Beautiful Cafe Interior"
            fill
            className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-[2s] ease-out"
            priority
          />

          {/* Review Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 bg-background/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 max-w-[220px] sm:max-w-xs shadow-lg"
          >
            <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">
              &quot;Best aesthetic cafe in town, the coffee is unmatched.&quot;
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
