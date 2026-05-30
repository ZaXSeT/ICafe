import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendOTP } from "@/lib/mailer";

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let userId = "";

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      } else {
        // User exists but is unverified. 
        // Update their password to the new one and prepare to send a new OTP.
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { email },
          data: { password: hashedPassword, name }
        });
        userId = existingUser.id;

        // Clean up any old tokens for this email to prevent spam/confusion
        await prisma.verificationToken.deleteMany({
          where: { identifier: email }
        });
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      userId = user.id;
    }

    // Generate OTP
    const otp = generateOTP();

    // Calculate expiration time (10 minutes from now)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    // Store the OTP in the VerificationToken table
    // NextAuth VerificationToken requires identifier and token to be unique together
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires,
      },
    });

    // Send the OTP via email
    await sendOTP(email, otp);

    return NextResponse.json(
      { message: "User registered successfully. Please verify your email.", userId: userId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}
