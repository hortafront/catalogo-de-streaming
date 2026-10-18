// Os nomes ficam escritos por extenso: só assim o Next troca o valor no bundle
// do navegador.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_CHAVE =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseConfigurado = SUPABASE_URL !== "" && SUPABASE_CHAVE !== "";
