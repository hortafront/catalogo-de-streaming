"use client";

import { useId, useRef } from "react";
import { useFiltros } from "@/hooks/useFiltros";
import { ControlesFiltros } from "./ControlesFiltros";

export function BarraFiltros() {
  const { ativos } = useFiltros();
  const painel = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  return (
    <section aria-label="Filtros" className="mb-6">
      <div className="hidden rounded-2xl border border-borda bg-superficie p-6 md:block">
        <ControlesFiltros />
      </div>

      <button
        type="button"
        onClick={() => painel.current?.showModal()}
        className="rounded-full border border-borda-forte bg-superficie px-4 py-2 font-medium md:hidden"
      >
        Filtros{ativos > 0 && ` (${ativos})`}
      </button>

      {/* showModal() já prende o foco, fecha com Esc e devolve o foco ao botão. */}
      <dialog
        ref={painel}
        aria-labelledby={idTitulo}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-fundo p-4 text-texto backdrop:bg-black/50"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={idTitulo} className="text-xl font-bold">
            Filtros
          </h2>
          <button
            type="button"
            onClick={() => painel.current?.close()}
            className="rounded-full border border-borda-forte px-4 py-2 font-medium"
          >
            Fechar
          </button>
        </div>
        <ControlesFiltros />
        <button
          type="button"
          onClick={() => painel.current?.close()}
          className="mt-6 w-full rounded-full bg-destaque px-4 py-3 font-medium text-sobre-destaque"
        >
          Ver resultados
        </button>
      </dialog>
    </section>
  );
}
