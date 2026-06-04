import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ModalProvider } from "@/context/ModalContext";

import Navbar from "@/components/Navbar";
import { UserProvider } from "@/context/UserContext";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Nexora - Premium Jewelry",
  description: "Discover and design premium jewelry with Nexora.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <UserProvider>
          <ModalProvider>
            <Navbar />
            <main className="main-content">
              {children}
            </main>
            <WhatsAppButton />
          </ModalProvider>
        </UserProvider>
      </body>
    </html>
  );
}
