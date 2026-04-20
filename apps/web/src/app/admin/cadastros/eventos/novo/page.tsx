"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EventAccessType = "ingresso" | "lista" | "aberto";

type EntryCategoryOption = { id: string; name: string };

type CreateEventPayload = {
  title: string;
  description?: string | null;

  banner_url?: string | null;

  location_name: string;
  location_address: string;

  tickets_url?: string | null;

  entry_category_id?: string | null;

  starts_at: string; // ISO
  ends_at: string; // ISO
};

function addMinutesToIso(iso: string, minutes: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
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

export default function AdminCadastrosEventosNovoPage() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [bannerUrl, setBannerUrl] = React.useState("");

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

  const [locationName, setLocationName] = React.useState("");
  const [cep, setCep] = React.useState("");

  const [street, setStreet] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [neighborhood, setNeighborhood] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");

  const [isFetchingCep, setIsFetchingCep] = React.useState(false);
  const [cepError, setCepError] = React.useState<string | null>(null);

  const [description, setDescription] = React.useState("");

  const [accessType, setAccessType] = React.useState<EventAccessType>("aberto");
  const [accessUrl, setAccessUrl] = React.useState("");

  const [entryCategories, setEntryCategories] = React.useState<EntryCategoryOption[]>([]);
  const [entryCategoryId, setEntryCategoryId] = React.useState<string>("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  async function loadEntryCategories() {
    try {
      const [groupsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/category-groups", { method: "GET" }),
        fetch("/api/admin/categories", { method: "GET" }),
      ]);

      if (!groupsRes.ok || !categoriesRes.ok) return;

      const groups = (await groupsRes.json()) as { id: string; name: string }[];
      const categories = (await categoriesRes.json()) as { id: string; group_id: string; name: string }[];

      const entryGroup = groups.find((g) => g.name === "Entrada");
      if (!entryGroup) return;

      const options = categories
        .filter((c) => c.group_id === entryGroup.id)
        .map((c) => ({ id: c.id, name: c.name }))
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      setEntryCategories(options);

      // se ainda não selecionado, seta a primeira opção
      if (!entryCategoryId && options.length > 0) {
        setEntryCategoryId(options[0].id);
      }
    } catch {
      // silencioso (não bloquear cadastro)
    }
  }

  React.useEffect(() => {
    void loadEntryCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) return setSubmitError("Informe o título.");
    if (!startDate.trim()) return setSubmitError("Informe a data de início.");
    if (!startTime.trim()) return setSubmitError("Informe a hora de início.");

    if (hasEndDateTime) {
      if (!endDate.trim()) return setSubmitError("Informe a data de término.");
      if (!endTime.trim()) return setSubmitError("Informe a hora de término.");
    }

    if (!locationName.trim()) return setSubmitError("Informe o nome do local.");
    if (!street.trim()) return setSubmitError("Informe a rua/logradouro.");
    if (!number.trim()) return setSubmitError("Informe o número.");
    if (!neighborhood.trim()) return setSubmitError("Informe o bairro.");
    if (!city.trim()) return setSubmitError("Informe a cidade.");
    if (!state.trim()) return setSubmitError("Informe o estado.");

    if (accessType !== "aberto" && !accessUrl.trim()) {
      return setSubmitError("Informe a URL (ingresso ou lista).");
    }

    const startsAtIso = new Date(`${startDate}T${startTime}:00`).toISOString();

    const endsAtIso = hasEndDateTime
      ? new Date(`${endDate}T${endTime}:00`).toISOString()
      : addMinutesToIso(startsAtIso, 120);

    const locationAddress = [street.trim(), `nº ${number.trim()}`, neighborhood.trim(), `${city.trim()}/${state.trim()}`, cep.trim()]
      .filter(Boolean)
      .join(" - ");

    const payload: CreateEventPayload = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      banner_url: bannerUrl.trim() ? bannerUrl.trim() : null,
      location_name: locationName.trim(),
      location_address: locationAddress,
      tickets_url: accessType === "aberto" ? null : accessUrl.trim(),
      entry_category_id: entryCategoryId ? entryCategoryId : null,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
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

      router.push("/admin/cadastros/eventos");
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
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Cadastrar evento</h1>
              <p className="mt-1 text-sm text-slate-600">
                Preencha os dados para criar um novo evento.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/cadastros/eventos")}
            >
              Voltar
            </Button>
          </div>

          <div className="mt-6">
            <form onSubmit={handleCreate} className="grid gap-6">
              <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6">
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
                    className="border-slate-200 focus-visible:ring-[#F58318]"
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
                        className="border-slate-200 focus-visible:ring-[#F58318]"
                      />
                    </div>
                  </div>

              {bannerUrl.trim() ? (
                <div className="grid gap-2">
                  <div className="text-sm font-medium text-slate-700">Prévia do banner</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerUrl}
                    alt="Prévia do banner"
                    className="max-h-56 w-full rounded-md border border-slate-200 object-cover"
                  />
                </div>
              ) : null}

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
                    className="border-slate-200 focus-visible:ring-[#F58318]"
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
                    className="border-slate-200 focus-visible:ring-[#F58318]"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <input
                  id="has_end_datetime"
                  type="checkbox"
                  className="mt-1"
                  checked={hasEndDateTime}
                  onChange={(e) => setHasEndDateTime(e.target.checked)}
                />
                <div className="grid gap-1">
                  <Label htmlFor="has_end_datetime" className="font-medium text-slate-700">
                    Inserir data e hora do término
                  </Label>
                  <div className="text-xs text-slate-600">
                    Se desmarcado, o término será igual ao início (pode ser ajustado depois).
                  </div>
                </div>
              </div>

              {hasEndDateTime ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="end_date" className="font-medium text-slate-700">
                      Data término
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-slate-200 focus-visible:ring-[#F58318]"
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
                      className="border-slate-200 focus-visible:ring-[#F58318]"
                    />
                  </div>
                </div>
              ) : null}

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
                    className="border-slate-200 focus-visible:ring-[#F58318]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cep" className="font-medium text-slate-700">
                    CEP
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      placeholder="00000-000"
                      className="border-slate-200 focus-visible:ring-[#F58318]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleFetchCep()}
                      disabled={isFetchingCep}
                    >
                      {isFetchingCep ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                  {cepError ? <div className="text-xs text-red-700">{cepError}</div> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="street" className="font-medium text-slate-700">
                    Rua / Logradouro
                  </Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Av. Paulista"
                    className="border-slate-200 focus-visible:ring-[#F58318]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="number" className="font-medium text-slate-700">
                    Número
                  </Label>
                  <Input
                    id="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 1000"
                    className="border-slate-200 focus-visible:ring-[#F58318]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="neighborhood" className="font-medium text-slate-700">
                    Bairro
                  </Label>
                  <Input
                    id="neighborhood"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Bela Vista"
                    className="border-slate-200 focus-visible:ring-[#F58318]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city" className="font-medium text-slate-700">
                    Cidade
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="border-slate-200 focus-visible:ring-[#F58318]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="state" className="font-medium text-slate-700">
                    Estado (UF)
                  </Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Ex: SP"
                    className="border-slate-200 focus-visible:ring-[#F58318]"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="font-medium text-slate-700">
                  Descrição
                </Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição do evento..."
                  className="min-h-28 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="entry_category" className="font-medium text-slate-700">
                    Categoria entrada
                  </Label>
                  <select
                    id="entry_category"
                    value={entryCategoryId}
                    onChange={(e) => setEntryCategoryId(e.target.value)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
                  >
                    {entryCategories.length === 0 ? (
                      <option value="">(sem categorias cadastradas)</option>
                    ) : null}
                    {entryCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="access_type" className="font-medium text-slate-700">
                    Tipo de acesso
                  </Label>
                  <select
                    id="access_type"
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value as EventAccessType)}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
                  >
                    <option value="ingresso">Evento com Ingresso</option>
                    <option value="lista">Evento com nome na lista</option>
                    <option value="aberto">Aberto ao público</option>
                  </select>
                </div>
              </div>

                  {accessType !== "aberto" ? (
                    <div className="grid gap-2">
                      <Label htmlFor="access_url" className="font-medium text-slate-700">
                        URL (ingresso / lista)
                      </Label>
                      <Input
                        id="access_url"
                        value={accessUrl}
                        onChange={(e) => setAccessUrl(e.target.value)}
                        placeholder="https://..."
                        className="border-slate-200 focus-visible:ring-[#F58318]"
                      />
                    </div>
                  ) : null}
                </div>
              </Card>

              {submitError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/cadastros/eventos")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  className="bg-[#F58318] text-white hover:bg-[#F58318]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Evento"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
