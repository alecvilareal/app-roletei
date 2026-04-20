"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminCadastrosLocaisPage() {
  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="ativos">Locais Ativos</TabsTrigger>
            <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-6">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h1 className="text-xl font-semibold text-slate-900">
                Visão Geral
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Resumo/indicadores de locais (placeholder).
              </p>
            </div>
          </TabsContent>

          <TabsContent value="ativos" className="mt-6">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Locais Ativos
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Lista de locais ativos (placeholder).
              </p>
            </div>
          </TabsContent>

          <TabsContent value="cadastrar" className="mt-6">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Cadastrar</h2>
              <p className="mt-2 text-sm text-slate-600">
                Formulário para criar local (placeholder).
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
