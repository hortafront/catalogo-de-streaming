"use client";

import { useFilmes } from "@/hooks/useFilmes";
import { useFiltros } from "@/hooks/useFiltros";
import { BarraFiltros } from "./BarraFiltros";
import { ResultadoFilmes } from "./ResultadoFilmes";

export function Catalogo() {
  const { filtros } = useFiltros();
  const consulta = useFilmes(filtros);

  return (
    <>
      <BarraFiltros />
      <ResultadoFilmes
        consulta={consulta}
        vazio={
          <p className="py-12 text-center">
            Nenhum filme com esses filtros. Tente remover algum deles.
          </p>
        }
      />
    </>
  );
}
