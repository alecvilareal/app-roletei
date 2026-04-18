"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <div className="min-h-full bg-slate-50 px-8 py-8 md:px-12">
      <div className="mx-auto w-full max-w-none">
        <Card className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Usuários</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Página de gerenciamento de usuários (placeholder).
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
