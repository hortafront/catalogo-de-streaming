import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_CHAVE,
  SUPABASE_URL,
  supabaseConfigurado,
} from "@/lib/supabase/config";

// Renova o token da sessão a cada requisição. Não bloqueia nenhuma rota.
export async function proxy(request: NextRequest) {
  if (!supabaseConfigurado) return NextResponse.next();

  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_CHAVE, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(novos, cabecalhos) {
        novos.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        novos.forEach(({ name, value, options }) =>
          resposta.cookies.set(name, value, options),
        );
        Object.entries(cabecalhos).forEach(([nome, valor]) =>
          resposta.headers.set(nome, valor),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return resposta;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
