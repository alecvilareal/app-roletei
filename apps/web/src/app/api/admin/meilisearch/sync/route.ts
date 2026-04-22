import { NextResponse } from "next/server";

import { meilisearchAdmin } from "@/lib/meilisearch";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EventRow = {
  id: string;
  title: string | null;
};

export async function GET() {
  const supabase = await createClient();

  // Busca apenas os campos necessários para indexação.
  const { data: events, error } = await supabase
    .from("events")
    .select("id,title");

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
    }));

  // Seleciona (e cria automaticamente se não existir) o índice "events".
  const index = meilisearchAdmin.index("events");

  // Envia documentos para o Meilisearch
  const task = await index.addDocuments(documents);

  return NextResponse.json({
    ok: true,
    sent: documents.length,
    task,
  });
}
