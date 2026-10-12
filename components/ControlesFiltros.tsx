"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useGeneros, useServicos } from "@/hooks/useCatalogos";
import { useFiltros } from "@/hooks/useFiltros";
import { urlImagem } from "@/lib/config";
import {
  ANO_MIN,
  anoMax,
  ORDENS,
  ROTULO_ORDEM,
  ROTULO_TIPO,
  TIPOS,
} from "@/lib/filtros/filtros";
import type { Ordem, TipoDisponibilidade } from "@/lib/tipos";

// O Brasil tem dezenas de serviços no TMDB; a lista começa pelos mais relevantes.
const SERVICOS_VISIVEIS = 12;
const NOTAS = [0, 5, 6, 7, 8, 9];

const CLASSES_CAMPO =
  "rounded-lg border border-borda-forte bg-fundo px-3 py-2";
const CLASSES_ROTULO = "mb-1 block text-sm font-medium";

function alternarId(lista: number[], id: number): number[] {
  return lista.includes(id) ? lista.filter((item) => item !== id) : [...lista, id];
}

function classesEtiqueta(ativa: boolean): string {
  return ativa
    ? "rounded-full border border-destaque bg-destaque px-3 py-1 text-sm font-medium text-sobre-destaque"
    : "rounded-full border border-borda-forte bg-fundo px-3 py-1 text-sm";
}

function CampoAno({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string;
  valor: number | null;
  aoMudar: (ano: number | null) => void;
}) {
  const id = useId();

  // Só grava ao sair do campo ou no Enter, para um ano digitado pela metade
  // não virar filtro.
  function confirmar(campo: HTMLInputElement) {
    const texto = campo.value.trim();
    if (texto === "") {
      if (valor !== null) aoMudar(null);
      return;
    }
    const ano = Number(texto);
    if (/^\d{4}$/.test(texto) && ano >= ANO_MIN && ano <= anoMax()) {
      if (ano !== valor) aoMudar(ano);
    } else {
      campo.value = valor === null ? "" : String(valor);
    }
  }

  return (
    <div>
      <label htmlFor={id} className={CLASSES_ROTULO}>
        {rotulo}
      </label>
      <input
        id={id}
        key={valor ?? "vazio"}
        defaultValue={valor ?? ""}
        inputMode="numeric"
        maxLength={4}
        placeholder="AAAA"
        onBlur={(evento) => confirmar(evento.currentTarget)}
        onKeyDown={(evento) => {
          if (evento.key === "Enter") confirmar(evento.currentTarget);
        }}
        className={`w-24 ${CLASSES_CAMPO}`}
      />
    </div>
  );
}

export function ControlesFiltros() {
  const { filtros, definir, limpar, ativos } = useFiltros();
  const servicos = useServicos();
  const generos = useGeneros();
  const [todosServicos, setTodosServicos] = useState(false);
  const idTipo = useId();
  const idNota = useId();
  const idOrdem = useId();

  const listaServicos = servicos.data ?? [];
  const servicosMostrados = todosServicos
    ? listaServicos
    : listaServicos.filter(
        (servico, indice) =>
          indice < SERVICOS_VISIVEIS || filtros.servicos.includes(servico.id),
      );

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className={CLASSES_ROTULO}>Serviço</legend>
        {servicos.isPending && (
          <p className="text-sm text-texto-suave">Carregando serviços…</p>
        )}
        {servicos.isError && (
          <p className="text-sm text-texto-suave">
            Não foi possível carregar os serviços.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {servicosMostrados.map((servico) => {
            const ativo = filtros.servicos.includes(servico.id);
            const logo = urlImagem(servico.logo, "w92");
            return (
              <button
                key={servico.id}
                type="button"
                aria-pressed={ativo}
                onClick={() =>
                  definir({ servicos: alternarId(filtros.servicos, servico.id) })
                }
                className={`inline-flex items-center gap-2 ${classesEtiqueta(ativo)}`}
              >
                {logo && (
                  <Image
                    src={logo}
                    alt=""
                    width={24}
                    height={24}
                    unoptimized
                    className="size-6 rounded"
                  />
                )}
                {servico.nome}
              </button>
            );
          })}
        </div>
        {listaServicos.length > SERVICOS_VISIVEIS && (
          <button
            type="button"
            aria-expanded={todosServicos}
            onClick={() => setTodosServicos((aberto) => !aberto)}
            className="mt-2 text-sm font-medium text-destaque underline"
          >
            {todosServicos
              ? "Mostrar menos serviços"
              : `Mostrar todos os ${listaServicos.length} serviços`}
          </button>
        )}
      </fieldset>

      <fieldset>
        <legend className={CLASSES_ROTULO}>Gênero</legend>
        {generos.isPending && (
          <p className="text-sm text-texto-suave">Carregando gêneros…</p>
        )}
        {generos.isError && (
          <p className="text-sm text-texto-suave">
            Não foi possível carregar os gêneros.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {(generos.data ?? []).map((genero) => {
            const ativo = filtros.generos.includes(genero.id);
            return (
              <button
                key={genero.id}
                type="button"
                aria-pressed={ativo}
                onClick={() =>
                  definir({ generos: alternarId(filtros.generos, genero.id) })
                }
                className={classesEtiqueta(ativo)}
              >
                {genero.nome}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor={idTipo} className={CLASSES_ROTULO}>
            Tipo
          </label>
          {/* As opções vêm de TIPOS, então o valor é sempre um tipo válido. */}
          <select
            id={idTipo}
            value={filtros.tipo}
            onChange={(evento) =>
              definir({ tipo: evento.target.value as TipoDisponibilidade })
            }
            className={CLASSES_CAMPO}
          >
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ROTULO_TIPO[tipo]}
              </option>
            ))}
          </select>
        </div>

        <CampoAno
          rotulo="Ano, de"
          valor={filtros.anoDe}
          aoMudar={(ano) =>
            definir({
              anoDe: ano,
              anoAte:
                ano !== null && filtros.anoAte !== null && ano > filtros.anoAte
                  ? ano
                  : filtros.anoAte,
            })
          }
        />
        <CampoAno
          rotulo="Ano, até"
          valor={filtros.anoAte}
          aoMudar={(ano) =>
            definir({
              anoAte: ano,
              anoDe:
                ano !== null && filtros.anoDe !== null && ano < filtros.anoDe
                  ? ano
                  : filtros.anoDe,
            })
          }
        />

        <div>
          <label htmlFor={idNota} className={CLASSES_ROTULO}>
            Nota mínima
          </label>
          <select
            id={idNota}
            value={filtros.notaMin}
            onChange={(evento) =>
              definir({ notaMin: Number(evento.target.value) })
            }
            className={CLASSES_CAMPO}
          >
            {!NOTAS.includes(filtros.notaMin) && (
              <option value={filtros.notaMin}>{filtros.notaMin} ou mais</option>
            )}
            {NOTAS.map((nota) => (
              <option key={nota} value={nota}>
                {nota === 0 ? "Qualquer" : `${nota} ou mais`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={idOrdem} className={CLASSES_ROTULO}>
            Ordenar por
          </label>
          {/* As opções vêm de ORDENS, então o valor é sempre uma ordem válida. */}
          <select
            id={idOrdem}
            value={filtros.ordem}
            onChange={(evento) =>
              definir({ ordem: evento.target.value as Ordem })
            }
            className={CLASSES_CAMPO}
          >
            {ORDENS.map((ordem) => (
              <option key={ordem} value={ordem}>
                {ROTULO_ORDEM[ordem]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={limpar}
          disabled={ativos === 0 && filtros.ordem === "popularidade"}
          className="rounded-full border border-borda-forte px-4 py-2 font-medium disabled:opacity-50"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
