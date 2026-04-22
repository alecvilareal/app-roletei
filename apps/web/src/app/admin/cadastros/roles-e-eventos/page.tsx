"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LocaisTab } from "./LocaisTab";
import { RolesTab } from "./RolesTab";

export default function AdminCadastrosRolesEEventosPage() {
  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Tabs defaultValue="roles" className="w-full">
          <TabsList>
            <TabsTrigger value="roles">Rolês</TabsTrigger>
            <TabsTrigger value="locais">Locais</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <RolesTab />
          </TabsContent>

          <TabsContent value="locais">
            <LocaisTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
