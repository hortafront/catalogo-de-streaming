"use client";

import { useBusca } from "@/hooks/useBusca";
import { ResultadoFilmes } from "./ResultadoFilmes";

export function ResultadoBusca({ q }: { q: string }) {
  const consulta = useBusca(q);

  return (
    <>
      <h1 className="text-2xl font-bold">Resultados para “{q}”</h1>
      <p className="mb-4 mt-1 text-sm text-texto-suave">
        A busca mostra qualquer filme. A página de cada um informa se ele está
        em algum streaming no Brasil.
      </p>
      <ResultadoFilmes
        consulta={consulta}
        vazio={
          <p className="py-12 text-center">
            Nenhum filme encontrado para “{q}”. Confira a grafia ou tente outro
            título.
          </p>
        }
      />
    </>
  );
}
