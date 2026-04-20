import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isEmailAlreadyExistsError(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("already registered") ||
    m.includes("already exists") ||
    m.includes("email") && m.includes("exists") ||
    m.includes("email") && m.includes("registered")
  );
}

type CreationMode = "password" | "invite";

type PostBody = {
  full_name: string;
  email: string;
  creation_mode: CreationMode;
  password?: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: "cao_chupando_manga";
  created_at: string;
  updated_at: string;
};

type CombinedUser = {
  id: string;
  full_name: string | null;
  role: "cao_chupando_manga";
  email: string | null;
  created_at: string;
  email_confirmed_at: string | null;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

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

  return { ok: true, supabase };
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

  const { full_name, email, creation_mode, password } = body ?? ({} as PostBody);

  if (!isNonEmptyString(full_name)) {
    return jsonError(400, "Campo obrigatório inválido: full_name.");
  }
  if (!isNonEmptyString(email)) {
    return jsonError(400, "Campo obrigatório inválido: email.");
  }
  if (creation_mode !== "password" && creation_mode !== "invite") {
    return jsonError(
      400,
      "Campo obrigatório inválido: creation_mode (use 'password' ou 'invite').",
    );
  }
  if (creation_mode === "password" && !isNonEmptyString(password)) {
    return jsonError(
      400,
      "Campo obrigatório inválido: password (obrigatório quando creation_mode = 'password').",
    );
  }

  let supabaseAdmin: ReturnType<typeof createAdminClient>;
  try {
    supabaseAdmin = createAdminClient();
  } catch (e) {
    return jsonError(500, "Erro de configuração do Supabase Admin.", {
      message: e instanceof Error ? e.message : String(e),
    });
  }

  try {
    // 4/5) Criar usuário no auth (service role)
    const createUserResult =
      creation_mode === "password"
        ? await supabaseAdmin.auth.admin.createUser({
            email,
            password: password!,
            email_confirm: true,
            user_metadata: { full_name },
          })
        : await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { full_name },
          });

    let newUserId = createUserResult.data.user?.id ?? null;
    let createdNow = true;

    if (createUserResult.error) {
      // Idempotência: se o e-mail já existir, tratar como "usuário já existe"
      if (isEmailAlreadyExistsError(createUserResult.error.message)) {
        createdNow = false;

        const { data: authUsersData, error: authUsersError } =
          await supabaseAdmin.auth.admin.listUsers();

        if (authUsersError) {
          return jsonError(
            500,
            "Não foi possível validar o usuário existente no Supabase Auth.",
            authUsersError.message,
          );
        }

        const existing = (authUsersData.users ?? []).find(
          (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
        );

        if (!existing?.id) {
          return jsonError(
            500,
            "O Supabase informou que o e-mail já existe, mas não foi possível localizar o usuário.",
          );
        }

        newUserId = existing.id;
      } else {
        return jsonError(
          400,
          "Não foi possível criar o usuário no Supabase Auth.",
          createUserResult.error.message,
        );
      }
    }

    if (!newUserId) {
      return jsonError(
        500,
        "Usuário criado/existente, mas não foi possível obter o ID do usuário no Supabase.",
      );
    }

    // 6) Garantir perfil (service role) - idempotente via upsert
    const { data: createdProfile, error: profileUpsertError } =
      await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: newUserId,
            full_name,
            role: "cao_chupando_manga",
          },
          { onConflict: "id" },
        )
        .select("*")
        .single<ProfileRow>();

    if (profileUpsertError) {
      return jsonError(
        500,
        "Usuário criado/existente, mas não foi possível garantir o perfil em profiles.",
        profileUpsertError.message,
      );
    }

    // 7) Retornar perfil final (201 se criou auth agora, 200 se já existia)
    return NextResponse.json(createdProfile, { status: createdNow ? 201 : 200 });
  } catch (e) {
    return jsonError(500, "Erro inesperado ao criar usuário.", {
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

export async function GET() {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  let supabaseAdmin: ReturnType<typeof createAdminClient>;
  try {
    supabaseAdmin = createAdminClient();
  } catch (e) {
    return jsonError(500, "Erro de configuração do Supabase Admin.", {
      message: e instanceof Error ? e.message : String(e),
    });
  }

  // 2) Buscar todos os profiles
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, role, created_at, updated_at")
    .returns<ProfileRow[]>();

  if (profilesError) {
    return jsonError(
      500,
      "Erro ao listar perfis (profiles).",
      profilesError.message,
    );
  }

  // 3) Buscar usuários do auth para obter email
  const { data: authUsersData, error: authUsersError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (authUsersError) {
    return jsonError(
      500,
      "Erro ao listar usuários do Supabase Auth.",
      authUsersError.message,
    );
  }

  const authUsersById = new Map<
    string,
    { email: string | null; email_confirmed_at: string | null }
  >(
    (authUsersData.users ?? []).map((u) => [
      u.id,
      {
        email: u.email ?? null,
        email_confirmed_at: u.email_confirmed_at ?? null,
      },
    ]),
  );

  // 4) Combinar e retornar
  const combined: CombinedUser[] = (profiles ?? []).map((p) => {
    const authInfo = authUsersById.get(p.id) ?? {
      email: null,
      email_confirmed_at: null,
    };

    return {
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      email: authInfo.email,
      created_at: p.created_at,
      email_confirmed_at: authInfo.email_confirmed_at,
    };
  });

  return NextResponse.json(combined, { status: 200 });
}
