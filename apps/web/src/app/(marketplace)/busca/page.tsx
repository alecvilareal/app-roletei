import { ArrowLeft, Calendar, MapPin, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventCard, type Event } from "@/features/events/components/EventCard";
import type { EventSearchHit } from "@/hooks/useEventSearch";
import { meilisearch } from "@/lib/meilisearch";

export const dynamic = "force-dynamic";

type ApiEvent = {
  id: string;
  title: string;
  banner_url: string | null;
  location_name: string;
  location_address: string;
  starts_at: string;
  ends_at?: string;
  is_active: boolean;

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
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
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
    ev.custom_mode_type === "ticket"
      ? "Ingresso"
      : ev.custom_mode_type === "entry"
        ? "Entrada"
        : "Personalizado";

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
          return typeof v === "number" && Number.isFinite(v) && v > 0
            ? formatCentsBRL(v)
            : "";
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
    return typeof v === "number" && Number.isFinite(v) && v > 0
      ? formatCentsBRL(v)
      : "";
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

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function MarketplaceSearchPage({
  searchParams,
}: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY) {
    return (
      <main className="bg-background text-foreground">
        <section className="bg-slate-50">
          <div className="mx-auto w-full max-w-[1536px] px-6 py-10 md:py-12">
            <div className="mx-auto w-full max-w-[1400px]">
              <div className="flex items-center gap-6">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-full px-3"
                >
                  <Link href="/" aria-label="Voltar">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Link>
                </Button>

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    Resultados da Busca
                  </h1>
                  <p className="mt-1 text-sm text-red-600">
                    NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY não configurada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    );
  }

  const index = meilisearch.index("events");

  const res = query
    ? await index.search<EventSearchHit>(query, {
        limit: 50,
        attributesToRetrieve: [
          "id",
          "title",
          "banner_url",
          "location_name",
          "location_address",
          "starts_at",
          "price_mode",
          "free_access_type",
          "paid_type",
          "is_couvert_optional",
          "paid_by_gender",
          "paid_value_cents",
          "paid_female_value_cents",
          "paid_male_value_cents",
          "custom_mode_type",
          "custom_until_time",
          "custom_until_kind",
          "custom_until_by_gender",
          "custom_until_value_cents",
          "custom_until_female_value_cents",
          "custom_until_male_value_cents",
          "custom_after_by_gender",
          "custom_after_value_cents",
          "custom_after_female_value_cents",
          "custom_after_male_value_cents",
          "event_music_styles",
          "is_active",
        ],
      })
    : { hits: [] as EventSearchHit[] };

  const hits = Array.isArray(res.hits) ? res.hits : [];

  const events = hits.map((hit) => mapApiEventToCard(hit as unknown as ApiEvent));

  return (
    <main className="bg-background text-foreground">
      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-[1536px] px-6 py-10 md:py-12">
          <div className="mx-auto w-full max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-6">
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-full px-3"
                  >
                    <Link href="/" aria-label="Voltar">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Link>
                  </Button>

                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                      Resultados da Busca
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {query ? (
                        <>
                          Encontramos{" "}
                          <span className="font-semibold text-foreground">
                            {hits.length}
                          </span>{" "}
                          {hits.length === 1 ? "resultado" : "resultados"} para{" "}
                          <span className="font-semibold text-foreground">
                            “{query}”
                          </span>
                          .
                        </>
                      ) : (
                        "Digite um termo para buscar eventos no marketplace."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Widget */}
              <div className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-border/60">
                <form action="/busca" method="GET">
                  <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:gap-0">
                    {/* O que */}
                    <div className="relative flex items-center gap-3 rounded-xl px-3 py-3 md:flex-[1.4] md:py-2">
                      <Search className="h-5 w-5 text-slate-500" />
                      <Input
                        name="q"
                        defaultValue={query}
                        placeholder="O que você quer curtir?"
                        className="h-11 rounded-xl border-0 bg-transparent px-0 text-sm text-slate-900 shadow-none outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#F58318]/40 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="hidden h-10 w-px bg-border md:block" />

                    {/* Onde (placeholder visual para padronizar com a home) */}
                    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left md:flex-1 md:py-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-slate-500" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-500">
                            Onde
                          </div>
                          <div className="truncate text-sm font-semibold text-slate-900">
                            Belo Horizonte, MG
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        em breve
                      </span>
                    </div>

                    <div className="hidden h-10 w-px bg-border md:block" />

                    {/* Data (placeholder visual para padronizar com a home) */}
                    <div className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-left md:flex-1 md:py-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-slate-500" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-500">
                            Data
                          </div>
                          <div className="truncate text-sm font-semibold text-slate-900">
                            Qualquer data
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        em breve
                      </span>
                    </div>

                    {/* CTA */}
                    <div className="md:px-3">
                      <Button
                        type="submit"
                        className="h-12 w-full rounded-xl bg-[#F58318] px-8 font-semibold text-white transition-colors hover:bg-[#F58318]/90 md:w-auto"
                      >
                        <Search className="mr-2 h-5 w-5" />
                        Buscar
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Results */}
              {query ? (
                hits.length === 0 ? (
                  <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-border/60">
                    <Search className="mx-auto h-14 w-14 text-slate-400/40" />
                    <h2 className="mt-4 text-base font-semibold text-foreground">
                      Nenhum resultado encontrado
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tente buscar por outro termo (ex: “pagode”, “open bar”,
                      “forró”).
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )
              ) : (
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-border/60">
                  <Search className="mx-auto h-14 w-14 text-slate-400/40" />
                  <h2 className="mt-4 text-base font-semibold text-foreground">
                    Comece sua busca
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Digite acima para encontrar eventos, festas e shows.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
