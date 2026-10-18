"use client";

import Link from "next/link";
import { useActionState } from "react";
import { criarConta, entrar, type EstadoFormulario } from "@/app/entrar/acoes";

const INICIAL: EstadoFormulario = { erro: null, email: "" };

const CLASSES_CAMPO =
  "mt-1 w-full rounded-lg border border-borda-forte bg-superficie px-3 py-2";

export function FormularioEntrar({
  modo,
  voltar,
}: {
  modo: "entrar" | "criar";
  voltar: string;
}) {
  const criando = modo === "criar";
  const [estado, enviar, enviando] = useActionState(
    criando ? criarConta : entrar,
    INICIAL,
  );
  const sufixo = `voltar=${encodeURIComponent(voltar)}`;

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="cartaz text-4xl leading-none sm:text-5xl">
        {criando ? "Criar conta" : "Entrar"}
      </h1>
      <form action={enviar} className="mt-6 flex flex-col gap-4">
        <label className="font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={estado.email}
            className={CLASSES_CAMPO}
          />
        </label>
        <label className="font-medium">
          Senha
          <input
            name="senha"
            type="password"
            required
            minLength={6}
            autoComplete={criando ? "new-password" : "current-password"}
            className={CLASSES_CAMPO}
          />
        </label>
        <input type="hidden" name="voltar" value={voltar} />
        {estado.erro && (
          <p role="alert" className="text-sm font-medium">
            {estado.erro}
          </p>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-destaque px-5 py-2 font-medium text-sobre-destaque disabled:opacity-60"
        >
          {enviando
            ? criando
              ? "Criando conta…"
              : "Entrando…"
            : criando
              ? "Criar conta"
              : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-sm text-texto-suave">
        {criando ? (
          <Link href={`/entrar?${sufixo}`} className="underline">
            Já tem conta? Entrar
          </Link>
        ) : (
          <Link href={`/entrar?modo=criar&${sufixo}`} className="underline">
            Não tem conta? Criar conta
          </Link>
        )}
      </p>
    </div>
  );
}
