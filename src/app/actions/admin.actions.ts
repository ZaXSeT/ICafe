"use server";

import { getStaffSession } from "./staff.actions";

// Global state to store mock orders in memory during development
const mockOrders: any[] = [
  {
    id: "mock-1",
    type: "ONLINE",
    tableNumber: "T1",
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
    order: {
      total: 12.5,
      items: [
        { name: "Cappuccino", quantity: 2, price: 4.5 },
        { name: "Blueberry Muffin", quantity: 1, price: 3.5 }
      ]
    }
  },
  {
    id: "mock-2",
    type: "POS",
    tableNumber: "T3",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    order: {
      total: 8.0,
      items: [
        { name: "Flat White", quantity: 2, price: 4.0 }
      ]
    }
  }
];

export async function getAdminOrders() {
  const session = await getStaffSession();
  if (!session) throw new Error("Unauthorized");

  const hasAdminCredentials = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!hasAdminCredentials) {
    // Return mock orders from memory, sorted by newest first
    return [...mockOrders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    
    // Fetch online reservations
    const reservationsSnapshot = await adminDb.collection("reservations")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
      
    const reservations = reservationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: "ONLINE",
        tableNumber: data.tableNumber,
        status: data.status,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        order: data.order || null,
        notes: data.notes
      };
    });

    // Fetch POS orders
    const posSnapshot = await adminDb.collection("pos_orders")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
      
    const posOrders = posSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: "POS",
        tableNumber: data.tableNumber || "Takeaway",
        status: data.status,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        order: data.order || null,
        notes: data.notes
      };
    });

    // Combine and sort
    const allOrders = [...reservations, ...posOrders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allOrders;
  } catch (e) {
    console.error("Error fetching admin orders:", e);
    return [];
  }
}

export async function completeOrder(id: string, type: "ONLINE" | "POS") {
  const session = await getStaffSession();
  if (!session) throw new Error("Unauthorized");

  const hasAdminCredentials = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!hasAdminCredentials) {
    // Update mock order in memory
    const orderIndex = mockOrders.findIndex(o => o.id === id);
    if (orderIndex >= 0) {
      mockOrders[orderIndex] = {
        ...mockOrders[orderIndex],
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
        completedBy: session.name
      };
    }
    return { success: true };
  }

  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    const collectionName = type === "ONLINE" ? "reservations" : "pos_orders";
    
    await adminDb.collection(collectionName).doc(id).update({
      status: "COMPLETED",
      completedAt: new Date(),
      completedBy: session.name
    });

    return { success: true };
  } catch (e) {
    console.error("Error completing order:", e);
    return { success: false, error: "Failed to update order" };
  }
}

export async function createPosOrder(order: any, tableNumber: string = "Takeaway", notes: string = "") {
  const session = await getStaffSession();
  if (!session) throw new Error("Unauthorized");

  const hasAdminCredentials = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!hasAdminCredentials) {
    // Save mock order in memory
    const newOrder = {
      id: `pos-${Math.floor(Math.random() * 10000)}`,
      type: "POS",
      tableNumber,
      status: "COMPLETED", // POS orders are typically completed instantly
      notes,
      order,
      createdAt: new Date().toISOString()
    };
    mockOrders.push(newOrder);

    return { 
      success: true, 
      orderId: newOrder.id,
      createdAt: newOrder.createdAt
    };
  }

  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    const docRef = await adminDb.collection("pos_orders").add({
      staffId: session.id,
      staffName: session.name,
      tableNumber,
      status: "COMPLETED",
      notes,
      order,
      createdAt: new Date()
    });

    return { 
      success: true, 
      orderId: docRef.id,
      createdAt: new Date().toISOString()
    };
  } catch (e) {
    console.error("Error creating POS order:", e);
    return { success: false, error: "Failed to create POS order" };
  }
}
