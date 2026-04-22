import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { meilisearch } from "@/lib/meilisearch";
import type { EventSearchHit } from "@/hooks/useEventSearch";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function MarketplaceSearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY) {
    return (
      <main className="mx-auto w-full max-w-[1536px] px-8 py-10">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/marketplace">Voltar</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Busca</h1>
        </div>

        <p className="mt-4 text-sm text-red-600">
          NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY não configurada.
        </p>
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
    <main className="bg-slate-50">
      <div className="mx-auto w-full max-w-[1536px] px-6 py-10 md:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Button asChild variant="outline" className="h-10 rounded-full">
                <Link href="/marketplace">Voltar</Link>
              </Button>

              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                  Busca
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {query ? (
                    <>
                      Resultados para:{" "}
                      <span className="font-medium text-slate-900">{query}</span>
                    </>
                  ) : (
                    "Digite algo para buscar."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border/60">
            <form action="/busca" method="GET">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex h-11 w-full items-center rounded-full border bg-white px-4 ring-1 ring-slate-200">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    name="q"
                    defaultValue={query}
                    placeholder="O que você quer curtir hoje?"
                    className="h-10 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-full bg-[#F58318] px-7 text-sm font-semibold text-white hover:bg-[#F58318]/90 md:w-auto"
                >
                  Buscar
                </Button>
              </div>
            </form>
          </div>

          {/* Resultados */}
          {query ? (
            hits.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-border/60">
                Nenhum resultado encontrado.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border/60">
                <ul className="divide-y">
                  {hits.map((hit) => (
                    <li key={hit.id} className="px-5 py-4">
                      <Link
                        href={`/marketplace/eventos/${hit.id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        {hit.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : null}
        </div>
      </div>
    </main>
  );
}
