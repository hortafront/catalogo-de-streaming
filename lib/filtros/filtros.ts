import { MAX_PAGINA } from "@/lib/config";
import type { Filtros, Ordem, TipoDisponibilidade } from "@/lib/tipos";

export const TIPOS: readonly TipoDisponibilidade[] = [
  "flatrate",
  "free",
  "ads",
  "rent",
  "buy",
];

export const ORDENS: readonly Ordem[] = ["popularidade", "lancamento", "nota"];

export const ROTULO_TIPO: Record<TipoDisponibilidade, string> = {
  flatrate: "Assinatura",
  free: "Grátis",
  ads: "Com anúncios",
  rent: "Aluguel",
  buy: "Compra",
};

export const ROTULO_ORDEM: Record<Ordem, string> = {
  popularidade: "Popularidade",
  lancamento: "Lançamento",
  nota: "Nota",
};

export const ANO_MIN = 1900;

export function anoMax(): number {
  return new Date().getFullYear() + 1;
}

export const FILTROS_PADRAO: Filtros = {
  servicos: [],
  tipo: "flatrate",
  generos: [],
  anoDe: null,
  anoAte: null,
  notaMin: 0,
  ordem: "popularidade",
};

function invalido(nome: string): string {
  return `Parâmetro "${nome}" inválido.`;
}

function lerIds(bruto: string | null, nome: string, erros: string[]): number[] {
  if (!bruto) return [];
  if (!/^\d{1,7}(,\d{1,7}){0,19}$/.test(bruto)) {
    erros.push(invalido(nome));
    return [];
  }
  return [...new Set(bruto.split(",").map(Number))];
}

function lerAno(
  bruto: string | null,
  nome: string,
  erros: string[],
): number | null {
  if (!bruto) return null;
  const ano = Number(bruto);
  if (!/^\d{4}$/.test(bruto) || ano < ANO_MIN || ano > anoMax()) {
    erros.push(invalido(nome));
    return null;
  }
  return ano;
}

function lerOpcao<T extends string>(
  bruto: string | null,
  opcoes: readonly T[],
  padrao: T,
  nome: string,
  erros: string[],
): T {
  if (!bruto) return padrao;
  const achada = opcoes.find((opcao) => opcao === bruto);
  if (achada === undefined) {
    erros.push(invalido(nome));
    return padrao;
  }
  return achada;
}

function lerNota(bruto: string | null, erros: string[]): number {
  if (!bruto) return 0;
  if (!/^(10|\d)$/.test(bruto)) {
    erros.push(invalido("notaMin"));
    return 0;
  }
  return Number(bruto);
}

/**
 * Sempre devolve filtros válidos: um campo inválido vira o valor padrão e gera
 * uma entrada em `erros`. As rotas respondem 400 quando há erros; a interface
 * os ignora.
 */
export function analisarFiltros(params: URLSearchParams): {
  filtros: Filtros;
  erros: string[];
} {
  const erros: string[] = [];
  const anoDe = lerAno(params.get("anoDe"), "anoDe", erros);
  let anoAte = lerAno(params.get("anoAte"), "anoAte", erros);
  if (anoDe !== null && anoAte !== null && anoDe > anoAte) {
    erros.push('"anoDe" não pode ser maior que "anoAte".');
    anoAte = null;
  }
  const filtros: Filtros = {
    servicos: lerIds(params.get("servico"), "servico", erros),
    tipo: lerOpcao(params.get("tipo"), TIPOS, FILTROS_PADRAO.tipo, "tipo", erros),
    generos: lerIds(params.get("genero"), "genero", erros),
    anoDe,
    anoAte,
    notaMin: lerNota(params.get("notaMin"), erros),
    ordem: lerOpcao(
      params.get("ordem"),
      ORDENS,
      FILTROS_PADRAO.ordem,
      "ordem",
      erros,
    ),
  };
  return { filtros, erros };
}

/** Só escreve os valores diferentes do padrão. */
export function escreverFiltros(f: Filtros): URLSearchParams {
  const params = new URLSearchParams();
  if (f.servicos.length > 0) params.set("servico", f.servicos.join(","));
  if (f.tipo !== FILTROS_PADRAO.tipo) params.set("tipo", f.tipo);
  if (f.generos.length > 0) params.set("genero", f.generos.join(","));
  if (f.anoDe !== null) params.set("anoDe", String(f.anoDe));
  if (f.anoAte !== null) params.set("anoAte", String(f.anoAte));
  if (f.notaMin > 0) params.set("notaMin", String(f.notaMin));
  if (f.ordem !== FILTROS_PADRAO.ordem) params.set("ordem", f.ordem);
  return params;
}

/** A ordenação não conta como filtro ativo. */
export function contarFiltrosAtivos(f: Filtros): number {
  let ativos = 0;
  if (f.servicos.length > 0) ativos += 1;
  if (f.tipo !== FILTROS_PADRAO.tipo) ativos += 1;
  if (f.generos.length > 0) ativos += 1;
  if (f.anoDe !== null || f.anoAte !== null) ativos += 1;
  if (f.notaMin > 0) ativos += 1;
  return ativos;
}

export function analisarPagina(params: URLSearchParams): {
  pagina: number;
  erro: string | null;
} {
  const bruto = params.get("pagina");
  if (!bruto) return { pagina: 1, erro: null };
  const pagina = Number(bruto);
  if (!/^\d{1,3}$/.test(bruto) || pagina < 1 || pagina > MAX_PAGINA) {
    return { pagina: 1, erro: invalido("pagina") };
  }
  return { pagina, erro: null };
}
