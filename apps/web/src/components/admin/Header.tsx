"use client";

import { Button } from "@/components/ui/button";

export function AdminHeader({
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
