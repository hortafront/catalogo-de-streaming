"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { buscarJson } from "@/lib/buscarJson";
import type { PaginaFilmes } from "@/lib/tipos";
import { proximaPagina, type ConsultaFilmes } from "./useFilmes";

export function useBusca(q: string): ConsultaFilmes {
  return useInfiniteQuery({
    queryKey: ["busca", q],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({ q, pagina: String(pageParam) });
      return buscarJson<PaginaFilmes>(`/api/busca?${params}`, signal);
    },
    initialPageParam: 1,
    getNextPageParam: proximaPagina,
    enabled: q.length > 0,
  });
}
