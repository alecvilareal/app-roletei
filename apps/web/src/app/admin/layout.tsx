"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Folder, LayoutDashboard, Settings } from "lucide-react";

import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar, type AdminNavItem } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const isLoginRoute = pathname === "/admin/login";

  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems: AdminNavItem[] = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: "/admin/cadastros",
      label: "Cadastros",
      icon: <Folder className="h-4 w-4" />,
    },
    {
      href: "/admin/settings",
      label: "Configurações",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    let ignore = false;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (ignore) return;

      setIsAuthenticated(Boolean(data.session));
      setSessionChecked(true);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setSessionChecked(true);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const headerTitle = useMemo(() => {
    if (pathname === "/admin/dashboard") return "Dashboard";
    if (pathname.startsWith("/admin/cadastros/roles-e-eventos")) return "Rolês e Eventos";
    if (pathname.startsWith("/admin/cadastros/categorias-e-tags"))
      return "Categorias e Tags";
    if (pathname.startsWith("/admin/cadastros/localizacoes")) return "Localizações";
    if (pathname.startsWith("/admin/cadastros/categorias-organizacao"))
      return "Categorias e Organização";
    if (pathname.startsWith("/admin/cadastros")) return "Cadastros";
    if (pathname.startsWith("/admin/settings/users")) return "Usuários";
    if (pathname.startsWith("/admin/settings/eventos")) return "Config. Eventos";
    if (pathname.startsWith("/admin/settings")) return "Configurações";
    return "Admin";
  }, [pathname]);

  // Rota de login não deve ter shell admin
  if (isLoginRoute) return <>{children}</>;

  // Enquanto não checamos sessão, renderiza nada (evita flash)
  if (!sessionChecked) return null;

  // Se não autenticado, renderiza nada (middleware cuida do redirect)
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <AdminSidebar
        items={navItems}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((v) => !v)}
      />

      <div className="flex flex-1 flex-col">
        <AdminHeader
          title={headerTitle}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
