import { ArrowLeft, Calendar, MapPin, Search, Ticket } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EventSearchHit } from "@/hooks/useEventSearch";
import { meilisearch } from "@/lib/meilisearch";

export const dynamic = "force-dynamic";

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
        attributesToRetrieve: ["id", "title"],
      })
    : { hits: [] as EventSearchHit[] };

  const hits = Array.isArray(res.hits) ? res.hits : [];

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
                  <div className="rounded-2xl bg-white shadow-sm ring-1 ring-border/60">
                    <div className="grid grid-cols-1 gap-0 divide-y sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-3">
                      {hits.map((hit) => (
                        <Link
                          key={hit.id}
                          href={`/marketplace/eventos/${hit.id}`}
                          className="group flex items-start gap-3 p-5 transition-colors hover:bg-slate-50"
                        >
                          <span className="mt-0.5 inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-border/60 transition-colors group-hover:bg-white">
                            <Ticket className="h-5 w-5" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-2 text-sm font-semibold text-slate-900">
                              {hit.title}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Ver detalhes do evento
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
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
