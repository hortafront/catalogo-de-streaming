"use client";

import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { buscarJson } from "@/lib/buscarJson";
import { escreverFiltros } from "@/lib/filtros/filtros";
import type { Filtros, PaginaFilmes } from "@/lib/tipos";

export type ConsultaFilmes = UseInfiniteQueryResult<
  InfiniteData<PaginaFilmes>,
  Error
>;

export function proximaPagina(ultima: PaginaFilmes): number | undefined {
  return ultima.pagina < ultima.totalPaginas ? ultima.pagina + 1 : undefined;
}

export function useFilmes(filtros: Filtros): ConsultaFilmes {
  const consulta = escreverFiltros(filtros).toString();
  return useInfiniteQuery({
    queryKey: ["filmes", consulta],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams(consulta);
      params.set("pagina", String(pageParam));
      return buscarJson<PaginaFilmes>(`/api/filmes?${params}`, signal);
    },
    initialPageParam: 1,
    getNextPageParam: proximaPagina,
  });
}
