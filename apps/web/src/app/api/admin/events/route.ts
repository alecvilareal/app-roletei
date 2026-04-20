import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type PostBody = {
  title: string;
  description?: string | null;

  banner_url?: string | null;

  location_name: string;
  location_address: string;

  tickets_url?: string | null;

  starts_at: string; // ISO
  ends_at: string; // ISO
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
    description,
    banner_url,
    location_name,
    location_address,
    tickets_url,
    starts_at,
    ends_at,
  } = body ?? ({} as PostBody);

  if (!isNonEmptyString(title)) return jsonError(400, "Campo obrigatório inválido: title.");
  if (!isNonEmptyString(location_name))
    return jsonError(400, "Campo obrigatório inválido: location_name.");
  if (!isNonEmptyString(location_address))
    return jsonError(400, "Campo obrigatório inválido: location_address.");
  if (!isNonEmptyString(starts_at))
    return jsonError(400, "Campo obrigatório inválido: starts_at.");
  if (!isNonEmptyString(ends_at)) return jsonError(400, "Campo obrigatório inválido: ends_at.");

  if (!isValidUrlOrEmpty(banner_url))
    return jsonError(400, "Campo inválido: banner_url (precisa ser uma URL válida).");
  if (!isValidUrlOrEmpty(tickets_url))
    return jsonError(400, "Campo inválido: tickets_url (precisa ser uma URL válida).");

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

  const { data, error } = await authCheck.supabase
    .from("events")
    .insert({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : null,
      banner_url: typeof banner_url === "string" ? banner_url.trim() : null,
      location_name: location_name.trim(),
      location_address: location_address.trim(),
      tickets_url: typeof tickets_url === "string" ? tickets_url.trim() : null,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return jsonError(500, "Não foi possível cadastrar o evento.", error.message);
  }

  return NextResponse.json(data, { status: 201 });
}
