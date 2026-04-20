"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsTabAtivos } from "@/features/admin-events/components/EventsTabAtivos";
import { EventsTabEventos } from "@/features/admin-events/components/EventsTabEventos";
import { EventsTabInativos } from "@/features/admin-events/components/EventsTabInativos";
import { EventsTabScrapping } from "@/features/admin-events/components/EventsTabScrapping";
import { EventsTabVisaoGeral } from "@/features/admin-events/components/EventsTabVisaoGeral";

export default function AdminCadastrosEventosPage() {
  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
            <TabsTrigger value="ativos">Eventos Ativos</TabsTrigger>
            <TabsTrigger value="inativos">Eventos Inativos</TabsTrigger>
            <TabsTrigger value="scrapping">Scrapping</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-6">
            <EventsTabVisaoGeral />
          </TabsContent>

          <TabsContent value="eventos" className="mt-6">
            <EventsTabEventos />
          </TabsContent>

          <TabsContent value="ativos" className="mt-6">
            <EventsTabAtivos />
          </TabsContent>

          <TabsContent value="inativos" className="mt-6">
            <EventsTabInativos />
          </TabsContent>

          <TabsContent value="scrapping" className="mt-6">
            <EventsTabScrapping />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
