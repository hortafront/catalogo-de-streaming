import type { Metadata } from "next";
import { ListaSalva } from "@/components/ListaSalva";

export const metadata: Metadata = { title: "Minha lista" };

export default function PaginaMinhaLista() {
  return (
    <>
      <h1 className="text-2xl font-bold">Minha lista</h1>
      <p className="mb-6 mt-1 text-sm text-texto-suave">
        A lista fica guardada só neste navegador. Ela não aparece em outros
        aparelhos e some se os dados do site forem apagados.
      </p>
      <ListaSalva />
    </>
  );
}
