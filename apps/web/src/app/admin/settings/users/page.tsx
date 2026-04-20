"use client";

import * as React from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminUsers, type AdminUser } from "@/hooks/useAdminUsers";
import {
  Dialog as AlertDialog,
  DialogContent as AlertDialogContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
} from "@/components/ui/dialog";

type UserStatus = "Ativo" | "Convite Enviado";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function StatusBadge({ status }: { status: UserStatus }) {
  const variantClasses =
    status === "Ativo"
      ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 hover:bg-emerald-500/10"
      : "bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 hover:bg-amber-500/10";

  return <Badge className={variantClasses}>{status}</Badge>;
}

function getUserStatus(u: AdminUser): UserStatus {
  return u.email_confirmed_at ? "Ativo" : "Convite Enviado";
}

function AdminUsersSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <div className="grid gap-3 p-4">
        <div className="h-9 w-full animate-pulse rounded-md bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded-md bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded-md bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded-md bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded-md bg-slate-100" />
        <div className="h-9 w-full animate-pulse rounded-md bg-slate-100" />
      </div>
    </div>
  );
}

type CreationMode = "password" | "invite";

type UserDialogMode = "create" | "edit";

function UserDialog({
  open,
  onOpenChange,
  mode,
  onCreated,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: UserDialogMode;
  onCreated: () => Promise<void>;
  user?: AdminUser | null;
}) {
  const title = mode === "create" ? "Novo Usuário" : "Editar Usuário";
  const description =
    mode === "create"
      ? "Crie um novo usuário para acessar o sistema."
      : "Atualize os dados do usuário selecionado.";

  const [fullName, setFullName] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [creationMode, setCreationMode] = React.useState<CreationMode>("password");
  const [password, setPassword] = React.useState<string>("");

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setSubmitError(null);

    if (mode === "edit" && user) {
      setFullName(user.full_name ?? "");
      setEmail(user.email ?? "");
      setCreationMode("password");
      setPassword("");
      return;
    }

    setFullName("");
    setEmail("");
    setCreationMode("password");
    setPassword("");
  }, [open, mode, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!fullName.trim()) {
      setSubmitError("Informe o nome completo.");
      return;
    }
    if (!email.trim()) {
      setSubmitError("Informe o e-mail.");
      return;
    }
    if (mode === "create" && creationMode === "password" && !password.trim()) {
      setSubmitError("Informe uma senha temporária.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res =
        mode === "create"
          ? await fetch("/api/admin/users", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                full_name: fullName.trim(),
                email: email.trim(),
                creation_mode: creationMode,
                password: creationMode === "password" ? password : undefined,
              }),
            })
          : await fetch(`/api/admin/users/${user?.id ?? ""}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                full_name: fullName.trim(),
              }),
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
            : mode === "create"
              ? "Não foi possível criar o usuário."
              : "Não foi possível atualizar o usuário.";

        setSubmitError(message);
        return;
      }

      onOpenChange(false);
      await onCreated();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `Erro ao ${mode === "create" ? "criar" : "atualizar"} usuário: ${err.message}`
          : `Erro ao ${mode === "create" ? "criar" : "atualizar"} usuário.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name" className="font-medium text-slate-700">
                Nome
              </Label>
              <Input
                id="full_name"
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-slate-200 focus-visible:ring-[#F58318]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="font-medium text-slate-700">
                E-mail
              </Label>
              <Input
                id="email"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-slate-200 focus-visible:ring-[#F58318]"
                disabled={mode === "edit"}
              />
            </div>

            {mode === "create" ? (
              <>
                <div className="grid gap-2">
                  <Label className="font-medium text-slate-700">
                    Modo de criação
                  </Label>
                  <div className="grid gap-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="creationMode"
                        value="password"
                        checked={creationMode === "password"}
                        onChange={() => setCreationMode("password")}
                        className="h-4 w-4 accent-[#F58318]"
                      />
                      Definir senha temporária
                    </label>

                    <label
                      className="flex items-center gap-2 text-sm text-slate-400"
                      title="Configure o SMTP no Supabase para usar esta opção"
                    >
                      <input
                        type="radio"
                        name="creationMode"
                        value="invite"
                        checked={creationMode === "invite"}
                        onChange={() => setCreationMode("invite")}
                        className="h-4 w-4 accent-[#F58318]"
                        disabled
                      />
                      Convidar por email
                    </label>
                  </div>
                </div>

                {creationMode === "password" ? (
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="font-medium text-slate-700">
                      Senha temporária
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-slate-200 focus-visible:ring-[#F58318]"
                    />
                  </div>
                ) : null}
              </>
            ) : null}

            {submitError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              className="text-slate-600"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#F58318] text-white hover:bg-[#F58318]/90"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Salvando..."
                : mode === "create"
                  ? "Criar Usuário"
                  : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UsersTable({
  users,
  onDelete,
  onEdit,
}: {
  users: AdminUser[];
  onDelete: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
      <Table>
        <TableHeader className="[&_tr]:border-slate-200">
          <TableRow className="border-b border-slate-200">
            <TableHead className="text-slate-600">Nome</TableHead>
            <TableHead className="text-slate-600">E-mail</TableHead>
            <TableHead className="text-slate-600">Função</TableHead>
            <TableHead className="text-slate-600">Status</TableHead>
            <TableHead className="text-slate-600">Data de criação</TableHead>
            <TableHead className="w-[52px] text-slate-600" />
          </TableRow>
        </TableHeader>

        <TableBody className="[&_tr]:border-slate-200">
          {users.length === 0 ? (
            <TableRow className="border-b border-slate-200 last:border-0">
              <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow
                key={u.id}
                className="border-b border-slate-200 last:border-0"
              >
                <TableCell className="font-medium text-slate-900">
                  {u.full_name ?? "Sem nome"}
                </TableCell>
                <TableCell className="text-slate-600">
                  {u.email ?? "Sem e-mail"}
                </TableCell>
                <TableCell className="text-slate-600">{u.role}</TableCell>
                <TableCell>
                  <StatusBadge status={getUserStatus(u)} />
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatDate(u.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onEdit(u)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => onDelete(u)}
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminUsersPage() {
  const [query, setQuery] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<AdminUser | null>(null);

  const { users, isLoading, error, refetch } = useAdminUsers();

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteUser, setDeleteUser] = React.useState<AdminUser | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  const filteredUsers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = (u.full_name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [query, users]);

  async function handleConfirmDelete() {
    if (!deleteUser) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
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
            : "Não foi possível excluir o usuário.";

        setDeleteError(message);
        return;
      }

      setDeleteOpen(false);
      setDeleteUser(null);
      await refetch();
    } catch (e) {
      setDeleteError(
        e instanceof Error
          ? `Erro ao excluir usuário: ${e.message}`
          : "Erro ao excluir usuário.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Tabs defaultValue="system-users" className="w-full">
          <TabsList>
            <TabsTrigger value="system-users">Usuários do sistema</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
          </TabsList>

          <TabsContent value="system-users" className="mt-6">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                <div className="relative w-full md:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nome ou e-mail..."
                    className="pl-9"
                  />
                </div>

                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Usuário
                </Button>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {isLoading ? (
                <AdminUsersSkeleton />
              ) : (
                <UsersTable
                  users={filteredUsers}
                  onDelete={(u) => {
                    setDeleteUser(u);
                    setDeleteError(null);
                    setDeleteOpen(true);
                  }}
                  onEdit={(u) => {
                    setEditUser(u);
                    setEditOpen(true);
                  }}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-sm text-slate-600">
                Gerenciamento de permissões (placeholder).
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">
              Excluir usuário
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Esta ação é irreversível. O usuário será removido do Auth e o perfil
              associado será excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteUser ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <div className="font-medium">{deleteUser.full_name ?? "Sem nome"}</div>
              <div className="text-slate-500">{deleteUser.email ?? "Sem e-mail"}</div>
            </div>
          ) : null}

          {deleteError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {deleteError}
            </div>
          ) : null}

          <AlertDialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              className="text-slate-600"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void handleConfirmDelete()}
              className="bg-red-600 text-white hover:bg-red-600/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserDialog
        open={createOpen}
        onOpenChange={(open) => setCreateOpen(open)}
        mode="create"
        onCreated={refetch}
      />

      <UserDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditUser(null);
        }}
        mode="edit"
        onCreated={refetch}
        user={editUser}
      />
    </div>
  );
}
