"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";
import { useMarcacoes } from "@/hooks/useMarcacoes";
import { ABAS, type Aba } from "@/lib/abas";
import { useSessao } from "./ProvedorSessao";

const NOMES: Record<Aba, string> = {
  catalogo: "Catálogo",
  "quero-assistir": "Quero assistir",
  assistidos: "Já assisti",
};

export function AbasInicio({ atual }: { atual: Aba }) {
  const { usuario } = useSessao();
  const { queroAssistir, assistidos, carregando } = useMarcacoes();
  const abas = useRef<(HTMLAnchorElement | null)[]>([]);
  const contagem: Partial<Record<Aba, number>> =
    usuario && !carregando
      ? { "quero-assistir": queroAssistir.length, assistidos: assistidos.length }
      : {};

  // As setas só movem o foco; quem troca de aba é o Enter, que segue o link.
  function teclar(evento: KeyboardEvent, indice: number) {
    const ultimo = ABAS.length - 1;
    const destino = {
      ArrowRight: indice === ultimo ? 0 : indice + 1,
      ArrowLeft: indice === 0 ? ultimo : indice - 1,
      Home: 0,
      End: ultimo,
    }[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    abas.current[destino]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Seções do início"
      className="sem-barra mb-6 flex gap-1 overflow-x-auto"
    >
      {ABAS.map((aba, indice) => {
        const ativa = aba === atual;
        const total = contagem[aba];
        return (
          <Link
            key={aba}
            ref={(elemento) => {
              abas.current[indice] = elemento;
            }}
            id={`aba-${aba}`}
            role="tab"
            aria-selected={ativa}
            aria-controls="painel-inicio"
            tabIndex={ativa ? 0 : -1}
            href={aba === "catalogo" ? "/" : `/?aba=${aba}`}
            scroll={false}
            onKeyDown={(evento) => teclar(evento, indice)}
            className={`block whitespace-nowrap rounded-full px-4 py-2 font-medium ${
              ativa
                ? "bg-texto/15 text-texto"
                : "text-texto-suave hover:text-texto"
            }`}
          >
            {NOMES[aba]}
            {total !== undefined && ` (${total})`}
          </Link>
        );
      })}
    </div>
  );
}
