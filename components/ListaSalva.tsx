"use client";

import Link from "next/link";
import { useMinhaLista } from "@/hooks/useMinhaLista";
import { CartaoFilme } from "./CartaoFilme";
import { GradeFilmes } from "./GradeFilmes";

export function ListaSalva() {
  const { lista } = useMinhaLista();

  if (lista.length === 0) {
    return (
      <div className="py-12 text-center">
        <p>Sua lista está vazia.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-destaque px-5 py-2 font-medium text-sobre-destaque"
        >
          Explorar o catálogo
        </Link>
      </div>
    );
  }

  return (
    <GradeFilmes>
      {lista.map((filme) => (
        <CartaoFilme key={filme.id} filme={filme} />
      ))}
    </GradeFilmes>
  );
}
