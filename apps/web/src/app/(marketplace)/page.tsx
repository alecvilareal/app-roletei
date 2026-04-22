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

import { SearchDropdown } from "@/components/search/SearchDropdown";
import { Button } from "@/components/ui/button";
import { EventCard, type Event } from "@/features/events/components/EventCard";
import { useEventSearch } from "@/hooks/useEventSearch";
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

type Filter = Event["category"] | "Tudo";

type ApiEvent = {
  id: string;
  title: string;
  banner_url: string | null;
  location_name: string;
  location_address: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;

  // valor/preço
  price_mode?: "free" | "paid" | "custom" | null;

  // free
  free_access_type?: "none" | "list" | "ticket" | null;

  // paid
  paid_type?: "couvert" | "ticket" | "entry" | null;
  is_couvert_optional?: boolean | null;
  paid_by_gender?: boolean | null;
  paid_value_cents?: number | null;
  paid_female_value_cents?: number | null;
  paid_male_value_cents?: number | null;

  // custom
  custom_mode_type?: "entry" | "ticket" | null;
  custom_until_time?: string | null; // "HH:MM:SS"
  custom_until_kind?: "free" | "value" | null;
  custom_until_by_gender?: boolean | null;
  custom_until_value_cents?: number | null;
  custom_until_female_value_cents?: number | null;
  custom_until_male_value_cents?: number | null;

  custom_after_by_gender?: boolean | null;
  custom_after_value_cents?: number | null;
  custom_after_female_value_cents?: number | null;
  custom_after_male_value_cents?: number | null;

  // estilos musicais (N:N)
  event_music_styles?: Array<{
    category: { name: string } | null;
  }>;
};

function monthAbbrPtBR(monthIndex0: number) {
  const months = [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
  ];
  return months[monthIndex0] ?? "";
}

function formatCentsBRL(cents: number) {
  const value = cents / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatTimeHHMM(time: string | null | undefined) {
  if (!time) return "";
  // Supabase pode retornar "HH:MM:SS" (time) — queremos "HH:MM"
  const parts = time.split(":");
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
}

function resolvePriceLabel(ev: ApiEvent): string {
  const mode = ev.price_mode ?? "free";

  if (mode === "free") return "Grátis";

  if (mode === "paid") {
    const typeLabel =
      ev.paid_type === "couvert"
        ? "Couvert"
        : ev.paid_type === "ticket"
          ? "Ingresso"
          : ev.paid_type === "entry"
            ? "Entrada"
            : "Pago";

    if (ev.paid_by_gender) {
      const female = ev.paid_female_value_cents;
      const male = ev.paid_male_value_cents;

      const parts: string[] = [];
      if (typeof female === "number" && Number.isFinite(female) && female > 0)
        parts.push(`F: ${formatCentsBRL(female)}`);
      if (typeof male === "number" && Number.isFinite(male) && male > 0)
        parts.push(`M: ${formatCentsBRL(male)}`);

      return parts.length ? `${typeLabel} ${parts.join(" • ")}` : typeLabel;
    }

    const v = ev.paid_value_cents;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) {
      return `${typeLabel} ${formatCentsBRL(v)}`;
    }

    return typeLabel;
  }

  // custom
  const modeLabel =
    ev.custom_mode_type === "ticket" ? "Ingresso" : ev.custom_mode_type === "entry" ? "Entrada" : "Personalizado";

  const untilTime = formatTimeHHMM(ev.custom_until_time);
  const untilDetails =
    ev.custom_until_kind === "free"
      ? "Grátis"
      : (() => {
          if (ev.custom_until_by_gender) {
            const parts: string[] = [];
            const female = ev.custom_until_female_value_cents;
            const male = ev.custom_until_male_value_cents;

            if (typeof female === "number" && Number.isFinite(female) && female > 0)
              parts.push(`F: ${formatCentsBRL(female)}`);
            if (typeof male === "number" && Number.isFinite(male) && male > 0)
              parts.push(`M: ${formatCentsBRL(male)}`);

            return parts.length ? parts.join(" • ") : "";
          }

          const v = ev.custom_until_value_cents;
          return typeof v === "number" && Number.isFinite(v) && v > 0 ? formatCentsBRL(v) : "";
        })();

  const afterDetails = (() => {
    if (ev.custom_after_by_gender) {
      const parts: string[] = [];
      const female = ev.custom_after_female_value_cents;
      const male = ev.custom_after_male_value_cents;

      if (typeof female === "number" && Number.isFinite(female) && female > 0)
        parts.push(`F: ${formatCentsBRL(female)}`);
      if (typeof male === "number" && Number.isFinite(male) && male > 0)
        parts.push(`M: ${formatCentsBRL(male)}`);

      return parts.length ? parts.join(" • ") : "";
    }

    const v = ev.custom_after_value_cents;
    return typeof v === "number" && Number.isFinite(v) && v > 0 ? formatCentsBRL(v) : "";
  })();

  // Formato desejado:
  // "Entrada até às 20h R$25,00, após R$35,00"
  const untilLabel = untilTime ? `até às ${untilTime}` : "até";
  const untilPart = `${modeLabel} ${untilLabel}${untilDetails ? ` ${untilDetails}` : ""}`.trim();
  const afterPart = `após${afterDetails ? ` ${afterDetails}` : ""}`.trim();

  return `${untilPart}, ${afterPart}`;
}

function resolveMusicStyleTags(ev: ApiEvent): string[] {
  const tags = (ev.event_music_styles ?? [])
    .map((x) => x.category?.name?.trim())
    .filter((x): x is string => Boolean(x));
  return Array.from(new Set(tags));
}

function mapApiEventToCard(ev: ApiEvent): Event {
  const start = new Date(ev.starts_at);
  const tags = resolveMusicStyleTags(ev);

  return {
    id: ev.id,
    title: ev.title,
    locationLabel: `${ev.location_name} • ${ev.location_address}`,
    dateChip: {
      day: String(start.getDate()).padStart(2, "0"),
      month: monthAbbrPtBR(start.getMonth()),
    },
    category: "Eventos",
    tags,
    priceLabel: resolvePriceLabel(ev),
    image: ev.banner_url?.trim()
      ? {
          src: ev.banner_url.trim(),
          alt: ev.title,
        }
      : null,
  };
}

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

  const search = useEventSearch({ debounceMs: 300, limit: 8 });
  const query = search.query;
  const setQuery = search.setQuery;
  const [, setCategory] = useState<CategoryKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setEventsLoading(true);
      try {
        const res = await fetch("/api/events?limit=50", { method: "GET" });
        if (!res.ok) throw new Error("Falha ao carregar eventos.");
        const data = (await res.json()) as ApiEvent[];
        const mapped = Array.isArray(data) ? data.map(mapApiEventToCard) : [];
        if (!ignore) setEvents(mapped);
      } catch {
        if (!ignore) setEvents([]);
      } finally {
        if (!ignore) setEventsLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(
    () => filterEvents(events, selectedFilter, query),
    [events, selectedFilter, query],
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
                <div className="relative flex items-center gap-3 rounded-xl px-3 py-3 md:flex-[1.4] md:py-2">
                  <Search className="h-5 w-5 text-slate-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="O que você quer curtir?"
                    className="h-10 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                  />

                  <SearchDropdown
                    open={query.trim().length > 0}
                    loading={search.loading}
                    error={search.error}
                    items={search.results.map((hit) => ({
                      id: hit.id,
                      label: hit.title,
                    }))}
                    onSelect={(item) => {
                      console.log("event.search.select", item.id);
                      setQuery(item.label);
                    }}
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
                {eventsLoading ? (
                  <div className="text-sm text-slate-600">Carregando eventos...</div>
                ) : (
                  featured.map((event, index) => {
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
                        {event.image ? (
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
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
                            <div className="text-center">
                              <div className="text-xs font-semibold uppercase tracking-widest text-white/70">
                                Roletei
                              </div>
                              <div className="mt-1 text-lg font-black text-white">Sem banner</div>
                            </div>
                          </div>
                        )}
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
                  })
                )}

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
