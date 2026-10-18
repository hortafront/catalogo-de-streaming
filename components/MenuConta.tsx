"use client";

import Link from "next/link";
import { sair } from "@/app/entrar/acoes";
import { useSessao } from "./ProvedorSessao";

export function MenuConta() {
  const { usuario, configurado } = useSessao();
  if (!configurado) return null;

  if (!usuario) {
    return (
      <Link
        href="/entrar"
        className="block whitespace-nowrap rounded-full px-4 py-2 font-medium text-texto-suave hover:text-texto"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 truncate text-sm text-texto-suave sm:inline">
        {usuario.email}
      </span>
      <form action={sair}>
        <button
          type="submit"
          className="whitespace-nowrap rounded-full px-4 py-2 font-medium text-texto-suave hover:text-texto"
        >
          Sair
        </button>
      </form>
    </div>
  );
}
