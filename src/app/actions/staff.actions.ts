"use server";

import { cookies, headers } from "next/headers";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function loginStaff(pin: string) {
  let staffMember = null;

  try {
    const staffRef = collection(db, "staff");
    
    // Auto-seed if empty
    const allStaff = await getDocs(query(staffRef, limit(1)));
    if (allStaff.empty) {
      await addDoc(staffRef, { name: "Admin Owner", pin: "123456", role: "OWNER", createdAt: new Date() });
    }

    const q = query(staffRef, where("pin", "==", pin));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      staffMember = { id: docSnap.id, ...docSnap.data() } as any;
    }
  } catch (e) {
    console.error("Firebase error during staff login:", e);
  }

  if (staffMember) {
    // Determine base domain to share cookie across admin/pos subdomains
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const baseDomain = host.includes("localhost") ? undefined : host.replace(/^[^.]+\./g, ".");

    // Set a session cookie (expires when browser closes)
    const cookieStore = await cookies();
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    if (baseDomain) {
      cookieOptions.domain = baseDomain;
    }

    cookieStore.set("staff_session", JSON.stringify({ id: staffMember.id, role: staffMember.role, name: staffMember.name }), cookieOptions);
    return { success: true, role: staffMember.role };
  }

  return { success: false, error: "Invalid PIN" };
}

export async function logoutStaff() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const baseDomain = host.includes("localhost") ? undefined : host.replace(/^[^.]+\./g, ".");

  const cookieStore = await cookies();
  const cookieOptions: any = {
    name: "staff_session",
    path: "/",
  };
  
  if (baseDomain) {
    cookieOptions.domain = baseDomain;
  }

  cookieStore.delete(cookieOptions);
  return { success: true };
}

export async function getStaffSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("staff_session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value) as { id: string; role: "OWNER" | "CASHIER"; name: string };
  } catch (e) {
    return null;
  }
}

export async function getStaffList() {
  const session = await getStaffSession();
  if (!session || session.role !== "OWNER") throw new Error("Unauthorized");

  try {
    const staffRef = collection(db, "staff");
    const snapshot = await getDocs(staffRef);
    
    if (snapshot.empty) {
      const docRef = await addDoc(staffRef, { name: "Admin Owner", pin: "123456", role: "OWNER", createdAt: new Date() });
      return [{ id: docRef.id, name: "Admin Owner", pin: "123456", role: "OWNER" }];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        name: data.name,
        pin: data.pin,
        role: data.role,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function addStaff(name: string, pin: string, role: "OWNER" | "CASHIER" = "CASHIER") {
  const session = await getStaffSession();
  if (!session || session.role !== "OWNER") throw new Error("Unauthorized");

  try {
    const staffRef = collection(db, "staff");
    // Check if pin exists
    const q = query(staffRef, where("pin", "==", pin));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { success: false, error: "PIN already in use" };
    }

    const docRef = await addDoc(staffRef, { name, pin, role, createdAt: new Date() });
    return { success: true, staff: { id: docRef.id, name, pin, role } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to connect to database" };
  }
}

export async function deleteStaff(id: string) {
  const session = await getStaffSession();
  if (!session || session.role !== "OWNER") throw new Error("Unauthorized");

  try {
    await deleteDoc(doc(db, "staff", id));
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to delete" };
  }
}

export async function setStaffSession(sessionData: any) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const baseDomain = host.includes("localhost") ? undefined : host.replace(/^[^.]+\./g, ".");

  const cookieStore = await cookies();
  const cookieOptions: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  if (baseDomain) {
    cookieOptions.domain = baseDomain;
  }

  cookieStore.set("staff_session", JSON.stringify(sessionData), cookieOptions);
  return { success: true };
}
