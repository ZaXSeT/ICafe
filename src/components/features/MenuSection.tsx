"use client";

import { useState } from "react";
import { Plus, Check, Heart } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "../providers/CartContext";
import { useFavorites } from "@/hooks/useFavorites";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isAvailable: boolean;
  isNew?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  menuItems: MenuItem[];
}

export function MenuSection({ categories, isLoggedIn }: { categories: Category[], isLoggedIn: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const isInApp = pathname.startsWith("/app");
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleAddToCart = (item: MenuItem) => {
    if (!isLoggedIn) {
      toast.error("Login Required", {
        description: "Please login first to add items to your order."
      });
      router.push(isInApp ? "/app/login" : "/login");
      return;
    }
    addToCart(item);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const handleToggleFavorite = (item: MenuItem) => {
    if (!isLoggedIn) {
      toast.error("Login Required", {
        description: "Please login first to save favorites."
      });
      return;
    }
    toggleFavorite({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    toast.success(
      isFavorite(item.id) ? `Removed ${item.name} from favorites` : `Added ${item.name} to favorites`,
      { id: "fav-toast" }
    );
  };

  return (
    <div className="space-y-10 md:space-y-12">
      {categories.map(category => (
        <section key={category.id} className="scroll-mt-24" id={category.name.toLowerCase().replace(/\s+/g, '-')}>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-heading font-bold pb-1 md:pb-2">{category.name}</h2>
            {category.description && (
              <p className="text-muted-foreground mt-1 text-sm md:text-base">{category.description}</p>
            )}
          </div>

          {/* Mobile: Compact list */}
          <div className="block md:hidden space-y-3">
            {category.menuItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-background border border-border/30 rounded-2xl p-3 hover:border-primary/30 transition-all"
              >
                {/* Thumbnail */}
                {item.image ? (
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    ☕
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
                    {item.isNew && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex-shrink-0">New</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>
                  )}
                  <span className="text-sm font-bold text-primary mt-1 block">${item.price.toFixed(2)}</span>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => handleToggleFavorite(item)}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                >
                  <Heart className={`w-4 h-4 transition-colors ${isFavorite(item.id) ? "fill-red-500 text-red-500" : "text-stone-300 hover:text-red-400"}`} />
                </button>

                {/* Add Button */}
                <button
                  onClick={() => handleAddToCart(item as any)}
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
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.menuItems.map(item => (
              <div
                key={item.id}
                className="group relative bg-background border border-border/30 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {item.image ? (
                  <div className="relative aspect-[3/2] w-full overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted flex items-center justify-center text-4xl flex-shrink-0">
                    ☕
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 pb-0.5">
                        <h3 className="font-semibold text-base font-heading leading-tight truncate pt-1 pb-1">{item.name}</h3>
                        {item.isNew && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex-shrink-0">New</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                    </div>
                    <span className="font-bold text-sm font-heading text-primary flex-shrink-0">${item.price.toFixed(2)}</span>
                  </div>

                  <div className="mt-auto pt-4 flex justify-end">
                    <button
                      onClick={() => handleAddToCart(item as any)}
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
