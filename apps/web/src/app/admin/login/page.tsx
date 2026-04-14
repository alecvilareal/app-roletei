"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage("Credenciais inválidas");
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-[#F58318] to-[#F58318] px-6 py-12">
      {/* Decorative blur blob */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-[520px] w-[520px] rounded-full bg-white/15 blur-3xl" />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative flex w-full max-w-md flex-col items-center">
        <Card className="relative w-full rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="p-6 sm:p-8">
            <Image
              src="/logo1.svg"
              alt="Roletei"
              width={180}
              height={56}
              className="mx-auto mb-8"
              priority
            />

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Painel Administrativo
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Entre com suas credenciais para acessar o painel.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="email"
                >
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@roletei.com"
                  className="h-11 rounded-lg focus-visible:ring-[#F58318]"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="password"
                >
                  Senha
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-lg focus-visible:ring-[#F58318]"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {errorMessage ? (
                <p className="text-sm font-medium text-red-600">
                  {errorMessage}
                </p>
              ) : null}

              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-white font-semibold text-[#F58318] ring-1 ring-white/60 transition-colors hover:bg-[#F58318] hover:text-white disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar no Painel"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
