"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  MonitorPlay,
  Settings,
  Tag,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function AdminSidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-dvh w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-1.5 rounded-sm bg-[#F58318]" />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              Roletei
            </p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900",
                isActive && "bg-slate-100 text-slate-900",
              )}
            >
              <span className="text-[#F58318]">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pb-6">
        <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200">
          Clean Admin · destaque em <span className="text-[#F58318]">Laranja</span>
        </div>
      </div>
    </aside>
  );
}

function AdminHeader({
  title,
  onLogout,
  isLoggingOut,
  onOpenMenu,
}: {
  title: string;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
  onOpenMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 md:hidden"
            aria-label="Abrir menu"
          >
            <span className="text-lg leading-none">≡</span>
          </button>

          <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </h1>
        </div>

        <Button
          className="bg-[#F58318] text-white hover:bg-[#F58318]/90"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Saindo..." : "Sair"}
        </Button>
      </div>
    </header>
  );
}

function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-slate-700">
          {title}
        </CardTitle>
        <div className="text-[#F58318]">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function MobileMenu({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/20"
        onClick={onClose}
        aria-label="Fechar menu"
      />
      <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-1.5 rounded-sm bg-[#F58318]" />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                Roletei
              </p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <Separator className="bg-slate-200" />

        <nav className="flex flex-col gap-1 px-3 py-4">
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900",
                  isActive && "bg-slate-100 text-slate-900",
                )}
              >
                <span className="text-[#F58318]">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: "/admin/events",
      label: "Eventos",
      icon: <MonitorPlay className="h-4 w-4" />,
    },
    {
      href: "/admin/categories",
      label: "Categorias",
      icon: <Tag className="h-4 w-4" />,
    },
    {
      href: "/admin/settings",
      label: "Configurações",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
    } finally {
      setIsLoggingOut(false);
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <MobileMenu
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={navItems}
      />

      <div className="flex min-h-dvh">
        <AdminSidebar items={navItems} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader
            title="Dashboard"
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
            onOpenMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 bg-slate-50 px-4 py-8 md:px-6">
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  Bem-vindo, Álec. O que vamos roletar hoje?
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Aqui vai um resumo rápido do painel (placeholders por enquanto).
                </p>
              </div>

              <Separator className="mb-6 bg-slate-200" />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                  title="Eventos Ativos"
                  value="12"
                  icon={<CalendarDays className="h-5 w-5" />}
                />
                <StatsCard
                  title="Visualizações (Hoje)"
                  value="840"
                  icon={<BarChart3 className="h-5 w-5" />}
                />
                <StatsCard
                  title="Novos Cadastros"
                  value="5"
                  icon={<UserPlus className="h-5 w-5" />}
                />
              </div>

              <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                Dica: o menu lateral já está pronto para adicionarmos rotas e
                sub-seções do admin.
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
