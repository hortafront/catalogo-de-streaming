export const REGIAO = "BR";
export const IDIOMA = "pt-BR";
export const MIN_VOTOS = 200;
export const MAX_PAGINA = 500;

export const UMA_HORA = 60 * 60;
export const UM_DIA = 24 * UMA_HORA;

export type TamanhoImagem = "w92" | "w185" | "w342" | "w500" | "w1280";

export function urlImagem(
  caminho: string | null,
  tamanho: TamanhoImagem,
): string | null {
  return caminho ? `https://image.tmdb.org/t/p/${tamanho}${caminho}` : null;
}
