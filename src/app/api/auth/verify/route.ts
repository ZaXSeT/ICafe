import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Missing email or verification code" },
        { status: 400 }
      );
    }

    // Find the token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: otp,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if it's expired
    if (verificationToken.expires < new Date()) {
      // Clean up the expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: { identifier: email, token: otp },
        },
      });

      return NextResponse.json(
        { error: "Verification code has expired. Please register again." },
        { status: 400 }
      );
    }

    // If valid and not expired, update the user
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete the token so it can't be used again
    await prisma.verificationToken.delete({
      where: {
        identifier_token: { identifier: email, token: otp },
      },
    });

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong during verification" },
      { status: 500 }
    );
  }
}
