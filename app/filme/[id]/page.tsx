import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetalheFilme, EsqueletoDetalhe } from "@/components/DetalheFilme";
import { obterFilme } from "@/lib/tmdb/consultas";

type Props = PageProps<"/filme/[id]">;

const ID_VALIDO = /^\d{1,9}$/;

// O título da aba vem do servidor, pela mesma consulta em cache que a rota de
// API usa.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!ID_VALIDO.test(id)) return { title: "Filme não encontrado" };
  try {
    const filme = await obterFilme(Number(id));
    return {
      title: filme.titulo,
      description: filme.sinopse.slice(0, 160) || undefined,
    };
  } catch {
    return { title: "Filme" };
  }
}

async function Conteudo({ params }: Pick<Props, "params">) {
  const { id } = await params;
  if (!ID_VALIDO.test(id)) notFound();
  return <DetalheFilme id={Number(id)} />;
}

export default function PaginaFilme({ params }: Props) {
  return (
    <Suspense fallback={<EsqueletoDetalhe />}>
      <Conteudo params={params} />
    </Suspense>
  );
}
