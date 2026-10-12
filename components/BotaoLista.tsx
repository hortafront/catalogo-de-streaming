"use client";

import { useMinhaLista } from "@/hooks/useMinhaLista";
import type { Filme } from "@/lib/tipos";

export function BotaoLista({
  filme,
  comTexto = false,
  sobreImagem = false,
}: {
  filme: Filme;
  comTexto?: boolean;
  /** Para o botão com texto dentro do Palco, sobre a cena do filme. */
  sobreImagem?: boolean;
}) {
  const { tem, alternar } = useMinhaLista();
  const salvo = tem(filme.id);
  const rotulo = salvo
    ? `Remover ${filme.titulo} da minha lista`
    : `Adicionar ${filme.titulo} à minha lista`;

  return (
    <button
      type="button"
      onClick={() => alternar(filme)}
      aria-pressed={salvo}
      aria-label={rotulo}
      title={rotulo}
      className={
        !comTexto
          ? // Sem texto ele fica sempre em cima de um pôster.
            "grid size-9 place-items-center rounded-full border border-tela/25 bg-sala/70 text-tela backdrop-blur-sm"
          : sobreImagem
            ? "inline-flex items-center gap-2 rounded-full border border-tela/30 bg-tela/15 px-6 py-3 font-semibold text-tela backdrop-blur-sm"
            : "inline-flex items-center gap-2 rounded-full border border-borda-forte bg-superficie px-4 py-2 font-medium"
      }
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <path
          d="M6 3h12v18l-6-4-6 4z"
          fill={salvo ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {comTexto && <span>{salvo ? "Na minha lista" : "Quero ver"}</span>}
    </button>
  );
}
