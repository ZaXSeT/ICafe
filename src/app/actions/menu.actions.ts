"use server";

// Temporarily disabled PrismaClient to prevent module evaluation crash
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// Mock data in case DB connection fails
const MOCK_CATEGORIES = [
  {
    id: "cat-1",
    name: "Espresso Bar",
    description: "Rich, bold, and crafted to perfection.",
    menuItems: [
      { id: "item-1", name: "Cappuccino", description: "Double shot espresso with steamed milk foam.", price: 4.5, isAvailable: true, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop" },
      { id: "item-2", name: "Iced Americano", description: "Espresso stretched with cold water over ice.", price: 3.5, isAvailable: true, image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop" },
      { id: "item-3", name: "Caramel Macchiato", description: "Vanilla syrup, steamed milk, espresso, caramel drizzle.", price: 5.5, isAvailable: true, image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=800&auto=format&fit=crop" },
      { id: "item-6", name: "Flat White", description: "Smooth ristretto shots of espresso with steamed whole milk.", price: 4.0, isAvailable: true, image: "https://images.unsplash.com/photo-1577717903610-d018cc01859c?q=80&w=800&auto=format&fit=crop" },
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

export async function getMenuData() {
  // Always return mock data until the database credentials are fixed
  return MOCK_CATEGORIES;
}
