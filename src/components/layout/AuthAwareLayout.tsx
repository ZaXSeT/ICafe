"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

const AUTH_ROUTES = ["/login", "/register"];

export function NavbarWrapper() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname)) return null;
  return <Navbar />;
}

export function FooterWrapper() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname)) return null;
  return <Footer />;
}
