import { getMenuData } from "@/app/actions/menu.actions";
import { MenuSection } from "@/components/features/MenuSection";
import { cookies } from "next/headers";

export default async function MobileMenuPage() {
  const categories = await getMenuData();

  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token");
  const isLoggedIn = !!token?.value;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-heading font-bold text-stone-800">Menu</h1>
        <p className="text-sm text-stone-500 mt-1">Browse & order your favorites</p>
      </div>

      {/* Category Pills — horizontal scroll */}
      <div className="flex overflow-x-auto gap-2 pb-3 px-6 scrollbar-hide">
        {categories.map((cat: { id: string; name: string }) => (
          <a
            key={cat.id}
            href={`#${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex-shrink-0 px-4 py-2 rounded-full bg-foreground/5 border border-border/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors whitespace-nowrap text-xs font-semibold"
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="px-4">
        <MenuSection categories={categories as any} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
