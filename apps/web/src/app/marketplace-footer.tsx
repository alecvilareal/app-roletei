"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MarketplaceFooter() {
  return (
    <footer className="border-t bg-[#FFFBE0]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-6 px-8 py-10 md:flex-row md:gap-4">
        {/* Left */}
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:text-left">
          <div className="flex items-center gap-3">
            <Image src="/logo1.svg" alt="Roletei" width={28} height={28} />
            <span className="text-base font-semibold tracking-tight text-foreground">
              Roletei
            </span>
          </div>
          <span className="text-xs text-muted-foreground md:ml-2">
            © 2026 Roletei. Todos os direitos reservados.
          </span>
        </div>

        {/* Center */}
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-[#DB7A1E]"
          >
            Privacidade
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-[#DB7A1E]"
          >
            Termos de Uso
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center">
          <Button variant="ghost" className="rounded-lg" asChild>
            <Link href="/admin/login">Login Admin</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
