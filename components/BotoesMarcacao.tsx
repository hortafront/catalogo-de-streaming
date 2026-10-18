"use client";

import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useMarcacoes, type Estado } from "@/hooks/useMarcacoes";
import { linkEntrar } from "@/lib/auth/caminhoSeguro";
import { supabaseConfigurado } from "@/lib/supabase/config";
import type { Filme } from "@/lib/tipos";
import { useSessao } from "./ProvedorSessao";

type Variante = { comTexto: boolean; sobreImagem: boolean };

const BOTOES: {
  estado: Estado;
  texto: string;
  marcar: (titulo: string) => string;
  tirar: (titulo: string) => string;
}[] = [
  {
    estado: "quero_assistir",
    texto: "Quero assistir",
    marcar: (titulo) => `Marcar ${titulo} como quero assistir`,
    tirar: (titulo) => `Tirar ${titulo} de quero assistir`,
  },
  {
    estado: "assistido",
    texto: "Já assisti",
    marcar: (titulo) => `Marcar ${titulo} como já assistido`,
    tirar: (titulo) => `Tirar ${titulo} de já assistidos`,
  },
];

function classes({ comTexto, sobreImagem }: Variante) {
  if (!comTexto) {
    // Sem texto ele fica sempre em cima de um pôster.
    return "grid size-9 place-items-center rounded-full border border-tela/25 bg-sala/70 text-tela backdrop-blur-sm";
  }
  return sobreImagem
    ? "inline-flex items-center gap-2 rounded-full border border-tela/30 bg-tela/15 px-6 py-3 font-semibold text-tela backdrop-blur-sm"
    : "inline-flex items-center gap-2 rounded-full border border-borda-forte bg-superficie px-4 py-2 font-medium";
}

function Icone({ estado, ativo }: { estado: Estado; ativo: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      {estado === "quero_assistir" ? (
        <path
          d="M6 3h12v18l-6-4-6 4z"
          fill={ativo ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M5 12l5 5L20 7"
          fill="none"
          stroke="currentColor"
          strokeWidth={ativo ? 3.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function Botoes({ filme, ...variante }: { filme: Filme } & Variante) {
  const { usuario } = useSessao();
  const { estadoDe, marcar, desmarcar } = useMarcacoes();
  const router = useRouter();
  const atual = estadoDe(filme.id);

  function clicar(estado: Estado) {
    if (!usuario) {
      router.push(linkEntrar(location.pathname + location.search));
    } else if (atual === estado) {
      desmarcar(filme.id);
    } else {
      marcar(filme, estado);
    }
  }

  return (
    <div className={variante.comTexto ? "contents" : "flex gap-1"}>
      {BOTOES.map(({ estado, texto, marcar: rotuloMarcar, tirar }) => {
        const ativo = atual === estado;
        const rotulo = ativo ? tirar(filme.titulo) : rotuloMarcar(filme.titulo);
        return (
          <button
            key={estado}
            type="button"
            onClick={() => clicar(estado)}
            aria-pressed={ativo}
            aria-label={rotulo}
            title={rotulo}
            className={classes(variante)}
          >
            <Icone estado={estado} ativo={ativo} />
            {variante.comTexto && <span>{texto}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function BotoesMarcacao({
  filme,
  comTexto = false,
  sobreImagem = false,
}: {
  filme: Filme;
  comTexto?: boolean;
  /** Para os botões com texto dentro do Palco, sobre a cena do filme. */
  sobreImagem?: boolean;
}) {
  if (!supabaseConfigurado) return null;
  return (
    <Suspense fallback={null}>
      <Botoes filme={filme} comTexto={comTexto} sobreImagem={sobreImagem} />
    </Suspense>
  );
}
