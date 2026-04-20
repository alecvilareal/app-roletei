import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type PostBody = {
  name: string;
};

const FIXED_GROUP_NAMES = new Set(["Tipo Evento", "Entrada"]);

function isFixedGroupName(name: string) {
  return FIXED_GROUP_NAMES.has(name.trim());
}

function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details: details ?? null }, { status });
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
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
      response: jsonError(
        403,
        "Acesso negado: você não tem permissão para administrar categorias.",
      ),
    };
  }

  return { ok: true, supabase };
}

export async function GET() {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { data, error } = await authCheck.supabase
    .from("category_groups")
    .select("id, name, created_at, updated_at")
    .order("name", { ascending: true });

  if (error) {
    return jsonError(500, "Não foi possível listar grupos de categorias.", error.message);
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

  const { name } = body ?? ({} as PostBody);

  if (!isNonEmptyString(name)) {
    return jsonError(400, "Campo obrigatório inválido: name.");
  }

  const { data, error } = await authCheck.supabase
    .from("category_groups")
    .insert({ name: name.trim() })
    .select("id, name, created_at, updated_at")
    .single();

  if (error) {
    return jsonError(500, "Não foi possível cadastrar o grupo de categorias.", error.message);
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!isNonEmptyString(id)) {
    return jsonError(400, "Parâmetro obrigatório inválido: id.");
  }

  // Impedir renomear grupos fixos
  const { data: currentGroup, error: currentGroupError } = await authCheck.supabase
    .from("category_groups")
    .select("id, name")
    .eq("id", id.trim())
    .maybeSingle<{ id: string; name: string }>();

  if (currentGroupError) {
    return jsonError(500, "Erro ao consultar o grupo.", currentGroupError.message);
  }

  if (!currentGroup) {
    return jsonError(404, "Grupo não encontrado.");
  }

  if (isFixedGroupName(currentGroup.name)) {
    return jsonError(403, "Não é permitido editar o nome deste grupo fixo.");
  }

  let body: PostBody | null = null;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return jsonError(400, "JSON inválido no corpo da requisição.");
  }

  const { name } = body ?? ({} as PostBody);

  if (!isNonEmptyString(name)) {
    return jsonError(400, "Campo obrigatório inválido: name.");
  }

  const { data, error } = await authCheck.supabase
    .from("category_groups")
    .update({ name: name.trim() })
    .eq("id", id.trim())
    .select("id, name, created_at, updated_at")
    .single();

  if (error) {
    return jsonError(500, "Não foi possível atualizar o grupo.", error.message);
  }

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!isNonEmptyString(id)) {
    return jsonError(400, "Parâmetro obrigatório inválido: id.");
  }

  // Impedir exclusão de grupos fixos
  const { data: currentGroup, error: currentGroupError } = await authCheck.supabase
    .from("category_groups")
    .select("id, name")
    .eq("id", id.trim())
    .maybeSingle<{ id: string; name: string }>();

  if (currentGroupError) {
    return jsonError(500, "Erro ao consultar o grupo.", currentGroupError.message);
  }

  if (!currentGroup) {
    return jsonError(404, "Grupo não encontrado.");
  }

  if (isFixedGroupName(currentGroup.name)) {
    return jsonError(403, "Não é permitido excluir este grupo fixo.");
  }

  // Bloquear exclusão se existir categoria no grupo
  const { count, error: countError } = await authCheck.supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("group_id", id.trim());

  if (countError) {
    return jsonError(500, "Erro ao validar categorias do grupo.", countError.message);
  }

  if ((count ?? 0) > 0) {
    return jsonError(
      409,
      "Não é possível excluir o grupo: existem categorias vinculadas a ele.",
    );
  }

  const { error } = await authCheck.supabase
    .from("category_groups")
    .delete()
    .eq("id", id.trim());

  if (error) {
    return jsonError(500, "Não foi possível excluir o grupo.", error.message);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
