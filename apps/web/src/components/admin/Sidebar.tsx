"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function AdminSidebar({
  items,
  defaultCollapsed = false,
  onCollapsedChange,
}: {
  items: AdminNavItem[];
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const widthClass = collapsed ? "w-[72px]" : "w-64";

  const header = useMemo(() => {
    return (
      <div className="flex h-16 items-center justify-between gap-3 px-3">
        <div
          className={cn(
            "flex items-center gap-3 overflow-hidden",
            collapsed && "justify-center",
          )}
        >
          <div className="h-9 w-1.5 shrink-0 rounded-sm bg-[#F58318]" />
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                Roletei
              </p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setCollapsed((prev) => {
              const next = !prev;
              onCollapsedChange?.(next);
              return next;
            });
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
          aria-label={collapsed ? "Expandir sidebar" : "Minimizar sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }, [collapsed, onCollapsedChange]);

  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "hidden h-dvh shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col",
        "transition-all duration-300",
        widthClass,
      )}
    >
      {header}

      <Separator className="bg-slate-200" />

      <nav
        className={cn(
          "flex flex-1 flex-col gap-1 px-3 py-4",
          collapsed && "px-2",
        )}
      >
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900",
                collapsed ? "justify-center gap-0 px-2" : "gap-3",
                isActive && "bg-slate-100 text-slate-900",
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-[#F58318]">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-6 pb-6">
          <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200">
            Clean Admin Dash · destaque em{" "}
            <span className="text-[#F58318]">Laranja</span>
          </div>
        </div>
      )}
    </aside>
  );
}
