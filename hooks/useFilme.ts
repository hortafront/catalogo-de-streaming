"use client";

import { useQuery } from "@tanstack/react-query";
import { buscarJson, ErroApi } from "@/lib/buscarJson";
import type { FilmeDetalhe } from "@/lib/tipos";

export function useFilme(id: number) {
  return useQuery<FilmeDetalhe, Error>({
    queryKey: ["filme", id],
    queryFn: ({ signal }) =>
      buscarJson<FilmeDetalhe>(`/api/filmes/${id}`, signal),
    retry: (tentativas, erro) =>
      !(erro instanceof ErroApi && erro.status === 404) && tentativas < 1,
  });
}
