import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { MarketplaceHeader } from "./marketplace-header";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Roletei",
  description: "Marketplace de eventos em Belo Horizonte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <MarketplaceHeader />
        {children}
      </body>
    </html>
  );
}
