import Image from "next/image";
import { urlImagem } from "@/lib/config";
import { ROTULO_TIPO, TIPOS } from "@/lib/filtros/filtros";
import type { OndeAssistir as Opcoes } from "@/lib/tipos";

export function OndeAssistir({
  opcoes,
  link,
}: {
  opcoes: Opcoes;
  link: string | null;
}) {
  const tiposComServico = TIPOS.filter((tipo) => opcoes[tipo].length > 0);

  return (
    <section aria-labelledby="titulo-onde-assistir">
      <h2 id="titulo-onde-assistir" className="text-xl font-bold">
        Onde assistir
      </h2>
      {tiposComServico.length === 0 ? (
        <p className="mt-2 text-texto-suave">
          Indisponível no Brasil no momento.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {tiposComServico.map((tipo) => (
            <div key={tipo}>
              <h3 className="mb-2 text-sm font-medium text-texto-suave">
                {ROTULO_TIPO[tipo]}
              </h3>
              <ul className="flex flex-wrap gap-3">
                {opcoes[tipo].map((servico) => {
                  const logo = urlImagem(servico.logo, "w92");
                  return (
                    <li
                      key={servico.id}
                      className="flex items-center gap-2 rounded-lg border border-borda bg-fundo px-3 py-2"
                    >
                      {logo && (
                        <Image
                          src={logo}
                          alt=""
                          width={32}
                          height={32}
                          unoptimized
                          className="size-8 rounded"
                        />
                      )}
                      <span>{servico.nome}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-block font-medium text-destaque underline"
            >
              Ver todas as opções no TMDB
            </a>
          )}
        </div>
      )}
      <p className="mt-3 text-sm text-texto-suave">
        Disponibilidade fornecida pelo JustWatch.
      </p>
    </section>
  );
}
