import { describe, expect, it } from "vitest";
import { mensagemErroAuth } from "./mensagens";

describe("mensagemErroAuth", () => {
  it.each([
    ["invalid_credentials", "Email ou senha incorretos."],
    ["user_already_exists", "Esse email já tem conta."],
    ["email_exists", "Esse email já tem conta."],
    ["weak_password", "A senha precisa ter pelo menos 6 caracteres."],
    ["outra_coisa", "Não foi possível entrar agora. Tente de novo."],
  ])("%s", (code, texto) => expect(mensagemErroAuth({ code })).toBe(texto));

  it("sem código", () => {
    expect(mensagemErroAuth(null)).toBe(
      "Não foi possível entrar agora. Tente de novo.",
    );
  });
});
