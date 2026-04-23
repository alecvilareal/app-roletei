import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { meilisearchAdmin } from "@/lib/meilisearch";

function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details: details ?? null }, { status });
}

async function assertAdminRole(): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>; userId: string }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      ok: false,
      response: jsonError(401, "Não foi possível validar o usuário autenticado.", userError.message),
    };
  }

  if (!user) {
    return { ok: false, response: jsonError(401, "Usuário não autenticado.") };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle<{ id: string; role: string }>();

  if (profileError) {
    return {
      ok: false,
      response: jsonError(500, "Erro ao consultar o perfil do usuário.", profileError.message),
    };
  }

  if (!profile || profile.role !== "cao_chupando_manga") {
    return {
      ok: false,
      response: jsonError(403, "Acesso negado: você não tem permissão para gerenciar eventos."),
    };
  }

  return { ok: true, supabase, userId: user.id };
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { id } = await context.params;

  if (!id || typeof id !== "string") {
    return jsonError(400, "Parâmetro inválido: id.");
  }

  const { data: event, error } = await authCheck.supabase
    .from("events")
    .select(
      [
        "id",
        "title",
        "banner_url",
        "place_id",
        "location_name",
        "location_address",
        "starts_at",
        "ends_at",
        "price_mode",
        "free_access_type",
        "free_access_link",
        "paid_type",
        "is_couvert_optional",
        "paid_by_gender",
        "paid_value_cents",
        "paid_female_value_cents",
        "paid_male_value_cents",
        "paid_link",
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
        "custom_link",
      ].join(","),
    )
    .eq("id", id)
    .maybeSingle<Record<string, unknown>>();

  if (error) {
    return jsonError(500, "Não foi possível carregar o evento.", error.message);
  }

  if (!event) {
    return jsonError(404, "Evento não encontrado.");
  }

  // estilos musicais ficam em public.event_music_styles (event_id, category_id)
  const { data: musicStyleRows, error: musicStylesError } = await authCheck.supabase
    .from("event_music_styles")
    .select("category_id")
    .eq("event_id", id);

  if (musicStylesError) {
    return jsonError(500, "Não foi possível carregar estilos musicais do evento.", musicStylesError.message);
  }

  const music_style_category_ids = (musicStyleRows ?? [])
    .map((r) => r.category_id)
    .filter((x): x is string => typeof x === "string");

  return NextResponse.json({ ...event, music_style_category_ids }, { status: 200 });
}

async function replaceEventMusicStyles(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  eventId: string,
  categoryIds: string[],
) {
  // remove todas e reinsere
  const { error: delError } = await supabase.from("event_music_styles").delete().eq("event_id", eventId);
  if (delError) throw new Error(delError.message);

  if (categoryIds.length === 0) return;

  const rows = categoryIds.map((category_id) => ({ event_id: eventId, category_id }));

  const { error: insError } = await supabase.from("event_music_styles").insert(rows);
  if (insError) throw new Error(insError.message);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { id } = await context.params;

  if (!id || typeof id !== "string") {
    return jsonError(400, "Parâmetro inválido: id.");
  }

  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) {
    return jsonError(400, "Body inválido.");
  }

  // validações mínimas
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const starts_at = typeof payload.starts_at === "string" ? payload.starts_at : "";
  const ends_at =
    typeof payload.ends_at === "string" ? payload.ends_at : payload.ends_at === null ? null : "";
  const price_mode =
    payload.price_mode === "free" || payload.price_mode === "paid" || payload.price_mode === "custom"
      ? payload.price_mode
      : null;

  const place_id = typeof payload.place_id === "string" ? payload.place_id : null;

  if (!title) return jsonError(400, "Informe o título.");
  if (!starts_at) return jsonError(400, "Informe starts_at.");
  if (ends_at === "") return jsonError(400, "Informe ends_at.");
  if (!price_mode) return jsonError(400, "Informe price_mode (free|paid|custom).");
  if (!place_id) return jsonError(400, "Informe place_id.");

  const update: Record<string, unknown> = {
    title,
    banner_url: typeof payload.banner_url === "string" || payload.banner_url === null ? payload.banner_url : null,
    place_id,
    starts_at,
    ends_at: ends_at === "" ? null : ends_at,
    price_mode,

    free_access_type: payload.free_access_type ?? null,
    free_access_link: payload.free_access_link ?? null,

    paid_type: payload.paid_type ?? null,
    is_couvert_optional: payload.is_couvert_optional ?? null,
    paid_by_gender: payload.paid_by_gender ?? null,
    paid_value_cents: payload.paid_value_cents ?? null,
    paid_female_value_cents: payload.paid_female_value_cents ?? null,
    paid_male_value_cents: payload.paid_male_value_cents ?? null,
    paid_link: payload.paid_link ?? null,

    custom_mode_type: payload.custom_mode_type ?? null,
    custom_until_time: payload.custom_until_time ?? null,
    custom_until_kind: payload.custom_until_kind ?? null,
    custom_until_by_gender: payload.custom_until_by_gender ?? null,
    custom_until_value_cents: payload.custom_until_value_cents ?? null,
    custom_until_female_value_cents: payload.custom_until_female_value_cents ?? null,
    custom_until_male_value_cents: payload.custom_until_male_value_cents ?? null,
    custom_after_by_gender: payload.custom_after_by_gender ?? null,
    custom_after_value_cents: payload.custom_after_value_cents ?? null,
    custom_after_female_value_cents: payload.custom_after_female_value_cents ?? null,
    custom_after_male_value_cents: payload.custom_after_male_value_cents ?? null,
    custom_link: payload.custom_link ?? null,
  };

  const musicStyleCategoryIds = Array.isArray(payload.music_style_category_ids)
    ? payload.music_style_category_ids.filter((x): x is string => typeof x === "string")
    : null;

  const { data, error } = await authCheck.supabase
    .from("events")
    .update(update)
    .eq("id", id)
    .select(
      [
        "id",
        "title",
        "banner_url",
        "place_id",
        "location_name",
        "location_address",
        "starts_at",
        "ends_at",
        "price_mode",
        "free_access_type",
        "free_access_link",
        "paid_type",
        "is_couvert_optional",
        "paid_by_gender",
        "paid_value_cents",
        "paid_female_value_cents",
        "paid_male_value_cents",
        "paid_link",
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
        "custom_link",
      ].join(","),
    )
    .maybeSingle<Record<string, unknown>>();

  if (error) {
    return jsonError(500, "Não foi possível atualizar o evento.", error.message);
  }

  if (!data) {
    return jsonError(404, "Evento não encontrado.");
  }

  if (musicStyleCategoryIds) {
    try {
      await replaceEventMusicStyles(authCheck.supabase, id, musicStyleCategoryIds);
    } catch (e) {
      return jsonError(
        500,
        "Evento atualizado, mas não foi possível salvar estilos musicais.",
        e instanceof Error ? e.message : e,
      );
    }
  }

  // sempre retorna os estilos atuais
  const { data: musicStyleRows, error: musicStylesError } = await authCheck.supabase
    .from("event_music_styles")
    .select("category_id")
    .eq("event_id", id);

  if (musicStylesError) {
    return jsonError(500, "Evento atualizado, mas não foi possível carregar estilos musicais.", musicStylesError.message);
  }

  const music_style_category_ids = (musicStyleRows ?? [])
    .map((r) => r.category_id)
    .filter((x): x is string => typeof x === "string");

  // Atualiza o índice do Meilisearch (não depende do sync manual).
  try {
    const index = meilisearchAdmin.index("events");
    await index.addDocuments([
      {
        id: (data as { id: string }).id,
        title: (data as { title?: string | null }).title ?? "",
        banner_url: (data as { banner_url?: string | null }).banner_url ?? null,
        location_name: (data as { location_name?: string | null }).location_name ?? "",
        location_address: (data as { location_address?: string | null }).location_address ?? "",
        starts_at: (data as { starts_at?: string | null }).starts_at ?? null,
        ends_at: (data as { ends_at?: string | null }).ends_at ?? null,
        is_active: true,
      },
    ]);
  } catch {
    // não quebra a edição se o Meilisearch estiver fora
  }

  return NextResponse.json({ ...data, music_style_category_ids }, { status: 200 });
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { id } = await context.params;

  if (!id || typeof id !== "string") {
    return jsonError(400, "Parâmetro inválido: id.");
  }

  const { error } = await authCheck.supabase.from("events").delete().eq("id", id);

  if (error) {
    return jsonError(500, "Não foi possível excluir o evento.", error.message);
  }

  // Remove do índice do Meilisearch (não depende do sync manual).
  try {
    const index = meilisearchAdmin.index("events");
    await index.deleteDocument(id);
  } catch {
    // não quebra a exclusão se o Meilisearch estiver fora
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
