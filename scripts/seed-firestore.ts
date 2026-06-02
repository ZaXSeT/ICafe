// Firestore Seeding Script
// Run with: npx tsx scripts/seed-firestore.ts

import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
const app = initializeApp({
  projectId: "icafe-add1f",
});

const db = getFirestore(app);

async function seed() {
  console.log("🌱 Seeding Firestore...\n");

  // --- Seed Categories & Menu Items ---
  console.log("📂 Creating categories and menu items...");

  const espressoBarRef = db.collection("categories").doc();
  await espressoBarRef.set({
    name: "Espresso Bar",
    description: "Rich, bold, and crafted to perfection.",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const espressoItems = [
    { name: "Cappuccino", description: "Double shot espresso with steamed milk foam.", price: 4.5, isAvailable: true, isPopular: true, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop" },
    { name: "Iced Americano", description: "Espresso stretched with cold water over ice.", price: 3.5, isAvailable: true, isPopular: false, image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop" },
    { name: "Caramel Macchiato", description: "Vanilla syrup, steamed milk, espresso, caramel drizzle.", price: 5.5, isAvailable: true, isPopular: true, image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=800&auto=format&fit=crop" },
    { name: "Flat White", description: "Smooth ristretto shots of espresso with steamed whole milk.", price: 4.0, isAvailable: true, isPopular: false, image: "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?q=80&w=800&auto=format&fit=crop" },
    { name: "Mocha Frappe", description: "Blended coffee, chocolate syrup, milk, and ice topped with whipped cream.", price: 6.0, isAvailable: true, isPopular: false, image: "https://images.unsplash.com/photo-1530373239216-42518e6b4063?q=80&w=800&auto=format&fit=crop" },
    { name: "Matcha Latte", description: "Premium matcha green tea with steamed milk.", price: 5.0, isAvailable: true, isPopular: true, image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800&auto=format&fit=crop" },
    { name: "Vanilla Latte", description: "Espresso, steamed milk, and classic vanilla syrup.", price: 4.75, isAvailable: true, isPopular: false, image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop" },
    { name: "Espresso Con Panna", description: "Espresso topped with a dollop of whipped cream.", price: 3.25, isAvailable: true, isPopular: false, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop" },
  ];

  for (const item of espressoItems) {
    await espressoBarRef.collection("menuItems").add({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log(`  ✅ Espresso Bar: ${espressoItems.length} items`);

  const pastryRef = db.collection("categories").doc();
  await pastryRef.set({
    name: "Pastries & Sweets",
    description: "Freshly baked daily.",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const pastryItems = [
    { name: "Butter Croissant", description: "Flaky, golden, and buttery.", price: 3.0, isAvailable: true, isPopular: false, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop" },
    { name: "Blueberry Muffin", description: "Loaded with wild blueberries.", price: 3.5, isAvailable: true, isPopular: true, image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=800&auto=format&fit=crop" },
    { name: "Chocolate Chip Cookie", description: "Warm and chewy with dark chocolate chunks.", price: 2.75, isAvailable: true, isPopular: false, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop" },
    { name: "Cinnamon Roll", description: "Topped with rich cream cheese icing.", price: 4.25, isAvailable: true, isPopular: false, image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=800&auto=format&fit=crop" },
  ];

  for (const item of pastryItems) {
    await pastryRef.collection("menuItems").add({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log(`  ✅ Pastries & Sweets: ${pastryItems.length} items`);

  // --- Seed Tables ---
  console.log("\n🪑 Creating tables...");

  const tablesData = [
    { number: 1, capacity: 2, status: "AVAILABLE", location: "Window" },
    { number: 2, capacity: 2, status: "AVAILABLE", location: "Window" },
    { number: 3, capacity: 4, status: "AVAILABLE", location: "Main Floor" },
    { number: 4, capacity: 4, status: "AVAILABLE", location: "Main Floor" },
    { number: 5, capacity: 6, status: "AVAILABLE", location: "Patio" },
    { number: 6, capacity: 2, status: "AVAILABLE", location: "Bar" },
    { number: 7, capacity: 8, status: "AVAILABLE", location: "Private Room" },
    { number: 8, capacity: 4, status: "AVAILABLE", location: "Patio" },
  ];

  for (const table of tablesData) {
    await db.collection("tables").add({
      ...table,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log(`  ✅ ${tablesData.length} tables created`);

  console.log("\n🎉 Firestore seeded successfully!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
