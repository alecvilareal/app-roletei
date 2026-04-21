"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialogDescription as ConfirmDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PlaceRow = {
  id: string;
  created_at: string;
  name: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

function normalizeCep(value: string) {
  return value.replace(/\D/g, "");
}

export default function AdminCadastrosLocalizacoesPage() {
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [placeToDelete, setPlaceToDelete] = useState<PlaceRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  const cepDigits = useMemo(() => normalizeCep(cep), [cep]);

  async function loadPlaces() {
    setLoadingPlaces(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/places", { method: "GET" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Não foi possível carregar as localizações.");
      }
      const data = (await res.json()) as PlaceRow[];
      setPlaces(data ?? []);
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "Não foi possível carregar as localizações.";
      setError(message);
    } finally {
      setLoadingPlaces(false);
    }
  }

  async function lookupCep(currentCepDigits: string) {
    const res = await fetch(
      `https://viacep.com.br/ws/${currentCepDigits}/json/`,
    );
    if (!res.ok) throw new Error("Não foi possível consultar o CEP no ViaCEP.");
    const data = (await res.json()) as ViaCepResponse;

    if (data?.erro) throw new Error("CEP não encontrado.");

    setLogradouro(data?.logradouro ?? "");
    setBairro(data?.bairro ?? "");
    setCidade(data?.localidade ?? "");
    setUf(data?.uf ?? "");
    setComplemento(data?.complemento ?? "");
  }

  useEffect(() => {
    void loadPlaces();
  }, []);

  useEffect(() => {
    if (cepDigits.length !== 8) return;

    setError(null);
    void lookupCep(cepDigits).catch((e: unknown) => {
      const message = e instanceof Error ? e.message : "Erro ao consultar CEP.";
      setError(message);
    });
  }, [cepDigits]);

  function resetForm() {
    setName("");
    setCep("");
    setLogradouro("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setUf("");
  }

  function openCreate() {
    setMode("create");
    setEditingPlaceId(null);
    setError(null);
    resetForm();
    setIsCreateOpen(true);
  }

  function openEdit(place: PlaceRow) {
    setMode("edit");
    setEditingPlaceId(place.id);
    setError(null);

    setName(place.name ?? "");
    setCep(place.cep ?? "");
    setLogradouro(place.logradouro ?? "");
    setNumero(place.numero ?? "");
    setComplemento(place.complemento ?? "");
    setBairro(place.bairro ?? "");
    setCidade(place.cidade ?? "");
    setUf(place.uf ?? "");

    setIsCreateOpen(true);
  }

  async function deletePlaceById(id: string) {
    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/places?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const body = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        throw new Error(body?.error ?? "Não foi possível excluir a localização.");
      }

      setPlaces((prev) => prev.filter((p) => p.id !== id));
      setPlaceToDelete(null);
      setSuccess("Localização excluída com sucesso.");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Não foi possível excluir a localização.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const method = mode === "edit" ? "PATCH" : "POST";
      const url =
        mode === "edit" && editingPlaceId
          ? `/api/admin/places?id=${encodeURIComponent(editingPlaceId)}`
          : "/api/admin/places";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cep,
          logradouro,
          numero,
          complemento: complemento.length ? complemento : null,
          bairro,
          cidade,
          uf,
        }),
      });

      const body = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        throw new Error(
          body?.error ??
            (mode === "edit"
              ? "Não foi possível editar a localização."
              : "Não foi possível cadastrar a localização."),
        );
      }

      setSuccess(
        mode === "edit"
          ? "Localização atualizada com sucesso."
          : "Localização cadastrada com sucesso.",
      );

      setIsCreateOpen(false);
      setMode("create");
      setEditingPlaceId(null);
      resetForm();

      await loadPlaces();
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : mode === "edit"
            ? "Não foi possível editar a localização."
            : "Não foi possível cadastrar a localização.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold text-slate-900">Localizações</h1>
              <p className="text-sm text-slate-600">
                Cadastre e gerencie as localizações disponíveis.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={loadPlaces}
                disabled={loadingPlaces}
              >
                {loadingPlaces ? "Atualizando..." : "Atualizar"}
              </Button>

              <Dialog
                open={isCreateOpen}
                onOpenChange={(open) => {
                  setIsCreateOpen(open);
                  if (!open) {
                    setMode("create");
                    setEditingPlaceId(null);
                    setError(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    className="bg-[#F58318] text-white hover:bg-[#F58318]/90"
                    onClick={(e) => {
                      e.preventDefault();
                      openCreate();
                    }}
                  >
                    Adicionar localização
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {mode === "edit"
                        ? "Editar localização"
                        : "Cadastrar localização"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha o CEP para buscar o endereço automaticamente.
                    </DialogDescription>
                  </DialogHeader>

                  <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="place-name"
                        className="font-medium text-slate-700"
                      >
                        Nome da localização
                      </Label>
                      <Input
                        id="place-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Casa de Shows XYZ"
                        className="border-slate-200 focus-visible:ring-[#F58318]"
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="place-cep"
                          className="font-medium text-slate-700"
                        >
                          CEP
                        </Label>
                        <Input
                          id="place-cep"
                          value={cep}
                          onChange={(e) => setCep(e.target.value)}
                          placeholder="00000-000"
                          inputMode="numeric"
                          className="border-slate-200 focus-visible:ring-[#F58318]"
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="place-numero"
                          className="font-medium text-slate-700"
                        >
                          Número
                        </Label>
                        <Input
                          id="place-numero"
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                          placeholder="Ex: 123"
                          className="border-slate-200 focus-visible:ring-[#F58318]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="place-logradouro"
                        className="font-medium text-slate-700"
                      >
                        Logradouro
                      </Label>
                      <Input
                        id="place-logradouro"
                        value={logradouro}
                        onChange={(e) => setLogradouro(e.target.value)}
                        placeholder="Ex: Av. Paulista"
                        className="border-slate-200 focus-visible:ring-[#F58318]"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label
                        htmlFor="place-complemento"
                        className="font-medium text-slate-700"
                      >
                        Complemento
                      </Label>
                      <Input
                        id="place-complemento"
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                        placeholder="Ex: Apto 12 / Bloco B"
                        className="border-slate-200 focus-visible:ring-[#F58318]"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="place-bairro"
                          className="font-medium text-slate-700"
                        >
                          Bairro
                        </Label>
                        <Input
                          id="place-bairro"
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                          className="border-slate-200 focus-visible:ring-[#F58318]"
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="place-cidade"
                          className="font-medium text-slate-700"
                        >
                          Cidade
                        </Label>
                        <Input
                          id="place-cidade"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          className="border-slate-200 focus-visible:ring-[#F58318]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 md:max-w-[160px]">
                      <Label
                        htmlFor="place-uf"
                        className="font-medium text-slate-700"
                      >
                        UF
                      </Label>
                      <Input
                        id="place-uf"
                        value={uf}
                        onChange={(e) => setUf(e.target.value)}
                        maxLength={2}
                        className="border-slate-200 focus-visible:ring-[#F58318]"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={cepDigits.length !== 8}
                        onClick={() =>
                          lookupCep(cepDigits).catch((e: unknown) => {
                            const message =
                              e instanceof Error
                                ? e.message
                                : "Erro ao consultar CEP.";
                            setError(message);
                          })
                        }
                      >
                        Buscar CEP
                      </Button>

                      <Button
                        type="submit"
                        className="bg-[#F58318] text-white hover:bg-[#F58318]/90"
                        disabled={submitting}
                      >
                        {submitting
                          ? "Salvando..."
                          : mode === "edit"
                            ? "Salvar alterações"
                            : "Salvar localização"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {success ? (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6">
            {loadingPlaces ? (
              <p className="text-sm text-slate-600">Carregando...</p>
            ) : places.length === 0 ? (
              <p className="text-sm text-slate-600">
                Nenhuma localização cadastrada ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600">
                      <th className="py-2 pr-4 font-medium">Nome</th>
                      <th className="py-2 pr-4 font-medium">Endereço</th>
                      <th className="py-2 pr-4 font-medium">CEP</th>
                      <th className="py-2 pr-4 font-medium">Cidade/UF</th>
                      <th className="py-2 pl-4 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {places.map((p) => (
                      <tr key={p.id} className="border-t border-slate-100">
                        <td className="py-2 pr-4 text-slate-900">{p.name}</td>
                        <td className="py-2 pr-4 text-slate-700">
                          {p.logradouro}, {p.numero}
                          {p.complemento ? ` - ${p.complemento}` : ""} — {p.bairro}
                        </td>
                        <td className="py-2 pr-4 text-slate-700">{p.cep}</td>
                        <td className="py-2 pr-4 text-slate-700">
                          {p.cidade}/{p.uf}
                        </td>
                        <td className="py-2 pl-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={`Ações da localização ${p.name}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  openEdit(p);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setPlaceToDelete(p);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <AlertDialog
            open={!!placeToDelete}
            onOpenChange={(open) => (!open ? setPlaceToDelete(null) : null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir localização</AlertDialogTitle>
                <ConfirmDescription>
                  {placeToDelete ? (
                    <>
                      Tem certeza que deseja excluir{" "}
                      <span className="font-medium">{placeToDelete.name}</span>?
                      Essa ação não pode ser desfeita.
                    </>
                  ) : null}
                </ConfirmDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={!placeToDelete || deleting}
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={(e) => {
                    e.preventDefault();
                    if (placeToDelete) void deletePlaceById(placeToDelete.id);
                  }}
                >
                  {deleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
