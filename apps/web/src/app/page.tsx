"use client";

import { useMemo, useState } from "react";
import {
  ChefHat,
  Drama,
  Dumbbell,
  GraduationCap,
  Music,
  PartyPopper,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EventCard, type Event } from "@/features/events/components/EventCard";

type CategoryKey =
  | "shows"
  | "festas"
  | "teatro"
  | "gastronomia"
  | "cursos"
  | "esportes";

const CATEGORY_ITEMS: Array<{
  key: CategoryKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "shows", label: "Shows", Icon: Music },
  { key: "festas", label: "Festas", Icon: PartyPopper },
  { key: "teatro", label: "Teatro", Icon: Drama },
  { key: "gastronomia", label: "Gastronomia", Icon: ChefHat },
  { key: "cursos", label: "Cursos", Icon: GraduationCap },
  { key: "esportes", label: "Esportes", Icon: Dumbbell },
];

const FILTERS = ["Tudo", "Shows", "Gastronomia", "Baladas", "Grátis"] as const;
type Filter = (typeof FILTERS)[number];

const EVENTS: Event[] = [
  {
    id: "1",
    title: "Baile do Viaduto — Edição Sextou",
    locationLabel: "Viaduto Santa Tereza • Belo Horizonte",
    dateChip: { day: "11", month: "ABR" },
    category: "Festas",
    priceLabel: "Grátis",
    image: {
      src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
      alt: "Pista de dança com luzes",
    },
  },
  {
    id: "2",
    title: "Festival de Cervejas Artesanais — Mercado Novo",
    locationLabel: "Mercado Novo • Belo Horizonte",
    dateChip: { day: "12", month: "ABR" },
    category: "Gastronomia",
    priceLabel: "A partir de R$ 25,00",
    image: {
      src: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80",
      alt: "Copos de cerveja artesanal",
    },
  },
  {
    id: "3",
    title: "Show Indie no A Obra — Bandas Locais",
    locationLabel: "A Obra • Savassi • Belo Horizonte",
    dateChip: { day: "12", month: "ABR" },
    category: "Shows",
    priceLabel: "A partir de R$ 40,00",
    image: {
      src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
      alt: "Palco com show ao vivo",
    },
  },
  {
    id: "4",
    title: "Cine ao Ar Livre na Praça — Clássicos Mineiros",
    locationLabel: "Praça da Liberdade • Belo Horizonte",
    dateChip: { day: "13", month: "ABR" },
    category: "Teatro",
    priceLabel: "Grátis",
    image: {
      src: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=80",
      alt: "Cinema ao ar livre",
    },
  },
  {
    id: "5",
    title: "Brunch & Vinil — Café com DJ",
    locationLabel: "Pop-up no Centro • Belo Horizonte",
    dateChip: { day: "13", month: "ABR" },
    category: "Gastronomia",
    priceLabel: "A partir de R$ 55,00",
    image: {
      src: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
      alt: "Mesa de brunch",
    },
  },
  {
    id: "6",
    title: "Noite de Pagode — Quintal do Chalé",
    locationLabel: "Quintal do Chalé • Serra • BH",
    dateChip: { day: "17", month: "ABR" },
    category: "Shows",
    priceLabel: "A partir de R$ 35,00",
    image: {
      src: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      alt: "Show com músicos no palco",
    },
  },
];

function filterEvents(events: Event[], filter: Filter, query: string) {
  const q = query.trim().toLowerCase();

  return events.filter((e) => {
    const matchesFilter =
      filter === "Tudo"
        ? true
        : `${e.category}`.toLowerCase().includes(filter.toLowerCase());

    const matchesQuery =
      q.length === 0
        ? true
        : `${e.title} ${e.locationLabel} ${e.category}`.toLowerCase().includes(q);

    return matchesFilter && matchesQuery;
  });
}

function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto mt-12 w-full max-w-[1400px] px-6">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState<Filter>("Tudo");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey | null>(null);

  const filtered = useMemo(
    () => filterEvents(EVENTS, selectedFilter, query),
    [selectedFilter, query],
  );

  const featured = filtered.slice(0, 4);
  const weekend = filtered.slice(0, 8);
  const free = filtered.filter((e) => e.priceLabel.toLowerCase().includes("grátis"));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Hero - Sympla style gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#DB7A1E_0%,#DB591F_100%)]" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-6 py-10 md:py-14">
          <div className="max-w-3xl space-y-3 text-background">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Descubra eventos incríveis em Belo Horizonte
            </h1>
            <p className="text-base/7 text-background/90 md:text-lg/8">
              Shows, festas, teatro, gastronomia e muito mais — encontre seu rolê
              do jeito mais rápido.
            </p>
          </div>

          {/* Search Widget (desktop/tablet) */}
          <Card className="mt-8 hidden border-none bg-background/95 p-4 shadow-2xl backdrop-blur md:block">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="relative md:col-span-6">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="O que você está procurando?"
                  className="h-12 rounded-xl bg-card pl-10 shadow-sm focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="md:col-span-3">
                <Input
                  defaultValue="Belo Horizonte"
                  placeholder="Onde?"
                  className="h-12 rounded-xl bg-card shadow-sm"
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  value={
                    category
                      ? CATEGORY_ITEMS.find((c) => c.key === category)?.label
                      : ""
                  }
                  readOnly
                  placeholder="Categoria"
                  className="h-12 rounded-xl bg-card shadow-sm"
                />
              </div>

              <div className="md:col-span-1">
                <Button className="h-12 w-full rounded-xl bg-[hsl(var(--primary))] font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90">
                  Buscar
                </Button>
              </div>
            </div>
          </Card>

          {/* Mobile simplified search bar */}
          <div className="mt-6 md:hidden">
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-2 rounded-xl border-border/40 bg-background/95 text-muted-foreground shadow-xl"
            >
              <Search className="h-4 w-4 text-[hsl(var(--primary))]" />
              Buscar eventos em BH…
            </Button>
          </div>

          {/* Quick filters (kept) */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((f) => {
              const active = f === selectedFilter;
              return (
                <Badge
                  key={f}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedFilter(f)}
                  className={[
                    "shrink-0 select-none rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-transparent bg-background text-foreground"
                      : "border-background/40 bg-background/10 text-background hover:bg-background/15",
                  ].join(" ")}
                >
                  {f}
                </Badge>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories carousel */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-10">
        <div className="flex gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORY_ITEMS.map(({ key, label, Icon }) => {
            const active = key === category;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCategory((c) => (c === key ? null : key))}
                className="group flex shrink-0 flex-col items-center gap-3"
              >
                <div
                  className={[
                    "flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-sm transition-transform duration-200 group-hover:scale-105",
                    active ? "ring-2 ring-[hsl(var(--primary))]" : "ring-1 ring-border/60",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-7 w-7 transition-transform duration-200",
                      active
                        ? "text-[hsl(var(--primary))]"
                        : "text-muted-foreground group-hover:text-foreground",
                      "group-hover:scale-110",
                    ].join(" ")}
                  />
                </div>
                <div className="text-sm font-medium text-foreground">{label}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sections */}
      <Section
        title="Eventos em Destaque em BH"
        description="Uma curadoria com o que está bombando agora."
        action={
          <a
            href="#"
            className="hidden text-sm font-semibold text-[hsl(var(--primary))] hover:underline md:inline"
          >
            Ver tudo
          </a>
        }
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </Section>

      <Section
        title="Para curtir este fim de semana"
        description="Planos perfeitos pra sexta, sábado e domingo."
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {weekend.map((event) => (
            <EventCard key={`weekend-${event.id}`} event={event} />
          ))}
        </div>
      </Section>

      <Section title="Eventos Gratuitos" description="Rolês bons sem gastar nada.">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {(free.length ? free : featured).map((event) => (
            <EventCard key={`free-${event.id}`} event={event} />
          ))}
        </div>
      </Section>

      <div className="h-16" />
    </div>
  );
}
