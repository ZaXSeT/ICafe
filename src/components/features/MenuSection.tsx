"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  menuItems: MenuItem[];
}

export function MenuSection({ categories }: { categories: Category[] }) {
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleAddToCart = (id: string) => {
    setAddedItems(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {categories.map(category => (
        <section key={category.id} className="scroll-mt-28" id={category.name.toLowerCase().replace(/\s+/g, '-')}>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-heading font-bold">{category.name}</h2>
            {category.description && (
              <p className="text-muted-foreground mt-1 text-sm md:text-base">{category.description}</p>
            )}
          </div>

          {/* Mobile: Compact list | Desktop: Card grid */}
          <div className="block md:hidden space-y-3">
            {category.menuItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-background border border-border/30 rounded-2xl p-3 hover:border-primary/30 transition-all"
              >
                {/* Thumbnail */}
                {item.image ? (
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    ☕
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>
                  )}
                  <span className="text-sm font-bold text-primary mt-1 block">${item.price.toFixed(2)}</span>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => handleAddToCart(item.id)}
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    addedItems[item.id]
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/5 text-foreground hover:bg-primary hover:text-primary-foreground border border-border/30"
                  }`}
                >
                  {addedItems[item.id] ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop: Card Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {category.menuItems.map(item => (
              <div
                key={item.id}
                className="group relative bg-background border border-border/30 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {item.image && (
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg font-heading leading-normal pb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                    </div>
                    <span className="font-bold text-base font-heading text-primary flex-shrink-0">${item.price.toFixed(2)}</span>
                  </div>

                  <div className="mt-auto pt-4 flex justify-end">
                    <button
                      onClick={() => handleAddToCart(item.id)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all ${
                        addedItems[item.id]
                          ? "bg-primary text-primary-foreground"
                          : "bg-foreground/5 text-foreground hover:bg-primary hover:text-primary-foreground border border-border/20"
                      }`}
                    >
                      {addedItems[item.id] ? (
                        <><Check className="w-3.5 h-3.5" /> Added</>
                      ) : (
                        <><Plus className="w-3.5 h-3.5" /> Add</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
