import Link from "next/link";
import type { Filme } from "@/lib/tipos";
import { BotaoLista } from "./BotaoLista";
import { Poster } from "./Poster";

export function CartaoFilme({ filme }: { filme: Filme }) {
  return (
    <li className="relative">
      <Link href={`/filme/${filme.id}`} className="group block rounded-lg">
        <Poster caminho={filme.poster} titulo={filme.titulo} />
        <h3 className="mt-2 line-clamp-2 font-medium group-hover:underline">
          {filme.titulo}
        </h3>
        <p className="text-sm text-texto-suave">
          {filme.ano ?? "Ano desconhecido"}
          {filme.nota !== null && (
            <>
              {" · "}
              <span aria-hidden="true">★</span>
              <span className="sr-only">Nota</span> {filme.nota.toFixed(1)}
            </>
          )}
        </p>
      </Link>
      {/* Fora do link: um elemento interativo não pode ficar dentro de outro. */}
      <div className="absolute right-2 top-2">
        <BotaoLista filme={filme} />
      </div>
    </li>
  );
}
