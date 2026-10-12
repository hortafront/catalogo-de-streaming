"use client";

import { useLayoutEffect } from "react";

const CHAVE = "catalogo:tema";

type Tema = "claro" | "escuro";

function temaSalvo(): Tema | null {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo === "claro" || salvo === "escuro" ? salvo : null;
  } catch {
    return null;
  }
}

function temaAtual(): Tema {
  const definido = document.documentElement.dataset.theme;
  if (definido === "claro" || definido === "escuro") return definido;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "escuro"
    : "claro";
}

function alternarTema() {
  const novo: Tema = temaAtual() === "escuro" ? "claro" : "escuro";
  document.documentElement.dataset.theme = novo;
  try {
    localStorage.setItem(CHAVE, novo);
  } catch {
    // sem armazenamento: o tema vale só até recarregar
  }
}

export function BotaoTema() {
  // Em desenvolvimento, o Strict Mode remonta a árvore e apaga o atributo que o
  // script do <head> pôs no <html>. Em produção isto não muda nada.
  useLayoutEffect(() => {
    const salvo = temaSalvo();
    if (salvo) document.documentElement.dataset.theme = salvo;
  }, []);

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label="Alternar entre tema claro e escuro"
      className="grid size-10 place-items-center rounded-full border border-borda-forte hover:bg-superficie"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  );
}
