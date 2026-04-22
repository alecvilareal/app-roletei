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
      [
        "id",
        "title",
        "banner_url",
        "location_name",
        "location_address",
        "starts_at",
        "ends_at",
        "is_active",
        "created_at",
        // valor/preço
        "price_mode",
        "free_access_type",
        "paid_type",
        "is_couvert_optional",
        "paid_by_gender",
        "paid_value_cents",
        "paid_female_value_cents",
        "paid_male_value_cents",
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
        // estilos musicais (N:N)
        "event_music_styles(category:categories(name))",
      ].join(", "),
    )
    .eq("is_active", true)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    return jsonError(500, "Não foi possível listar eventos.", error.message);
  }

  return NextResponse.json(data ?? [], { status: 200 });
}
