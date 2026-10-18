"use client";

import { useSyncExternalStore } from "react";

const DURACAO = 4000;

// Fora do React para qualquer componente poder avisar sem um provedor.
let atual: string | null = null;
let temporizador: ReturnType<typeof setTimeout> | undefined;
const ouvintes = new Set<() => void>();

function mudar(texto: string | null) {
  atual = texto;
  ouvintes.forEach((avisar) => avisar());
}

export function avisar(texto: string): void {
  clearTimeout(temporizador);
  mudar(texto);
  temporizador = setTimeout(() => mudar(null), DURACAO);
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

export function useAviso(): string | null {
  return useSyncExternalStore(
    assinar,
    () => atual,
    () => null,
  );
}
