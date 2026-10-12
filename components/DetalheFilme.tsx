"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { useFilme } from "@/hooks/useFilme";
import { ErroApi } from "@/lib/buscarJson";
import { urlImagem } from "@/lib/config";
import { BotaoLista } from "./BotaoLista";
import { OndeAssistir } from "./OndeAssistir";
import { Poster } from "./Poster";

function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

export function EsqueletoDetalhe() {
  return (
    <div aria-hidden="true" className="grid gap-6 md:grid-cols-[18rem_1fr]">
      <div className="mx-auto aspect-[2/3] w-56 animate-pulse rounded-lg bg-borda md:w-full" />
      <div className="space-y-3">
        <div className="h-8 w-2/3 animate-pulse rounded bg-borda" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-borda" />
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

  const fundo = urlImagem(filme.fundo, "w1280");
  const fatos = [
    filme.ano !== null ? String(filme.ano) : null,
    filme.duracao !== null ? formatarDuracao(filme.duracao) : null,
    filme.generos.map((genero) => genero.nome).join(", ") || null,
  ].filter((fato): fato is string => fato !== null);

  return (
    <article>
      {fundo && (
        <Image
          src={fundo}
          alt=""
          width={1280}
          height={720}
          unoptimized
          priority
          className="mb-6 hidden aspect-[21/9] w-full rounded-xl object-cover md:block"
        />
      )}

      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        <div className="mx-auto w-56 md:w-full">
          <Poster caminho={filme.poster} titulo={filme.titulo} tamanho="w500" />
        </div>

        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold">{filme.titulo}</h1>
            {fatos.length > 0 && (
              <p className="mt-1 text-texto-suave">{fatos.join(" · ")}</p>
            )}
            <p className="mt-2">
              {filme.nota !== null ? (
                <>
                  <span aria-hidden="true">★</span>{" "}
                  <span className="sr-only">Nota </span>
                  {filme.nota.toFixed(1)} de 10
                </>
              ) : (
                <span className="text-texto-suave">Ainda sem avaliações</span>
              )}
            </p>
            <div className="mt-4">
              <BotaoLista filme={filme} comTexto />
            </div>
          </header>

          <section aria-labelledby="titulo-sinopse">
            <h2 id="titulo-sinopse" className="text-xl font-bold">
              Sinopse
            </h2>
            <p className="mt-2 max-w-prose">
              {filme.sinopse || (
                <span className="text-texto-suave">
                  Sinopse não disponível em português.
                </span>
              )}
            </p>
          </section>

          <OndeAssistir opcoes={filme.ondeAssistir} link={filme.linkOpcoes} />
        </div>
      </div>

      {filme.trailer && (
        <section aria-labelledby="titulo-trailer" className="mt-10">
          <h2 id="titulo-trailer" className="text-xl font-bold">
            Trailer
          </h2>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${filme.trailer}`}
            title={`Trailer de ${filme.titulo}`}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            className="mt-3 aspect-video w-full max-w-3xl rounded-xl border border-borda"
          />
        </section>
      )}

      {filme.elenco.length > 0 && (
        <section aria-labelledby="titulo-elenco" className="mt-10">
          <h2 id="titulo-elenco" className="text-xl font-bold">
            Elenco principal
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
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
                  <p className="mt-2 font-medium">{pessoa.nome}</p>
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
    </article>
  );
}
