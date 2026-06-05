import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export interface AppSession {
  uid: string;
  name: string | null;
  email: string | null;
  role: string;
}

/**
 * Server-side helper to get the current user session from the firebase-token cookie.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<AppSession | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("firebase-token");

    if (!tokenCookie?.value) {
      return null;
    }

    // Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(tokenCookie.value);

    // Fetch user profile from Firestore
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const data = userDoc.data();

    return {
      uid: decoded.uid,
      name: data?.name || decoded.name || null,
      email: data?.email || decoded.email || null,
      role: data?.role || "CUSTOMER",
    };
  } catch {
    return null;
  }
}
