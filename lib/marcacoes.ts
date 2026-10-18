import type { Filme } from "./tipos";

export type Estado = "quero_assistir" | "assistido";

export type Marcacao = { filme: Filme; estado: Estado };

/** Uma linha de `filmes_marcados`, só com as colunas que o app lê. */
export type Linha = {
  filme_id: number;
  estado: Estado;
  titulo: string;
  poster: string | null;
  ano: number | null;
  nota: number | string | null;
};

export type Alteracao =
  | { tipo: "marcar"; filme: Filme; estado: Estado }
  | { tipo: "desmarcar"; id: number };

export function deLinha(linha: Linha): Marcacao {
  return {
    estado: linha.estado,
    filme: {
      id: linha.filme_id,
      titulo: linha.titulo,
      poster: linha.poster,
      ano: linha.ano,
      // O PostgREST pode devolver numeric como texto.
      nota: linha.nota === null ? null : Number(linha.nota),
    },
  };
}

/** A lista depois da alteração, com o filme marcado no começo. */
export function aplicar(lista: Marcacao[], alteracao: Alteracao): Marcacao[] {
  const id = alteracao.tipo === "marcar" ? alteracao.filme.id : alteracao.id;
  const resto = lista.filter((item) => item.filme.id !== id);
  if (alteracao.tipo === "desmarcar") return resto;
  // FilmeDetalhe traz campos a mais; a lista guarda só os de Filme.
  const { titulo, poster, ano, nota } = alteracao.filme;
  return [
    { filme: { id, titulo, poster, ano, nota }, estado: alteracao.estado },
    ...resto,
  ];
}

export function filtrar(lista: Marcacao[], estado: Estado): Filme[] {
  return lista.filter((item) => item.estado === estado).map((item) => item.filme);
}
