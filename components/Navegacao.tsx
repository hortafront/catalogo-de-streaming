"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMinhaLista } from "@/hooks/useMinhaLista";

const PAGINAS = [
  { href: "/", nome: "Início" },
  { href: "/explorar", nome: "Explorar" },
  { href: "/minha-lista", nome: "Minha lista" },
];

function Itens({ rota }: { rota: string | null }) {
  const { lista } = useMinhaLista();

  return (
    <nav aria-label="Principal">
      <ul className="sem-barra flex gap-1 overflow-x-auto">
        {PAGINAS.map(({ href, nome }) => {
          const atual = rota === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={atual ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full px-4 py-2 font-medium ${
                  atual
                    ? "bg-texto/15 text-texto"
                    : "text-texto-suave hover:text-texto"
                }`}
              >
                {nome}
                {href === "/minha-lista" && lista.length > 0 && (
                  <span className="ml-2 rounded-full bg-destaque px-2 py-0.5 text-sm text-sobre-destaque">
                    {lista.length}
                    <span className="sr-only"> filmes salvos</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Navegacao() {
  return <Itens rota={usePathname()} />;
}

export function NavegacaoSemRota() {
  return <Itens rota={null} />;
}
