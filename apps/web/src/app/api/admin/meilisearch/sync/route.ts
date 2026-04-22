import { NextResponse } from "next/server";

import { meilisearchAdmin } from "@/lib/meilisearch";
import { createClient } from "@/lib/supabase/server";

type MeiliEventDoc = {
  id: string;
};

export const dynamic = "force-dynamic";

type MusicStyleRow = {
  category: Array<{ name: string | null }>;
};

type EventRow = {
  id: string;
  title: string | null;
  banner_url: string | null;
  location_name: string | null;
  location_address: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean | null;

  // valor/preço
  price_mode: "free" | "paid" | "custom" | null;

  // free
  free_access_type: "none" | "list" | "ticket" | null;

  // paid
  paid_type: "couvert" | "ticket" | "entry" | null;
  is_couvert_optional: boolean | null;
  paid_by_gender: boolean | null;
  paid_value_cents: number | null;
  paid_female_value_cents: number | null;
  paid_male_value_cents: number | null;

  // custom
  custom_mode_type: "entry" | "ticket" | null;
  custom_until_time: string | null; // "HH:MM:SS"
  custom_until_kind: "free" | "value" | null;
  custom_until_by_gender: boolean | null;
  custom_until_value_cents: number | null;
  custom_until_female_value_cents: number | null;
  custom_until_male_value_cents: number | null;

  custom_after_by_gender: boolean | null;
  custom_after_value_cents: number | null;
  custom_after_female_value_cents: number | null;
  custom_after_male_value_cents: number | null;

  // estilos musicais (N:N)
  event_music_styles: MusicStyleRow[];
};

export async function GET() {
  const supabase = await createClient();

  // Busca os campos necessários para o EventCard (Home/Busca).
  const { data: events, error } = await supabase.from("events").select(`
      id,
      title,
      banner_url,
      location_name,
      location_address,
      starts_at,
      ends_at,
      is_active,
      price_mode,
      free_access_type,
      paid_type,
      is_couvert_optional,
      paid_by_gender,
      paid_value_cents,
      paid_female_value_cents,
      paid_male_value_cents,
      custom_mode_type,
      custom_until_time,
      custom_until_kind,
      custom_until_by_gender,
      custom_until_value_cents,
      custom_until_female_value_cents,
      custom_until_male_value_cents,
      custom_after_by_gender,
      custom_after_value_cents,
      custom_after_female_value_cents,
      custom_after_male_value_cents,
      event_music_styles: event_music_styles (
        category: category_id (
          name
        )
      )
    `);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  const documents = (events ?? [])
    .filter((e): e is EventRow => !!e && typeof e.id === "string")
    .map((e) => ({
      id: e.id,
      title: e.title ?? "",
      banner_url: e.banner_url ?? null,
      location_name: e.location_name ?? "",
      location_address: e.location_address ?? "",
      starts_at: e.starts_at ?? null,
      ends_at: e.ends_at ?? null,
      is_active: Boolean(e.is_active),

      price_mode: e.price_mode ?? null,
      free_access_type: e.free_access_type ?? null,
      paid_type: e.paid_type ?? null,
      is_couvert_optional: e.is_couvert_optional ?? null,
      paid_by_gender: e.paid_by_gender ?? null,
      paid_value_cents: e.paid_value_cents ?? null,
      paid_female_value_cents: e.paid_female_value_cents ?? null,
      paid_male_value_cents: e.paid_male_value_cents ?? null,

      custom_mode_type: e.custom_mode_type ?? null,
      custom_until_time: e.custom_until_time ?? null,
      custom_until_kind: e.custom_until_kind ?? null,
      custom_until_by_gender: e.custom_until_by_gender ?? null,
      custom_until_value_cents: e.custom_until_value_cents ?? null,
      custom_until_female_value_cents: e.custom_until_female_value_cents ?? null,
      custom_until_male_value_cents: e.custom_until_male_value_cents ?? null,

      custom_after_by_gender: e.custom_after_by_gender ?? null,
      custom_after_value_cents: e.custom_after_value_cents ?? null,
      custom_after_female_value_cents: e.custom_after_female_value_cents ?? null,
      custom_after_male_value_cents: e.custom_after_male_value_cents ?? null,

      event_music_styles: e.event_music_styles ?? [],
    }));

  // Seleciona (e cria automaticamente se não existir) o índice "events".
  const index = meilisearchAdmin.index("events");

  // Garante que o campo "title" seja pesquisável e "starts_at" possa ser usado em sorting.
  // (Sem isso, dependendo da configuração do índice, a busca pode retornar 0 hits.)
  await index.updateSearchableAttributes(["title", "location_name", "location_address"]);

  await index.updateSortableAttributes(["starts_at"]);

  // Remove do índice documentos que foram apagados do banco.
  const dbIds = new Set(documents.map((d) => d.id));

  const meiliDocs = await index.getDocuments<MeiliEventDoc>({
    fields: ["id"],
    limit: 10_000,
  });

  const staleIds = (meiliDocs.results ?? [])
    .map((d) => d.id)
    .filter((id) => typeof id === "string" && id && !dbIds.has(id));

  let deleteTask: unknown = null;
  if (staleIds.length > 0) {
    deleteTask = await index.deleteDocuments(staleIds);
  }

  // Envia documentos para o Meilisearch (upsert)
  const addTask = await index.addDocuments(documents);

  return NextResponse.json({
    ok: true,
    sent: documents.length,
    deleted: staleIds.length,
    deleteTask,
    addTask,
  });
}
