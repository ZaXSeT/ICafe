import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NavbarWrapper, FooterWrapper } from "@/components/layout/AuthAwareLayout";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ICafe | Premium Coffee & Reservations",
  description: "Experience the best coffee and seamless table reservations at ICafe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${montserrat.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <NavbarWrapper />
        <main className="flex-1 flex flex-col">{children}</main>
        <FooterWrapper />
        <Toaster />
      </body>
    </html>
  );
}
