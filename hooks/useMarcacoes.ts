"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useSessao } from "@/components/ProvedorSessao";
import { avisar } from "@/hooks/useAviso";
import { clienteNavegador } from "@/lib/supabase/navegador";
import {
  aplicar,
  deLinha,
  desfazer,
  filtrar,
  type Alteracao,
  type Estado,
  type Linha,
  type Marcacao,
} from "@/lib/marcacoes";
import type { Filme } from "@/lib/tipos";

export type { Estado };

const VAZIA: Marcacao[] = [];

export function useMarcacoes() {
  const { usuario, configurado } = useSessao();
  const queryClient = useQueryClient();
  const chave = useMemo(() => ["marcacoes", usuario?.id], [usuario?.id]);

  const consulta = useQuery({
    queryKey: chave,
    enabled: configurado && usuario !== null,
    queryFn: async (): Promise<Marcacao[]> => {
      const { data, error } = await clienteNavegador()
        .from("filmes_marcados")
        .select("filme_id, estado, titulo, poster, ano, nota")
        .order("atualizado_em", { ascending: false });
      if (error) throw new Error("Não foi possível carregar suas listas.");
      return (data as Linha[]).map(deLinha);
    },
  });

  const mutacao = useMutation({
    mutationKey: ["marcacoes"],
    // Em fila: dois cliques rápidos chegam ao banco na ordem em que foram dados.
    scope: { id: "marcacoes" },
    // Offline a gravação falha na hora e desfaz, em vez de ficar pausada.
    networkMode: "always",
    mutationFn: async (alteracao: Alteracao) => {
      const tabela = clienteNavegador().from("filmes_marcados");
      if (alteracao.tipo === "desmarcar") {
        const { error } = await tabela.delete().eq("filme_id", alteracao.id);
        if (error) throw error;
        return;
      }
      const { id, titulo, poster, ano, nota } = alteracao.filme;
      const { error } = await tabela.upsert(
        {
          usuario_id: usuario?.id,
          filme_id: id,
          estado: alteracao.estado,
          titulo,
          poster,
          ano,
          nota,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: "usuario_id,filme_id" },
      );
      if (error) throw error;
    },
    onMutate: async (alteracao) => {
      await queryClient.cancelQueries({ queryKey: chave });
      const anterior = queryClient.getQueryData<Marcacao[]>(chave);
      queryClient.setQueryData<Marcacao[]>(chave, (lista) =>
        aplicar(lista ?? VAZIA, alteracao),
      );
      return { anterior };
    },
    onError: (_erro, _alteracao, contexto) => {
      desfazer(queryClient, chave, contexto?.anterior);
      avisar("Não foi possível salvar. Tente de novo.");
    },
    onSettled: () => {
      // Só a última da fila busca de novo; antes disso a resposta apagaria as
      // alterações otimistas que ainda estão esperando.
      if (queryClient.isMutating({ mutationKey: ["marcacoes"] }) === 1) {
        void queryClient.invalidateQueries({ queryKey: chave });
      }
    },
  });

  const lista = (usuario && consulta.data) || VAZIA;
  const { mutate } = mutacao;

  const estadoDe = useCallback(
    (id: number): Estado | null =>
      lista.find((item) => item.filme.id === id)?.estado ?? null,
    [lista],
  );
  const marcar = useCallback(
    (filme: Filme, estado: Estado) => mutate({ tipo: "marcar", filme, estado }),
    [mutate],
  );
  const desmarcar = useCallback(
    (id: number) => mutate({ tipo: "desmarcar", id }),
    [mutate],
  );

  return {
    queroAssistir: useMemo(() => filtrar(lista, "quero_assistir"), [lista]),
    assistidos: useMemo(() => filtrar(lista, "assistido"), [lista]),
    estadoDe,
    marcar,
    desmarcar,
    carregando: usuario !== null && configurado && consulta.isPending,
    erro: usuario ? consulta.error : null,
    tentarDeNovo: () => void consulta.refetch(),
  };
}
