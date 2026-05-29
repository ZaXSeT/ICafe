import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  
  // Protect the booking table route
  if (!isLoggedIn && req.nextUrl.pathname.startsWith("/reservations/new")) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  // Optional: only run middleware on specific paths
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
