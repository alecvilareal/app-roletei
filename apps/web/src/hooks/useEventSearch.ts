"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { meilisearch } from "@/lib/meilisearch";

export type EventSearchHit = {
  id: string;
  title: string;
};

export function useEventSearch(options?: { debounceMs?: number; limit?: number }) {
  const debounceMs = options?.debounceMs ?? 300;
  const limit = options?.limit ?? 8;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EventSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY) {
      setError("NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY não configurada.");
      return;
    }

    if (!canSearch) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const myRequestId = ++requestIdRef.current;

    const t = setTimeout(async () => {
      try {
        const index = meilisearch.index("events");

        const res = await index.search<EventSearchHit>(query, {
          limit,
          attributesToRetrieve: ["id", "title"],
        });

        // Evita race conditions (resposta antiga chegando depois)
        if (requestIdRef.current !== myRequestId) return;

        setResults(Array.isArray(res.hits) ? res.hits : []);
      } catch (e) {
        if (requestIdRef.current !== myRequestId) return;
        setResults([]);
        setError(e instanceof Error ? e.message : "Erro ao buscar no Meilisearch.");
      } finally {
        if (requestIdRef.current !== myRequestId) return;
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(t);
  }, [canSearch, debounceMs, limit, query]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clear: () => setQuery(""),
  };
}
