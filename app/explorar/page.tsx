import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogo } from "@/components/Catalogo";
import { EsqueletosFilmes } from "@/components/GradeFilmes";
import { Palco } from "@/components/Palco";
import { ParedePosteres } from "@/components/ParedePosteres";

export const metadata: Metadata = { title: "Explorar" };

export default function PaginaExplorar() {
  return (
    <>
      <div className="mb-6">
        <Palco tamanho="baixo" cenario={<ParedePosteres />}>
          <h1 className="cartaz text-4xl leading-none sm:text-5xl lg:text-6xl">
            Explorar o catálogo
          </h1>
          <p className="mt-3 max-w-md text-lg text-tela/90">
            Filtre por serviço, gênero, ano e nota até achar o filme de hoje.
          </p>
        </Palco>
      </div>
      {/* O catálogo lê os filtros da URL, que só existe na requisição. */}
      <Suspense fallback={<EsqueletosFilmes />}>
        <Catalogo />
      </Suspense>
    </>
  );
}
