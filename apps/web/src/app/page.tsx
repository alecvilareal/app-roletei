"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  ChefHat,
  ChevronDown,
  Drama,
  Dumbbell,
  Music,
  MapPin,
  PartyPopper,
  Search,
} from "lucide-react";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { EventCard, type Event } from "@/features/events/components/EventCard";

type CategoryKey = "shows" | "festas" | "teatro" | "gastronomia" | "esportes";

const CATEGORY_ITEMS: Array<{
  key: CategoryKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "shows", label: "Shows", Icon: Music },
  { key: "festas", label: "Festas", Icon: PartyPopper },
  { key: "teatro", label: "Teatro", Icon: Drama },
  { key: "gastronomia", label: "Gastronomia", Icon: ChefHat },
  { key: "esportes", label: "Esportes", Icon: Dumbbell },
];

type Filter = (typeof EVENTS)[number]["category"] | "Tudo";

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
  const [selectedFilter] = useState<Filter>("Tudo");
  const [query, setQuery] = useState("");
  const [, setCategory] = useState<CategoryKey | null>(null);

  const filtered = useMemo(
    () => filterEvents(EVENTS, selectedFilter, query),
    [selectedFilter, query],
  );

  const featured = filtered.slice(0, 4);
  const weekend = filtered.slice(0, 8);
  const free = filtered.filter((e) => e.priceLabel.toLowerCase().includes("grátis"));

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Hero - marketplace minimalista (hierarquia: busca -> recomendados -> categorias) */}
      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-[1536px] px-6 py-8 md:py-10">
          {/* Search Widget (topo) */}
          <div>
            <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white shadow-sm ring-1 ring-border/60">
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center md:gap-0">
                {/* O que */}
                <div className="flex items-center gap-3 rounded-xl px-3 py-3 md:py-2">
                  <Search className="h-5 w-5 text-slate-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="O que você quer curtir?"
                    className="h-10 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="hidden h-10 w-px bg-border md:block" />

                {/* Onde */}
                <button
                  type="button"
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left md:py-2"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-slate-500" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-500">Onde</div>
                      <div className="truncate text-sm font-semibold text-slate-900">
                        Belo Horizonte, MG
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                </button>

                <div className="hidden h-10 w-px bg-border md:block" />

                {/* Data */}
                <button
                  type="button"
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left md:py-2"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-500" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-500">Data</div>
                      <div className="truncate text-sm font-semibold text-slate-900">
                        Qualquer data
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                </button>

                {/* CTA */}
                <div className="md:pl-4">
                  <Button className="h-12 w-full rounded-xl bg-[#DB7A1E] px-8 font-semibold text-white hover:bg-[#DB7A1E]/90 md:w-auto">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendados (carrossel) */}
          <div className="mt-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <h2 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
                Recomendados para você
              </h2>

              <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6 sm:pb-3">
                <div className="flex gap-4 sm:gap-6 max-sm:snap-x max-sm:snap-mandatory">
                  {featured.map((event) => (
                    <a
                      key={`rec-${event.id}`}
                      href="#"
                      className="group relative h-[180px] w-[320px] shrink-0 overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-border/60 sm:h-[220px] sm:w-[420px] max-sm:snap-center"
                    >
                      <Image
                        src={event.image.src}
                        alt={event.image.alt}
                        fill
                        sizes="(max-width: 640px) 320px, 420px"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        priority={false}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.50),transparent_55%)]" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="line-clamp-2 text-sm font-semibold text-white sm:text-base">
                          {event.title}
                        </div>
                        <div className="mt-1 text-xs text-white/85">
                          {event.locationLabel}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Categorias (discretas, abaixo do carrossel) */}
              <div className="mt-6 flex justify-center">
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 sm:gap-6">
                  {CATEGORY_ITEMS.map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory((c) => (c === key ? null : key))}
                      className="group flex flex-col items-center gap-2"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border/60 transition-transform duration-200 group-hover:-translate-y-0.5">
                        <Icon className="h-5 w-5 text-slate-700 transition-colors duration-200 group-hover:text-[#DB7A1E]" />
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
