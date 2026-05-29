"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const featuredItems = [
  {
    id: 1,
    name: "Matcha Latte",
    description: "Premium ceremonial grade matcha.",
    price: "$6.00",
    image: "/images/latte_art.png",
  },
  {
    id: 2,
    name: "Butter Croissant",
    description: "Flaky perfection baked fresh every morning.",
    price: "$3.50",
    image: "/images/croissant.png",
  },
];

export function FeaturedMenu() {
  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">A Taste of Art</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-md">
              Carefully crafted beverages and pastries that look as beautiful as they taste.
            </p>
          </div>
        </div>

        {/* Mobile: Horizontal scroll cards | Desktop: Grid */}
        <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none">
          {featuredItems.map((item, i) => (
            <motion.div
              key={item.id}
              className={`relative flex-shrink-0 w-[75vw] sm:w-[55vw] md:w-auto rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-shadow snap-start ${
                i === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1"
              }`}
              style={{ height: i === 0 ? undefined : undefined }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="relative h-[55vw] sm:h-[40vw] md:h-[300px] lg:h-[380px]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 md:p-8">
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block mb-2">
                    <span className="font-heading font-bold text-white text-sm sm:text-base">{item.price}</span>
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-white/80 text-sm line-clamp-2">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
