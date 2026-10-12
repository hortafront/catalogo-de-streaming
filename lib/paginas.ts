import type { Filme, PaginaFilmes } from "@/lib/tipos";

/**
 * O TMDB pode repetir um filme em páginas vizinhas quando a popularidade muda
 * entre duas chamadas. A grade usa o id como chave, então a repetição sai aqui.
 */
export function juntarPaginas(paginas: PaginaFilmes[] | undefined): Filme[] {
  const vistos = new Set<number>();
  const filmes: Filme[] = [];
  for (const pagina of paginas ?? []) {
    for (const filme of pagina.filmes) {
      if (!vistos.has(filme.id)) {
        vistos.add(filme.id);
        filmes.push(filme);
      }
    }
  }
  return filmes;
}
