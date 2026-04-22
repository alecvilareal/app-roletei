"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";

import { SearchDropdown } from "@/components/search/SearchDropdown";
import { Input } from "@/components/ui/input";
import { useEventSearch } from "@/hooks/useEventSearch";
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

function HeaderLinks({
  scrolled,
  variant,
}: {
  scrolled: boolean;
  variant: "center" | "right";
}) {
  // Center links: visible on top, disappear on scroll (absolute to avoid reflow)
  const centerClass =
    variant === "center"
      ? cn(
          "flex items-center gap-8 transition-all duration-500",
          scrolled
            ? "opacity-0 scale-95 pointer-events-none absolute"
            : "opacity-100 scale-100 static",
        )
      : "";

  // Right links: hidden on top, appear on scroll (no hidden, just opacity/PE)
  const rightClass =
    variant === "right"
      ? cn(
          "flex items-center gap-4 transition-all duration-500",
          scrolled
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
        )
      : "";

  const className = cn(variant === "center" ? centerClass : rightClass);

  return (
    <div className={className}>
      <a
        href="#"
        className={cn(
          "px-2 py-2 text-sm font-medium tracking-tight transition-colors hover:text-[#F58318]",
          scrolled ? "text-slate-900" : "text-slate-600",
        )}
      >
        Quem Somos
      </a>
      <a
        href="#"
        className={cn(
          "px-2 py-2 text-sm font-medium tracking-tight transition-colors hover:text-[#F58318]",
          scrolled ? "text-slate-900" : "text-slate-600",
        )}
      >
        Contato
      </a>
    </div>
  );
}

export function MarketplaceHeader() {
  const scrolled = useScrolled(64);
  const search = useEventSearch({ debounceMs: 300, limit: 8 });
  const router = useRouter();

  const goToSearchResults = () => {
    const q = search.query.trim();
    if (!q) return;
    router.push(`/busca?q=${encodeURIComponent(q)}`);
  };

  return (
    <header
      className={[
        "sticky top-0 z-[100] transition-shadow duration-300",
        scrolled ? "bg-white shadow-md" : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1536px] items-center px-8">
        {/* Coluna esquerda (Logo) */}
        <div className="flex flex-1 justify-start">
          <Link
            href="/"
            className={cn(
              "flex items-center transition-all duration-500",
              scrolled
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4 pointer-events-none",
            )}
          >
            <Image src="/logo1.svg" alt="Roletei" width={110} height={36} priority />
          </Link>
        </div>

        {/* Coluna central (Links no topo / Busca no scroll) */}
        <div className="relative flex flex-[2] items-center justify-center">
          {/* Links centrais (topo) */}
          <HeaderLinks scrolled={scrolled} variant="center" />

          {/* Busca (scroll) */}
          <div
            className={cn(
              "w-full max-w-xl transition-all duration-500",
              scrolled
                ? "opacity-100 scale-100 static"
                : "opacity-0 scale-95 pointer-events-none absolute",
            )}
            aria-hidden={!scrolled}
          >
            <div className="relative flex h-11 w-full items-center rounded-full border bg-card px-4 ring-1 ring-slate-200">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                value={search.query}
                onChange={(e) => search.setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToSearchResults();
                }}
                placeholder="O que você quer curtir hoje?"
                className="h-10 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
              />
              <div className="mx-2 h-6 w-px bg-border" />
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium tracking-tight text-slate-500 transition-colors hover:text-[#F58318]"
              >
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                  Belo Horizonte, MG
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              <SearchDropdown
                open={search.query.trim().length > 0}
                loading={search.loading}
                error={search.error}
                items={search.results.map((hit) => ({
                  id: hit.id,
                  label: hit.title,
                }))}
                onSelect={(item) => {
                  console.log("event.search.select", item.id);
                  search.setQuery(item.label);
                  router.push(`/marketplace/eventos/${item.id}`);
                }}
              />
            </div>
          </div>
        </div>

        {/* Coluna direita (Links no scroll + botão) */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <HeaderLinks scrolled={scrolled} variant="right" />

        </div>
      </div>
    </header>
  );
}
