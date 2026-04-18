"use client";

import { Button } from "@/components/ui/button";

export function AdminHeader({
  title,
  onLogout,
  isLoggingOut,
}: {
  title: string;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}) {
  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-4">
        <h1 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h1>

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
