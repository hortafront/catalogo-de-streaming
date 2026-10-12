export interface TmdbFilme {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  vote_count: number;
}

export interface TmdbPagina {
  page: number;
  results: TmdbFilme[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenero {
  id: number;
  name: string;
}

export interface TmdbServico {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
  display_priorities?: Record<string, number>;
}

export interface TmdbOndeAssistir {
  link?: string;
  flatrate?: TmdbServico[];
  free?: TmdbServico[];
  ads?: TmdbServico[];
  rent?: TmdbServico[];
  buy?: TmdbServico[];
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  iso_639_1: string;
}

export interface TmdbElenco {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbDetalhe extends TmdbFilme {
  overview: string | null;
  backdrop_path: string | null;
  runtime: number | null;
  genres: TmdbGenero[];
  credits?: { cast: TmdbElenco[] };
  videos?: { results: TmdbVideo[] };
  "watch/providers"?: { results: Record<string, TmdbOndeAssistir> };
}
