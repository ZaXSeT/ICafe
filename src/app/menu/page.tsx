import { getMenuData } from "@/app/actions/menu.actions";
import { MenuSection } from "@/components/features/MenuSection";
import { Coffee } from "lucide-react";

export const metadata = {
  title: "Our Menu | ICafe",
  description: "Browse our premium selection of coffees, pastries, and more.",
};

import { auth } from "@/auth";

export default async function MenuPage() {
  const categories = await getMenuData();
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <div className="flex-1 pt-32 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-2 md:mb-4">Our Menu</h1>
          <p className="text-sm md:text-lg text-muted-foreground">
            Crafted with love, served with care.
          </p>
        </div>

        {/* Category Pills — horizontal scroll on mobile */}
        <div className="flex overflow-x-auto gap-2 md:gap-3 pb-3 mb-6 md:mb-8 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:justify-center">
          {categories.map((cat: { id: string; name: string }) => (
            <a
              key={cat.id}
              href={`#${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex-shrink-0 px-4 py-2 rounded-full bg-foreground/5 border border-border/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors whitespace-nowrap text-sm font-semibold"
            >
              {cat.name}
            </a>
          ))}
        </div>

        {/* Menu Grid */}
        <MenuSection categories={categories as any} isLoggedIn={isLoggedIn} />

      </div>
    </div>
  );
}
