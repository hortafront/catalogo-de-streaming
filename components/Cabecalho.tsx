import Link from "next/link";
import { Suspense } from "react";
import { BotaoTema } from "./BotaoTema";
import { CampoBusca } from "./CampoBusca";
import { MenuConta } from "./MenuConta";
import { Navegacao, NavegacaoSemRota } from "./Navegacao";

export function Cabecalho() {
  return (
    <header className="z-40 bg-fundo/85 backdrop-blur-md md:sticky md:top-0">
      <div className="faixa flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <Link href="/" className="cartaz text-2xl leading-none text-destaque">
          Catálogo de Streaming
        </Link>
        <div className="order-2 ml-auto flex items-center gap-1 md:order-4 md:ml-0">
          <Suspense fallback={<div className="w-16" />}>
            <MenuConta />
          </Suspense>
          <BotaoTema />
        </div>
        <div className="order-3 w-full md:order-2 md:w-auto">
          {/* Na página de um filme o endereço só existe na requisição. */}
          <Suspense fallback={<NavegacaoSemRota />}>
            <Navegacao />
          </Suspense>
        </div>
        <div className="order-4 flex w-full md:order-3 md:ml-auto md:w-72">
          <CampoBusca />
        </div>
      </div>
    </header>
  );
}
