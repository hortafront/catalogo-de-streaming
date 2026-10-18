import "server-only";
import { cache } from "react";
import { supabaseConfigurado } from "./config";
import { criarClienteServidor } from "./servidor";

export type Usuario = { id: string; email: string };

export const obterUsuario = cache(async (): Promise<Usuario | null> => {
  if (!supabaseConfigurado) return null;
  try {
    const supabase = await criarClienteServidor();
    const { data } = await supabase.auth.getUser();
    return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
  } catch {
    return null;
  }
});
