"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { useFilme } from "@/hooks/useFilme";
import { ErroApi } from "@/lib/buscarJson";
import { urlImagem } from "@/lib/config";
import { BotoesMarcacao } from "./BotoesMarcacao";
import { FatosFilme } from "./FatosFilme";
import { OndeAssistir } from "./OndeAssistir";
import { Palco } from "./Palco";
import { Poster } from "./Poster";

export function EsqueletoDetalhe() {
  return (
    <div aria-hidden="true">
      <div className="min-h-[26rem] animate-pulse rounded-2xl bg-superficie" />
      <div className="mt-10 max-w-prose space-y-3">
        <div className="h-6 w-1/3 animate-pulse rounded bg-borda" />
        <div className="h-24 animate-pulse rounded bg-borda" />
      </div>
    </div>
  );
}

export function DetalheFilme({ id }: { id: number }) {
  const { data: filme, error, isPending, isError, refetch } = useFilme(id);

  if (isPending) {
    return (
      <>
        <p role="status" className="sr-only">
          Carregando filme…
        </p>
        <EsqueletoDetalhe />
      </>
    );
  }

  if (isError) {
    if (error instanceof ErroApi && error.status === 404) notFound();
    return (
      <div role="alert" className="py-12 text-center">
        <p>{error.message}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 rounded-full border border-borda-forte bg-superficie px-5 py-2 font-medium"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  return (
    <article>
      <Palco fundo={filme.fundo}>
        <div className="flex items-end gap-6">
          <div className="hidden w-40 shrink-0 sm:block lg:w-48">
            <Poster caminho={filme.poster} titulo={filme.titulo} tamanho="w500" />
          </div>
          <header className="min-w-0 max-w-3xl">
            <h1 className="cartaz text-4xl leading-[0.92] sm:text-5xl lg:text-6xl">
              {filme.titulo}
            </h1>
            <FatosFilme
              ano={filme.ano}
              duracao={filme.duracao}
              generos={filme.generos.map((genero) => genero.nome)}
              nota={filme.nota}
            />
            <div className="mt-5">
              <BotoesMarcacao filme={filme} comTexto sobreImagem />
            </div>
          </header>
        </div>
      </Palco>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* No celular, onde assistir vem antes da sinopse. */}
        <aside className="rounded-2xl border border-borda bg-superficie p-5 lg:sticky lg:top-24 lg:order-last lg:self-start">
          <OndeAssistir opcoes={filme.ondeAssistir} link={filme.linkOpcoes} />
        </aside>

        <div className="space-y-10">
          <section aria-labelledby="titulo-sinopse">
            <h2 id="titulo-sinopse" className="text-xl font-bold">
              Sinopse
            </h2>
            <p className="mt-2 max-w-prose text-lg">
              {filme.sinopse || (
                <span className="text-texto-suave">
                  Sinopse não disponível em português.
                </span>
              )}
            </p>
          </section>

          {filme.trailer && (
            <section aria-labelledby="titulo-trailer">
              <h2 id="titulo-trailer" className="text-xl font-bold">
                Trailer
              </h2>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${filme.trailer}`}
                title={`Trailer de ${filme.titulo}`}
                loading="lazy"
                allow="encrypted-media; picture-in-picture; fullscreen"
                className="mt-3 aspect-video w-full max-w-3xl rounded-2xl border border-borda"
              />
            </section>
          )}

          {filme.elenco.length > 0 && (
            <section aria-labelledby="titulo-elenco">
              <h2 id="titulo-elenco" className="text-xl font-bold">
                Elenco principal
              </h2>
              <ul className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-4 xl:grid-cols-5">
                {filme.elenco.map((pessoa) => {
                  const foto = urlImagem(pessoa.foto, "w185");
                  return (
                    <li key={pessoa.id}>
                      {foto ? (
                        <Image
                          src={foto}
                          alt=""
                          width={185}
                          height={278}
                          unoptimized
                          className="aspect-[2/3] w-full rounded-lg bg-superficie object-cover"
                        />
                      ) : (
                        <div className="aspect-[2/3] w-full rounded-lg border border-borda bg-superficie" />
                      )}
                      <p className="mt-2 text-sm font-medium">{pessoa.nome}</p>
                      {pessoa.personagem && (
                        <p className="text-sm text-texto-suave">
                          {pessoa.personagem}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
