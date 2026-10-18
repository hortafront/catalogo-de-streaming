import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_CHAVE, SUPABASE_URL } from "./config";

export async function criarClienteServidor(): Promise<SupabaseClient> {
  const loja = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_CHAVE, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll(novos) {
        try {
          novos.forEach(({ name, value, options }) =>
            loja.set(name, value, options),
          );
        } catch {
          // Server Components não gravam cookies; quem renova a sessão é o
          // proxy.ts.
        }
      },
    },
  });
}
