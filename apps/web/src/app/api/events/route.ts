import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: message, details: details ?? null }, { status });
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const { searchParams } = new URL(req.url);
  const limitRaw = searchParams.get("limit");
  const limit =
    typeof limitRaw === "string" && limitRaw.trim() && !Number.isNaN(Number(limitRaw))
      ? Math.min(Math.max(Number(limitRaw), 1), 50)
      : 20;

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, banner_url, location_name, location_address, starts_at, ends_at, is_active, created_at",
    )
    .eq("is_active", true)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    return jsonError(500, "Não foi possível listar eventos.", error.message);
  }

  return NextResponse.json(data ?? [], { status: 200 });
}
