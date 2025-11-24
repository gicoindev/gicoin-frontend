"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { ReactNode } from "react";
import "./globals.css";

import NavbarGold from "@/components/ui/navbar-gold";
import { inter } from "@/lib/fonts";

import { Providers } from "./providers";

// Toast systems
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <NavbarGold />
          {children}

          <SonnerToaster richColors position="top-center" />
          <ShadcnToaster />
          <HotToaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
