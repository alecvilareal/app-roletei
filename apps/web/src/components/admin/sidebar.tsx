"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
