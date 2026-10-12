import type { Metadata } from "next";
import { Suspense } from "react";
import { EsqueletosFilmes } from "@/components/GradeFilmes";
import { ResultadoBusca } from "@/components/ResultadoBusca";

type Props = PageProps<"/busca">;

async function lerConsulta(searchParams: Props["searchParams"]): Promise<string> {
  const { q } = await searchParams;
  const texto = Array.isArray(q) ? q[0] : q;
  return (texto ?? "").trim().slice(0, 100);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = await lerConsulta(searchParams);
  return { title: q ? `Busca: ${q}` : "Busca" };
}

async function Conteudo({ searchParams }: Pick<Props, "searchParams">) {
  const q = await lerConsulta(searchParams);
  if (!q) {
    return (
      <>
        <h1 className="cartaz mt-4 text-4xl leading-none sm:text-5xl">Busca</h1>
        <p className="mt-2 text-texto-suave">
          Digite o nome de um filme no campo de busca acima.
        </p>
      </>
    );
  }
  return <ResultadoBusca key={q} q={q} />;
}

export default function PaginaBusca({ searchParams }: Props) {
  return (
    <Suspense fallback={<EsqueletosFilmes />}>
      <Conteudo searchParams={searchParams} />
    </Suspense>
  );
}
