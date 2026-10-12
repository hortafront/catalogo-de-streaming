import { respostaErro, respostaErroTmdb, respostaJson } from "@/lib/api/resposta";
import { UMA_HORA } from "@/lib/config";
import { analisarPagina } from "@/lib/filtros/filtros";
import { buscarFilmes } from "@/lib/tmdb/consultas";

const TAMANHO_MAX = 100;

export async function GET(requisicao: Request) {
  const params = new URL(requisicao.url).searchParams;
  const q = (params.get("q") ?? "").trim();
  if (q.length === 0 || q.length > TAMANHO_MAX) {
    return respostaErro(400, 'Parâmetro "q" inválido.');
  }
  const { pagina, erro } = analisarPagina(params);
  if (erro) return respostaErro(400, erro);

  try {
    return respostaJson(await buscarFilmes(q, pagina), UMA_HORA);
  } catch (causa) {
    return respostaErroTmdb(causa);
  }
}
