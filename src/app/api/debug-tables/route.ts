import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tablesRef = collection(db, "tables");
    const snapshot = await getDocs(tablesRef);
    const tables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, tables });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
