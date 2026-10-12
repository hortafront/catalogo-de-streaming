import { connection } from "next/server";
import { respostaErroTmdb, respostaJson } from "@/lib/api/resposta";
import { UM_DIA } from "@/lib/config";
import { listarServicos } from "@/lib/tmdb/consultas";

export async function GET() {
  // Responde a cada requisição: sem isto o build tentaria gerar a resposta
  // sem a chave do TMDB.
  await connection();
  try {
    return respostaJson(await listarServicos(), UM_DIA);
  } catch (causa) {
    return respostaErroTmdb(causa);
  }
}
