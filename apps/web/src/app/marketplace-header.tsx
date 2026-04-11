"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function useScrolled(threshold = 56) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

export function MarketplaceHeader() {
  const scrolled = useScrolled(64);

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-6 px-6 py-5">
        {/* Left */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo1.svg"
            alt="Roletei"
            width={120}
            height={40}
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>

        {/* Center: search appears after scroll (desktop) */}
        <div className="hidden flex-1 justify-center md:flex">
          <div
            className={[
              "relative w-full max-w-xl transition-all duration-200",
              scrolled
                ? "opacity-100 translate-y-0"
                : "pointer-events-none -translate-y-1 opacity-0",
            ].join(" ")}
            aria-hidden={!scrolled}
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos em BH…"
              className="h-10 rounded-full bg-card pl-10 shadow-sm focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
            />
          </div>
        </div>

        {/* Right */}
        <nav className="ml-auto flex items-center gap-2 md:gap-4">
          <a
            href="#"
            className="hidden px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            Quem Somos
          </a>
          <a
            href="#"
            className="hidden px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            Contato
          </a>

          <Button className="h-11 rounded-full bg-[hsl(var(--primary))] px-5 font-semibold text-[hsl(var(--primary-foreground))] shadow-sm hover:bg-[hsl(var(--primary))]/90">
            Achar o meu Rolê
          </Button>
        </nav>
      </div>

      {/* Ultra subtle shadow to float */}
      <div className="pointer-events-none h-px w-full bg-transparent shadow-[0_8px_30px_rgba(0,0,0,0.05)]" />
    </header>
  );
}
