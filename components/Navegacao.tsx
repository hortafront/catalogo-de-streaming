"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGINAS = [
  { href: "/", nome: "Início" },
  { href: "/explorar", nome: "Explorar" },
];

function Itens({ rota }: { rota: string | null }) {
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
