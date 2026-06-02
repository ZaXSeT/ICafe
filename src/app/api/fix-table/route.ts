import { NextResponse } from "next/server";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const tablesRef = collection(db, "tables");
    const snapshot = await getDocs(tablesRef);
    let updatedCount = 0;

    for (const d of snapshot.docs) {
      const data = d.data();
      if (data.status === "OCCUPIED") {
        await updateDoc(doc(db, "tables", d.id), { status: "RESERVED" });
        updatedCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Fixed ${updatedCount} occupied tables` });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
