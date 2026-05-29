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
      { id: "item-1", name: "Cappuccino", description: "Double shot espresso with steamed milk foam.", price: 4.5, isAvailable: true, image: "/images/latte_art.png" },
      { id: "item-2", name: "Iced Americano", description: "Espresso stretched with cold water over ice.", price: 3.5, isAvailable: true, image: "/images/cafe_hero.png" },
      { id: "item-3", name: "Caramel Macchiato", description: "Vanilla syrup, steamed milk, espresso, caramel drizzle.", price: 5.5, isAvailable: true, image: "/images/latte_art.png" },
    ]
  },
  {
    id: "cat-2",
    name: "Pastries & Sweets",
    description: "Freshly baked daily.",
    menuItems: [
      { id: "item-4", name: "Butter Croissant", description: "Flaky, golden, and buttery.", price: 3.0, isAvailable: true, image: "/images/croissant.png" },
      { id: "item-5", name: "Blueberry Muffin", description: "Loaded with wild blueberries.", price: 3.5, isAvailable: true, image: "/images/croissant.png" },
    ]
  }
];

export async function getMenuData() {
  // Always return mock data until the database credentials are fixed
  return MOCK_CATEGORIES;
}
