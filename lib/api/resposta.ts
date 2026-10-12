import { NextResponse } from "next/server";
import { ErroConfiguracao, ErroTmdb } from "@/lib/tmdb/cliente";

/** Resposta de sucesso, com cache na CDN pelo tempo indicado. */
export function respostaJson(dados: unknown, segundos: number) {
  return NextResponse.json(dados, {
    headers: {
      "Cache-Control": `public, s-maxage=${segundos}, stale-while-revalidate=${segundos}`,
    },
  });
}

export function respostaErro(status: number, erro: string) {
  return NextResponse.json({ erro }, { status });
}

export function respostaErroTmdb(causa: unknown) {
  if (causa instanceof ErroTmdb && causa.status === 404) {
    return respostaErro(404, "Filme não encontrado.");
  }
  console.error(causa);
  if (causa instanceof ErroConfiguracao) {
    return respostaErro(500, "O servidor está sem a chave do TMDB.");
  }
  return respostaErro(
    502,
    "O TMDB está indisponível no momento. Tente de novo em instantes.",
  );
}
