import { respostaErro, respostaErroTmdb, respostaJson } from "@/lib/api/resposta";
import { UMA_HORA } from "@/lib/config";
import { obterFilme } from "@/lib/tmdb/consultas";

export async function GET(
  _requisicao: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) return respostaErro(400, "Id de filme inválido.");

  try {
    return respostaJson(await obterFilme(Number(id)), UMA_HORA);
  } catch (causa) {
    return respostaErroTmdb(causa);
  }
}
