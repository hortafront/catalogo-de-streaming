export type TipoDisponibilidade = "flatrate" | "free" | "ads" | "rent" | "buy";
export type Ordem = "popularidade" | "lancamento" | "nota";

export interface Filme {
  id: number;
  titulo: string;
  /** Caminho do pôster no TMDB, sem o domínio. */
  poster: string | null;
  ano: number | null;
  /** Nota de 0 a 10 com uma casa decimal; null quando o filme não tem votos. */
  nota: number | null;
}

export interface PaginaFilmes {
  pagina: number;
  totalPaginas: number;
  total: number;
  filmes: Filme[];
}

export interface Servico {
  id: number;
  nome: string;
  logo: string | null;
}

export interface Genero {
  id: number;
  nome: string;
}

export interface Pessoa {
  id: number;
  nome: string;
  personagem: string;
  foto: string | null;
}

export type OndeAssistir = Record<TipoDisponibilidade, Servico[]>;

export interface FilmeDetalhe extends Filme {
  sinopse: string;
  fundo: string | null;
  generos: Genero[];
  /** Duração em minutos. */
  duracao: number | null;
  elenco: Pessoa[];
  /** Chave do vídeo no YouTube. */
  trailer: string | null;
  ondeAssistir: OndeAssistir;
  /** Página do TMDB com todas as opções de exibição no Brasil. */
  linkOpcoes: string | null;
}

export interface Filtros {
  servicos: number[];
  tipo: TipoDisponibilidade;
  generos: number[];
  anoDe: number | null;
  anoAte: number | null;
  notaMin: number;
  ordem: Ordem;
}
