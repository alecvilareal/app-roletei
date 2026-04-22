"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PlaceOption = {
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

type MusicStyleOption = { id: string; name: string };

type CreateEventPayload = {
  title: string;

  banner_url?: string | null;

  place_id?: string | null;

  // fallback/manual (quando place_id não é enviado)
  location_name?: string;
  location_address?: string;

  // categorias (public.categories) do group "Estilo Musical"
  music_style_category_ids?: string[];

  starts_at: string; // ISO
  ends_at: string; // ISO

  // valor/preço
  price_mode: "free" | "paid" | "custom";

  // free
  free_access_type?: "none" | "list" | "ticket";
  free_access_link?: string | null;

  // paid
  paid_type?: "couvert" | "ticket" | "entry";
  is_couvert_optional?: boolean;
  paid_by_gender?: boolean;
  paid_value_cents?: number | null;
  paid_female_value_cents?: number | null;
  paid_male_value_cents?: number | null;
  paid_link?: string | null;

  // custom
  custom_mode_type?: "entry" | "ticket";
  custom_until_time?: string | null; // "HH:MM"
  custom_until_kind?: "free" | "value";
  custom_until_by_gender?: boolean;
  custom_until_value_cents?: number | null;
  custom_until_female_value_cents?: number | null;
  custom_until_male_value_cents?: number | null;
  custom_after_by_gender?: boolean;
  custom_after_value_cents?: number | null;
  custom_after_female_value_cents?: number | null;
  custom_after_male_value_cents?: number | null;
  custom_link?: string | null;
};

function addMinutesToIso(iso: string, minutes: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

function formatCurrencyBRLFromDigits(digits: string) {
  const onlyDigits = digits.replace(/\D/g, "");
  const value = Number(onlyDigits || "0") / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function currencyDigitsFromInput(raw: string) {
  return raw.replace(/\D/g, "");
}

async function fetchAddressByCep(rawCep: string) {
  const cepDigits = rawCep.replace(/\D/g, "");
  if (cepDigits.length !== 8) throw new Error("CEP inválido. Use 8 dígitos (ex: 01001000).");

  const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, { method: "GET" });
  if (!res.ok) throw new Error("Não foi possível consultar o CEP.");

  const data = (await res.json()) as {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };

  if (data?.erro) throw new Error("CEP não encontrado.");

  return {
    street: (data.logradouro ?? "").trim(),
    neighborhood: (data.bairro ?? "").trim(),
    city: (data.localidade ?? "").trim(),
    state: (data.uf ?? "").trim(),
  };
}

export default function AdminCadastrosRolesEEventosNovoPage() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [bannerUrl, setBannerUrl] = React.useState("");

  const [musicStyles, setMusicStyles] = React.useState<MusicStyleOption[]>([]);
  const [selectedMusicStyleIds, setSelectedMusicStyleIds] = React.useState<string[]>([]);
  const [musicStylesError, setMusicStylesError] = React.useState<string | null>(null);

  const [startDate, setStartDate] = React.useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [startTime, setStartTime] = React.useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const [hasEndDateTime, setHasEndDateTime] = React.useState(false);
  const [endDate, setEndDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [endTime, setEndTime] = React.useState("00:00");

  const [places, setPlaces] = React.useState<PlaceOption[]>([]);
  const [placeMode, setPlaceMode] = React.useState<"existing" | "new">("existing");
  const [selectedPlaceId, setSelectedPlaceId] = React.useState<string>("");

  const [locationName, setLocationName] = React.useState("");
  const [cep, setCep] = React.useState("");

  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");

  const [isFetchingCep, setIsFetchingCep] = React.useState(false);
  const [cepError, setCepError] = React.useState<string | null>(null);

  const [priceMode, setPriceMode] = React.useState<"paid" | "free" | "custom">("free");

  const [freeAccessType, setFreeAccessType] = React.useState<"none" | "list" | "ticket">("none");
  const [freeAccessLink, setFreeAccessLink] = React.useState("");

  const [paidType, setPaidType] = React.useState<"couvert" | "ticket" | "entry">("couvert");
  const [paidByGender, setPaidByGender] = React.useState(false);
  const [isCouvertOptional, setIsCouvertOptional] = React.useState(false);

  const [paidValue, setPaidValue] = React.useState("");
  const [paidFemaleValue, setPaidFemaleValue] = React.useState("");
  const [paidMaleValue, setPaidMaleValue] = React.useState("");
  const [paidLink, setPaidLink] = React.useState("");

  const [customModeType, setCustomModeType] = React.useState<"entry" | "ticket">("entry");

  const [customUntilTime, setCustomUntilTime] = React.useState("00:00");
  const [customUntilKind, setCustomUntilKind] = React.useState<"free" | "value">("free");
  const [customUntilByGender, setCustomUntilByGender] = React.useState(false);
  const [customUntilValue, setCustomUntilValue] = React.useState("");
  const [customUntilFemaleValue, setCustomUntilFemaleValue] = React.useState("");
  const [customUntilMaleValue, setCustomUntilMaleValue] = React.useState("");

  const [customAfterByGender, setCustomAfterByGender] = React.useState(false);
  const [customAfterValue, setCustomAfterValue] = React.useState("");
  const [customAfterFemaleValue, setCustomAfterFemaleValue] = React.useState("");
  const [customAfterMaleValue, setCustomAfterMaleValue] = React.useState("");

  const [customModeLink, setCustomModeLink] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  async function loadMusicStyles() {
    setMusicStylesError(null);
    try {
      const [groupsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/category-groups", { method: "GET" }),
        fetch("/api/admin/categories", { method: "GET" }),
      ]);

      if (!groupsRes.ok || !categoriesRes.ok) return;

      const groups = (await groupsRes.json()) as { id: string; name: string }[];
      const categories = (await categoriesRes.json()) as {
        id: string;
        group_id: string;
        name: string;
      }[];

      const group = groups.find((g) => g.name.trim() === "Estilo Musical");
      if (!group) return;

      const options = categories
        .filter((c) => c.group_id === group.id)
        .map((c) => ({ id: c.id, name: c.name }))
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      setMusicStyles(options);
    } catch (err) {
      setMusicStylesError(
        err instanceof Error ? err.message : "Não foi possível carregar estilos musicais.",
      );
    }
  }

  async function loadPlaces() {
    try {
      const res = await fetch("/api/admin/places", { method: "GET" });
      if (!res.ok) return;

      const data = (await res.json()) as PlaceOption[];
      const next = Array.isArray(data) ? data : [];
      setPlaces(next);

      if (!selectedPlaceId && next.length > 0) {
        setSelectedPlaceId(next[0].id);
      }
    } catch {
      // silencioso
    }
  }

  async function createPlaceFromForm() {
    const cepDigits = cep.replace(/\D/g, "");

    const payload = {
      name: locationName.trim(),
      cep: cepDigits,
      logradouro: street.trim(),
      numero: number.trim(),
      complemento: null as string | null,
      bairro: neighborhood.trim(),
      cidade: city.trim(),
      uf: state.trim().toUpperCase(),
    };

    const res = await fetch("/api/admin/places", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const details = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(details?.error ?? "Não foi possível cadastrar a localização.");
    }

    const created = (await res.json()) as PlaceOption;
    setPlaces((prev) => [created, ...prev]);
    setSelectedPlaceId(created.id);
    setPlaceMode("existing");
    return created;
  }

  React.useEffect(() => {
    void loadMusicStyles();
    void loadPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) return setSubmitError("Informe o título.");
    if (!startDate.trim()) return setSubmitError("Informe a data de início.");
    if (!startTime.trim()) return setSubmitError("Informe a hora de início.");

    // opcionais: banner_url, estilo musical e data/hora de término (controlado por hasEndDateTime)

    if (hasEndDateTime) {
      if (!endDate.trim()) return setSubmitError("Informe a data de término.");
      if (!endTime.trim()) return setSubmitError("Informe a hora de término.");
    }

    if (placeMode === "existing") {
      if (!selectedPlaceId) return setSubmitError("Selecione uma localização cadastrada.");
    } else {
      if (!locationName.trim()) return setSubmitError("Informe o nome do local.");
      if (!street.trim()) return setSubmitError("Informe a rua/logradouro.");
      if (!number.trim()) return setSubmitError("Informe o número.");
      if (!neighborhood.trim()) return setSubmitError("Informe o bairro.");
      if (!city.trim()) return setSubmitError("Informe a cidade.");
      if (!state.trim()) return setSubmitError("Informe o estado.");
    }

    const startsAtIso = new Date(`${startDate}T${startTime}:00`).toISOString();

    const endsAtIso = hasEndDateTime
      ? new Date(`${endDate}T${endTime}:00`).toISOString()
      : addMinutesToIso(startsAtIso, 120);

    let placeIdToUse: string | null = null;

    if (placeMode === "existing") {
      placeIdToUse = selectedPlaceId;
    } else {
      const createdPlace = await createPlaceFromForm();
      placeIdToUse = createdPlace.id;
    }

    const paidValueCents = paidValue ? Number(paidValue) : 0;
    const paidFemaleValueCents = paidFemaleValue ? Number(paidFemaleValue) : 0;
    const paidMaleValueCents = paidMaleValue ? Number(paidMaleValue) : 0;

    const customUntilValueCents = customUntilValue ? Number(customUntilValue) : 0;
    const customUntilFemaleValueCents = customUntilFemaleValue ? Number(customUntilFemaleValue) : 0;
    const customUntilMaleValueCents = customUntilMaleValue ? Number(customUntilMaleValue) : 0;

    const customAfterValueCents = customAfterValue ? Number(customAfterValue) : 0;
    const customAfterFemaleValueCents = customAfterFemaleValue ? Number(customAfterFemaleValue) : 0;
    const customAfterMaleValueCents = customAfterMaleValue ? Number(customAfterMaleValue) : 0;

    const payload: CreateEventPayload = {
      title: title.trim(),
      banner_url: bannerUrl.trim() ? bannerUrl.trim() : null,
      place_id: placeIdToUse,
      music_style_category_ids: selectedMusicStyleIds,
      starts_at: startsAtIso,
      ends_at: endsAtIso,

      price_mode: priceMode,

      free_access_type: freeAccessType,
      free_access_link: freeAccessLink.trim() ? freeAccessLink.trim() : null,

      paid_type: paidType,
      is_couvert_optional: isCouvertOptional,
      paid_by_gender: paidByGender,
      paid_value_cents: paidValueCents ? paidValueCents : null,
      paid_female_value_cents: paidFemaleValueCents ? paidFemaleValueCents : null,
      paid_male_value_cents: paidMaleValueCents ? paidMaleValueCents : null,
      paid_link: paidLink.trim() ? paidLink.trim() : null,

      custom_mode_type: customModeType,
      custom_until_time: customUntilTime,
      custom_until_kind: customUntilKind,
      custom_until_by_gender: customUntilByGender,
      custom_until_value_cents: customUntilValueCents ? customUntilValueCents : null,
      custom_until_female_value_cents: customUntilFemaleValueCents ? customUntilFemaleValueCents : null,
      custom_until_male_value_cents: customUntilMaleValueCents ? customUntilMaleValueCents : null,
      custom_after_by_gender: customAfterByGender,
      custom_after_value_cents: customAfterValueCents ? customAfterValueCents : null,
      custom_after_female_value_cents: customAfterFemaleValueCents ? customAfterFemaleValueCents : null,
      custom_after_male_value_cents: customAfterMaleValueCents ? customAfterMaleValueCents : null,
      custom_link: customModeLink.trim() ? customModeLink.trim() : null,
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        const message = details?.error ?? "Não foi possível cadastrar o evento.";
        setSubmitError(message);
        return;
      }

      router.push("/admin/cadastros/roles-e-eventos");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? `Erro ao cadastrar evento: ${err.message}` : "Erro ao cadastrar evento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFetchCep() {
    setCepError(null);
    setIsFetchingCep(true);

    try {
      const address = await fetchAddressByCep(cep);
      setStreet(address.street);
      setNeighborhood(address.neighborhood);
      setCity(address.city);
      setState(address.state);
    } catch (err) {
      setCepError(err instanceof Error ? err.message : "Não foi possível buscar o CEP.");
    } finally {
      setIsFetchingCep(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-10 sm:px-6 md:px-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Cadastrar evento</h1>
            <p className="mt-1 text-sm text-slate-600">Preencha os dados para criar um novo evento.</p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/cadastros/roles-e-eventos")}
            className="w-full sm:w-auto"
          >
            Voltar
          </Button>
        </div>

        <form onSubmit={handleCreate} className="mt-8 grid gap-8">
          {/* 1º Card - Informações gerais */}
          <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60">
              <CardTitle className="text-base text-slate-900">Informações gerais</CardTitle>
              <CardDescription>Identificação do evento e banner de destaque.</CardDescription>
            </CardHeader>

              <div className="grid gap-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="font-medium text-slate-700">
                    Título
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Show da banda X"
                    className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="banner_url" className="font-medium text-slate-700">
                    URL do banner
                  </Label>
                  <Input
                    id="banner_url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://..."
                    className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="music_styles" className="font-medium text-slate-700">
                    Estilo musical
                  </Label>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    {musicStyles.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        (nenhum estilo musical cadastrado em Categorias e Tags)
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {musicStyles.map((opt) => {
                          const checked = selectedMusicStyleIds.includes(opt.id);
                          return (
                            <label
                              key={opt.id}
                              className={[
                                "cursor-pointer select-none rounded-full border px-3 py-1 text-sm transition-colors",
                                checked
                                  ? "border-[#F58318]/40 bg-[#F58318]/15 text-slate-900"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={checked}
                                onChange={(e) => {
                                  setSelectedMusicStyleIds((prev) => {
                                    if (e.target.checked) return Array.from(new Set([...prev, opt.id]));
                                    return prev.filter((id) => id !== opt.id);
                                  });
                                }}
                              />
                              {opt.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {musicStylesError ? (
                    <div className="text-xs text-red-700">{musicStylesError}</div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Você pode selecionar um ou mais estilos.
                    </div>
                  )}
                </div>
              </div>

              {bannerUrl.trim() ? (
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-700">Prévia do banner</div>
                    <div className="text-xs text-slate-500">Recomendado 16:6</div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                    <div className="aspect-[16/6] w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={bannerUrl}
                        alt="Prévia do banner"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    Dica: prefira uma imagem com boa iluminação e alta resolução.
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* 2º Card - Data e horário (Premium) */}
          <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60">
              <CardTitle className="text-base text-slate-900">Data e horário (Premium)</CardTitle>
              <CardDescription>Defina início e, se necessário, o término.</CardDescription>
            </CardHeader>

            <div className="grid gap-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="start_date" className="font-medium text-slate-700">
                    Data início
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="start_time" className="font-medium text-slate-700">
                    Hora início
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                  />
                </div>
              </div>

              <label
                htmlFor="has_end_datetime"
                className="group flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm transition-colors hover:bg-slate-50/80"
              >
                <div className="grid gap-1">
                  <div className="text-sm font-semibold text-slate-900">
                    Inserir data e hora do término
                  </div>
                  <div className="text-xs text-slate-600">
                    Se desmarcado, o término será igual ao início (pode ser ajustado depois).
                  </div>
                </div>

                <div className="pt-0.5">
                  <span
                    className={[
                      "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors",
                      hasEndDateTime
                        ? "border-[#F58318]/40 bg-[#F58318]/90"
                        : "border-slate-300 bg-white",
                    ].join(" ")}
                  >
                    <input
                      id="has_end_datetime"
                      type="checkbox"
                      className="sr-only"
                      checked={hasEndDateTime}
                      onChange={(e) => setHasEndDateTime(e.target.checked)}
                    />
                    <span
                      className={[
                        "pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
                        hasEndDateTime ? "translate-x-5" : "translate-x-0.5",
                      ].join(" ")}
                    />
                  </span>
                </div>
              </label>

              {hasEndDateTime ? (
                <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="end_date" className="font-medium text-slate-700">
                      Data término
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="end_time" className="font-medium text-slate-700">
                      Hora término
                    </Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          {/* 3º Card - Localização */}
          <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60">
              <CardTitle className="text-base text-slate-900">Localização</CardTitle>
              <CardDescription>Informe o local e o endereço do evento.</CardDescription>
            </CardHeader>

            <div className="grid gap-6 p-6">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-sm font-semibold text-slate-900">Tipo de localização</div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlaceMode("existing")}
                      className={[
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        placeMode === "existing"
                          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-600 hover:bg-white/60",
                      ].join(" ")}
                    >
                      Selecionar cadastrada
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlaceMode("new")}
                      className={[
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        placeMode === "new"
                          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-600 hover:bg-white/60",
                      ].join(" ")}
                    >
                      Inserir nova
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Você pode usar uma localização já cadastrada ou preencher uma nova manualmente.
                </div>
              </div>

              {placeMode === "existing" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="place_id" className="font-medium text-slate-700">
                      Localização cadastrada
                    </Label>
                    <select
                      id="place_id"
                      value={selectedPlaceId}
                      onChange={(e) => setSelectedPlaceId(e.target.value)}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
                    >
                      {places.length === 0 ? (
                        <option value="">(nenhuma localização cadastrada)</option>
                      ) : null}

                      {places.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.cidade}/{p.uf}
                        </option>
                      ))}
                    </select>

                    {selectedPlaceId ? (
                      <div className="text-xs text-slate-500">
                        {(() => {
                          const p = places.find((x) => x.id === selectedPlaceId);
                          if (!p) return null;
                          const address = [
                            p.logradouro,
                            `nº ${p.numero}`,
                            p.complemento ? p.complemento : null,
                            p.bairro,
                            `${p.cidade}/${p.uf}`,
                            p.cep,
                          ]
                            .filter(Boolean)
                            .join(" - ");
                          return <span>Endereço: {address}</span>;
                        })()}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="location_name" className="font-medium text-slate-700">
                        Nome do local
                      </Label>
                      <Input
                        id="location_name"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="Ex: Arena Roletei"
                        className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cep" className="font-medium text-slate-700">
                        CEP
                      </Label>

                      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                        <Input
                          id="cep"
                          value={cep}
                          onChange={(e) => setCep(e.target.value)}
                          placeholder="00000-000"
                          className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleFetchCep()}
                          disabled={isFetchingCep}
                          className="w-full border-slate-200 bg-white shadow-sm sm:w-auto"
                        >
                          {isFetchingCep ? "Buscando..." : "Buscar"}
                        </Button>
                      </div>

                      {cepError ? <div className="text-xs text-red-700">{cepError}</div> : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-6">
                    <div className="grid gap-2 md:col-span-4">
                      <Label htmlFor="street" className="font-medium text-slate-700">
                        Rua / Logradouro
                      </Label>
                      <Input
                        id="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Ex: Av. Paulista"
                        className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                      />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="number" className="font-medium text-slate-700">
                        Número
                      </Label>
                      <Input
                        id="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="Ex: 1000"
                        className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-6">
                    <div className="grid gap-2 md:col-span-3">
                      <Label htmlFor="neighborhood" className="font-medium text-slate-700">
                        Bairro
                      </Label>
                      <Input
                        id="neighborhood"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Ex: Bela Vista"
                        className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                      />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="city" className="font-medium text-slate-700">
                        Cidade
                      </Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ex: São Paulo"
                        className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                      />
                    </div>

                    <div className="grid gap-2 md:col-span-1">
                      <Label htmlFor="state" className="font-medium text-slate-700">
                        Estado (UF)
                      </Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Ex: SP"
                        className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* 4º Card - Valor */}
          <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/60">
              <CardTitle className="text-base text-slate-900">Valor</CardTitle>
              <CardDescription>Selecione se o evento é pago, grátis ou personalizado.</CardDescription>
            </CardHeader>

            <div className="grid gap-6 p-6">
              <div className="grid gap-2">
                <Label className="font-medium text-slate-700">Tipo</Label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPriceMode("free")}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      priceMode === "free"
                        ? "bg-[#F58318] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Grátis
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriceMode("paid")}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      priceMode === "paid"
                        ? "bg-[#F58318] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Pago
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriceMode("custom")}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      priceMode === "custom"
                        ? "bg-[#F58318] text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Personalizado
                  </button>
                </div>

                <div className="text-xs text-slate-500">
                  Este valor será salvo no evento.
                </div>
              </div>

              {priceMode === "free" ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="free_access_type" className="font-medium text-slate-700">
                      Tipo
                    </Label>
                    <select
                      id="free_access_type"
                      value={freeAccessType}
                      onChange={(e) => setFreeAccessType(e.target.value as "none" | "list" | "ticket")}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
                    >
                      <option value="list">Nome na Lista (OFF)</option>
                      <option value="ticket">Retirar Ingresso (OFF)</option>
                      <option value="none">Nada</option>
                    </select>
                  </div>

                  {freeAccessType === "list" || freeAccessType === "ticket" ? (
                    <div className="grid gap-2">
                      <Label htmlFor="free_access_link" className="font-medium text-slate-700">
                        Link (opcional)
                      </Label>
                      <Input
                        id="free_access_link"
                        value={freeAccessLink}
                        onChange={(e) => setFreeAccessLink(e.target.value)}
                        placeholder="https://..."
                        className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {priceMode === "paid" ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="paid_type" className="font-medium text-slate-700">
                      Tipo
                    </Label>
                    <select
                      id="paid_type"
                      value={paidType}
                      onChange={(e) => setPaidType(e.target.value as "couvert" | "ticket" | "entry")}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
                    >
                      <option value="couvert">Couvert</option>
                      <option value="ticket">Ingresso</option>
                      <option value="entry">Entrada</option>
                    </select>
                  </div>

                  {paidType === "couvert" ? (
                    <div className="grid gap-4">
                      <label
                        htmlFor="couvert_optional"
                        className="group flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm transition-colors hover:bg-slate-50/80"
                      >
                        <div className="grid gap-1">
                          <div className="text-sm font-semibold text-slate-900">Opcional</div>
                          <div className="text-xs text-slate-600">
                            Marque se o couvert pode ser opcional.
                          </div>
                        </div>

                        <div className="pt-0.5">
                          <span
                            className={[
                              "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors",
                              isCouvertOptional
                                ? "border-[#F58318]/40 bg-[#F58318]/90"
                                : "border-slate-300 bg-white",
                            ].join(" ")}
                          >
                            <input
                              id="couvert_optional"
                              type="checkbox"
                              className="sr-only"
                              checked={isCouvertOptional}
                              onChange={(e) => setIsCouvertOptional(e.target.checked)}
                            />
                            <span
                              className={[
                                "pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
                                isCouvertOptional ? "translate-x-5" : "translate-x-0.5",
                              ].join(" ")}
                            />
                          </span>
                        </div>
                      </label>

                      <div className="grid gap-2">
                        <Label htmlFor="paid_couvert_value" className="font-medium text-slate-700">
                          Valor
                        </Label>
                        <Input
                          id="paid_couvert_value"
                          value={formatCurrencyBRLFromDigits(paidValue)}
                          onChange={(e) => setPaidValue(currencyDigitsFromInput(e.target.value))}
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <label
                        htmlFor="paid_by_gender"
                        className="group flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm transition-colors hover:bg-slate-50/80"
                      >
                        <div className="grid gap-1">
                          <div className="text-sm font-semibold text-slate-900">Valores por SEXO</div>
                          <div className="text-xs text-slate-600">
                            Defina valores diferentes para feminino e masculino.
                          </div>
                        </div>

                        <div className="pt-0.5">
                          <span
                            className={[
                              "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors",
                              paidByGender
                                ? "border-[#F58318]/40 bg-[#F58318]/90"
                                : "border-slate-300 bg-white",
                            ].join(" ")}
                          >
                            <input
                              id="paid_by_gender"
                              type="checkbox"
                              className="sr-only"
                              checked={paidByGender}
                              onChange={(e) => setPaidByGender(e.target.checked)}
                            />
                            <span
                              className={[
                                "pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
                                paidByGender ? "translate-x-5" : "translate-x-0.5",
                              ].join(" ")}
                            />
                          </span>
                        </div>
                      </label>

                      {paidByGender ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="paid_value_female" className="font-medium text-slate-700">
                              Valor feminino
                            </Label>
                            <Input
                              id="paid_value_female"
                              value={formatCurrencyBRLFromDigits(paidFemaleValue)}
                              onChange={(e) => setPaidFemaleValue(currencyDigitsFromInput(e.target.value))}
                              inputMode="numeric"
                              placeholder="R$ 0,00"
                              className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="paid_value_male" className="font-medium text-slate-700">
                              Valor masculino
                            </Label>
                            <Input
                              id="paid_value_male"
                              value={formatCurrencyBRLFromDigits(paidMaleValue)}
                              onChange={(e) => setPaidMaleValue(currencyDigitsFromInput(e.target.value))}
                              inputMode="numeric"
                              placeholder="R$ 0,00"
                              className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          <Label htmlFor="paid_value" className="font-medium text-slate-700">
                            Valor
                          </Label>
                          <Input
                            id="paid_value"
                            value={formatCurrencyBRLFromDigits(paidValue)}
                            onChange={(e) => setPaidValue(currencyDigitsFromInput(e.target.value))}
                            inputMode="numeric"
                            placeholder="R$ 0,00"
                            className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                          />
                        </div>
                      )}

                      <div className="grid gap-2">
                        <Label htmlFor="paid_link" className="font-medium text-slate-700">
                          Link do ingresso (opcional)
                        </Label>
                        <Input
                          id="paid_link"
                          value={paidLink}
                          onChange={(e) => setPaidLink(e.target.value)}
                          placeholder="https://..."
                          className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {priceMode === "custom" ? (
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="custom_mode_type" className="font-medium text-slate-700">
                      Tipo
                    </Label>
                    <select
                      id="custom_mode_type"
                      value={customModeType}
                      onChange={(e) => setCustomModeType(e.target.value as "entry" | "ticket")}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
                    >
                      <option value="entry">Entrada</option>
                      <option value="ticket">Ingresso</option>
                    </select>
                  </div>

                  <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-900">Até</div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="custom_until_time" className="font-medium text-slate-700">
                          Horário
                        </Label>
                        <Input
                          id="custom_until_time"
                          type="time"
                          value={customUntilTime}
                          onChange={(e) => setCustomUntilTime(e.target.value)}
                          className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="custom_until_kind" className="font-medium text-slate-700">
                          Tipo
                        </Label>
                        <select
                          id="custom_until_kind"
                          value={customUntilKind}
                          onChange={(e) => setCustomUntilKind(e.target.value as "free" | "value")}
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
                        >
                          <option value="free">Grátis (OFF)</option>
                          <option value="value">Valor</option>
                        </select>
                      </div>
                    </div>

                    {customUntilKind === "value" ? (
                      <div className="grid gap-4">
                        <label
                          htmlFor="custom_until_by_gender"
                          className="group flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm transition-colors hover:bg-slate-50/80"
                        >
                          <div className="grid gap-1">
                            <div className="text-sm font-semibold text-slate-900">Valores por SEXO</div>
                            <div className="text-xs text-slate-600">
                              Defina valores diferentes para feminino e masculino.
                            </div>
                          </div>

                          <div className="pt-0.5">
                            <span
                              className={[
                                "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors",
                                customUntilByGender
                                  ? "border-[#F58318]/40 bg-[#F58318]/90"
                                  : "border-slate-300 bg-white",
                              ].join(" ")}
                            >
                              <input
                                id="custom_until_by_gender"
                                type="checkbox"
                                className="sr-only"
                                checked={customUntilByGender}
                                onChange={(e) => setCustomUntilByGender(e.target.checked)}
                              />
                              <span
                                className={[
                                  "pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
                                  customUntilByGender ? "translate-x-5" : "translate-x-0.5",
                                ].join(" ")}
                              />
                            </span>
                          </div>
                        </label>

                        {customUntilByGender ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label
                                htmlFor="custom_until_value_female"
                                className="font-medium text-slate-700"
                              >
                                Valor feminino
                              </Label>
                              <Input
                                id="custom_until_value_female"
                                value={formatCurrencyBRLFromDigits(customUntilFemaleValue)}
                                onChange={(e) =>
                                  setCustomUntilFemaleValue(currencyDigitsFromInput(e.target.value))
                                }
                                inputMode="numeric"
                                placeholder="R$ 0,00"
                                className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label
                                htmlFor="custom_until_value_male"
                                className="font-medium text-slate-700"
                              >
                                Valor masculino
                              </Label>
                              <Input
                                id="custom_until_value_male"
                                value={formatCurrencyBRLFromDigits(customUntilMaleValue)}
                                onChange={(e) =>
                                  setCustomUntilMaleValue(currencyDigitsFromInput(e.target.value))
                                }
                                inputMode="numeric"
                                placeholder="R$ 0,00"
                                className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-2">
                            <Label htmlFor="custom_until_value" className="font-medium text-slate-700">
                              Valor
                            </Label>
                            <Input
                              id="custom_until_value"
                              value={formatCurrencyBRLFromDigits(customUntilValue)}
                              onChange={(e) =>
                                setCustomUntilValue(currencyDigitsFromInput(e.target.value))
                              }
                              inputMode="numeric"
                              placeholder="R$ 0,00"
                              className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                            />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-900">Após</div>

                    <label
                      htmlFor="custom_after_by_gender"
                      className="group flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm transition-colors hover:bg-slate-50/80"
                    >
                      <div className="grid gap-1">
                        <div className="text-sm font-semibold text-slate-900">Valores por SEXO</div>
                        <div className="text-xs text-slate-600">
                          Defina valores diferentes para feminino e masculino.
                        </div>
                      </div>

                      <div className="pt-0.5">
                        <span
                          className={[
                            "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors",
                            customAfterByGender
                              ? "border-[#F58318]/40 bg-[#F58318]/90"
                              : "border-slate-300 bg-white",
                          ].join(" ")}
                        >
                          <input
                            id="custom_after_by_gender"
                            type="checkbox"
                            className="sr-only"
                            checked={customAfterByGender}
                            onChange={(e) => setCustomAfterByGender(e.target.checked)}
                          />
                          <span
                            className={[
                              "pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
                              customAfterByGender ? "translate-x-5" : "translate-x-0.5",
                            ].join(" ")}
                          />
                        </span>
                      </div>
                    </label>

                    {customAfterByGender ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label
                            htmlFor="custom_after_value_female"
                            className="font-medium text-slate-700"
                          >
                            Valor feminino
                          </Label>
                          <Input
                            id="custom_after_value_female"
                            value={formatCurrencyBRLFromDigits(customAfterFemaleValue)}
                            onChange={(e) =>
                              setCustomAfterFemaleValue(currencyDigitsFromInput(e.target.value))
                            }
                            inputMode="numeric"
                            placeholder="R$ 0,00"
                            className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label
                            htmlFor="custom_after_value_male"
                            className="font-medium text-slate-700"
                          >
                            Valor masculino
                          </Label>
                          <Input
                            id="custom_after_value_male"
                            value={formatCurrencyBRLFromDigits(customAfterMaleValue)}
                            onChange={(e) =>
                              setCustomAfterMaleValue(currencyDigitsFromInput(e.target.value))
                            }
                            inputMode="numeric"
                            placeholder="R$ 0,00"
                            className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Label htmlFor="custom_after_value" className="font-medium text-slate-700">
                          Valor
                        </Label>
                        <Input
                          id="custom_after_value"
                          value={formatCurrencyBRLFromDigits(customAfterValue)}
                          onChange={(e) => setCustomAfterValue(currencyDigitsFromInput(e.target.value))}
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="custom_mode_link" className="font-medium text-slate-700">
                      Link (opcional)
                    </Label>
                    <Input
                      id="custom_mode_link"
                      value={customModeLink}
                      onChange={(e) => setCustomModeLink(e.target.value)}
                      placeholder="https://..."
                      className="border-slate-200 bg-white shadow-sm focus-visible:ring-[#F58318]"
                    />
                  </div>

                </div>
              ) : null}
            </div>
          </Card>


          {submitError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/cadastros/roles-e-eventos")}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="w-full bg-[#F58318] text-white hover:bg-[#F58318]/90 sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar Evento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
