"use client";

import * as React from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EventsTabAtivos() {
  const [events, setEvents] = React.useState<EventRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/admin/events?status=active", {
          method: "GET",
          headers: { "content-type": "application/json" },
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
              : "Não foi possível carregar os eventos ativos.";

          throw new Error(message);
        }

        const data = (await res.json()) as EventRow[];
        if (!ignore) setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Erro ao carregar eventos.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Eventos Ativos</h2>
        <div className="text-sm text-slate-500">{events.length} evento(s)</div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-4 text-sm text-slate-600">Carregando...</div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-md ring-1 ring-slate-200">
          <Table>
            <TableHeader className="[&_tr]:border-slate-200">
              <TableRow className="border-b border-slate-200">
                <TableHead className="text-slate-600">Título</TableHead>
                <TableHead className="text-slate-600">Local</TableHead>
                <TableHead className="text-slate-600">Início</TableHead>
                <TableHead className="text-slate-600">Final</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="[&_tr]:border-slate-200">
              {events.length === 0 ? (
                <TableRow className="border-b border-slate-200 last:border-0">
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                    Nenhum evento ativo cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((ev) => (
                  <TableRow key={ev.id} className="border-b border-slate-200 last:border-0">
                    <TableCell className="font-medium text-slate-900">
                      {ev.title}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="font-medium text-slate-900">{ev.location_name}</div>
                      <div className="text-slate-500">{ev.location_address}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">{formatDateTime(ev.starts_at)}</TableCell>
                    <TableCell className="text-slate-600">{formatDateTime(ev.ends_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
