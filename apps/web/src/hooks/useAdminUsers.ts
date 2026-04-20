"use client";

import * as React from "react";

export type AdminUser = {
  id: string;
  full_name: string | null;
  role: "cao_chupando_manga";
  email: string | null;
  created_at: string;
  email_confirmed_at: string | null;
};

type UseAdminUsersResult = {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useAdminUsers(): UseAdminUsersResult {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "GET",
        headers: { "content-type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        let details: unknown = null;
        try {
          details = await res.json();
        } catch {
          // ignore
        }

        const message =
          typeof (details as { error?: unknown } | null)?.error === "string"
            ? (details as { error: string }).error
            : "Não foi possível carregar os usuários.";

        setError(message);
        setUsers([]);
        return;
      }

      const data = (await res.json()) as AdminUser[];
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Erro de rede ao carregar usuários: ${e.message}`
          : "Erro de rede ao carregar usuários.",
      );
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}
