import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CHAVE, SUPABASE_URL } from "./config";

let cliente: SupabaseClient | undefined;

/** Só chame com o Supabase configurado. */
export function clienteNavegador(): SupabaseClient {
  cliente ??= createBrowserClient(SUPABASE_URL, SUPABASE_CHAVE);
  return cliente;
}
