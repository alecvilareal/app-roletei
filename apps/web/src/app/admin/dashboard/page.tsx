"use client";

import { BarChart3, CalendarDays, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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


export default function AdminDashboardPage() {
  return (
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
  );
}
