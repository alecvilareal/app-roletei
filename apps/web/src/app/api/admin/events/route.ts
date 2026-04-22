import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type PostBody = {
  title: string;

  banner_url?: string | null;

  // quando enviado, o backend busca o local e preenche location_name/location_address
  place_id?: string | null;

  // fallback/manual (quando place_id não é enviado)
  location_name?: string;
  location_address?: string;

  // categorias (public.categories) do group "Estilo Musical"
  music_style_category_ids?: string[];

  starts_at: string; // ISO
  ends_at: string; // ISO

  // valor/preço
  price_mode?: "free" | "paid" | "custom";

  // free
  free_access_type?: "none" | "list" | "ticket";
  free_access_link?: string;

  // paid
  paid_type?: "couvert" | "ticket" | "entry";
  is_couvert_optional?: boolean;
  paid_by_gender?: boolean;
  paid_value_cents?: number;
  paid_female_value_cents?: number;
  paid_male_value_cents?: number;
  paid_link?: string;

  // custom
  custom_mode_type?: "entry" | "ticket";
  custom_until_time?: string; // "HH:MM"
  custom_until_kind?: "free" | "value";
  custom_until_by_gender?: boolean;
  custom_until_value_cents?: number;
  custom_until_female_value_cents?: number;
  custom_until_male_value_cents?: number;
  custom_after_by_gender?: boolean;
  custom_after_value_cents?: number;
  custom_after_female_value_cents?: number;
  custom_after_male_value_cents?: number;
  custom_link?: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details: details ?? null }, { status });
}

async function assertAdminRole(): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> }
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
      response: jsonError(
        401,
        "Não foi possível validar o usuário autenticado.",
        userError.message,
      ),
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
      response: jsonError(403, "Acesso negado: você não tem permissão para cadastrar eventos."),
    };
  }

  return { ok: true, supabase };
}

function isValidUrlOrEmpty(v: unknown): v is string | null | undefined {
  if (v === null || v === undefined) return true;
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (!s) return true;
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") ?? "active").toLowerCase();
  const sort = (searchParams.get("sort") ?? "starts_at").toLowerCase();
  const limitRaw = searchParams.get("limit");
  const limit =
    limitRaw && Number.isFinite(Number(limitRaw)) ? Math.max(1, Math.min(50, Number(limitRaw))) : null;

  let isActive: boolean | null = true;
  if (status === "active" || status === "ativos") isActive = true;
  else if (status === "inactive" || status === "inativos") isActive = false;
  else if (status === "all" || status === "todos") isActive = null;
  else return jsonError(400, "Parâmetro inválido: status (use active/inactive/all).");

  const sortColumn = sort === "created_at" ? "created_at" : "starts_at";
  const sortAscending = sortColumn === "starts_at";

  let query = authCheck.supabase
    .from("events")
    .select(
      "id, title, location_name, location_address, starts_at, ends_at, is_active, created_at",
    )
    .order(sortColumn, { ascending: sortAscending });

  if (limit) query = query.limit(limit);

  if (isActive !== null) {
    query = query.eq("is_active", isActive);
  }

  const { data, error } = await query;

  if (error) {
    return jsonError(500, "Não foi possível listar eventos.", error.message);
  }

  return NextResponse.json(data ?? [], { status: 200 });
}

export async function POST(req: NextRequest) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  let body: PostBody | null = null;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return jsonError(400, "JSON inválido no corpo da requisição.");
  }

  const {
    title,
    banner_url,
    place_id,
    location_name,
    location_address,
    music_style_category_ids,
    starts_at,
    ends_at,

    price_mode,
    free_access_type,
    free_access_link,

    paid_type,
    is_couvert_optional,
    paid_by_gender,
    paid_value_cents,
    paid_female_value_cents,
    paid_male_value_cents,
    paid_link,

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
    custom_link,
  } = body ?? ({} as PostBody);

  if (!isNonEmptyString(title)) return jsonError(400, "Campo obrigatório inválido: title.");
  if (!isNonEmptyString(starts_at))
    return jsonError(400, "Campo obrigatório inválido: starts_at.");
  if (!isNonEmptyString(ends_at)) return jsonError(400, "Campo obrigatório inválido: ends_at.");

  if (!isValidUrlOrEmpty(banner_url))
    return jsonError(400, "Campo inválido: banner_url (precisa ser uma URL válida).");
  const startDate = new Date(starts_at);
  const endDate = new Date(ends_at);

  if (Number.isNaN(startDate.getTime())) {
    return jsonError(400, "Campo inválido: starts_at (use uma data/hora válida).");
  }
  if (Number.isNaN(endDate.getTime())) {
    return jsonError(400, "Campo inválido: ends_at (use uma data/hora válida).");
  }
  if (endDate.getTime() <= startDate.getTime()) {
    return jsonError(400, "Campo inválido: ends_at deve ser maior que starts_at.");
  }

  // resolve local (place) se informado
  let resolvedPlace: {
    id: string;
    name: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
  } | null = null;

  if (typeof place_id === "string" && place_id.trim()) {
    const { data: place, error: placeError } = await authCheck.supabase
      .from("places")
      .select("id, name, cep, logradouro, numero, complemento, bairro, cidade, uf")
      .eq("id", place_id)
      .maybeSingle();

    if (placeError) {
      return jsonError(500, "Erro ao consultar o local selecionado.", placeError.message);
    }

    if (!place) {
      return jsonError(400, "Local selecionado inválido (place_id não encontrado).");
    }

    resolvedPlace = place;
  }

  const resolvedLocationName = resolvedPlace ? resolvedPlace.name : location_name;
  const resolvedLocationAddress = resolvedPlace
    ? [
        resolvedPlace.logradouro,
        `nº ${resolvedPlace.numero}`,
        resolvedPlace.complemento ? resolvedPlace.complemento : null,
        resolvedPlace.bairro,
        `${resolvedPlace.cidade}/${resolvedPlace.uf}`,
        resolvedPlace.cep,
      ]
        .filter(Boolean)
        .join(" - ")
    : location_address;

  if (!isNonEmptyString(resolvedLocationName)) {
    return jsonError(400, "Informe o nome do local (ou selecione uma localização cadastrada).");
  }
  if (!isNonEmptyString(resolvedLocationAddress)) {
    return jsonError(400, "Informe o endereço do local (ou selecione uma localização cadastrada).");
  }

  const normalizedPriceMode: "free" | "paid" | "custom" =
    price_mode === "paid" || price_mode === "custom" ? price_mode : "free";

  const { data, error } = await authCheck.supabase
    .from("events")
    .insert({
      title: title.trim(),
      banner_url: typeof banner_url === "string" ? banner_url.trim() : null,
      place_id: resolvedPlace ? resolvedPlace.id : null,
      location_name: resolvedLocationName.trim(),
      location_address: resolvedLocationAddress.trim(),
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),

      price_mode: normalizedPriceMode,

      free_access_type: free_access_type ?? null,
      free_access_link: typeof free_access_link === "string" ? free_access_link.trim() : null,

      paid_type: paid_type ?? null,
      is_couvert_optional: Boolean(is_couvert_optional),
      paid_by_gender: Boolean(paid_by_gender),
      paid_value_cents: Number.isFinite(Number(paid_value_cents)) ? Number(paid_value_cents) : null,
      paid_female_value_cents: Number.isFinite(Number(paid_female_value_cents))
        ? Number(paid_female_value_cents)
        : null,
      paid_male_value_cents: Number.isFinite(Number(paid_male_value_cents))
        ? Number(paid_male_value_cents)
        : null,
      paid_link: typeof paid_link === "string" ? paid_link.trim() : null,

      custom_mode_type: custom_mode_type ?? null,
      custom_until_time: typeof custom_until_time === "string" ? custom_until_time : null,
      custom_until_kind: custom_until_kind ?? null,
      custom_until_by_gender: Boolean(custom_until_by_gender),
      custom_until_value_cents: Number.isFinite(Number(custom_until_value_cents))
        ? Number(custom_until_value_cents)
        : null,
      custom_until_female_value_cents: Number.isFinite(Number(custom_until_female_value_cents))
        ? Number(custom_until_female_value_cents)
        : null,
      custom_until_male_value_cents: Number.isFinite(Number(custom_until_male_value_cents))
        ? Number(custom_until_male_value_cents)
        : null,
      custom_after_by_gender: Boolean(custom_after_by_gender),
      custom_after_value_cents: Number.isFinite(Number(custom_after_value_cents))
        ? Number(custom_after_value_cents)
        : null,
      custom_after_female_value_cents: Number.isFinite(Number(custom_after_female_value_cents))
        ? Number(custom_after_female_value_cents)
        : null,
      custom_after_male_value_cents: Number.isFinite(Number(custom_after_male_value_cents))
        ? Number(custom_after_male_value_cents)
        : null,
      custom_link: typeof custom_link === "string" ? custom_link.trim() : null,
    })
    .select("*")
    .single();

  if (error) {
    return jsonError(500, "Não foi possível cadastrar o evento.", error.message);
  }

  // salva estilos musicais (N:N) se enviados
  if (Array.isArray(music_style_category_ids) && music_style_category_ids.length > 0) {
    const uniqueIds = Array.from(
      new Set(
        music_style_category_ids
          .filter((x) => typeof x === "string")
          .map((x) => x.trim())
          .filter(Boolean),
      ),
    );

    if (uniqueIds.length > 0) {
      const { error: stylesError } = await authCheck.supabase.from("event_music_styles").insert(
        uniqueIds.map((categoryId) => ({
          event_id: data.id,
          category_id: categoryId,
        })),
      );

      if (stylesError) {
        return jsonError(
          500,
          "Evento criado, mas não foi possível salvar os estilos musicais.",
          stylesError.message,
        );
      }
    }
  }

  return NextResponse.json(data, { status: 201 });
}
