# Roletei — Monorepo (Web + Mobile)

Hub de eventos e rolês em Belo Horizonte, com **Web (Next.js)** e **Mobile (Expo/React Native)**, usando **Supabase** como backend e **Meilisearch** para buscas.

## Objetivos de arquitetura

- **Monorepo com npm workspaces**: desenvolvimento integrado e compartilhamento de código.
- **Separação clara por domínio** (apps vs packages), reduzindo acoplamento.
- **Reuso de código** entre web e mobile (tipos, validações, utilitários e regras de negócio).
- Base preparada para **Supabase** (auth, storage, database) e **Meilisearch** (full-text search).

## Estrutura de pastas

```
apps/
  web/            # Next.js (a ser inicializado)
  mobile/         # Expo/React Native (a ser inicializado)
packages/
  shared/         # Tipagens, Zod schemas, utils e regras de negócio compartilhadas
```

## Workspaces

O repositório está configurado com `npm workspaces` no `package.json` raiz:

- `apps/*`
- `packages/*`

## Convenções (planejadas)

- `packages/shared`
  - `src/types` — tipagens e contratos (DTOs)
  - `src/schemas` — validações com Zod (input/output)
  - `src/utils` — helpers puros (formatters, dates, etc.)
  - `src/domain` — regras de negócio (use-cases) independentes de UI

## Stack alvo (futuro)

- Web: Next.js (App Router), TypeScript, Tailwind (opcional)
- Mobile: Expo (React Native), TypeScript
- Backend: Supabase (Postgres + Auth + Storage + Edge Functions, se necessário)
- Busca: Meilisearch (indexação e ranking)

## Scripts

No momento o monorepo está apenas com o esqueleto. Scripts serão adicionados quando `apps/web`, `apps/mobile` e `packages/shared` forem inicializados.

## Como evoluir a partir daqui (próximos passos)

1. Inicializar `apps/web` com Next.js
2. Inicializar `apps/mobile` com Expo
3. Criar `packages/shared` com TypeScript + build (tsup ou swc) + exports
4. Adicionar tooling: ESLint, Prettier, TypeScript base, CI
