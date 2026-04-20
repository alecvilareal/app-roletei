"use client";

import * as React from "react";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CategoryGroupRow = {
  id: string;
  name: string;
};

type CategoryRow = {
  id: string;
  group_id: string;
  name: string;
};

export default function AdminCadastrosCategoriasPage() {
  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);

  const [groupName, setGroupName] = React.useState("");
  const [categoryName, setCategoryName] = React.useState("");
  const [selectedGroupId, setSelectedGroupId] = React.useState("");

  const [groups, setGroups] = React.useState<CategoryGroupRow[]>([]);
  const [groupsLoading, setGroupsLoading] = React.useState(false);

  const [categories, setCategories] = React.useState<CategoryRow[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function loadGroups() {
    setGroupsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/category-groups", { method: "GET" });
      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível carregar os grupos.");
      }
      const data = (await res.json()) as CategoryGroupRow[];
      setGroups(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar grupos.");
    } finally {
      setGroupsLoading(false);
    }
  }

  async function loadCategories() {
    setCategoriesLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/categories", { method: "GET" });
      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível carregar as categorias.");
      }
      const data = (await res.json()) as CategoryRow[];
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar categorias.");
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function loadGroupsAndCategories() {
    await Promise.all([loadGroups(), loadCategories()]);
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!groupName.trim()) {
      setError("Informe o nome do grupo.");
      return;
    }

    try {
      const res = await fetch("/api/admin/category-groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: groupName.trim() }),
      });

      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível cadastrar o grupo.");
      }

      setSuccess("Grupo cadastrado com sucesso.");
      setGroupName("");
      setIsGroupModalOpen(false);
      await loadGroupsAndCategories();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cadastrar grupo.");
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedGroupId.trim()) {
      setError("Selecione um grupo.");
      return;
    }
    if (!categoryName.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          group_id: selectedGroupId,
          name: categoryName.trim(),
        }),
      });

      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível cadastrar a categoria.");
      }

      setSuccess("Categoria cadastrada com sucesso.");
      setCategoryName("");
      setSelectedGroupId("");
      setIsCategoryModalOpen(false);
      await loadGroupsAndCategories();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cadastrar categoria.");
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    setError(null);
    setSuccess(null);

    const confirmed = window.confirm("Tem certeza que deseja excluir esta categoria?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(categoryId)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível excluir a categoria.");
      }

      setSuccess("Categoria excluída com sucesso.");
      await loadGroupsAndCategories();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir categoria.");
    }
  }

  async function handleDeleteGroup(groupId: string) {
    setError(null);
    setSuccess(null);

    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este grupo? Só será permitido se ele estiver vazio.",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/admin/category-groups?id=${encodeURIComponent(groupId)}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível excluir o grupo.");
      }

      setSuccess("Grupo excluído com sucesso.");
      await loadGroupsAndCategories();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir grupo.");
    }
  }
  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-6">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h1 className="text-xl font-semibold text-slate-900">
                Visão Geral
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Resumo/indicadores de categorias (placeholder).
              </p>
            </div>
          </TabsContent>

          <TabsContent value="categorias" className="mt-6">
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-slate-900">Categorias</h2>
                <p className="text-sm text-slate-600">
                  Grupos cadastrados e suas respectivas categorias.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setSuccess(null);
                    setError(null);
                    await loadGroupsAndCategories();
                  }}
                >
                  Atualizar
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                {groupsLoading || categoriesLoading ? (
                  <div className="text-sm text-slate-600">Carregando...</div>
                ) : groups.length === 0 ? (
                  <div className="text-sm text-slate-600">
                    Nenhum grupo cadastrado ainda.
                  </div>
                ) : (
                  groups.map((g) => {
                    const cats = categories.filter((c) => c.group_id === g.id);

                    return (
                      <div
                        key={g.id}
                        className="rounded-lg border border-slate-200 bg-white"
                      >
                        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-slate-900">{g.name}</div>
                            <div className="text-xs text-slate-500">
                              {cats.length} {cats.length === 1 ? "categoria" : "categorias"}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 w-9 p-0 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            title="Excluir grupo"
                            onClick={() => handleDeleteGroup(g.id)}
                            disabled={cats.length > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="px-4 py-4">
                          {cats.length === 0 ? (
                            <div className="text-sm text-slate-600">
                              Nenhuma categoria neste grupo.
                            </div>
                          ) : (
                            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {cats.map((c) => (
                                <li
                                  key={c.id}
                                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800"
                                >
                                  <span className="min-w-0 truncate">{c.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCategory(c.id)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                                    title="Excluir categoria"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cadastrar" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Cadastrar grupo de categorias
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Crie um grupo para organizar várias categorias.
                </p>

                <div className="mt-6">
                  <Button
                    className="bg-[#F58318] text-white hover:bg-[#F58318]/90"
                    onClick={async () => {
                      setSuccess(null);
                      setError(null);
                      setIsGroupModalOpen(true);
                    }}
                  >
                    Cadastrar grupo
                  </Button>
                </div>
              </Card>

              <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Cadastrar categoria
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Cadastre uma categoria dentro de um grupo.
                </p>

                <div className="mt-6">
                  <Button
                    className="bg-[#F58318] text-white hover:bg-[#F58318]/90"
                    onClick={async () => {
                      setSuccess(null);
                      setError(null);
                      setIsCategoryModalOpen(true);
                      await loadGroups();
                      await loadCategories();
                    }}
                  >
                    Cadastrar categoria
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar grupo de categorias</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateGroup} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="group_name">Nome do grupo</Label>
                <Input
                  id="group_name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex: Eventos"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGroupModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#F58318] text-white hover:bg-[#F58318]/90">
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar categoria</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateCategory} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="group_select">Grupo</Label>
                <select
                  id="group_select"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
                >
                  <option value="">
                    {groupsLoading ? "Carregando..." : "Selecione um grupo"}
                  </option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category_name">Nome da categoria</Label>
                <Input
                  id="category_name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Shows"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#F58318] text-white hover:bg-[#F58318]/90">
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}
      </div>
    </div>
  );
}
