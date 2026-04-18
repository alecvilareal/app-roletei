"use client";

import * as React from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type UserRole = "Admin" | "Cliente" | "Operador";
type UserStatus = "Ativo" | "Inativo";

type MockUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO
};

const mockUsers: MockUser[] = [
  {
    id: "usr_1",
    name: "Ana Souza",
    email: "ana.souza@exemplo.com",
    role: "Admin",
    status: "Ativo",
    createdAt: "2026-01-12T10:22:00.000Z",
  },
  {
    id: "usr_2",
    name: "Bruno Almeida",
    email: "bruno.almeida@exemplo.com",
    role: "Operador",
    status: "Ativo",
    createdAt: "2026-02-03T14:10:00.000Z",
  },
  {
    id: "usr_3",
    name: "Carla Nunes",
    email: "carla.nunes@exemplo.com",
    role: "Cliente",
    status: "Inativo",
    createdAt: "2025-11-18T09:05:00.000Z",
  },
  {
    id: "usr_4",
    name: "Diego Pereira",
    email: "diego.pereira@exemplo.com",
    role: "Cliente",
    status: "Ativo",
    createdAt: "2026-03-21T17:44:00.000Z",
  },
  {
    id: "usr_5",
    name: "Eduarda Lima",
    email: "eduarda.lima@exemplo.com",
    role: "Operador",
    status: "Ativo",
    createdAt: "2026-04-01T12:30:00.000Z",
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { year: "numeric", month: "short", day: "2-digit" });
}

function StatusBadge({ status }: { status: UserStatus }) {
  const variantClasses =
    status === "Ativo"
      ? "bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/10"
      : "bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/20 hover:bg-slate-500/10";

  return <Badge className={variantClasses}>{status}</Badge>;
}

type UserDialogMode = "create" | "edit";

function UserDialog({
  open,
  onOpenChange,
  mode,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: UserDialogMode;
  user?: MockUser | null;
}) {
  const title = mode === "create" ? "Novo Usuário" : "Editar Usuário";
  const description =
    mode === "create"
      ? "Crie um novo usuário para acessar o sistema."
      : "Atualize os dados do usuário selecionado.";

  // UI-only (sem submit real)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
            <Label htmlFor="name" className="font-medium text-slate-700">
              Nome
            </Label>
            <Input
              id="name"
              placeholder="Nome completo"
              defaultValue={user?.name ?? ""}
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
              defaultValue={user?.email ?? ""}
              className="border-slate-200 focus-visible:ring-[#F58318]"
            />
          </div>

          {mode === "create" ? (
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-medium text-slate-700">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="border-slate-200 focus-visible:ring-[#F58318]"
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="role" className="font-medium text-slate-700">
              Função
            </Label>
            <select
              id="role"
              defaultValue={user?.role ?? "Cliente"}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[#F58318]"
            >
              <option value="Admin">Admin</option>
              <option value="Operador">Operador</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            className="text-slate-600"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button className="bg-[#F58318] text-white hover:bg-[#F58318]/90">
            {mode === "create" ? "Criar Usuário" : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UsersTable({
  users,
  onEdit,
}: {
  users: MockUser[];
  onEdit: (user: MockUser) => void;
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
                  {u.name}
                </TableCell>
                <TableCell className="text-slate-600">{u.email}</TableCell>
                <TableCell className="text-slate-600">{u.role}</TableCell>
                <TableCell>
                  <StatusBadge status={u.status} />
                </TableCell>
                <TableCell className="text-slate-600">
                  {formatDate(u.createdAt)}
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
                      <DropdownMenuItem onSelect={() => {}}>
                        Redefinir Senha
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => {}}
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
  const [selectedUser, setSelectedUser] = React.useState<MockUser | null>(null);

  const filteredUsers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockUsers;

    return mockUsers.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    });
  }, [query]);

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

              <UsersTable
                users={filteredUsers}
                onEdit={(u) => {
                  setSelectedUser(u);
                  setEditOpen(true);
                }}
              />
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

      <UserDialog
        open={createOpen}
        onOpenChange={(open) => setCreateOpen(open)}
        mode="create"
      />

      <UserDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedUser(null);
        }}
        mode="edit"
        user={selectedUser}
      />
    </div>
  );
}
