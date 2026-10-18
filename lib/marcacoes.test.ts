import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  aplicar,
  deLinha,
  desfazer,
  filtrar,
  type Marcacao,
} from "./marcacoes";

const matrix = { id: 603, titulo: "Matrix", poster: "/m.jpg", ano: 1999, nota: 8.2 };
const duna = { id: 438631, titulo: "Duna", poster: null, ano: null, nota: null };

describe("deLinha", () => {
  it("converte nota numeric em texto para número", () => {
    expect(
      deLinha({ filme_id: 603, estado: "assistido", titulo: "Matrix", poster: null, ano: null, nota: "8.2" }),
    ).toEqual({
      estado: "assistido",
      filme: { id: 603, titulo: "Matrix", poster: null, ano: null, nota: 8.2 },
    });
  });
  it("mantém nota nula", () => {
    expect(
      deLinha({ filme_id: 1, estado: "quero_assistir", titulo: "X", poster: null, ano: null, nota: null }).filme.nota,
    ).toBeNull();
  });
});

describe("aplicar", () => {
  const lista: Marcacao[] = [{ filme: duna, estado: "quero_assistir" }];

  it("marcar põe o filme no começo", () => {
    expect(aplicar(lista, { tipo: "marcar", filme: matrix, estado: "assistido" })).toEqual([
      { filme: matrix, estado: "assistido" },
      { filme: duna, estado: "quero_assistir" },
    ]);
  });
  it("trocar de lista não duplica", () => {
    expect(aplicar(lista, { tipo: "marcar", filme: duna, estado: "assistido" })).toEqual([
      { filme: duna, estado: "assistido" },
    ]);
  });
  it("desmarcar tira o filme", () => {
    expect(aplicar(lista, { tipo: "desmarcar", id: duna.id })).toEqual([]);
  });
  it("guarda só os campos de Filme", () => {
    const detalhe = { ...matrix, sinopse: "...", elenco: [] };
    expect(aplicar([], { tipo: "marcar", filme: detalhe, estado: "assistido" })[0].filme).toEqual(matrix);
  });
});

describe("filtrar", () => {
  it("separa por estado mantendo a ordem", () => {
    const lista: Marcacao[] = [
      { filme: matrix, estado: "assistido" },
      { filme: duna, estado: "quero_assistir" },
    ];
    expect(filtrar(lista, "quero_assistir")).toEqual([duna]);
    expect(filtrar(lista, "assistido")).toEqual([matrix]);
  });
});

describe("desfazer", () => {
  const chave = ["marcacoes", "u1"];

  it("volta para a lista anterior", () => {
    const cliente = new QueryClient();
    const anterior: Marcacao[] = [{ filme: duna, estado: "quero_assistir" }];
    cliente.setQueryData(chave, [{ filme: matrix, estado: "assistido" }]);
    desfazer(cliente, chave, anterior);
    expect(cliente.getQueryData(chave)).toEqual(anterior);
  });

  it("tira a marcação otimista quando a lista nunca carregou", () => {
    const cliente = new QueryClient();
    cliente.setQueryData(chave, [{ filme: matrix, estado: "quero_assistir" }]);
    desfazer(cliente, chave, undefined);
    expect(cliente.getQueryData(chave)).toBeUndefined();
  });
});
