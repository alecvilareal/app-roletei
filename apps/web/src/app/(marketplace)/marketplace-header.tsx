"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search } from "lucide-react";

import { SearchDropdown } from "@/components/search/SearchDropdown";
import { Input } from "@/components/ui/input";
import { useEventSearch } from "@/hooks/useEventSearch";

function HeaderLinks() {
  return (
    <div className="flex items-center gap-4">
      <a
        href="#"
        className="px-2 py-2 text-sm font-medium tracking-tight text-slate-900 transition-colors hover:text-[#F58318]"
      >
        Como funciona
      </a>
      <a
        href="#"
        className="px-2 py-2 text-sm font-medium tracking-tight text-slate-900 transition-colors hover:text-[#F58318]"
      >
        Quem somos
      </a>
      <a
        href="#"
        className="px-2 py-2 text-sm font-medium tracking-tight text-slate-900 transition-colors hover:text-[#F58318]"
      >
        Ajuda
      </a>
    </div>
  );
}

export function MarketplaceHeader() {
  const search = useEventSearch({ debounceMs: 300, limit: 8 });
  const router = useRouter();

  const goToSearchResults = () => {
    const q = search.query.trim();
    if (!q) return;
    router.push(`/busca?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-[100] bg-white shadow-md">
      <div className="mx-auto flex h-20 w-full max-w-[1536px] items-center px-8">
        <div className="flex flex-1 justify-start">
          <Link href="/" className="flex items-center">
            <Image src="/logo1.svg" alt="Roletei" width={110} height={36} priority />
          </Link>
        </div>

        <div className="relative flex flex-[2] items-center justify-center">
          <div className="w-full max-w-xl">
            <div className="relative flex h-11 w-full items-center rounded-full border border-input bg-background px-4 shadow-sm transition-all duration-200 focus-within:border-[#F58318] focus-within:ring-4 focus-within:ring-[#F58318]/20 focus-within:shadow-[0_0_0_1px_rgba(245,131,24,0.35),0_0_24px_rgba(245,131,24,0.18)]">
              <Search className="h-4 w-4 text-muted-foreground" />
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
                className="inline-flex items-center gap-2 text-sm font-medium tracking-tight text-muted-foreground transition-colors hover:text-[#F58318]"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                  Belo Horizonte, MG
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
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

        <div className="flex flex-1 items-center justify-end gap-4">
          <HeaderLinks />
        </div>
      </div>
    </header>
  );
}
