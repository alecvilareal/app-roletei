"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { cn } from "@/lib/utils";

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
  const [scrolled, setScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(
    () => filterEvents(EVENTS, selectedFilter, query),
    [selectedFilter, query],
  );

  const featured = filtered.slice(0, 6);
  const weekend = filtered.slice(0, 8);
  const free = filtered.filter((e) => e.priceLabel.toLowerCase().includes("grátis"));

  useEffect(() => {
    if (!featured.length) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featured.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [featured.length]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Hero - marketplace minimalista (hierarquia: busca -> recomendados -> categorias) */}
      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-[1536px] px-6 py-10 md:py-12">
          <div className="mb-10 flex justify-center">
            <div
              className={[
                "transition-all duration-500 ease-in transform",
                scrolled
                  ? "opacity-0 -translate-y-8"
                  : "opacity-100 translate-y-0",
              ].join(" ")}
              style={{ minHeight: 104 }}
            >
              <Image
                src="/logo1.svg"
                alt="Roletei"
                width={360}
                height={117}
                priority
              />
            </div>
          </div>

          {/* Search Widget (topo) */}
          <div>
            <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white shadow-sm ring-1 ring-border/60">
              <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:gap-0">
                {/* O que */}
                <div className="flex items-center gap-3 rounded-xl px-3 py-3 md:flex-[1.4] md:py-2">
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
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left md:flex-1 md:py-2"
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
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left md:flex-1 md:py-2"
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
                <div className="md:px-3">
                  <Button className="h-12 w-full rounded-xl bg-[#F58318] px-8 font-semibold text-white hover:bg-[#F58318]/90 md:w-auto">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendados (carrossel) */}
          <div className="mt-12">
            <div className="mx-auto w-full max-w-[1400px]">
              <h2 className="mb-0 w-full text-center text-base font-semibold tracking-tight text-foreground md:text-lg">
                Próximos a você
              </h2>

              <div className="relative mx-auto mt-0 flex h-[260px] w-full max-w-[1400px] items-center justify-center overflow-visible sm:h-[400px]">
                {featured.map((event, index) => {
                  const len = featured.length;
                  const rawOffset = index - activeIndex;
                  // Lógica para encontrar o caminho mais curto no círculo
                  let offset = (rawOffset + Math.floor(len / 2)) % len;
                  if (offset < 0) offset += len;
                  offset -= Math.floor(len / 2);

                  const isCenter = offset === 0;
                  const isLayer1 = Math.abs(offset) === 1;
                  const isLayer2 = Math.abs(offset) === 2;
                  const isHidden = !isCenter && !isLayer1 && !isLayer2;

                  let translate = "translate-x-0";
                  let scale = "scale-100";
                  let zIndex = "z-40";
                  let opacity = "opacity-100";

                  let overlayOpacity = "opacity-0";

                  if (offset === -1) {
                    translate = "-translate-x-[55%]";
                    scale = "scale-[0.85]";
                    zIndex = "z-30";
                    overlayOpacity = "opacity-40";
                  } else if (offset === 1) {
                    translate = "translate-x-[55%]";
                    scale = "scale-[0.85]";
                    zIndex = "z-30";
                    overlayOpacity = "opacity-40";
                  } else if (offset === -2) {
                    translate = "-translate-x-[95%]";
                    scale = "scale-[0.70]";
                    zIndex = "z-20";
                    overlayOpacity = "opacity-75";
                  } else if (offset === 2) {
                    translate = "translate-x-[95%]";
                    scale = "scale-[0.70]";
                    zIndex = "z-20";
                    overlayOpacity = "opacity-75";
                  } else if (isHidden) {
                    scale = "scale-75";
                    zIndex = "z-10";
                    opacity = "opacity-0 pointer-events-none";
                    overlayOpacity = "opacity-0";
                  }

                  return (
                    <a
                      key={`rec-${event.id}`}
                      href="#"
                      onClick={(e) => {
                        if (!isCenter) {
                          e.preventDefault();
                          setActiveIndex(index);
                        }
                      }}
                      className={cn(
                        "absolute transition-all duration-500 ease-out",
                        "h-[220px] w-[300px] sm:h-[320px] sm:w-[500px] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl",
                        translate,
                        scale,
                        zIndex,
                        opacity,
                        !isCenter && "cursor-pointer",
                      )}
                    >
                      <Image
                        src={event.image.src}
                        alt={event.image.alt}
                        fill
                        sizes="(max-width: 640px) 300px, 500px"
                        className={cn(
                          "object-cover transition-transform duration-500",
                          isCenter && "group-hover:scale-[1.03]",
                          !isCenter && "blur-[2px]",
                        )}
                        priority={isCenter}
                      />
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-white transition-opacity duration-500",
                          overlayOpacity,
                        )}
                      />
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.80),transparent_50%)] transition-opacity duration-500",
                          offset === 0 ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute bottom-0 left-0 right-0 p-5 sm:p-6 transition-opacity duration-500",
                          offset === 0 ? "opacity-100" : "opacity-0",
                        )}
                      >
                        <div className="line-clamp-2 text-base font-bold text-white sm:text-xl drop-shadow-md">
                          {event.title}
                        </div>
                        <div className="mt-2 text-xs font-medium text-white/90 sm:text-sm drop-shadow">
                          {event.locationLabel}
                        </div>
                      </div>
                    </a>
                  );
                })}

                <button
                  type="button"
                  aria-label="Anterior"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      featured.length ? (prev - 1 + featured.length) % featured.length : 0,
                    )
                  }
                  className="absolute left-4 sm:left-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-800 shadow-2xl ring-1 ring-black/5 transition-all hover:scale-110 hover:text-[#F58318] hover:shadow-2xl"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>

                <button
                  type="button"
                  aria-label="Próximo"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      featured.length ? (prev + 1) % featured.length : 0,
                    )
                  }
                  className="absolute right-4 sm:right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-800 shadow-2xl ring-1 ring-black/5 transition-all hover:scale-110 hover:text-[#F58318] hover:shadow-2xl"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
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
                        <Icon className="h-5 w-5 text-slate-700 transition-colors duration-200 group-hover:text-[#F58318]" />
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
