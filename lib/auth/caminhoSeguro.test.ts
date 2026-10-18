import { describe, expect, it } from "vitest";
import { caminhoSeguro, linkEntrar } from "./caminhoSeguro";

describe("caminhoSeguro", () => {
  it.each(["/", "/filme/603", "/?aba=assistidos", "/busca?q=matrix"])(
    "aceita %s",
    (caminho) => expect(caminhoSeguro(caminho)).toBe(caminho),
  );
  it.each([
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "filme/603",
    "",
    null,
    undefined,
  ])("rejeita %s", (caminho) => expect(caminhoSeguro(caminho)).toBe("/"));
});

describe("linkEntrar", () => {
  it("codifica o caminho de volta", () => {
    expect(linkEntrar("/?aba=assistidos")).toBe(
      "/entrar?voltar=%2F%3Faba%3Dassistidos",
    );
  });
});
