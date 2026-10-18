"use server";

import { redirect } from "next/navigation";
import { caminhoSeguro } from "@/lib/auth/caminhoSeguro";
import { mensagemErroAuth } from "@/lib/auth/mensagens";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type EstadoFormulario = { erro: string | null; email: string };

type Credenciais = { email: string; password: string };

function texto(dados: FormData, campo: string): string {
  const valor = dados.get(campo);
  return typeof valor === "string" ? valor : "";
}

async function autenticar(
  dados: FormData,
  chamar: (
    supabase: Awaited<ReturnType<typeof criarClienteServidor>>,
    credenciais: Credenciais,
  ) => Promise<{ error: { code?: string } | null }>,
): Promise<EstadoFormulario> {
  const email = texto(dados, "email").trim();
  const senha = texto(dados, "senha");
  if (!supabaseConfigurado) {
    return { erro: "Login indisponível: configure o Supabase.", email };
  }
  if (!email || !senha) return { erro: "Preencha email e senha.", email };

  const supabase = await criarClienteServidor();
  const { error } = await chamar(supabase, { email, password: senha });
  if (error) return { erro: mensagemErroAuth(error), email };

  // Fora de qualquer try: o redirect funciona lançando um erro especial.
  redirect(caminhoSeguro(texto(dados, "voltar")));
}

export async function entrar(
  _estado: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  return autenticar(dados, (supabase, credenciais) =>
    supabase.auth.signInWithPassword(credenciais),
  );
}

export async function criarConta(
  _estado: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  return autenticar(dados, (supabase, credenciais) =>
    supabase.auth.signUp(credenciais),
  );
}

export async function sair(): Promise<void> {
  if (supabaseConfigurado) {
    const supabase = await criarClienteServidor();
    await supabase.auth.signOut();
  }
  redirect("/");
}
