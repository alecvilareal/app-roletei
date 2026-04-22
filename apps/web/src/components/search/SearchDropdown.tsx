"use client";

import { cn } from "@/lib/utils";

export type SearchDropdownItem = {
  id: string;
  label: string;
};

export function SearchDropdown({
  open,
  loading,
  error,
  emptyLabel = "Nenhum resultado.",
  items,
  onSelect,
  className,
}: {
  open: boolean;
  loading: boolean;
  error: string | null;
  emptyLabel?: string;
  items: SearchDropdownItem[];
  onSelect: (item: SearchDropdownItem) => void;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-white shadow-lg",
        className,
      )}
    >
      {loading ? (
        <div className="px-4 py-3 text-sm text-slate-600">Buscando...</div>
      ) : error ? (
        <div className="px-4 py-3 text-sm text-red-600">{error}</div>
      ) : items.length ? (
        <div className="py-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-900 hover:bg-slate-50"
              onClick={() => onSelect(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-3 text-sm text-slate-600">{emptyLabel}</div>
      )}
    </div>
  );
}
