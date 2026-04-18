"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function AdminSidebar({
  items,
  isCollapsed,
  onToggle,
}: {
  items: AdminNavItem[];
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  const settingsChildren = useMemo(
    () => [
      {
        href: "/admin/settings/users",
        label: "Usuários",
      },
    ],
    [],
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(() => {
    return (
      pathname === "/admin/settings" || pathname.startsWith("/admin/settings/")
    );
  });

  return (
    <aside
      className={cn(
        "h-full shrink-0 border-r border-slate-200 bg-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-1.5 rounded-sm bg-[#F58318]" />
          <div className={cn("leading-tight", isCollapsed && "hidden")}>
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              Roletei
            </p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-2 py-3">
        {items.map((item) => {
          const isSettings = item.href === "/admin/settings";

          if (isSettings) {
            const isParentActive =
              pathname === "/admin/settings" ||
              pathname.startsWith("/admin/settings/");

            return (
              <div key={item.href} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen((v) => !v)}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900",
                    isCollapsed ? "justify-center" : "gap-3",
                    isParentActive && "bg-slate-100 text-slate-900",
                  )}
                  aria-expanded={isSettingsOpen}
                  aria-controls="admin-settings-group"
                >
                  <span className="text-[#F58318]">{item.icon}</span>
                  <span className={cn("font-medium", isCollapsed && "hidden")}>
                    {item.label}
                  </span>

                  {isCollapsed ? null : (
                    <span className="ml-auto text-slate-500">
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isSettingsOpen && "rotate-180",
                        )}
                      />
                    </span>
                  )}
                </button>

                <div
                  id="admin-settings-group"
                  className={cn(
                    "mt-1 flex flex-col gap-1 overflow-hidden pl-2",
                    isSettingsOpen ? "max-h-40" : "max-h-0",
                    "transition-[max-height] duration-300",
                    isCollapsed && "hidden",
                  )}
                >
                  {settingsChildren.map((child) => {
                    const isActive = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center rounded-md px-3 py-1.5 text-[13px] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900",
                          isActive && "bg-slate-100 text-slate-900",
                        )}
                      >
                        <span className="font-medium">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900",
                isCollapsed ? "justify-center" : "gap-3",
                isActive && "bg-slate-100 text-slate-900",
              )}
            >
              <span className="text-[#F58318]">{item.icon}</span>
              <span className={cn("font-medium", isCollapsed && "hidden")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
