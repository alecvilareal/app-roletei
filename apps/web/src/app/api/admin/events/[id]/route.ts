import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

  return NextResponse.json({ ok: true }, { status: 200 });
}
