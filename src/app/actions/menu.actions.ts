"use server";

import { revalidatePath } from "next/cache";

// Mock data as fallback (in case Firestore is empty or has no data seeded yet)
const INITIAL_CATEGORIES = [
  {
    id: "cat-1",
    name: "Espresso Bar",
    description: "Rich, bold, and crafted to perfection.",
    menuItems: [
      { id: "item-1", name: "Cappuccino", description: "Double shot espresso with steamed milk foam.", price: 4.5, isAvailable: true, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop" },
      { id: "item-2", name: "Iced Americano", description: "Espresso stretched with cold water over ice.", price: 3.5, isAvailable: true, image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop" },
      { id: "item-3", name: "Caramel Macchiato", description: "Vanilla syrup, steamed milk, espresso, caramel drizzle.", price: 5.5, isAvailable: true, image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=800&auto=format&fit=crop" },
      { id: "item-6", name: "Flat White", description: "Smooth ristretto shots of espresso with steamed whole milk.", price: 4.0, isAvailable: true, image: "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?q=80&w=800&auto=format&fit=crop" },
      { id: "item-7", name: "Mocha Frappe", description: "Blended coffee, chocolate syrup, milk, and ice topped with whipped cream.", price: 6.0, isAvailable: true, image: "https://images.unsplash.com/photo-1530373239216-42518e6b4063?q=80&w=800&auto=format&fit=crop" },
      { id: "item-8", name: "Matcha Latte", description: "Premium matcha green tea with steamed milk.", price: 5.0, isAvailable: true, image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800&auto=format&fit=crop" },
      { id: "item-9", name: "Vanilla Latte", description: "Espresso, steamed milk, and classic vanilla syrup.", price: 4.75, isAvailable: true, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop" },
      { id: "item-10", name: "Espresso Con Panna", description: "Espresso topped with a dollop of whipped cream.", price: 3.25, isAvailable: true, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop" },
    ]
  },
  {
    id: "cat-2",
    name: "Pastries & Sweets",
    description: "Freshly baked daily.",
    menuItems: [
      { id: "item-4", name: "Butter Croissant", description: "Flaky, golden, and buttery.", price: 3.0, isAvailable: true, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop" },
      { id: "item-5", name: "Blueberry Muffin", description: "Loaded with wild blueberries.", price: 3.5, isAvailable: true, image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=800&auto=format&fit=crop" },
      { id: "item-11", name: "Chocolate Chip Cookie", description: "Warm and chewy with dark chocolate chunks.", price: 2.75, isAvailable: true, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop" },
      { id: "item-12", name: "Cinnamon Roll", description: "Topped with rich cream cheese icing.", price: 4.25, isAvailable: true, image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=800&auto=format&fit=crop" },
    ]
  }
];

// Ensure mock data persists across Next.js thread boundaries in development
const globalForMock = globalThis as unknown as {
  __MOCK_CATEGORIES: any[];
  __NEXT_ITEM_ID: number;
};

if (!globalForMock.__MOCK_CATEGORIES) {
  globalForMock.__MOCK_CATEGORIES = INITIAL_CATEGORIES;
  globalForMock.__NEXT_ITEM_ID = 100;
}

const MOCK_CATEGORIES = globalForMock.__MOCK_CATEGORIES;

export async function addMenuItem(categoryId: string, item: any) {
  const hasAdminCredentials = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!hasAdminCredentials) {
    const cat = MOCK_CATEGORIES.find(c => c.id === categoryId);
    if (cat) {
      const newItem = { ...item, id: `item-${globalForMock.__NEXT_ITEM_ID++}`, isAvailable: true, isNew: true };
      cat.menuItems.push(newItem);
      revalidatePath("/", "layout");
      return { success: true, item: newItem };
    }
    return { success: false, error: "Category not found" };
  }

  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    const docRef = await adminDb.collection("categories").doc(categoryId).collection("menuItems").add({
      ...item,
      isAvailable: true,
      isNew: true,
      createdAt: new Date()
    });
    revalidatePath("/", "layout");
    return { success: true, item: { id: docRef.id, ...item, isAvailable: true, isNew: true } };
  } catch (e) {
    return { success: false, error: "Failed to add to database" };
  }
}

export async function deleteMenuItem(categoryId: string, itemId: string) {
  const hasAdminCredentials = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!hasAdminCredentials) {
    const cat = MOCK_CATEGORIES.find(c => c.id === categoryId);
    if (cat) {
      cat.menuItems = cat.menuItems.filter((i: any) => i.id !== itemId);
      revalidatePath("/", "layout");
      return { success: true };
    }
    return { success: false };
  }

  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    await adminDb.collection("categories").doc(categoryId).collection("menuItems").doc(itemId).delete();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete from database" };
  }
}

export async function getMenuData() {
  // Check if Firebase Admin credentials are configured
  const hasAdminCredentials = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!hasAdminCredentials) {
    // No admin credentials configured, use mock data directly
    // This avoids the "Could not load default credentials" error
    return MOCK_CATEGORIES;
  }

  try {
    // Dynamically import to avoid module-level initialization errors
    const { adminDb } = await import("@/lib/firebase-admin");
    const categoriesSnapshot = await adminDb.collection("categories").get();

    if (categoriesSnapshot.empty) {
      return MOCK_CATEGORIES;
    }

    const categories = await Promise.all(
      categoriesSnapshot.docs.map(async (catDoc) => {
        const catData = catDoc.data();
        const menuItemsSnapshot = await adminDb
          .collection("categories")
          .doc(catDoc.id)
          .collection("menuItems")
          .get();

        const menuItems = menuItemsSnapshot.docs.map((itemDoc) => ({
          id: itemDoc.id,
          ...itemDoc.data(),
        }));

        return {
          id: catDoc.id,
          name: catData.name,
          description: catData.description || null,
          menuItems,
        };
      })
    );

    return categories;
  } catch (error) {
    console.error("Error fetching menu data from Firestore:", error);
    return MOCK_CATEGORIES;
  }
}
