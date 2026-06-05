"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

const AUTH_ROUTES = ["/login", "/register"];

export function NavbarWrapper() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname) || pathname.startsWith("/app")) return null;
  return <Navbar />;
}

export function FooterWrapper() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname) || pathname.startsWith("/app")) return null;
  return <Footer />;
}

import { CartPopup } from "@/components/features/CartPopup";

export function CartPopupWrapper() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname) || pathname.startsWith("/app") || pathname.startsWith("/pos") || pathname.startsWith("/admin")) return null;
  return <CartPopup />;
}
