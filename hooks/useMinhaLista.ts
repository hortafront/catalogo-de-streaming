"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Filme } from "@/lib/tipos";

const CHAVE = "catalogo:minha-lista";
const VAZIA: Filme[] = [];

// O estado fica fora do React para todos os componentes verem a mesma lista.
// Se o localStorage falhar, a lista continua funcionando na memória.
let cache: Filme[] = VAZIA;
let cacheBruto: string | null = null;
const ouvintes = new Set<() => void>();

function ehFilme(valor: unknown): valor is Filme {
  if (typeof valor !== "object" || valor === null) return false;
  const v = valor as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.titulo === "string" &&
    (typeof v.poster === "string" || v.poster === null) &&
    (typeof v.ano === "number" || v.ano === null) &&
    (typeof v.nota === "number" || v.nota === null)
  );
}

function interpretar(bruto: string | null): Filme[] {
  if (!bruto) return VAZIA;
  try {
    const dados: unknown = JSON.parse(bruto);
    return Array.isArray(dados) ? dados.filter(ehFilme) : VAZIA;
  } catch {
    return VAZIA;
  }
}

function ler(): Filme[] {
  let bruto: string | null;
  try {
    bruto = localStorage.getItem(CHAVE);
  } catch {
    return cache;
  }
  if (bruto !== cacheBruto) {
    cacheBruto = bruto;
    cache = interpretar(bruto);
  }
  return cache;
}

function gravar(lista: Filme[]) {
  cache = lista;
  try {
    const bruto = JSON.stringify(lista);
    localStorage.setItem(CHAVE, bruto);
    cacheBruto = bruto;
  } catch {
    // armazenamento indisponível: a lista vale só até fechar a aba
  }
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  window.addEventListener("storage", avisar);
  return () => {
    ouvintes.delete(avisar);
    window.removeEventListener("storage", avisar);
  };
}

function lerNoServidor(): Filme[] {
  return VAZIA;
}

export function useMinhaLista() {
  const lista = useSyncExternalStore(assinar, ler, lerNoServidor);

  const tem = useCallback(
    (id: number) => lista.some((filme) => filme.id === id),
    [lista],
  );

  const remover = useCallback((id: number) => {
    gravar(ler().filter((filme) => filme.id !== id));
  }, []);

  const alternar = useCallback((filme: Filme) => {
    const atual = ler();
    if (atual.some((item) => item.id === filme.id)) {
      gravar(atual.filter((item) => item.id !== filme.id));
      return;
    }
    const { id, titulo, poster, ano, nota } = filme;
    gravar([{ id, titulo, poster, ano, nota }, ...atual]);
  }, []);

  return { lista, tem, alternar, remover };
}
