import Link from "next/link";
import type { Filme } from "@/lib/tipos";
import { BotoesMarcacao } from "./BotoesMarcacao";
import { Poster } from "./Poster";

export function CartaoFilme({
  filme,
  className = "",
}: {
  filme: Filme;
  className?: string;
}) {
  return (
    <li className={`relative ${className}`}>
      <Link href={`/filme/${filme.id}`} className="group block rounded-lg">
        <div className="transition-transform duration-200 group-hover:-translate-y-1">
          <Poster caminho={filme.poster} titulo={filme.titulo} />
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium group-hover:underline">
          {filme.titulo}
        </h3>
        <p className="flex gap-3 text-sm text-texto-suave">
          <span>{filme.ano ?? "Ano desconhecido"}</span>
          {filme.nota !== null && (
            <span>
              <span aria-hidden="true">★</span>
              <span className="sr-only">Nota</span> {filme.nota.toFixed(1)}
            </span>
          )}
        </p>
      </Link>
      {/* Fora do link: um elemento interativo não pode ficar dentro de outro. */}
      <div className="absolute right-2 top-2">
        <BotoesMarcacao filme={filme} />
      </div>
    </li>
  );
}
