"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { useFilme } from "@/hooks/useFilme";
import { useFilmes } from "@/hooks/useFilmes";
import { urlImagem } from "@/lib/config";
import { FILTROS_PADRAO } from "@/lib/filtros/filtros";
import { juntarPaginas } from "@/lib/paginas";
import type { Filme } from "@/lib/tipos";
import { BotoesMarcacao } from "./BotoesMarcacao";
import { FatosFilme } from "./FatosFilme";
import { Palco } from "./Palco";

const CANDIDATOS = 5;
const GENEROS_MOSTRADOS = 2;

function Cena({
  filme,
  candidatos,
  aoEscolher,
}: {
  filme: Filme;
  candidatos: Filme[];
  aoEscolher: (id: number) => void;
}) {
  // A lista não traz a cena nem a sinopse. Enquanto o detalhe carrega, ou se
  // ele falhar, o destaque aparece só com o que a lista já deu.
  const { data: detalhe } = useFilme(filme.id);
  const idTitulo = useId();
  const idPopulares = useId();

  return (
    <section aria-labelledby={idTitulo}>
      <Palco fundo={detalhe?.fundo} tamanho="alto">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2
              id={idTitulo}
              className="cartaz text-5xl leading-[0.92] sm:text-6xl lg:text-7xl"
            >
              {filme.titulo}
            </h2>
            <FatosFilme
              ano={filme.ano}
              duracao={detalhe?.duracao}
              generos={detalhe?.generos
                .slice(0, GENEROS_MOSTRADOS)
                .map((genero) => genero.nome)}
              nota={filme.nota}
            />
            {detalhe?.sinopse && (
              <p className="mt-4 line-clamp-3 max-w-xl text-lg text-tela/90">
                {detalhe.sinopse}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/filme/${filme.id}`}
                className="rounded-full bg-tela px-6 py-3 font-semibold text-sala"
              >
                Ver onde assistir
              </Link>
              <BotoesMarcacao filme={filme} comTexto sobreImagem />
            </div>
          </div>

          {candidatos.length > 1 && (
            <div>
              <p id={idPopulares} className="mb-2 text-sm text-tela/80">
                Mais populares agora
              </p>
              <ol aria-labelledby={idPopulares} className="flex gap-2">
                {candidatos.map((candidato, indice) => {
                  const escolhido = candidato.id === filme.id;
                  const miniatura = urlImagem(candidato.poster, "w92");
                  return (
                    <li key={candidato.id}>
                      <button
                        type="button"
                        aria-pressed={escolhido}
                        aria-label={`${indice + 1}º: ${candidato.titulo}`}
                        title={candidato.titulo}
                        onClick={() => aoEscolher(candidato.id)}
                        className={`block w-14 overflow-hidden rounded-md outline-offset-2 transition-opacity sm:w-16 ${
                          escolhido
                            ? "outline-2 outline-tela"
                            : "opacity-60 hover:opacity-100 focus-visible:opacity-100"
                        }`}
                      >
                        {miniatura ? (
                          <Image
                            src={miniatura}
                            alt=""
                            width={92}
                            height={138}
                            unoptimized
                            className="aspect-[2/3] w-full object-cover"
                          />
                        ) : (
                          <span className="grid aspect-[2/3] w-full place-items-center bg-tela/15 font-bold">
                            {indice + 1}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </Palco>
    </section>
  );
}

export function Destaque() {
  const { data, isPending } = useFilmes(FILTROS_PADRAO);
  const paginas = data?.pages;
  const candidatos = useMemo(
    () => juntarPaginas(paginas).slice(0, CANDIDATOS),
    [paginas],
  );
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const filme =
    candidatos.find((candidato) => candidato.id === escolhido) ?? candidatos[0];

  if (isPending) {
    return (
      <div
        aria-hidden="true"
        className="min-h-[min(76vh,44rem)] animate-pulse rounded-2xl bg-superficie"
      />
    );
  }

  // Sem filmes ou com erro, a primeira fileira logo abaixo já avisa.
  if (!filme) return null;

  return <Cena filme={filme} candidatos={candidatos} aoEscolher={setEscolhido} />;
}
