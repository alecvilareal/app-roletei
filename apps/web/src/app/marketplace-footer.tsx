"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MarketplaceFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto w-full max-w-[1536px] px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Coluna 1 — Branding */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center">
              <Image src="/logo1.svg" alt="Roletei" width={140} height={46} priority />
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              Descubra o melhor de Belo Horizonte: eventos, gastronomia, shows e rolês
              que combinam com você.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:text-[#F58318]"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Site"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:text-[#F58318]"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Comunidade"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:text-[#F58318]"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Email"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:text-[#F58318]"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Coluna 2 — Plataforma */}
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-900">
              Plataforma
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed">
              <li>
                <Link
                  href="#"
                  className="text-slate-500 transition-colors hover:text-[#F58318]"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 transition-colors hover:text-[#F58318]"
                >
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 transition-colors hover:text-[#F58318]"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 transition-colors hover:text-[#F58318]"
                >
                  Carreiras
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 — Suporte */}
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-900">
              Suporte
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed">
              <li>
                <Link
                  href="#"
                  className="text-slate-500 transition-colors hover:text-[#F58318]"
                >
                  Ajuda / FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 transition-colors hover:text-[#F58318]"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 transition-colors hover:text-[#F58318]"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-500 transition-colors hover:text-[#F58318]"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-slate-500 transition-colors hover:text-[#F58318]"
                >
                  Login Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4 — Newsletter / App */}
          <div className="space-y-4">
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-900">
              Novidades
            </h3>

            <p className="text-sm leading-relaxed text-slate-500">
              Receba recomendações semanais e descubra novos rolês em BH.
            </p>

            <Button
              variant="outline"
              className="h-11 w-full justify-center rounded-xl border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              asChild
            >
              <a href="#">Assinar newsletter</a>
            </Button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                className="h-11 rounded-xl border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                asChild
              >
                <a href="#">App Store</a>
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                asChild
              >
                <a href="#">Play Store</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-slate-100 pt-6">
          <div className="flex flex-col gap-2 text-left">
            <div className="text-sm text-slate-500">
              © 2026 Roletei. Feito com ❤️ em Belo Horizonte.
            </div>
            <div className="text-[10px] text-slate-400">
              Roletei Tecnologia LTDA • CNPJ 00.000.000/0000-00
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
