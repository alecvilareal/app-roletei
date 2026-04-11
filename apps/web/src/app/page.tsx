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
    dateChip: { day: "11", month: "ABR" },
    category: "Baladas",
    priceLabel: "Grátis",
    distanceLabel: "Centro • 1,8km",
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
    dateChip: { day: "12", month: "ABR" },
    category: "Gastronomia",
    priceLabel: "A partir de R$ 25",
    distanceLabel: "Centro • 2,2km",
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
    dateChip: { day: "12", month: "ABR" },
    category: "Shows",
    priceLabel: "A partir de R$ 40",
    distanceLabel: "Savassi • 3,6km",
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
    dateChip: { day: "13", month: "ABR" },
    category: "Grátis",
    priceLabel: "Grátis",
    distanceLabel: "Funcionários • 4,1km",
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
    dateChip: { day: "13", month: "ABR" },
    category: "Gastronomia",
    priceLabel: "A partir de R$ 55",
    distanceLabel: "Centro • 2,0km",
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
    dateChip: { day: "17", month: "ABR" },
    category: "Shows",
    priceLabel: "A partir de R$ 35",
    distanceLabel: "Serra • 5,2km",
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
      {/* Header - Glass */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="text-xl font-extrabold tracking-tight text-foreground">
              Roletei
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {["Explorar", "Hoje", "Favoritos"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <Button className="h-10 rounded-full bg-[hsl(var(--primary))] px-5 font-medium text-[hsl(var(--primary-foreground))] shadow-sm hover:bg-[hsl(var(--primary))]/90">
            Entrar
          </Button>
        </div>
      </header>

      <main className="w-full pb-16">
        {/* Hero background */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-80 w-[900px] -translate-x-1/2 rounded-full bg-[hsl(var(--primary))]/15 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.25]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
                backgroundSize: "14px 14px",
              }}
            />
          </div>

          <div className="relative mx-auto w-full max-w-[1400px] px-6 py-12 md:py-16">
            <div className="max-w-3xl space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                Belo Horizonte • rolês em tempo real
              </p>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-6xl">
                O que tem pra hoje em BH?
              </h1>

              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Encontre shows, gastronomia, festas e rolês grátis perto de você.
                Do Centro à Savassi — tudo no mesmo lugar.
              </p>

              {/* Search - precision tool */}
              <div className="relative w-full max-w-2xl">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[hsl(var(--primary))]" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar rolês, lugares, bairros..."
                  className="h-14 w-full rounded-full border-border/60 bg-card pl-12 pr-4 text-base shadow-xl focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-0"
                />
              </div>

              {/* Quick filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {FILTERS.map((f) => {
                  const active = f === selectedFilter;

                  return (
                    <Badge
                      key={f}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedFilter(f)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setSelectedFilter(f);
                      }}
                      className={[
                        "shrink-0 select-none rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "border-border/70 bg-card text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {f}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Events */}
        <section className="mx-auto mt-10 w-full max-w-[1400px] px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Em alta hoje
              </h2>
              <p className="text-sm text-muted-foreground">
                Seleção de rolês pra você decidir rápido.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-12 text-center text-sm text-muted-foreground">
              Nenhum rolê encontrado.
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
