"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/components/providers/CartContext";
import { Heart, Plus, Coffee } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export function FavoritesSection() {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();

  const handleQuickAdd = (fav: typeof favorites[0]) => {
    addToCart({
      id: fav.id,
      name: fav.name,
      price: fav.price,
      image: fav.image,
      description: null,
      isAvailable: true,
    });
  };

  if (favorites.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-stone-800 font-heading mb-4">Your Favorites</h2>
        <div className="bg-stone-100/50 border border-stone-200/50 rounded-2xl p-6 text-center">
          <Heart className="w-8 h-8 text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-500 font-medium">No favorites yet</p>
          <p className="text-xs text-stone-400 mt-1">Tap the ♥ on menu items to save them here</p>
          <Link href="/app/menu" className="inline-block mt-4 text-primary text-xs font-bold hover:underline">
            Browse Menu →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-stone-800 font-heading">Your Favorites</h2>
        <Link href="/app/menu" className="text-primary text-xs font-bold">
          See Menu →
        </Link>
      </div>
      <div className="space-y-3">
        {favorites.slice(0, 5).map((fav) => (
          <div key={fav.id} className="bg-white border border-stone-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-14 h-14 rounded-xl overflow-hidden relative bg-stone-100 flex-shrink-0">
              {fav.image ? (
                <Image src={fav.image} alt={fav.name} fill sizes="56px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-stone-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-stone-800 text-sm truncate">{fav.name}</h3>
              <p className="text-primary font-bold text-sm mt-0.5">${fav.price.toFixed(2)}</p>
            </div>

            {/* Remove favorite */}
            <button
              onClick={() => {
                removeFavorite(fav.id);
                toast.success(`Removed ${fav.name} from favorites`, { id: "fav-toast" });
              }}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            >
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            </button>

            {/* Quick add to cart */}
            <button
              onClick={() => handleQuickAdd(fav)}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
