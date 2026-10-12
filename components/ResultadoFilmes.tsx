"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { ConsultaFilmes } from "@/hooks/useFilmes";
import { juntarPaginas } from "@/lib/paginas";
import { CartaoFilme } from "./CartaoFilme";
import { EsqueletosFilmes, GradeFilmes } from "./GradeFilmes";

const CLASSES_BOTAO =
  "rounded-full border border-borda-forte bg-superficie px-5 py-2 font-medium";

function Erro({ mensagem, aoTentar }: { mensagem: string; aoTentar: () => void }) {
  return (
    <div role="alert" className="py-8 text-center">
      <p>{mensagem}</p>
      <button type="button" onClick={aoTentar} className={`mt-3 ${CLASSES_BOTAO}`}>
        Tentar de novo
      </button>
    </div>
  );
}

export function ResultadoFilmes({
  consulta,
  vazio,
}: {
  consulta: ConsultaFilmes;
  vazio: ReactNode;
}) {
  const {
    data,
    error,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = consulta;

  const paginas = data?.pages;
  const filmes = useMemo(() => juntarPaginas(paginas), [paginas]);
  const total = paginas?.[0]?.total ?? 0;
  const sentinela = useRef<HTMLDivElement>(null);
  // Com erro a sentinela não é observada: sem isso, uma falha na próxima página
  // dispararia novas tentativas sem parar enquanto ela estivesse visível.
  const podeCarregar = hasNextPage && !isFetchingNextPage && !isError;

  useEffect(() => {
    const elemento = sentinela.current;
    if (!elemento || !podeCarregar) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas[0]?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: "600px" },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [podeCarregar, fetchNextPage]);

  if (isPending) {
    return (
      <>
        <p role="status" className="sr-only">
          Carregando filmes…
        </p>
        <EsqueletosFilmes />
      </>
    );
  }

  if (isError && filmes.length === 0) {
    return <Erro mensagem={error.message} aoTentar={() => void refetch()} />;
  }

  if (filmes.length === 0) return <>{vazio}</>;

  return (
    <>
      <p className="mb-4 text-sm text-texto-suave">
        {total.toLocaleString("pt-BR")}{" "}
        {total === 1 ? "filme encontrado" : "filmes encontrados"}
      </p>
      <GradeFilmes>
        {filmes.map((filme) => (
          <CartaoFilme key={filme.id} filme={filme} />
        ))}
      </GradeFilmes>
      <p role="status" className="sr-only">
        {isFetchingNextPage
          ? "Carregando mais filmes…"
          : `${filmes.length} filmes carregados.`}
      </p>
      {isFetchingNextPage && (
        <div className="mt-6">
          <EsqueletosFilmes quantidade={6} />
        </div>
      )}
      {isError && (
        <Erro
          mensagem="Não foi possível carregar mais filmes."
          aoTentar={() => void fetchNextPage()}
        />
      )}
      {hasNextPage && !isError && !isFetchingNextPage && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            className={CLASSES_BOTAO}
          >
            Carregar mais
          </button>
        </div>
      )}
      {!hasNextPage && (
        <p className="mt-8 text-center text-sm text-texto-suave">
          Fim da lista.
        </p>
      )}
      <div ref={sentinela} aria-hidden="true" />
    </>
  );
}
