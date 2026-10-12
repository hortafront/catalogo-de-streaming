"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useFilmes } from "@/hooks/useFilmes";
import { urlImagem } from "@/lib/config";
import { FILTROS_PADRAO } from "@/lib/filtros/filtros";
import { juntarPaginas } from "@/lib/paginas";

// O bastante para três linhas na tela mais larga (12 colunas).
const QUANTIDADE = 36;

/**
 * Mosaico inclinado com os pôsteres dos filmes mais populares. É só enfeite:
 * vai como `cenario` do Palco e some para quem usa leitor de tela.
 */
export function ParedePosteres() {
  const { data } = useFilmes(FILTROS_PADRAO);
  const paginas = data?.pages;
  const posteres = useMemo(() => {
    const urls = juntarPaginas(paginas).flatMap(
      (filme) => urlImagem(filme.poster, "w185") ?? [],
    );
    if (urls.length === 0) return [];
    // A primeira página tem 20 filmes; a lista se repete até encher a parede.
    return Array.from(
      { length: QUANTIDADE },
      (_, indice) => urls[indice % urls.length],
    );
  }, [paginas]);

  if (posteres.length === 0) return null;

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -inset-x-12 -top-28 grid animate-surgir -rotate-6 grid-cols-6 gap-3 sm:grid-cols-8 lg:grid-cols-12">
        {posteres.map((url, indice) => (
          <Image
            key={indice}
            src={url}
            alt=""
            width={185}
            height={278}
            unoptimized
            className="aspect-[2/3] w-full rounded-md object-cover"
          />
        ))}
      </div>
    </div>
  );
}
