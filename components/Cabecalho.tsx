import Link from "next/link";
import { BotaoTema } from "./BotaoTema";
import { CampoBusca } from "./CampoBusca";
import { ContadorLista } from "./ContadorLista";

export function Cabecalho() {
  return (
    <header className="border-b border-borda">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Catálogo de Streaming
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:order-last sm:ml-0">
          <ContadorLista />
          <BotaoTema />
        </div>
        <div className="flex w-full sm:w-auto sm:flex-1 sm:px-4">
          <CampoBusca />
        </div>
      </div>
    </header>
  );
}
