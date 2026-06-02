import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if Firebase Admin credentials are configured
    const hasAdminCredentials = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!hasAdminCredentials) {
      // Registration is handled client-side via Firebase Auth SDK in AuthContext
      // This API route is only needed for server-side admin operations
      return NextResponse.json(
        { message: "Registration handled client-side via Firebase Auth." },
        { status: 200 }
      );
    }

    // Dynamically import to avoid module-level initialization errors
    const { adminAuth, adminDb } = await import("@/lib/firebase-admin");

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user profile in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      name,
      email,
      role: "CUSTOMER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "User registered successfully.", userId: userRecord.uid },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error?.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}
