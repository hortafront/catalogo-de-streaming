"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, Suspense, use, useEffect, type ReactNode } from "react";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { clienteNavegador } from "@/lib/supabase/navegador";
import type { Usuario } from "@/lib/supabase/sessao";

const Contexto = createContext<Promise<Usuario | null> | null>(null);

/** Precisa de um <Suspense> acima: o usuário chega do servidor numa promise. */
export function useSessao(): {
  usuario: Usuario | null;
  configurado: boolean;
} {
  const promessa = use(Contexto);
  if (!promessa) throw new Error("useSessao precisa do ProvedorSessao");
  return { usuario: use(promessa), configurado: supabaseConfigurado };
}

// A fonte da verdade é o servidor. Quando a sessão muda no navegador (expirou,
// saiu em outra aba), o refresh pede ao layout um usuário novo.
function Vigia() {
  const { usuario } = useSessao();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = usuario?.id ?? null;

  useEffect(() => {
    if (!supabaseConfigurado) return;
    const { data } = clienteNavegador().auth.onAuthStateChange(
      (evento, sessao) => {
        // A sessão inicial é a mesma que o servidor já leu dos cookies.
        if (evento === "INITIAL_SESSION") return;
        if ((sessao?.user.id ?? null) !== id) router.refresh();
      },
    );
    return () => data.subscription.unsubscribe();
  }, [id, router]);

  useEffect(() => {
    if (id === null) queryClient.removeQueries({ queryKey: ["marcacoes"] });
  }, [id, queryClient]);

  return null;
}

export function ProvedorSessao({
  usuario,
  children,
}: {
  usuario: Promise<Usuario | null>;
  children: ReactNode;
}) {
  return (
    <Contexto value={usuario}>
      <Suspense fallback={null}>
        <Vigia />
      </Suspense>
      {children}
    </Contexto>
  );
}
