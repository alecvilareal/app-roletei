import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type PlaceRow = {
  id: string;
  created_at: string;
  name: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
};

type PostBody = {
  name: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  uf: string;
};

type PatchBody = Partial<PostBody>;

function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details: details ?? null }, { status });
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function normalizeCep(value: string) {
  return value.replace(/\D/g, "");
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
      response: jsonError(403, "Acesso negado: você não tem permissão para administrar locais."),
    };
  }

  return { ok: true, supabase };
}

export async function GET() {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const { data, error } = await authCheck.supabase
    .from("places")
    .select("id, created_at, name, cep, logradouro, numero, complemento, bairro, cidade, uf")
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError(500, "Não foi possível listar os locais.", error.message);
  }

  return NextResponse.json((data ?? []) as PlaceRow[], { status: 200 });
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
    name,
    cep,
    logradouro,
    numero,
    complemento = null,
    bairro,
    cidade,
    uf,
  } = body ?? ({} as PostBody);

  if (!isNonEmptyString(name)) return jsonError(400, "Campo obrigatório inválido: name.");
  if (!isNonEmptyString(cep)) return jsonError(400, "Campo obrigatório inválido: cep.");
  if (!isNonEmptyString(logradouro)) return jsonError(400, "Campo obrigatório inválido: logradouro.");
  if (!isNonEmptyString(numero)) return jsonError(400, "Campo obrigatório inválido: numero.");
  if (!isNonEmptyString(bairro)) return jsonError(400, "Campo obrigatório inválido: bairro.");
  if (!isNonEmptyString(cidade)) return jsonError(400, "Campo obrigatório inválido: cidade.");
  if (!isNonEmptyString(uf)) return jsonError(400, "Campo obrigatório inválido: uf.");

  const cepDigits = normalizeCep(cep);
  if (cepDigits.length !== 8) {
    return jsonError(400, "CEP inválido: informe 8 dígitos.");
  }

  const payload = {
    name: name.trim(),
    cep: cepDigits,
    logradouro: logradouro.trim(),
    numero: numero.trim(),
    complemento: isNonEmptyString(complemento) ? complemento.trim() : null,
    bairro: bairro.trim(),
    cidade: cidade.trim(),
    uf: uf.trim().toUpperCase(),
  };

  const { data, error } = await authCheck.supabase
    .from("places")
    .insert(payload)
    .select("id, created_at, name, cep, logradouro, numero, complemento, bairro, cidade, uf")
    .single();

  if (error) {
    return jsonError(500, "Não foi possível cadastrar o local.", error.message);
  }

  return NextResponse.json(data as PlaceRow, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!isNonEmptyString(id)) {
    return jsonError(400, "Informe o id do local a ser editado.");
  }

  let body: PatchBody | null = null;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return jsonError(400, "JSON inválido no corpo da requisição.");
  }

  const next: Partial<PostBody> = {};
  if (typeof body?.name === "string") next.name = body.name;
  if (typeof body?.cep === "string") next.cep = body.cep;
  if (typeof body?.logradouro === "string") next.logradouro = body.logradouro;
  if (typeof body?.numero === "string") next.numero = body.numero;
  if (typeof body?.complemento === "string" || body?.complemento === null) {
    next.complemento = body.complemento;
  }
  if (typeof body?.bairro === "string") next.bairro = body.bairro;
  if (typeof body?.cidade === "string") next.cidade = body.cidade;
  if (typeof body?.uf === "string") next.uf = body.uf;

  if (Object.keys(next).length === 0) {
    return jsonError(400, "Nenhum campo válido foi enviado para atualização.");
  }

  const payload: Partial<PostBody> & { cep?: string; uf?: string } = {};

  if (typeof next.name === "string") {
    if (!isNonEmptyString(next.name)) return jsonError(400, "Campo inválido: name.");
    payload.name = next.name.trim();
  }

  if (typeof next.cep === "string") {
    if (!isNonEmptyString(next.cep)) return jsonError(400, "Campo inválido: cep.");
    const cepDigits = normalizeCep(next.cep);
    if (cepDigits.length !== 8) return jsonError(400, "CEP inválido: informe 8 dígitos.");
    payload.cep = cepDigits;
  }

  if (typeof next.logradouro === "string") {
    if (!isNonEmptyString(next.logradouro)) return jsonError(400, "Campo inválido: logradouro.");
    payload.logradouro = next.logradouro.trim();
  }

  if (typeof next.numero === "string") {
    if (!isNonEmptyString(next.numero)) return jsonError(400, "Campo inválido: numero.");
    payload.numero = next.numero.trim();
  }

  if (typeof next.complemento === "string") {
    payload.complemento = isNonEmptyString(next.complemento) ? next.complemento.trim() : null;
  } else if (next.complemento === null) {
    payload.complemento = null;
  }

  if (typeof next.bairro === "string") {
    if (!isNonEmptyString(next.bairro)) return jsonError(400, "Campo inválido: bairro.");
    payload.bairro = next.bairro.trim();
  }

  if (typeof next.cidade === "string") {
    if (!isNonEmptyString(next.cidade)) return jsonError(400, "Campo inválido: cidade.");
    payload.cidade = next.cidade.trim();
  }

  if (typeof next.uf === "string") {
    if (!isNonEmptyString(next.uf)) return jsonError(400, "Campo inválido: uf.");
    payload.uf = next.uf.trim().toUpperCase();
  }

  const { data, error } = await authCheck.supabase
    .from("places")
    .update(payload)
    .eq("id", id)
    .select("id, created_at, name, cep, logradouro, numero, complemento, bairro, cidade, uf")
    .maybeSingle();

  if (error) {
    return jsonError(500, "Não foi possível editar o local.", error.message);
  }

  if (!data) {
    return jsonError(404, "Local não encontrado.");
  }

  return NextResponse.json(data as PlaceRow, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const authCheck = await assertAdminRole();
  if (!authCheck.ok) return authCheck.response;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!isNonEmptyString(id)) {
    return jsonError(400, "Informe o id do local a ser excluído.");
  }

  const { error } = await authCheck.supabase.from("places").delete().eq("id", id);

  if (error) {
    return jsonError(500, "Não foi possível excluir o local.", error.message);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
