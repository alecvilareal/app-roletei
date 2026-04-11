"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventCard, type Event } from "@/features/events/components/EventCard";

const FILTERS = ["Tudo", "Shows", "Gastronomia", "Baladas", "Grátis"] as const;
type Filter = (typeof FILTERS)[number];

const EVENTS: Event[] = [
  {
    id: "1",
    title: "Baile do Viaduto — Edição Sextou",
    venue: "Viaduto Santa Tereza",
    neighborhood: "Centro",
    dateLabel: "Sex, 19:00",
    category: "Baladas",
    priceLabel: "Grátis",
    image: {
      src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
      alt: "Pista de dança com luzes",
    },
  },
  {
    id: "2",
    title: "Festival de Cervejas Artesanais — Mercado Novo",
    venue: "Mercado Novo",
    neighborhood: "Centro",
    dateLabel: "Sáb, 14:00",
    category: "Gastronomia",
    priceLabel: "R$ 25",
    image: {
      src: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80",
      alt: "Copos de cerveja artesanal",
    },
  },
  {
    id: "3",
    title: "Show Indie no A Obra — Bandas Locais",
    venue: "A Obra Bar Dançante",
    neighborhood: "Savassi",
    dateLabel: "Sáb, 22:00",
    category: "Shows",
    priceLabel: "R$ 40",
    image: {
      src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
      alt: "Palco com show ao vivo",
    },
  },
  {
    id: "4",
    title: "Cine ao Ar Livre na Praça — Clássicos Mineiros",
    venue: "Praça da Liberdade",
    neighborhood: "Funcionários",
    dateLabel: "Dom, 18:30",
    category: "Grátis",
    priceLabel: "Grátis",
    image: {
      src: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=80",
      alt: "Cinema ao ar livre",
    },
  },
  {
    id: "5",
    title: "Brunch & Vinil — Café com DJ",
    venue: "Café Palhares (Pop-up)",
    neighborhood: "Centro",
    dateLabel: "Dom, 10:00",
    category: "Gastronomia",
    priceLabel: "R$ 55",
    image: {
      src: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
      alt: "Mesa de brunch",
    },
  },
  {
    id: "6",
    title: "Noite de Pagode — Quintal do Chalé",
    venue: "Quintal do Chalé",
    neighborhood: "Serra",
    dateLabel: "Qui, 20:00",
    category: "Shows",
    priceLabel: "R$ 35",
    image: {
      src: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      alt: "Show com músicos no palco",
    },
  },
];

function filterEvents(events: Event[], filter: Filter, query: string) {
  const q = query.trim().toLowerCase();

  return events.filter((e) => {
    const matchesFilter = filter === "Tudo" ? true : e.category === filter;
    const matchesQuery =
      q.length === 0
        ? true
        : `${e.title} ${e.venue} ${e.neighborhood ?? ""} ${e.category}`
            .toLowerCase()
            .includes(q);

    return matchesFilter && matchesQuery;
  });
}

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState<Filter>("Tudo");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterEvents(EVENTS, selectedFilter, query),
    [selectedFilter, query],
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="text-lg font-semibold tracking-tight text-foreground">
            Roletei
          </div>
          <Button
            variant="ghost"
            className="h-9 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Entrar
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 pb-14 pt-5">
        {/* Hero */}
        <section className="space-y-4">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
            O que tem pra hoje em BH?
          </h1>

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar rolês, lugares, bairros..."
              className="h-12 rounded-full border-border/70 bg-card pl-11 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-0"
            />
          </div>

          {/* Quick filters */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => {
              const active = f === selectedFilter;

              return (
                <Badge
                  key={f}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedFilter(f)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedFilter(f);
                  }}
                  className={[
                    "shrink-0 select-none rounded-full border border-border/70 px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "bg-card text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {f}
                </Badge>
              );
            })}
          </div>
        </section>

        {/* Events grid */}
        <section className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10 text-center text-sm text-muted-foreground">
              Nenhum rolê encontrado.
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
