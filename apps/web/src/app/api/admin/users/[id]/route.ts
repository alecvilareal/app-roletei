import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, details: details ?? null },
    { status },
  );
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Variável NEXT_PUBLIC_SUPABASE_URL não configurada.");
  }
  if (!serviceRoleKey) {
    throw new Error("Variável SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  return createSupabaseAdminClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function assertAdminRole(): Promise<
  | { ok: true }
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
    return {
      ok: false,
      response: jsonError(401, "Usuário não autenticado."),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle<{ id: string; role: string }>();

  if (profileError) {
    return {
      ok: false,
      response: jsonError(
        500,
        "Erro ao consultar o perfil do usuário.",
        profileError.message,
      ),
    };
  }

  if (!profile || profile.role !== "cao_chupando_manga") {
    return {
      ok: false,
      response: jsonError(
        403,
        "Acesso negado: você não tem permissão para administrar usuários.",
      ),
    };
  }

  return { ok: true };
}

type PatchBody = {
  full_name?: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { id } = await ctx.params;

  if (!id || typeof id !== "string") {
    return jsonError(400, "Parâmetro inválido: id.");
  }

  let body: PatchBody | null = null;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return jsonError(400, "JSON inválido no corpo da requisição.");
  }

  const { full_name } = body ?? ({} as PatchBody);

  if (!isNonEmptyString(full_name)) {
    return jsonError(400, "Campo obrigatório inválido: full_name.");
  }

  let supabaseAdmin: ReturnType<typeof createAdminClient>;
  try {
    supabaseAdmin = createAdminClient();
  } catch (e) {
    return jsonError(500, "Erro de configuração do Supabase Admin.", {
      message: e instanceof Error ? e.message : String(e),
    });
  }

  const { data: updatedProfile, error } = await supabaseAdmin
    .from("profiles")
    .update({ full_name: full_name.trim() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return jsonError(500, "Não foi possível atualizar o perfil.", error.message);
  }

  if (!updatedProfile) {
    return jsonError(404, "Perfil não encontrado para o usuário informado.");
  }

  return NextResponse.json(updatedProfile, { status: 200 });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { id } = await ctx.params;

  if (!id || typeof id !== "string") {
    return jsonError(400, "Parâmetro inválido: id.");
  }

  let supabaseAdmin: ReturnType<typeof createAdminClient>;
  try {
    supabaseAdmin = createAdminClient();
  } catch (e) {
    return jsonError(500, "Erro de configuração do Supabase Admin.", {
      message: e instanceof Error ? e.message : String(e),
    });
  }

  // Observação: profiles tem FK com ON DELETE CASCADE para auth.users(id),
  // então basta deletar o usuário no Auth.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    return jsonError(
      400,
      "Não foi possível excluir o usuário.",
      error.message,
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
