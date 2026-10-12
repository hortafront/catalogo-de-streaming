import "server-only";

import { cacheLife } from "next/cache";
import { IDIOMA, MIN_VOTOS, REGIAO } from "@/lib/config";
import type {
  FilmeDetalhe,
  Filtros,
  Genero,
  Ordem,
  PaginaFilmes,
  Servico,
} from "@/lib/tipos";
import { ErroTmdb, exigirToken, tmdb } from "./cliente";
import { converterDetalhe, converterPagina, ordenarServicos } from "./converter";
import type {
  TmdbDetalhe,
  TmdbGenero,
  TmdbPagina,
  TmdbServico,
} from "./tipos-tmdb";

const ORDENACAO: Record<Ordem, string> = {
  popularidade: "popularity.desc",
  lancamento: "primary_release_date.desc",
  nota: "vote_average.desc",
};

// As funções "EmCache" guardam só respostas boas: uma falha do TMDB lança erro
// e não fica no cache. A falta do token é checada fora delas, antes da chamada.

async function paginaEmCache(
  caminho: string,
  params: Record<string, string>,
): Promise<PaginaFilmes> {
  "use cache";
  cacheLife("hours");
  return converterPagina(await tmdb<TmdbPagina>(caminho, params));
}

export async function listarFilmes(
  f: Filtros,
  pagina: number,
): Promise<PaginaFilmes> {
  exigirToken();
  const params: Record<string, string> = {
    language: IDIOMA,
    watch_region: REGIAO,
    with_watch_monetization_types: f.tipo,
    sort_by: ORDENACAO[f.ordem],
    include_adult: "false",
    include_video: "false",
    page: String(pagina),
  };
  if (f.servicos.length > 0) params.with_watch_providers = f.servicos.join("|");
  if (f.generos.length > 0) params.with_genres = f.generos.join(",");
  if (f.anoDe !== null) params["primary_release_date.gte"] = `${f.anoDe}-01-01`;
  if (f.anoAte !== null) params["primary_release_date.lte"] = `${f.anoAte}-12-31`;
  if (f.notaMin > 0) params["vote_average.gte"] = String(f.notaMin);
  if (f.notaMin > 0 || f.ordem === "nota") {
    params["vote_count.gte"] = String(MIN_VOTOS);
  }
  return paginaEmCache("discover/movie", params);
}

export async function buscarFilmes(
  q: string,
  pagina: number,
): Promise<PaginaFilmes> {
  exigirToken();
  return paginaEmCache("search/movie", {
    query: q,
    language: IDIOMA,
    region: REGIAO,
    include_adult: "false",
    page: String(pagina),
  });
}

/** Devolve null quando o filme não existe, para o 404 também ficar no cache. */
async function filmeEmCache(id: number): Promise<FilmeDetalhe | null> {
  "use cache";
  cacheLife("hours");
  try {
    const dados = await tmdb<TmdbDetalhe>(`movie/${id}`, {
      language: IDIOMA,
      append_to_response: "credits,videos,watch/providers",
      include_video_language: "pt,en",
    });
    return converterDetalhe(dados);
  } catch (causa) {
    if (causa instanceof ErroTmdb && causa.status === 404) return null;
    throw causa;
  }
}

export async function obterFilme(id: number): Promise<FilmeDetalhe> {
  exigirToken();
  const filme = await filmeEmCache(id);
  if (filme === null) throw new ErroTmdb(404, "Filme não encontrado.");
  return filme;
}

async function servicosEmCache(): Promise<Servico[]> {
  "use cache";
  cacheLife("days");
  const dados = await tmdb<{ results: TmdbServico[] }>(
    "watch/providers/movie",
    { language: IDIOMA, watch_region: REGIAO },
  );
  return ordenarServicos(dados.results);
}

export async function listarServicos(): Promise<Servico[]> {
  exigirToken();
  return servicosEmCache();
}

async function generosEmCache(): Promise<Genero[]> {
  "use cache";
  cacheLife("days");
  const dados = await tmdb<{ genres: TmdbGenero[] }>("genre/movie/list", {
    language: IDIOMA,
  });
  return dados.genres.map((g) => ({ id: g.id, nome: g.name }));
}

export async function listarGeneros(): Promise<Genero[]> {
  exigirToken();
  return generosEmCache();
}
