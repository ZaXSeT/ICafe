import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NavbarWrapper, FooterWrapper } from "@/components/layout/AuthAwareLayout";
import { AuthProvider } from "@/components/providers/AuthContext";
import { CartProvider } from "@/components/providers/CartContext";
import { CartPopup } from "@/components/features/CartPopup";
import { headers } from "next/headers";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ICafe | Premium Coffee & Reservations",
  description: "Experience the best coffee and seamless table reservations at ICafe.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isAdminOrPos = host.startsWith("admin.") || host.startsWith("pos.");

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${montserrat.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <AuthProvider>
          <CartProvider>
            {!isAdminOrPos && <NavbarWrapper />}
            <main className="flex-1 flex flex-col">{children}</main>
            {!isAdminOrPos && <FooterWrapper />}
            <Toaster position="top-center" className="print:hidden" />
            {!isAdminOrPos && <CartPopup />}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
