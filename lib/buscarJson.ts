export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroApi";
  }
}

const MENSAGEM_PADRAO = "Não foi possível carregar os dados.";

export async function buscarJson<T>(url: string, sinal?: AbortSignal): Promise<T> {
  const resposta = await fetch(url, { signal: sinal });
  if (!resposta.ok) {
    let mensagem = MENSAGEM_PADRAO;
    try {
      const corpo: unknown = await resposta.json();
      if (
        typeof corpo === "object" &&
        corpo !== null &&
        "erro" in corpo &&
        typeof corpo.erro === "string"
      ) {
        mensagem = corpo.erro;
      }
    } catch {
      // corpo sem JSON: fica a mensagem padrão
    }
    throw new ErroApi(resposta.status, mensagem);
  }
  return (await resposta.json()) as T;
}
