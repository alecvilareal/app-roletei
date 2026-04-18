"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminUsersPage() {
  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Card className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <CardContent>
            <Tabs defaultValue="system-users" className="w-full">
              <TabsList>
                <TabsTrigger value="system-users">Usuários do sistema</TabsTrigger>
                <TabsTrigger value="permissions">Permissões</TabsTrigger>
              </TabsList>

              <TabsContent value="system-users">
                <div className="text-sm text-slate-600">
                  Lista de usuários do sistema (placeholder).
                </div>
              </TabsContent>

              <TabsContent value="permissions">
                <div className="text-sm text-slate-600">
                  Gerenciamento de permissões (placeholder).
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
