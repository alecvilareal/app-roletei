"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


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
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR");
}

export function EventsTabEventos() {
  const router = useRouter();

  const [events, setEvents] = React.useState<EventRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [eventToDelete, setEventToDelete] = React.useState<EventRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

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

  async function deleteEventById(id: string) {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível excluir o evento.");
      }

      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      setEventToDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir evento.");
    } finally {
      setDeleting(false);
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
            <Button asChild className="bg-[#F58318] text-white hover:bg-[#F58318]/90">
              <Link href="/admin/cadastros/eventos/novo">Adicionar evento</Link>
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

                    <div className="mt-2 flex items-start justify-between gap-3 text-xs text-slate-600 sm:mt-0 sm:justify-end sm:text-right">
                      <div>
                        <div>
                          Criado em:{" "}
                          <span className="font-medium">{formatDateTime(ev.created_at)}</span>
                        </div>
                        <div>
                          Início:{" "}
                          <span className="font-medium">{formatDateTime(ev.starts_at)}</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Ações do evento ${ev.title}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              router.push(`/admin/cadastros/eventos/${ev.id}/editar`);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onSelect={(e) => {
                              e.preventDefault();
                              setEventToDelete(ev);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => (!open ? setEventToDelete(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento</AlertDialogTitle>
            <AlertDialogDescription>
              {eventToDelete ? (
                <>
                  Tem certeza que deseja excluir <span className="font-medium">{eventToDelete.title}</span>?
                  Essa ação não pode ser desfeita.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!eventToDelete || deleting}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault();
                if (eventToDelete) void deleteEventById(eventToDelete.id);
              }}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
