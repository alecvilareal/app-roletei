"use client";

import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  MonitorPlay,
  Settings,
  Tag,
  type LucideIcon,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/Header";
import { AdminSidebar, type AdminNavItem } from "@/components/admin/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function iconNode(Icon: LucideIcon) {
  return <Icon className="h-4 w-4" />;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems: AdminNavItem[] = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: iconNode(LayoutDashboard),
    },
    {
      href: "/admin/events",
      label: "Eventos",
      icon: iconNode(MonitorPlay),
    },
    {
      href: "/admin/categories",
      label: "Categorias",
      icon: iconNode(Tag),
    },
    {
      href: "/admin/settings",
      label: "Configurações",
      icon: iconNode(Settings),
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
      {/* Mobile drawer (simples, reaproveitando o mesmo estado de overlay do header) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/20"
            onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="h-px bg-slate-200" />

            <nav className="flex flex-col gap-1 px-3 py-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <span className="text-[#F58318]">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex min-h-dvh">
        <AdminSidebar
          items={navItems}
          defaultCollapsed={false}
          onCollapsedChange={setIsSidebarCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader
            title="Admin"
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
            onOpenMenu={() => setIsMobileMenuOpen(true)}
          />

          {/* Garante que o conteúdo nunca fique "por baixo" da sidebar ao colapsar/expandir */}
          <main
            className="flex-1 bg-slate-50 px-4 py-8 md:px-6"
            data-sidebar-collapsed={isSidebarCollapsed ? "true" : "false"}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
