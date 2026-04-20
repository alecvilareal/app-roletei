"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriasOrganizacaoTabCategorias } from "./_components/TabCategorias";
import { CategoriasOrganizacaoTabLocalizacoes } from "./_components/TabLocalizacoes";

export default function AdminCadastrosCategoriasOrganizacaoPage() {
  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Tabs defaultValue="categorias" className="w-full">
          <TabsList>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="localizacoes">Localizações</TabsTrigger>
          </TabsList>

          <TabsContent value="categorias" className="mt-6">
            <CategoriasOrganizacaoTabCategorias />
          </TabsContent>

          <TabsContent value="localizacoes" className="mt-6">
            <CategoriasOrganizacaoTabLocalizacoes />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
