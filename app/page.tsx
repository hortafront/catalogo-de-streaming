import { Suspense } from "react";
import { Catalogo } from "@/components/Catalogo";
import { EsqueletosFilmes } from "@/components/GradeFilmes";

export default function Pagina() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Filmes no streaming</h1>
      {/* O catálogo lê os filtros da URL, que só existe na requisição. */}
      <Suspense fallback={<EsqueletosFilmes />}>
        <Catalogo />
      </Suspense>
    </>
  );
}
