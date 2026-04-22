import { Meilisearch } from "meilisearch";

const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST ?? "";

// Server-side (admin/sync, settings, etc.)
const adminApiKey = process.env.MEILISEARCH_MASTER_KEY ?? "";

// Client-side (busca pública). Deve ser uma key com permissões reduzidas (somente search).
const publicSearchKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY ?? "";

if (!host) {
  // Mantém stack trace e falha cedo quando alguém tentar usar o client sem configurar o host.
  // Evita erro silencioso em runtime.
  throw new Error(
    "Meilisearch: variável de ambiente NEXT_PUBLIC_MEILISEARCH_HOST não encontrada. Configure-a antes de usar o client."
  );
}

/**
 * Client do Meilisearch.
 *
 * - `NEXT_PUBLIC_MEILISEARCH_HOST` define o host.
 * - `MEILISEARCH_MASTER_KEY` define a master key (opcional em alguns ambientes).
 *
 * Observação: `MEILISEARCH_MASTER_KEY` NÃO é `NEXT_PUBLIC_*` e não deve ser exposta ao client-side.
 * Use este client preferencialmente em Server Components / Route Handlers.
 */
/**
 * Client server-side (admin).
 * Use em Route Handlers / Server Actions.
 */
export const meilisearchAdmin = new Meilisearch({
  host,
  ...(adminApiKey ? { apiKey: adminApiKey } : {}),
});

/**
 * Client client-side (search).
 * Use em componentes client e hooks.
 */
export const meilisearch = new Meilisearch({
  host,
  ...(publicSearchKey ? { apiKey: publicSearchKey } : {}),
});
