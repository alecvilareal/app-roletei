"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, MapPin, Search, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
    <header
      className={[
        "sticky top-0 z-30 transition-shadow duration-300",
        scrolled ? "bg-white shadow-md" : "bg-transparent",
      ].join(" ")}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1536px] items-center px-8 py-4 transition-all",
          scrolled ? "gap-6" : "gap-0",
        )}
      >
        {/* Left */}
        <Link
          href="/"
          className={cn(
            "flex items-center overflow-hidden transition-all duration-500 ease-out",
            scrolled
              ? "w-[110px] opacity-100 mr-0"
              : "w-0 opacity-0 pointer-events-none mr-0",
          )}
        >
          <Image src="/logo1.svg" alt="Roletei" width={110} height={36} priority />
        </Link>

        {/* Center: search appears after scroll (desktop) */}
        <div
          className={cn(
            "hidden justify-center md:flex transition-all",
            scrolled ? "flex-1 opacity-100" : "w-0 flex-none opacity-0 overflow-hidden",
          )}
        >
          <div
            className={[
              "w-full max-w-xl transition-all duration-200",
              scrolled
                ? "opacity-100 translate-y-0"
                : "pointer-events-none -translate-y-1 opacity-0",
            ].join(" ")}
            aria-hidden={!scrolled}
          >
            <div className="flex h-11 w-full items-center rounded-full border bg-card px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="O que você quer curtir hoje?"
                className="h-10 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
              />
              <div className="mx-2 h-6 w-px bg-border" />
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[#F58318]"
              >
                <MapPin className="h-4 w-4" />
                <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                  Belo Horizonte, MG
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right */}
        <nav
          className={cn(
            "flex items-center gap-4 transition-all",
            scrolled ? "ml-auto" : "flex-1 justify-center",
          )}
        >
          <a
            href="#"
            className={[
              "hidden px-2 py-2 text-sm font-medium transition-colors hover:text-[#F58318] md:inline-flex",
              scrolled ? "text-slate-900" : "text-slate-600",
            ].join(" ")}
          >
            Quem Somos
          </a>
          <a
            href="#"
            className={[
              "hidden px-2 py-2 text-sm font-medium transition-colors hover:text-[#F58318] md:inline-flex",
              scrolled ? "text-slate-900" : "text-slate-600",
            ].join(" ")}
          >
            Contato
          </a>

          <Button
            className={[
              "h-11 rounded-lg bg-[#F58318] px-5 font-semibold text-white shadow-sm hover:bg-[#F58318]/90 transition-all duration-300",
              scrolled ? "scale-100 opacity-100 flex" : "scale-95 opacity-0 hidden",
            ].join(" ")}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Achar o meu Rolê
          </Button>
        </nav>
      </div>
    </header>
  );
}
