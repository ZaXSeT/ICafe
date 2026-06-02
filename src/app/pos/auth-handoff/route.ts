import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const session = req.nextUrl.searchParams.get("session");
  
  if (session) {
    const cookieStore = await cookies();
    cookieStore.set("staff_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
  }

  // Redirect to the POS root explicitly using the host header
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return NextResponse.redirect(`${protocol}://${host}/`);
}
