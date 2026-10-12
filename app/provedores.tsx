"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

function criarCliente() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let clienteDoNavegador: QueryClient | undefined;

function obterCliente() {
  // No servidor, um cliente por renderização; no navegador, sempre o mesmo.
  if (typeof window === "undefined") return criarCliente();
  clienteDoNavegador ??= criarCliente();
  return clienteDoNavegador;
}

export function Provedores({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={obterCliente()}>{children}</QueryClientProvider>
  );
}
