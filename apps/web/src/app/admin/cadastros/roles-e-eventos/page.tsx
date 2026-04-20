"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolesEventosTabEventos } from "./_components/TabEventos";
import { RolesEventosTabLocais } from "./_components/TabLocais";
import { RolesEventosTabVisaoGeral } from "./_components/TabVisaoGeral";

export default function AdminCadastrosRolesEEventosPage() {
  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Tabs defaultValue="visao-geral" className="w-full">
          <TabsList>
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="eventos">Eventos</TabsTrigger>
            <TabsTrigger value="locais">Locais</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-6">
            <RolesEventosTabVisaoGeral />
          </TabsContent>

          <TabsContent value="eventos" className="mt-6">
            <RolesEventosTabEventos />
          </TabsContent>

          <TabsContent value="locais" className="mt-6">
            <RolesEventosTabLocais />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
