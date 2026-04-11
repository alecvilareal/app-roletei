import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-[#DB7A1E] to-[#DB591F] px-6 py-12">
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

            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@roletei.com"
                  className="h-11 rounded-lg focus-visible:ring-[#DB7A1E]"
                  autoComplete="email"
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
                  className="h-11 rounded-lg focus-visible:ring-[#DB7A1E]"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="button"
                className="h-11 w-full rounded-lg bg-white font-semibold text-[#DB7A1E] ring-1 ring-white/60 transition-colors hover:bg-[#DB7A1E] hover:text-white"
              >
                Entrar no Painel
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
