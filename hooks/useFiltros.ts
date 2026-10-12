"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  analisarFiltros,
  contarFiltrosAtivos,
  escreverFiltros,
  FILTROS_PADRAO,
} from "@/lib/filtros/filtros";
import type { Filtros } from "@/lib/tipos";

/** Os filtros vivem na URL. Quem usa este hook precisa estar dentro de <Suspense>. */
export function useFiltros() {
  const params = useSearchParams();
  const router = useRouter();

  const filtros = useMemo(
    () => analisarFiltros(new URLSearchParams(params.toString())).filtros,
    [params],
  );

  const aplicar = useCallback(
    (novos: Filtros) => {
      const consulta = escreverFiltros(novos).toString();
      router.push(consulta ? `/?${consulta}` : "/", { scroll: false });
    },
    [router],
  );

  const definir = useCallback(
    (parcial: Partial<Filtros>) => aplicar({ ...filtros, ...parcial }),
    [aplicar, filtros],
  );

  const limpar = useCallback(() => aplicar(FILTROS_PADRAO), [aplicar]);

  return { filtros, definir, limpar, ativos: contarFiltrosAtivos(filtros) };
}
