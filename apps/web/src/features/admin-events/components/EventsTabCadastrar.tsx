"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateEventPayload = {
  title: string;
  description?: string | null;
  banner_url?: string | null;
  location_name: string;
  location_address: string;
  tickets_url?: string | null;
  starts_at: string;
  ends_at: string;
};

function toLocalDateTimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventsTabCadastrar() {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [bannerUrl, setBannerUrl] = React.useState("");
  const [ticketsUrl, setTicketsUrl] = React.useState("");
  const [locationName, setLocationName] = React.useState("");
  const [locationAddress, setLocationAddress] = React.useState("");

  const [startsAt, setStartsAt] = React.useState(() => toLocalDateTimeValue(new Date()));
  const [endsAt, setEndsAt] = React.useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return toLocalDateTimeValue(d);
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!title.trim()) return setSubmitError("Informe o título.");
    if (!locationName.trim()) return setSubmitError("Informe o nome do local.");
    if (!locationAddress.trim()) return setSubmitError("Informe o endereço do local.");
    if (!startsAt.trim()) return setSubmitError("Informe a data/hora de início.");
    if (!endsAt.trim()) return setSubmitError("Informe a data/hora final.");

    const payload: CreateEventPayload = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      banner_url: bannerUrl.trim() ? bannerUrl.trim() : null,
      location_name: locationName.trim(),
      location_address: locationAddress.trim(),
      tickets_url: ticketsUrl.trim() ? ticketsUrl.trim() : null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let details: unknown = null;
        try {
          details = await res.json();
        } catch {
          // ignore
        }

        const message =
          typeof (details as { error?: unknown } | null)?.error === "string"
            ? (details as { error: string }).error
            : "Não foi possível cadastrar o evento.";

        setSubmitError(message);
        return;
      }

      setSubmitSuccess("Evento cadastrado com sucesso.");

      setTitle("");
      setDescription("");
      setBannerUrl("");
      setTicketsUrl("");
      setLocationName("");
      setLocationAddress("");

      const now = new Date();
      setStartsAt(toLocalDateTimeValue(now));
      const end = new Date(now);
      end.setHours(end.getHours() + 2);
      setEndsAt(toLocalDateTimeValue(end));
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `Erro ao cadastrar evento: ${err.message}`
          : "Erro ao cadastrar evento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">Cadastrar Evento</h2>
        <p className="text-sm text-slate-600">
          Preencha os dados do evento e clique em salvar.
        </p>
      </div>

      <form onSubmit={handleCreate} className="mt-6 grid gap-4">
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

          <div className="grid gap-2">
            <Label htmlFor="tickets_url" className="font-medium text-slate-700">
              URL de ingressos
            </Label>
            <Input
              id="tickets_url"
              value={ticketsUrl}
              onChange={(e) => setTicketsUrl(e.target.value)}
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
            <Label htmlFor="location_name" className="font-medium text-slate-700">
              Local (nome)
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
            <Label htmlFor="location_address" className="font-medium text-slate-700">
              Local (endereço)
            </Label>
            <Input
              id="location_address"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Rua..., número..., cidade/UF"
              className="border-slate-200 focus-visible:ring-[#F58318]"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="starts_at" className="font-medium text-slate-700">
              Data e hora início
            </Label>
            <Input
              id="starts_at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="border-slate-200 focus-visible:ring-[#F58318]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ends_at" className="font-medium text-slate-700">
              Data e hora final
            </Label>
            <Input
              id="ends_at"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="border-slate-200 focus-visible:ring-[#F58318]"
            />
          </div>
        </div>

        {submitError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        {submitSuccess ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {submitSuccess}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
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
  );
}
