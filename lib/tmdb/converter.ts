import { MAX_PAGINA, REGIAO } from "@/lib/config";
import { TIPOS } from "@/lib/filtros/filtros";
import type {
  Filme,
  FilmeDetalhe,
  OndeAssistir,
  PaginaFilmes,
  Servico,
} from "@/lib/tipos";
import type {
  TmdbDetalhe,
  TmdbFilme,
  TmdbPagina,
  TmdbServico,
  TmdbVideo,
} from "./tipos-tmdb";

const TAMANHO_ELENCO = 10;

export function converterFilme(f: TmdbFilme): Filme {
  const ano = f.release_date ? Number(f.release_date.slice(0, 4)) : NaN;
  return {
    id: f.id,
    titulo: f.title,
    poster: f.poster_path,
    ano: Number.isInteger(ano) && ano > 0 ? ano : null,
    nota: f.vote_count > 0 ? Math.round(f.vote_average * 10) / 10 : null,
  };
}

export function converterPagina(p: TmdbPagina): PaginaFilmes {
  return {
    pagina: p.page,
    totalPaginas: Math.min(p.total_pages, MAX_PAGINA),
    total: p.total_results,
    filmes: p.results.map(converterFilme),
  };
}

export function converterServico(s: TmdbServico): Servico {
  return { id: s.provider_id, nome: s.provider_name, logo: s.logo_path };
}

function prioridade(s: TmdbServico): number {
  return s.display_priorities?.[REGIAO] ?? s.display_priority ?? 9999;
}

export function ordenarServicos(lista: TmdbServico[]): Servico[] {
  return [...lista]
    .sort((a, b) => prioridade(a) - prioridade(b))
    .map(converterServico);
}

function escolherTrailer(videos: TmdbVideo[]): string | null {
  const youtube = videos.filter((v) => v.site === "YouTube");
  const candidatos = [
    ...youtube.filter((v) => v.type === "Trailer" && v.iso_639_1 === "pt"),
    ...youtube.filter((v) => v.type === "Trailer"),
    ...youtube.filter((v) => v.type === "Teaser"),
  ];
  return candidatos[0]?.key ?? null;
}

export function converterDetalhe(d: TmdbDetalhe): FilmeDetalhe {
  const regional = d["watch/providers"]?.results[REGIAO];
  const ondeAssistir = Object.fromEntries(
    TIPOS.map((tipo) => [tipo, ordenarServicos(regional?.[tipo] ?? [])]),
  ) as OndeAssistir;

  const elenco = [...(d.credits?.cast ?? [])]
    .sort((a, b) => a.order - b.order)
    .slice(0, TAMANHO_ELENCO)
    .map((p) => ({
      id: p.id,
      nome: p.name,
      personagem: p.character,
      foto: p.profile_path,
    }));

  return {
    ...converterFilme(d),
    sinopse: d.overview ?? "",
    fundo: d.backdrop_path,
    generos: d.genres.map((g) => ({ id: g.id, nome: g.name })),
    duracao: d.runtime && d.runtime > 0 ? d.runtime : null,
    elenco,
    trailer: escolherTrailer(d.videos?.results ?? []),
    ondeAssistir,
    linkOpcoes: regional?.link ?? null,
  };
}
