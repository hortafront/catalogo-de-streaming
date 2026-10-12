"use client";

import Link from "next/link";
import { useMinhaLista } from "@/hooks/useMinhaLista";

export function ContadorLista() {
  const { lista } = useMinhaLista();
  return (
    <Link
      href="/minha-lista"
      className="whitespace-nowrap rounded-full px-3 py-2 font-medium hover:bg-superficie"
    >
      Minha lista
      <span className="ml-1 text-texto-suave">({lista.length})</span>
    </Link>
  );
}
