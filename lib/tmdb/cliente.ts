import "server-only";

const BASE = "https://api.themoviedb.org/3";

export class ErroTmdb extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroTmdb";
  }
}

export class ErroConfiguracao extends Error {
  constructor() {
    super("A variável de ambiente TMDB_API_TOKEN não está definida.");
    this.name = "ErroConfiguracao";
  }
}

export function exigirToken(): string {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new ErroConfiguracao();
  return token;
}

export async function tmdb<T>(
  caminho: string,
  params: Record<string, string>,
): Promise<T> {
  const token = exigirToken();
  const url = `${BASE}/${caminho}?${new URLSearchParams(params)}`;
  let resposta: Response;
  try {
    resposta = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
  } catch {
    throw new ErroTmdb(502, "Não foi possível contatar o TMDB.");
  }
  if (!resposta.ok) {
    throw new ErroTmdb(resposta.status, `O TMDB respondeu ${resposta.status}.`);
  }
  try {
    return (await resposta.json()) as T;
  } catch {
    throw new ErroTmdb(502, "O TMDB devolveu uma resposta ilegível.");
  }
}
