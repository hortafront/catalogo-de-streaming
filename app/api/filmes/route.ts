import { respostaErro, respostaErroTmdb, respostaJson } from "@/lib/api/resposta";
import { UMA_HORA } from "@/lib/config";
import { analisarFiltros, analisarPagina } from "@/lib/filtros/filtros";
import { listarFilmes } from "@/lib/tmdb/consultas";

export async function GET(requisicao: Request) {
  const params = new URL(requisicao.url).searchParams;
  const { filtros, erros } = analisarFiltros(params);
  const { pagina, erro } = analisarPagina(params);
  const primeiroErro = erros[0] ?? erro;
  if (primeiroErro) return respostaErro(400, primeiroErro);

  try {
    return respostaJson(await listarFilmes(filtros, pagina), UMA_HORA);
  } catch (causa) {
    return respostaErroTmdb(causa);
  }
}
