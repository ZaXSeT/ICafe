import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Get hostname from headers (e.g., admin.localhost:3000, pos.localhost:3000, localhost:3000)
  const hostname = req.headers.get("host") || "";

  // Support Vercel deployments and localhost
  // E.g. admin.yourdomain.com -> currentHost = 'admin'
  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(`.icafe.com`, "")
      : hostname.replace(`.localhost:3000`, "");

  // Skip rewriting if the path already contains /admin or /pos to prevent infinite loops
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/pos") || url.pathname.startsWith("/app")) {
    const response = NextResponse.next();
    response.headers.set("x-next-pathname", url.pathname);
    return response;
  }

  // Rewrite for Admin Subdomain
  if (hostname.startsWith("admin.")) {
    url.pathname = `/admin${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-next-pathname", url.pathname);
    return response;
  }

  // Rewrite for POS Subdomain
  if (hostname.startsWith("pos.")) {
    url.pathname = `/pos${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-next-pathname", url.pathname);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("x-next-pathname", url.pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - fonts (custom font files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|fonts).*)",
  ],
};
