"use client";

import { useQuery } from "@tanstack/react-query";
import { buscarJson } from "@/lib/buscarJson";
import type { Genero, Servico } from "@/lib/tipos";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function useServicos() {
  return useQuery<Servico[], Error>({
    queryKey: ["servicos"],
    queryFn: ({ signal }) => buscarJson<Servico[]>("/api/servicos", signal),
    staleTime: UM_DIA_MS,
  });
}

export function useGeneros() {
  return useQuery<Genero[], Error>({
    queryKey: ["generos"],
    queryFn: ({ signal }) => buscarJson<Genero[]>("/api/generos", signal),
    staleTime: UM_DIA_MS,
  });
}
