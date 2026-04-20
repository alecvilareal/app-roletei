"use client";

import * as React from "react";

import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = React.useState("");
  const [categoryName, setCategoryName] = React.useState("");
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = React.useState("");
  const [selectedGroupId, setSelectedGroupId] = React.useState("");

  const [groups, setGroups] = React.useState<CategoryGroupRow[]>([]);
  const [groupsLoading, setGroupsLoading] = React.useState(false);

  const [categories, setCategories] = React.useState<CategoryRow[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(false);

  const [activeGroupId, setActiveGroupId] = React.useState<string | null>(null);

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
      const nextGroups = Array.isArray(data) ? data : [];
      setGroups(nextGroups);

      setActiveGroupId((prev) => {
        if (prev && nextGroups.some((g) => g.id === prev)) return prev;
        return nextGroups[0]?.id ?? null;
      });
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

  React.useEffect(() => {
    void loadGroupsAndCategories();

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadGroupsAndCategories();
      }
    }

    window.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function handleUpdateGroup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!editingGroupId) return;

    if (!editingGroupName.trim()) {
      setError("Informe o nome do grupo.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/category-groups?id=${encodeURIComponent(editingGroupId)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: editingGroupName.trim() }),
      });

      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível atualizar o grupo.");
      }

      setSuccess("Grupo atualizado com sucesso.");
      setEditingGroupId(null);
      setEditingGroupName("");
      await loadGroupsAndCategories();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar grupo.");
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

  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!editingCategoryId) return;

    if (!editingCategoryName.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/categories?id=${encodeURIComponent(editingCategoryId)}`,
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: editingCategoryName.trim() }),
        },
      );

      if (!res.ok) {
        const details = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error ?? "Não foi possível atualizar a categoria.");
      }

      setSuccess("Categoria atualizada com sucesso.");
      setEditingCategoryId(null);
      setEditingCategoryName("");
      await loadGroupsAndCategories();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atualizar categoria.");
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

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;
  const activeCategories = activeGroup
    ? categories.filter((c) => c.group_id === activeGroup.id)
    : [];
  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
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
              <div className="grid gap-4 md:grid-cols-[280px_1fr]">
                {/* Menu lateral (grupos) */}
                <div className="rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Grupos</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 w-9 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      title="Cadastrar grupo"
                      onClick={() => {
                        setSuccess(null);
                        setError(null);
                        setIsGroupModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="max-h-[520px] overflow-auto p-2">
                    {groupsLoading || categoriesLoading ? (
                      <div className="px-2 py-3 text-sm text-slate-600">Carregando...</div>
                    ) : groups.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-slate-600">
                        Nenhum grupo cadastrado ainda.
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {groups.map((g) => {
                          const catsCount = categories.filter((c) => c.group_id === g.id).length;
                          const isActive = g.id === activeGroupId;

                          return (
                            <li key={g.id} className="group relative">
                              <button
                                type="button"
                                onClick={() => setActiveGroupId(g.id)}
                                className={[
                                  "w-full rounded-md px-3 py-2 pr-10 text-left text-sm transition",
                                  isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-800 hover:bg-slate-100",
                                ].join(" ")}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="min-w-0 truncate font-medium">{g.name}</span>
                                  <span
                                    className={[
                                      "shrink-0 rounded-full px-2 py-0.5 text-xs",
                                      isActive ? "bg-white/15 text-white" : "bg-slate-200 text-slate-700",
                                    ].join(" ")}
                                  >
                                    {catsCount}
                                  </span>
                                </div>
                              </button>

                              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className={[
                                        "inline-flex h-8 w-8 items-center justify-center rounded-md",
                                        isActive
                                          ? "text-white/80 hover:bg-white/10 hover:text-white"
                                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                                      ].join(" ")}
                                      title="Ações do grupo"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        setError(null);
                                        setSuccess(null);
                                        setEditingGroupId(g.id);
                                        setEditingGroupName(g.name);
                                      }}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      disabled={catsCount > 0}
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        handleDeleteGroup(g.id);
                                      }}
                                      className={catsCount > 0 ? "" : "text-red-600 focus:text-red-600"}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Conteúdo (categorias do grupo selecionado) */}
                <div className="rounded-lg border border-slate-200 bg-white">
                  <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {activeGroup ? activeGroup.name : "Selecione um grupo"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {activeGroup
                          ? `${activeCategories.length} ${
                              activeCategories.length === 1 ? "categoria" : "categorias"
                            }`
                          : "Escolha um grupo no menu ao lado."}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 w-9 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      title="Cadastrar categoria neste grupo"
                      onClick={async () => {
                        if (!activeGroup) return;
                        setSuccess(null);
                        setError(null);
                        setSelectedGroupId(activeGroup.id);
                        setIsCategoryModalOpen(true);
                        await loadGroups();
                        await loadCategories();
                      }}
                      disabled={!activeGroup}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="px-4 py-4">
                    {!activeGroup ? (
                      <div className="text-sm text-slate-600">
                        Selecione um grupo para visualizar as categorias.
                      </div>
                    ) : activeCategories.length === 0 ? (
                      <div className="text-sm text-slate-600">
                        Nenhuma categoria neste grupo.
                      </div>
                    ) : (
                      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {activeCategories.map((c) => (
                          <li
                            key={c.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800"
                          >
                            <span className="min-w-0 truncate">{c.name}</span>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200/60 hover:text-slate-900"
                                  title="Ações da categoria"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setError(null);
                                    setSuccess(null);
                                    setEditingCategoryId(c.id);
                                    setEditingCategoryName(c.name);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleDeleteCategory(c.id);
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
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

        <Dialog open={editingGroupId !== null} onOpenChange={(open) => (!open ? setEditingGroupId(null) : null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar grupo</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateGroup} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_group_name">Nome do grupo</Label>
                <Input
                  id="edit_group_name"
                  value={editingGroupName}
                  onChange={(e) => setEditingGroupName(e.target.value)}
                  placeholder="Ex: Eventos"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingGroupId(null)}
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

        <Dialog open={editingCategoryId !== null} onOpenChange={(open) => (!open ? setEditingCategoryId(null) : null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar categoria</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleUpdateCategory} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Grupo</Label>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  {activeGroup ? activeGroup.name : "—"}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_category_name">Nome da categoria</Label>
                <Input
                  id="edit_category_name"
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  placeholder="Ex: Shows"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCategoryId(null)}
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
                <Label>Grupo</Label>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                  {groups.find((g) => g.id === selectedGroupId)?.name ?? "—"}
                </div>
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
