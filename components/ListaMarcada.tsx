"use client";

import Link from "next/link";
import { useMarcacoes, type Estado } from "@/hooks/useMarcacoes";
import type { Aba } from "@/lib/abas";
import { linkEntrar } from "@/lib/auth/caminhoSeguro";
import { CartaoFilme } from "./CartaoFilme";
import { EsqueletosFilmes, GradeFilmes } from "./GradeFilmes";
import { useSessao } from "./ProvedorSessao";

const CLASSES_BOTAO =
  "mt-4 inline-block rounded-full bg-destaque px-5 py-2 font-medium text-sobre-destaque";

export function ListaMarcada({ estado, aba }: { estado: Estado; aba: Aba }) {
  const { usuario, configurado } = useSessao();
  const { queroAssistir, assistidos, carregando, erro, tentarDeNovo } =
    useMarcacoes();
  const filmes = estado === "quero_assistir" ? queroAssistir : assistidos;

  if (!configurado) {
    return (
      <p className="py-12 text-center">
        Login indisponível: configure o Supabase.
      </p>
    );
  }

  if (!usuario) {
    return (
      <div className="py-12 text-center">
        <p>Entre para montar suas listas.</p>
        <Link
          href={linkEntrar(aba === "catalogo" ? "/" : `/?aba=${aba}`)}
          className={CLASSES_BOTAO}
        >
          Entrar
        </Link>
      </div>
    );
  }

  if (carregando) return <EsqueletosFilmes />;

  if (erro) {
    return (
      <div role="alert" className="rounded-lg border border-borda p-4">
        <p>{erro.message}</p>
        <button
          type="button"
          onClick={tentarDeNovo}
          className="mt-3 rounded-full border border-borda-forte bg-superficie px-5 py-2 font-medium"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (filmes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p>Nenhum filme aqui ainda.</p>
        <Link href="/" className={CLASSES_BOTAO}>
          Ver o catálogo
        </Link>
      </div>
    );
  }

  return (
    <GradeFilmes>
      {filmes.map((filme) => (
        <CartaoFilme key={filme.id} filme={filme} />
      ))}
    </GradeFilmes>
  );
}
