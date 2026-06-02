"use server";

import { getStaffSession } from "./staff.actions";
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, limit, getDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getAdminOrders() {
  const session = await getStaffSession();
  if (!session) throw new Error("Unauthorized");

  try {
    // Fetch online reservations
    const resRef = collection(db, "reservations");
    const resQuery = query(resRef, orderBy("createdAt", "desc"), limit(50));
    const reservationsSnapshot = await getDocs(resQuery);
      
    const reservations = reservationsSnapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        type: "ONLINE",
        tableNumber: data.tableNumber,
        status: data.status,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        order: data.order || null,
        notes: data.notes
      };
    });

    // Fetch POS orders
    const posRef = collection(db, "pos_orders");
    const posQuery = query(posRef, orderBy("createdAt", "desc"), limit(50));
    const posSnapshot = await getDocs(posQuery);
      
    const posOrders = posSnapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        type: "POS",
        tableNumber: data.tableNumber || "Takeaway",
        status: data.status,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
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

  try {
    const collectionName = type === "ONLINE" ? "reservations" : "pos_orders";
    const orderDoc = doc(db, collectionName, id);
    
    // Get the order to find the table number before completing it
    const orderSnap = await getDoc(orderDoc);
    const orderData = orderSnap.data();

    // Mark order as completed
    await updateDoc(orderDoc, {
      status: "COMPLETED",
      completedAt: new Date(),
      completedBy: session.name
    });

    // Free up the table if there is an associated table number (works for both ONLINE and POS)
    if (orderData) {
      if (orderData.tableId) {
        await updateDoc(doc(db, "tables", orderData.tableId), {
          status: "AVAILABLE"
        });
      } else if (orderData.tableNumber && orderData.tableNumber !== "Takeaway") {
        // Fallback in case tableId wasn't saved, try to find by table number
        // Extract integer if it's formatted as "Table 1"
        const numStr = String(orderData.tableNumber).replace(/\D/g, "");
        const num = parseInt(numStr, 10);
        
        if (!isNaN(num)) {
          const { setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "tables", `table-${num}`), {
            id: `table-${num}`,
            number: num,
            status: "AVAILABLE"
          }, { merge: true });
        }
      }
    }

    return { success: true };
  } catch (e) {
    console.error("Error completing order:", e);
    return { success: false, error: "Failed to update order" };
  }
}

export async function createPosOrder(order: any, tableNumber: string = "Takeaway", notes: string = "", paymentMethod: string = "Cash") {
  const session = await getStaffSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const isTakeaway = tableNumber === "Takeaway";
    const status = isTakeaway ? "COMPLETED" : "IN_PROGRESS";

    const docRef = await addDoc(collection(db, "pos_orders"), {
      staffId: session.id,
      staffName: session.name,
      tableNumber,
      status,
      notes,
      paymentMethod,
      order,
      createdAt: new Date()
    });

    // If it's dine-in, mark the table as RESERVED
    if (!isTakeaway) {
      const numStr = String(tableNumber).replace(/\D/g, "");
      const num = parseInt(numStr, 10);
      if (!isNaN(num)) {
        const { setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "tables", `table-${num}`), {
          id: `table-${num}`,
          number: num,
          status: "RESERVED"
        }, { merge: true });
      }
    }

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
