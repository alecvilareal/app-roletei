import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";

type EventRow = {
  id: string;
  title: string;
  banner_url: string | null;
  place_id: string | null;
  location_name: string | null;
  location_address: string | null;
  starts_at: string;
  ends_at: string | null;
  price_mode: "free" | "paid" | "custom" | string | null;

  free_access_type: "none" | "list" | "ticket" | string | null;
  free_access_link: string | null;

  paid_type: "couvert" | "ticket" | "entry" | string | null;
  is_couvert_optional: boolean | null;
  paid_by_gender: boolean | null;
  paid_value_cents: number | null;
  paid_female_value_cents: number | null;
  paid_male_value_cents: number | null;
  paid_link: string | null;

  custom_mode_type: "entry" | "ticket" | string | null;
  custom_until_time: string | null;
  custom_until_kind: "free" | "value" | string | null;
  custom_until_by_gender: boolean | null;
  custom_until_value_cents: number | null;
  custom_until_female_value_cents: number | null;
  custom_until_male_value_cents: number | null;
  custom_after_by_gender: boolean | null;
  custom_after_value_cents: number | null;
  custom_after_female_value_cents: number | null;
  custom_after_male_value_cents: number | null;
  custom_link: string | null;

  event_music_styles?: Array<{
    category: { id: string; name: string } | null;
  }>;
};

type PlaceRow = {
  id: string;
  name: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
};

function formatDateTimeBR(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const formatted = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTimeBR(time: string | null | undefined) {
  if (!time) return "";
  const [hh, mm] = time.split(":");
  if (!hh || !mm) return time;
  return `${hh}:${mm}`;
}

function formatTimeBRCompact(time: string | null | undefined) {
  if (!time) return "";
  const [hh, mm] = time.split(":");
  if (!hh || !mm) return time;

  if (mm === "00") {
    return `${hh}h`;
  }

  return `${hh}h${mm}`;
}

function formatCurrencyBRL(cents: number | null | undefined) {
  if (typeof cents !== "number" || !Number.isFinite(cents)) return "";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function joinParts(parts: Array<string | null | undefined>, separator = " • ") {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(separator);
}

function formatCepBR(cep: string | null | undefined) {
  if (!cep) return "";
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return cep.trim();
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function priceLabelForFree(ev: EventRow) {
  const label =
    ev.free_access_type === "list"
      ? "Nome na lista"
      : ev.free_access_type === "ticket"
        ? "Retirar ingresso"
        : "Entrada gratuita";

  return {
    label,
    detail: ev.free_access_link ? "Acesso via link disponível." : "Sem cobrança de entrada.",
  };
}

function priceLabelForPaid(ev: EventRow) {
  const typeLabel =
    ev.paid_type === "couvert"
      ? "Couvert"
      : ev.paid_type === "ticket"
        ? "Ingresso"
        : ev.paid_type === "entry"
          ? "Entrada"
          : "Valor";

  if (ev.paid_by_gender) {
    return {
      label: typeLabel,
      detail: joinParts([
        ev.paid_female_value_cents ? `Feminino: ${formatCurrencyBRL(ev.paid_female_value_cents)}` : null,
        ev.paid_male_value_cents ? `Masculino: ${formatCurrencyBRL(ev.paid_male_value_cents)}` : null,
      ]),
    };
  }

  const value = formatCurrencyBRL(ev.paid_value_cents);

  if (!value) {
    return {
      label: typeLabel,
      detail: "Valor não informado.",
    };
  }

  return {
    label: typeLabel,
    detail: ev.paid_type === "couvert" ? value : `A partir de ${value}`,
  };
}

function priceLabelForCustom(ev: EventRow) {
  const modeLabel =
    ev.custom_mode_type === "ticket"
      ? "Ingresso"
      : ev.custom_mode_type === "entry"
        ? "Entrada"
        : "Personalizado";

  const untilTime = formatTimeBRCompact(ev.custom_until_time);
  const untilLabel =
    ev.custom_until_kind === "free"
      ? "Gratuito"
      : ev.custom_until_by_gender
        ? joinParts([
            ev.custom_until_female_value_cents
              ? `Feminino: ${formatCurrencyBRL(ev.custom_until_female_value_cents).replace("R$ ", "R$")}`
              : null,
            ev.custom_until_male_value_cents
              ? `Masculino: ${formatCurrencyBRL(ev.custom_until_male_value_cents).replace("R$ ", "R$")}`
              : null,
          ], " / ")
        : formatCurrencyBRL(ev.custom_until_value_cents).replace("R$ ", "R$");

  const afterTime = formatTimeBRCompact(ev.custom_until_time);
  const afterLabel = ev.custom_after_by_gender
    ? joinParts([
        ev.custom_after_female_value_cents
          ? `Feminino: ${formatCurrencyBRL(ev.custom_after_female_value_cents).replace("R$ ", "R$")}`
          : null,
        ev.custom_after_male_value_cents
          ? `Masculino: ${formatCurrencyBRL(ev.custom_after_male_value_cents).replace("R$ ", "R$")}`
          : null,
      ], " / ")
    : formatCurrencyBRL(ev.custom_after_value_cents).replace("R$ ", "R$");

  return {
    label: modeLabel,
    detail: [
      untilTime ? `Até às ${untilTime}: ${untilLabel}` : untilLabel,
      afterLabel ? `Após às ${afterTime}: ${afterLabel}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

function getPriceSummary(ev: EventRow) {
  const mode = ev.price_mode ?? "free";

  if (mode === "paid") return priceLabelForPaid(ev);
  if (mode === "custom") return priceLabelForCustom(ev);
  return priceLabelForFree(ev);
}

function resolveMusicTags(ev: EventRow) {
  const tags = (ev.event_music_styles ?? [])
    .map((item) => normalizeText(item.category?.name))
    .filter(Boolean);

  return Array.from(new Set(tags));
}

function formatPlaceAddress(place: PlaceRow | null, fallback: string | null) {
  if (place) {
    return joinParts(
      [
        joinParts([place.logradouro, place.numero ? `nº ${place.numero}` : null, place.complemento], ", "),
        joinParts([place.bairro, joinParts([place.cidade, place.uf], "/")], " - "),
        place.cep ? `CEP ${formatCepBR(place.cep)}` : null,
      ],
      ", ",
    );
  }

  return fallback?.trim() || "";
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      [
        "id",
        "title",
        "banner_url",
        "place_id",
        "location_name",
        "location_address",
        "starts_at",
        "ends_at",
        "price_mode",
        "free_access_type",
        "free_access_link",
        "paid_type",
        "is_couvert_optional",
        "paid_by_gender",
        "paid_value_cents",
        "paid_female_value_cents",
        "paid_male_value_cents",
        "paid_link",
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
        "custom_link",
        "event_music_styles(category:categories(id,name))",
      ].join(","),
    )
    .eq("id", id)
    .maybeSingle<EventRow>();

  if (error || !event) {
    notFound();
  }

  let place: PlaceRow | null = null;

  if (event.place_id) {
    const { data: placeData } = await supabase
      .from("places")
      .select("id,name,cep,logradouro,numero,complemento,bairro,cidade,uf")
      .eq("id", event.place_id)
      .maybeSingle<PlaceRow>();

    place = placeData ?? null;
  }

  const tags = resolveMusicTags(event);
  const startLabel = formatDateTimeBR(event.starts_at);
  const endLabel = formatDateTimeBR(event.ends_at);
  const priceSummary = getPriceSummary(event);
  const locationLabel = place?.name ?? event.location_name ?? "Local do evento";
  const locationAddressLine = formatPlaceAddress(place, event.location_address);
  const locationMapQuery = locationAddressLine || locationLabel || event.title;

  return (
    <main className="min-h-dvh bg-slate-50">
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Button asChild variant="outline" size="sm" className="w-fit rounded-full">
          <Link href="/">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {event.title}
          </h1>

          {tags.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full border-[#F58318]/20 bg-[#F58318]/10 px-3 py-1 text-[#F58318]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            {startLabel}
            {endLabel ? ` • até ${endLabel}` : ""}
          </p>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-sm font-medium text-slate-500">Valor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">{priceSummary.label}</div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{priceSummary.detail}</p>
              </div>

              {event.price_mode === "paid" ? (
                <div className="grid gap-3">
                  {event.is_couvert_optional ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Couvert opcional.
                    </div>
                  ) : null}

                  {event.paid_link ? (
                    <Button asChild variant="outline" className="w-full justify-center">
                      <a href={event.paid_link} target="_blank" rel="noreferrer">
                        Abrir link de compra
                      </a>
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {event.price_mode === "free" && event.free_access_link ? (
                <Button asChild variant="outline" className="w-full justify-center">
                  <a href={event.free_access_link} target="_blank" rel="noreferrer">
                    Abrir link de acesso
                  </a>
                </Button>
              ) : null}

              {event.price_mode === "custom" && event.custom_link ? (
                <Button asChild variant="outline" className="w-full justify-center">
                  <a href={event.custom_link} target="_blank" rel="noreferrer">
                    Abrir link de acesso
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-sm font-medium text-slate-500">Local</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="text-lg font-semibold text-slate-900">{locationLabel}</div>

              {locationAddressLine ? (
                <div className="leading-6 text-slate-600">{locationAddressLine}</div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-medium text-slate-500">Mapa</h2>
          </div>
          <div className="h-[400px] w-full">
            <iframe
              title={`Mapa do evento ${event.title}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(locationMapQuery)}&output=embed`}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
