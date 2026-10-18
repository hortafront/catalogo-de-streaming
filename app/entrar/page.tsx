import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FormularioEntrar } from "@/components/FormularioEntrar";
import { caminhoSeguro } from "@/lib/auth/caminhoSeguro";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { obterUsuario } from "@/lib/supabase/sessao";

export const metadata: Metadata = { title: "Entrar" };

type Props = PageProps<"/entrar">;

function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

async function Conteudo({ searchParams }: Pick<Props, "searchParams">) {
  if (!supabaseConfigurado) {
    return (
      <p className="mt-10 text-center">
        Login indisponível: configure o Supabase.
      </p>
    );
  }
  if (await obterUsuario()) redirect("/");

  const parametros = await searchParams;
  const modo = primeiro(parametros.modo) === "criar" ? "criar" : "entrar";
  const voltar = caminhoSeguro(primeiro(parametros.voltar));
  return <FormularioEntrar key={modo} modo={modo} voltar={voltar} />;
}

export default function PaginaEntrar({ searchParams }: Props) {
  return (
    <Suspense fallback={null}>
      <Conteudo searchParams={searchParams} />
    </Suspense>
  );
}
