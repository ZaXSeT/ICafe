import { NextResponse } from "next/server";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const staffRef = collection(db, "staff");
    const snapshot = await getDocs(staffRef);
    let ownerFound = false;

    for (const d of snapshot.docs) {
      const data = d.data();
      if (data.pin === "123456") {
        await updateDoc(doc(db, "staff", d.id), { role: "OWNER" });
        ownerFound = true;
      }
    }

    if (!ownerFound) {
      await addDoc(staffRef, { name: "Admin Owner", pin: "123456", role: "OWNER", createdAt: new Date() });
    }

    return NextResponse.json({ success: true, message: "Owner fixed" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
