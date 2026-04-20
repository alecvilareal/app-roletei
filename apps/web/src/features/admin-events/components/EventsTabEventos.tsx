"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

type EventRow = {
  id: string;
  title: string;
  location_name: string;
  location_address: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
};

function toLocalDateTimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR");
}

export function EventsTabEventos() {
  const [events, setEvents] = React.useState<EventRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

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

  function resetCreateForm() {
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

    setSubmitError(null);
    setSubmitSuccess(null);
  }

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
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        const message = details?.error ?? "Não foi possível cadastrar o evento.";
        setSubmitError(message);
        return;
      }

      setSubmitSuccess("Evento cadastrado com sucesso.");
      await loadRecentEvents();
      setIsCreateModalOpen(false);
      resetCreateForm();
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

  async function loadRecentEvents() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/events?status=all&sort=created_at&limit=15", {
        method: "GET",
      });

      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível carregar os eventos.");
      }

      const data = (await res.json()) as EventRow[];
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar eventos.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void loadRecentEvents();

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadRecentEvents();
      }
    }

    window.addEventListener("visibilitychange", onVisibilityChange);

    return () => window.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return (
    <>
      <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Últimos eventos adicionados</h2>
            <p className="mt-1 text-sm text-slate-600">
              Mostrando os eventos mais recentes (por data de criação).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="bg-[#F58318] text-white hover:bg-[#F58318]/90"
              onClick={() => {
                setSubmitError(null);
                setSubmitSuccess(null);
                setIsCreateModalOpen(true);
              }}
            >
              Adicionar evento
            </Button>

            <Button type="button" variant="outline" onClick={() => void loadRecentEvents()}>
              Atualizar
            </Button>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="text-sm text-slate-600">Carregando...</div>
          ) : error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : events.length === 0 ? (
            <div className="text-sm text-slate-600">Nenhum evento cadastrado ainda.</div>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
              {events.map((ev) => (
                <li key={ev.id} className="p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{ev.title}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        {ev.location_name} — {ev.location_address}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 sm:mt-0 sm:text-right">
                      <div>
                        Criado em:{" "}
                        <span className="font-medium">{formatDateTime(ev.created_at)}</span>
                      </div>
                      <div>
                        Início: <span className="font-medium">{formatDateTime(ev.starts_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
                        ev.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700",
                      ].join(" ")}
                    >
                      {ev.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastrar evento</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="grid gap-4">
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
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
