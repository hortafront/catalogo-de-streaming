"use client";

import Link from "next/link";
import { useId, useMemo, useRef } from "react";
import { useFilmes } from "@/hooks/useFilmes";
import { escreverFiltros, FILTROS_PADRAO } from "@/lib/filtros/filtros";
import { juntarPaginas } from "@/lib/paginas";
import type { Filtros } from "@/lib/tipos";
import { CartaoFilme } from "./CartaoFilme";

const CLASSES_ITEM = "w-36 shrink-0 snap-start sm:w-44";
const CLASSES_SETA =
  "grid size-9 place-items-center rounded-full border border-borda text-texto-suave hover:border-borda-forte hover:text-texto";

function Seta({ rotulo, d, aoClicar }: { rotulo: string; d: string; aoClicar: () => void }) {
  return (
    <button type="button" aria-label={rotulo} onClick={aoClicar} className={CLASSES_SETA}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Uma fileira horizontal com a primeira página de filmes dos filtros dados. */
export function FileiraFilmes({
  titulo,
  filtros,
}: {
  titulo: string;
  filtros: Partial<Filtros>;
}) {
  const completos = { ...FILTROS_PADRAO, ...filtros };
  const { data, error, isPending, isError, refetch } = useFilmes(completos);
  const paginas = data?.pages;
  const filmes = useMemo(() => juntarPaginas(paginas), [paginas]);
  const trilho = useRef<HTMLUListElement>(null);
  const idTitulo = useId();
  const consulta = escreverFiltros(completos).toString();

  // A rolagem suave vem do CSS (scroll-smooth), que respeita quem pediu menos
  // movimento.
  function rolar(direcao: 1 | -1) {
    const elemento = trilho.current;
    if (elemento) elemento.scrollBy({ left: direcao * elemento.clientWidth * 0.85 });
  }

  if (!isPending && !isError && filmes.length === 0) return null;

  return (
    <section aria-labelledby={idTitulo} className="mt-10">
      <div className="mb-3 flex items-center gap-4">
        <h2 id={idTitulo} className="text-xl font-bold">
          {titulo}
        </h2>
        <Link
          href={consulta ? `/explorar?${consulta}` : "/explorar"}
          aria-label={`Ver todos de ${titulo}`}
          className="text-sm font-medium text-texto-suave hover:text-texto"
        >
          Ver todos
        </Link>
        <div className="ml-auto hidden gap-2 md:flex">
          <Seta
            rotulo={`Voltar em ${titulo}`}
            d="M15 5l-7 7 7 7"
            aoClicar={() => rolar(-1)}
          />
          <Seta
            rotulo={`Avançar em ${titulo}`}
            d="M9 5l7 7-7 7"
            aoClicar={() => rolar(1)}
          />
        </div>
      </div>

      {isPending && (
        <div aria-hidden="true" className="flex gap-3 overflow-hidden p-1">
          {Array.from({ length: 10 }, (_, indice) => (
            <div
              key={indice}
              className={`aspect-[2/3] animate-pulse rounded-lg bg-superficie ${CLASSES_ITEM}`}
            />
          ))}
        </div>
      )}

      {isError && (
        <div role="alert" className="rounded-lg border border-borda p-4">
          <p>{error.message}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 rounded-full border border-borda-forte bg-superficie px-5 py-2 font-medium"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {filmes.length > 0 && (
        // O respiro de 4px deixa o contorno de foco aparecer dentro da rolagem.
        <ul
          ref={trilho}
          className="sem-barra -m-1 flex snap-x gap-3 overflow-x-auto scroll-smooth scroll-px-1 p-1"
        >
          {filmes.map((filme) => (
            <CartaoFilme key={filme.id} filme={filme} className={CLASSES_ITEM} />
          ))}
        </ul>
      )}
    </section>
  );
}
