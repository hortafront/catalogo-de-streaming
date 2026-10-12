# Catálogo de Filmes em Streaming: Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um site em Next.js que lista os filmes disponíveis agora nos streamings do Brasil, com filtros, busca, página de detalhes e lista "quero ver", usando a API do TMDB.

**Architecture:** O navegador busca os dados com TanStack Query em cinco rotas `/api/*` do Next.js, que validam os parâmetros e repassam a chamada ao TMDB com a chave guardada no servidor. Os filtros vivem nos parâmetros da URL, que são a única fonte de verdade. `lib/tmdb/` é o único lugar que conhece o formato do TMDB; o resto do app usa os tipos de `lib/tipos.ts`.

**Tech Stack:** Next.js (App Router), React, TypeScript estrito, Tailwind CSS v4, TanStack Query v5, npm, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-11-catalogo-de-filmes-design.md`

## Global Constraints

- Sem testes automatizados (decisão da spec). Cada tarefa termina com `npm run typecheck`, `npm run lint` e uma verificação manual descrita no próprio passo. Não instale Jest, Vitest nem Playwright.
- TypeScript em modo estrito em todo o código. Sem `any` e sem `@ts-ignore`.
- Região fixa `BR` e idioma `pt-BR`, definidos só em `lib/config.ts`.
- A chave do TMDB fica em `TMDB_API_TOKEN` (o "API Read Access Token", usado como Bearer) e só é lida em `lib/tmdb/cliente.ts`. Nunca use o prefixo `NEXT_PUBLIC_`.
- Padrão do filtro de tipo: `flatrate`. Padrão da ordenação: `popularidade`.
- Mínimo de votos: `200`, aplicado quando `notaMin > 0` ou `ordem=nota`.
- Limite de paginação do TMDB: `500` páginas, `20` filmes por página.
- Cache: 1 hora para catálogo, busca e detalhes; 24 horas para serviços e gêneros.
- Erros das rotas: 400 para parâmetro inválido (sem chamar o TMDB), 404 para filme inexistente, 502 para falha do TMDB, sempre com corpo `{ "erro": "mensagem" }`.
- Valores de filtro iguais ao padrão não aparecem na URL.
- Todo texto da interface em português do Brasil.
- Contraste AA nos dois temas, foco sempre visível, todo botão de ícone com nome acessível.
- O rodapé credita o TMDB e o JustWatch.
- Os comandos deste plano são para o Git Bash. A pasta do projeto tem espaços no nome; use aspas nos caminhos.

## Review Focus

Como a spec exclui testes automatizados, cada item abaixo é fixado por um passo de verificação manual na tarefa indicada.

1. **URL editada à mão com filtros inválidos** (`/?tipo=xyz&anoDe=abc&servico=;;`): o catálogo abre com os valores padrão para os campos inválidos, sem tela de erro. Tarefa 7.
2. **Mesmo filme em duas páginas seguidas** (a popularidade muda entre uma chamada e outra): a grade não mostra o filme duas vezes nem gera aviso de chave duplicada no console. Tarefa 6.
3. **`localStorage` bloqueado ou com conteúdo corrompido:** o app abre normalmente, com a lista vazia. Tarefa 5.
4. **Filme com dados faltando** (sem pôster, sem data, sem votos, sem sinopse, sem trailer, sem disponibilidade no Brasil): cada falta tem um estado próprio, sem imagem quebrada nem "NaN" ou "null" na tela. Tarefas 6 e 9.
5. **Falha ao carregar a próxima página na rolagem infinita:** os filmes já carregados continuam na tela, aparece "Tentar de novo" e o app não entra em laço de novas tentativas. Tarefa 6.

## Estrutura de arquivos

```
app/
  layout.tsx                 casca: tema, provedores, cabeçalho, rodapé
  globals.css                tokens de cor dos dois temas, foco, movimento reduzido
  provedores.tsx             QueryClientProvider
  page.tsx                   catálogo
  not-found.tsx              página 404
  busca/page.tsx             resultados da busca
  filme/[id]/page.tsx        detalhes
  minha-lista/page.tsx       lista "quero ver"
  api/filmes/route.ts
  api/filmes/[id]/route.ts
  api/busca/route.ts
  api/servicos/route.ts
  api/generos/route.ts
components/
  Cabecalho.tsx  Rodape.tsx  BotaoTema.tsx  CampoBusca.tsx  ContadorLista.tsx
  Poster.tsx  BotaoLista.tsx  CartaoFilme.tsx  GradeFilmes.tsx  ResultadoFilmes.tsx
  Catalogo.tsx  ControlesFiltros.tsx  BarraFiltros.tsx
  ResultadoBusca.tsx  DetalheFilme.tsx  OndeAssistir.tsx  ListaSalva.tsx
hooks/
  useFiltros.ts  useFilmes.ts  useBusca.ts  useFilme.ts  useCatalogos.ts  useMinhaLista.ts
lib/
  config.ts                  região, idioma, limites, URL de imagem
  tipos.ts                   tipos do domínio
  buscarJson.ts              fetch do cliente com erro tipado
  paginas.ts                 junta páginas sem repetir filme
  filtros/filtros.ts         leitura, validação e escrita dos filtros (cliente e servidor)
  tmdb/cliente.ts            fetch autenticado ao TMDB (só servidor)
  tmdb/tipos-tmdb.ts         formato das respostas do TMDB
  tmdb/converter.ts          TMDB → tipos do domínio
  tmdb/consultas.ts          as cinco consultas usadas pelas rotas
  api/resposta.ts            respostas de erro padronizadas
docs/roteiro-de-verificacao.md
README.md  .env.example
```

---

### Task 1: Criar o projeto Next.js

**Files:**
- Create: projeto Next.js na raiz (via `create-next-app`), `.env.example`
- Modify: `package.json`, `next.config.ts`, `.gitignore`

**Interfaces:**
- Produces: scripts `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`; alias de importação `@/*` apontando para a raiz; `next/image` liberado para `image.tmdb.org`.

- [ ] **Step 1: Gerar o projeto em uma subpasta**

O nome da pasta raiz tem espaços e "ç", o que o npm não aceita como nome de pacote. Por isso o projeto é gerado em uma subpasta e depois movido.

```bash
cd "/c/Users/lelet/Documents/projetos vscode/seleçao de filmes"
npx create-next-app@latest catalogo-filmes --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --disable-git --yes
```

Expected: termina com "Success! Created catalogo-filmes".

- [ ] **Step 2: Mover o projeto para a raiz**

```bash
rm -rf catalogo-filmes/.git
shopt -s dotglob
mv catalogo-filmes/* .
rmdir catalogo-filmes
ls
```

Expected: `app`, `docs`, `package.json`, `next.config.ts`, `tsconfig.json` e `node_modules` na raiz; a pasta `catalogo-filmes` não existe mais.

- [ ] **Step 3: Instalar as dependências do app**

```bash
npm install @tanstack/react-query server-only
```

- [ ] **Step 4: Adicionar o script de checagem de tipos**

Em `package.json`, dentro de `"scripts"`, acrescente a linha:

```json
"typecheck": "tsc --noEmit"
```

- [ ] **Step 5: Liberar as imagens do TMDB**

Substitua o conteúdo de `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 6: Documentar a variável de ambiente**

Crie `.env.example`:

```
# "API Read Access Token" do TMDB: https://www.themoviedb.org/settings/api
TMDB_API_TOKEN=
```

O `.gitignore` gerado ignora `.env*`. Acrescente no fim dele, para o exemplo entrar no git:

```
!.env.example
```

- [ ] **Step 7: Verificar**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: os três comandos terminam sem erros.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project"
```

---

### Task 2: Tipos do domínio, filtros e acesso ao TMDB

**Files:**
- Create: `lib/config.ts`, `lib/tipos.ts`, `lib/filtros/filtros.ts`, `lib/tmdb/cliente.ts`, `lib/tmdb/tipos-tmdb.ts`, `lib/tmdb/converter.ts`, `lib/tmdb/consultas.ts`

**Interfaces:**
- Produces (de `lib/tipos.ts`): `TipoDisponibilidade`, `Ordem`, `Filme`, `PaginaFilmes`, `Servico`, `Genero`, `Pessoa`, `OndeAssistir`, `FilmeDetalhe`, `Filtros`.
- Produces (de `lib/config.ts`): `REGIAO`, `IDIOMA`, `MIN_VOTOS`, `MAX_PAGINA`, `urlImagem(caminho, tamanho)`.
- Produces (de `lib/filtros/filtros.ts`): `TIPOS`, `ORDENS`, `ROTULO_TIPO`, `ROTULO_ORDEM`, `ANO_MIN`, `anoMax()`, `FILTROS_PADRAO`, `analisarFiltros(params): { filtros: Filtros; erros: string[] }`, `escreverFiltros(f): URLSearchParams`, `contarFiltrosAtivos(f): number`, `analisarPagina(params): { pagina: number; erro: string | null }`.
- Produces (de `lib/tmdb/cliente.ts`): `ErroTmdb` (com `status`), `ErroConfiguracao`, `tmdb<T>(caminho, params, revalidar)`.
- Produces (de `lib/tmdb/consultas.ts`): `listarFilmes(filtros, pagina)`, `buscarFilmes(q, pagina)`, `obterFilme(id)`, `listarServicos()`, `listarGeneros()`.

- [ ] **Step 1: Criar `lib/config.ts`**

```ts
export const REGIAO = "BR";
export const IDIOMA = "pt-BR";
export const MIN_VOTOS = 200;
export const MAX_PAGINA = 500;

export const UMA_HORA = 60 * 60;
export const UM_DIA = 24 * UMA_HORA;

export type TamanhoImagem = "w92" | "w185" | "w342" | "w500" | "w1280";

export function urlImagem(
  caminho: string | null,
  tamanho: TamanhoImagem,
): string | null {
  return caminho ? `https://image.tmdb.org/t/p/${tamanho}${caminho}` : null;
}
```

- [ ] **Step 2: Criar `lib/tipos.ts`**

```ts
export type TipoDisponibilidade = "flatrate" | "free" | "ads" | "rent" | "buy";
export type Ordem = "popularidade" | "lancamento" | "nota";

export interface Filme {
  id: number;
  titulo: string;
  /** Caminho do pôster no TMDB, sem o domínio. */
  poster: string | null;
  ano: number | null;
  /** Nota de 0 a 10 com uma casa decimal; null quando o filme não tem votos. */
  nota: number | null;
}

export interface PaginaFilmes {
  pagina: number;
  totalPaginas: number;
  total: number;
  filmes: Filme[];
}

export interface Servico {
  id: number;
  nome: string;
  logo: string | null;
}

export interface Genero {
  id: number;
  nome: string;
}

export interface Pessoa {
  id: number;
  nome: string;
  personagem: string;
  foto: string | null;
}

export type OndeAssistir = Record<TipoDisponibilidade, Servico[]>;

export interface FilmeDetalhe extends Filme {
  sinopse: string;
  fundo: string | null;
  generos: Genero[];
  /** Duração em minutos. */
  duracao: number | null;
  elenco: Pessoa[];
  /** Chave do vídeo no YouTube. */
  trailer: string | null;
  ondeAssistir: OndeAssistir;
  /** Página do TMDB com todas as opções de exibição no Brasil. */
  linkOpcoes: string | null;
}

export interface Filtros {
  servicos: number[];
  tipo: TipoDisponibilidade;
  generos: number[];
  anoDe: number | null;
  anoAte: number | null;
  notaMin: number;
  ordem: Ordem;
}
```

- [ ] **Step 3: Criar `lib/filtros/filtros.ts`**

Este arquivo é usado pelo navegador e pelas rotas de API, então não pode importar nada exclusivo do servidor. `analisarFiltros` sempre devolve filtros válidos: um campo inválido vira o valor padrão e gera uma entrada em `erros`. As rotas respondem 400 quando `erros` não está vazio; a interface ignora `erros` e usa os filtros.

```ts
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
```

- [ ] **Step 4: Criar `lib/tmdb/cliente.ts`**

```ts
import "server-only";

const BASE = "https://api.themoviedb.org/3";

export class ErroTmdb extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroTmdb";
  }
}

export class ErroConfiguracao extends Error {
  constructor() {
    super("A variável de ambiente TMDB_API_TOKEN não está definida.");
    this.name = "ErroConfiguracao";
  }
}

export async function tmdb<T>(
  caminho: string,
  params: Record<string, string>,
  revalidar: number,
): Promise<T> {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new ErroConfiguracao();

  const url = `${BASE}/${caminho}?${new URLSearchParams(params)}`;
  let resposta: Response;
  try {
    resposta = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      next: { revalidate: revalidar },
    });
  } catch {
    throw new ErroTmdb(502, "Não foi possível contatar o TMDB.");
  }
  if (!resposta.ok) {
    throw new ErroTmdb(resposta.status, `O TMDB respondeu ${resposta.status}.`);
  }
  try {
    return (await resposta.json()) as T;
  } catch {
    throw new ErroTmdb(502, "O TMDB devolveu uma resposta ilegível.");
  }
}
```

- [ ] **Step 5: Criar `lib/tmdb/tipos-tmdb.ts`**

```ts
export interface TmdbFilme {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  vote_count: number;
}

export interface TmdbPagina {
  page: number;
  results: TmdbFilme[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenero {
  id: number;
  name: string;
}

export interface TmdbServico {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
  display_priorities?: Record<string, number>;
}

export interface TmdbOndeAssistir {
  link?: string;
  flatrate?: TmdbServico[];
  free?: TmdbServico[];
  ads?: TmdbServico[];
  rent?: TmdbServico[];
  buy?: TmdbServico[];
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  iso_639_1: string;
}

export interface TmdbElenco {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbDetalhe extends TmdbFilme {
  overview: string | null;
  backdrop_path: string | null;
  runtime: number | null;
  genres: TmdbGenero[];
  credits?: { cast: TmdbElenco[] };
  videos?: { results: TmdbVideo[] };
  "watch/providers"?: { results: Record<string, TmdbOndeAssistir> };
}
```

- [ ] **Step 6: Criar `lib/tmdb/converter.ts`**

```ts
import { MAX_PAGINA, REGIAO } from "@/lib/config";
import { TIPOS } from "@/lib/filtros/filtros";
import type {
  Filme,
  FilmeDetalhe,
  OndeAssistir,
  PaginaFilmes,
  Servico,
} from "@/lib/tipos";
import type {
  TmdbDetalhe,
  TmdbFilme,
  TmdbPagina,
  TmdbServico,
  TmdbVideo,
} from "./tipos-tmdb";

const TAMANHO_ELENCO = 10;

export function converterFilme(f: TmdbFilme): Filme {
  const ano = f.release_date ? Number(f.release_date.slice(0, 4)) : NaN;
  return {
    id: f.id,
    titulo: f.title,
    poster: f.poster_path,
    ano: Number.isInteger(ano) && ano > 0 ? ano : null,
    nota: f.vote_count > 0 ? Math.round(f.vote_average * 10) / 10 : null,
  };
}

export function converterPagina(p: TmdbPagina): PaginaFilmes {
  return {
    pagina: p.page,
    totalPaginas: Math.min(p.total_pages, MAX_PAGINA),
    total: p.total_results,
    filmes: p.results.map(converterFilme),
  };
}

export function converterServico(s: TmdbServico): Servico {
  return { id: s.provider_id, nome: s.provider_name, logo: s.logo_path };
}

function prioridade(s: TmdbServico): number {
  return s.display_priorities?.[REGIAO] ?? s.display_priority ?? 9999;
}

export function ordenarServicos(lista: TmdbServico[]): Servico[] {
  return [...lista]
    .sort((a, b) => prioridade(a) - prioridade(b))
    .map(converterServico);
}

function escolherTrailer(videos: TmdbVideo[]): string | null {
  const youtube = videos.filter((v) => v.site === "YouTube");
  const candidatos = [
    ...youtube.filter((v) => v.type === "Trailer" && v.iso_639_1 === "pt"),
    ...youtube.filter((v) => v.type === "Trailer"),
    ...youtube.filter((v) => v.type === "Teaser"),
  ];
  return candidatos[0]?.key ?? null;
}

export function converterDetalhe(d: TmdbDetalhe): FilmeDetalhe {
  const regional = d["watch/providers"]?.results[REGIAO];
  const ondeAssistir = Object.fromEntries(
    TIPOS.map((tipo) => [tipo, ordenarServicos(regional?.[tipo] ?? [])]),
  ) as OndeAssistir;

  const elenco = [...(d.credits?.cast ?? [])]
    .sort((a, b) => a.order - b.order)
    .slice(0, TAMANHO_ELENCO)
    .map((p) => ({
      id: p.id,
      nome: p.name,
      personagem: p.character,
      foto: p.profile_path,
    }));

  return {
    ...converterFilme(d),
    sinopse: d.overview ?? "",
    fundo: d.backdrop_path,
    generos: d.genres.map((g) => ({ id: g.id, nome: g.name })),
    duracao: d.runtime && d.runtime > 0 ? d.runtime : null,
    elenco,
    trailer: escolherTrailer(d.videos?.results ?? []),
    ondeAssistir,
    linkOpcoes: regional?.link ?? null,
  };
}
```

- [ ] **Step 7: Criar `lib/tmdb/consultas.ts`**

```ts
import "server-only";

import { IDIOMA, MIN_VOTOS, REGIAO, UMA_HORA, UM_DIA } from "@/lib/config";
import type {
  FilmeDetalhe,
  Filtros,
  Genero,
  Ordem,
  PaginaFilmes,
  Servico,
} from "@/lib/tipos";
import { tmdb } from "./cliente";
import { converterDetalhe, converterPagina, ordenarServicos } from "./converter";
import type {
  TmdbDetalhe,
  TmdbGenero,
  TmdbPagina,
  TmdbServico,
} from "./tipos-tmdb";

const ORDENACAO: Record<Ordem, string> = {
  popularidade: "popularity.desc",
  lancamento: "primary_release_date.desc",
  nota: "vote_average.desc",
};

export async function listarFilmes(
  f: Filtros,
  pagina: number,
): Promise<PaginaFilmes> {
  const params: Record<string, string> = {
    language: IDIOMA,
    watch_region: REGIAO,
    with_watch_monetization_types: f.tipo,
    sort_by: ORDENACAO[f.ordem],
    include_adult: "false",
    include_video: "false",
    page: String(pagina),
  };
  if (f.servicos.length > 0) params.with_watch_providers = f.servicos.join("|");
  if (f.generos.length > 0) params.with_genres = f.generos.join(",");
  if (f.anoDe !== null) params["primary_release_date.gte"] = `${f.anoDe}-01-01`;
  if (f.anoAte !== null) params["primary_release_date.lte"] = `${f.anoAte}-12-31`;
  if (f.notaMin > 0) params["vote_average.gte"] = String(f.notaMin);
  if (f.notaMin > 0 || f.ordem === "nota") {
    params["vote_count.gte"] = String(MIN_VOTOS);
  }
  return converterPagina(
    await tmdb<TmdbPagina>("discover/movie", params, UMA_HORA),
  );
}

export async function buscarFilmes(
  q: string,
  pagina: number,
): Promise<PaginaFilmes> {
  const params = {
    query: q,
    language: IDIOMA,
    region: REGIAO,
    include_adult: "false",
    page: String(pagina),
  };
  return converterPagina(
    await tmdb<TmdbPagina>("search/movie", params, UMA_HORA),
  );
}

export async function obterFilme(id: number): Promise<FilmeDetalhe> {
  const params = {
    language: IDIOMA,
    append_to_response: "credits,videos,watch/providers",
    include_video_language: "pt,en",
  };
  return converterDetalhe(
    await tmdb<TmdbDetalhe>(`movie/${id}`, params, UMA_HORA),
  );
}

export async function listarServicos(): Promise<Servico[]> {
  const dados = await tmdb<{ results: TmdbServico[] }>(
    "watch/providers/movie",
    { language: IDIOMA, watch_region: REGIAO },
    UM_DIA,
  );
  return ordenarServicos(dados.results);
}

export async function listarGeneros(): Promise<Genero[]> {
  const dados = await tmdb<{ genres: TmdbGenero[] }>(
    "genre/movie/list",
    { language: IDIOMA },
    UM_DIA,
  );
  return dados.genres.map((g) => ({ id: g.id, nome: g.name }));
}
```

- [ ] **Step 8: Verificar**

```bash
npm run typecheck && npm run lint
```

Expected: sem erros.

- [ ] **Step 9: Commit**

```bash
git add lib
git commit -m "feat: add domain types, filter parsing and TMDB access layer"
```

---

### Task 3: Rotas de API

**Pré-requisito:** o arquivo `.env.local` na raiz com `TMDB_API_TOKEN=<token>`. Se o parceiro humano ainda não forneceu o token, pare e peça. Não invente um valor.

**Files:**
- Create: `lib/api/resposta.ts`, `app/api/filmes/route.ts`, `app/api/filmes/[id]/route.ts`, `app/api/busca/route.ts`, `app/api/servicos/route.ts`, `app/api/generos/route.ts`

**Interfaces:**
- Consumes: `analisarFiltros`, `analisarPagina` de `@/lib/filtros/filtros`; `listarFilmes`, `buscarFilmes`, `obterFilme`, `listarServicos`, `listarGeneros` de `@/lib/tmdb/consultas`; `ErroTmdb`, `ErroConfiguracao` de `@/lib/tmdb/cliente`.
- Produces: `GET /api/filmes` → `PaginaFilmes`; `GET /api/busca?q=` → `PaginaFilmes`; `GET /api/filmes/[id]` → `FilmeDetalhe`; `GET /api/servicos` → `Servico[]`; `GET /api/generos` → `Genero[]`. Em erro, `{ erro: string }` com status 400, 404, 500 ou 502.

- [ ] **Step 1: Criar `lib/api/resposta.ts`**

```ts
import { NextResponse } from "next/server";
import { ErroConfiguracao, ErroTmdb } from "@/lib/tmdb/cliente";

export function respostaErro(status: number, erro: string) {
  return NextResponse.json({ erro }, { status });
}

export function respostaErroTmdb(causa: unknown) {
  if (causa instanceof ErroTmdb && causa.status === 404) {
    return respostaErro(404, "Filme não encontrado.");
  }
  console.error(causa);
  if (causa instanceof ErroConfiguracao) {
    return respostaErro(500, "O servidor está sem a chave do TMDB.");
  }
  return respostaErro(
    502,
    "O TMDB está indisponível no momento. Tente de novo em instantes.",
  );
}
```

- [ ] **Step 2: Criar `app/api/filmes/route.ts`**

```ts
import { NextResponse } from "next/server";
import { respostaErro, respostaErroTmdb } from "@/lib/api/resposta";
import { analisarFiltros, analisarPagina } from "@/lib/filtros/filtros";
import { listarFilmes } from "@/lib/tmdb/consultas";

export async function GET(requisicao: Request) {
  const params = new URL(requisicao.url).searchParams;
  const { filtros, erros } = analisarFiltros(params);
  const { pagina, erro } = analisarPagina(params);
  const primeiroErro = erros[0] ?? erro;
  if (primeiroErro) return respostaErro(400, primeiroErro);

  try {
    return NextResponse.json(await listarFilmes(filtros, pagina));
  } catch (causa) {
    return respostaErroTmdb(causa);
  }
}
```

- [ ] **Step 3: Criar `app/api/busca/route.ts`**

```ts
import { NextResponse } from "next/server";
import { respostaErro, respostaErroTmdb } from "@/lib/api/resposta";
import { analisarPagina } from "@/lib/filtros/filtros";
import { buscarFilmes } from "@/lib/tmdb/consultas";

const TAMANHO_MAX = 100;

export async function GET(requisicao: Request) {
  const params = new URL(requisicao.url).searchParams;
  const q = (params.get("q") ?? "").trim();
  if (q.length === 0 || q.length > TAMANHO_MAX) {
    return respostaErro(400, 'Parâmetro "q" inválido.');
  }
  const { pagina, erro } = analisarPagina(params);
  if (erro) return respostaErro(400, erro);

  try {
    return NextResponse.json(await buscarFilmes(q, pagina));
  } catch (causa) {
    return respostaErroTmdb(causa);
  }
}
```

- [ ] **Step 4: Criar `app/api/filmes/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { respostaErro, respostaErroTmdb } from "@/lib/api/resposta";
import { obterFilme } from "@/lib/tmdb/consultas";

export async function GET(
  _requisicao: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) return respostaErro(400, "Id de filme inválido.");

  try {
    return NextResponse.json(await obterFilme(Number(id)));
  } catch (causa) {
    return respostaErroTmdb(causa);
  }
}
```

- [ ] **Step 5: Criar `app/api/servicos/route.ts`**

```ts
import { NextResponse } from "next/server";
import { respostaErroTmdb } from "@/lib/api/resposta";
import { listarServicos } from "@/lib/tmdb/consultas";

export async function GET() {
  try {
    return NextResponse.json(await listarServicos());
  } catch (causa) {
    return respostaErroTmdb(causa);
  }
}
```

- [ ] **Step 6: Criar `app/api/generos/route.ts`**

```ts
import { NextResponse } from "next/server";
import { respostaErroTmdb } from "@/lib/api/resposta";
import { listarGeneros } from "@/lib/tmdb/consultas";

export async function GET() {
  try {
    return NextResponse.json(await listarGeneros());
  } catch (causa) {
    return respostaErroTmdb(causa);
  }
}
```

- [ ] **Step 7: Verificar tipos e lint**

```bash
npm run typecheck && npm run lint
```

Expected: sem erros.

- [ ] **Step 8: Verificar as rotas com o servidor rodando**

Em um terminal, `npm run dev`. Em outro:

```bash
B=http://localhost:3000
status() { curl -s -o /dev/null -w "%{http_code}  $1\n" "$B$1"; }
status "/api/filmes"
status "/api/filmes?servico=8&genero=28,35&anoDe=2000&anoAte=2020&notaMin=7&ordem=nota&pagina=2"
status "/api/filmes?tipo=xyz"
status "/api/filmes?anoDe=2020&anoAte=2000"
status "/api/filmes?servico=8;9"
status "/api/filmes?pagina=501"
status "/api/busca?q=matrix"
status "/api/busca?q=%20%20"
status "/api/busca"
status "/api/filmes/603"
status "/api/filmes/abc"
status "/api/filmes/999999999"
status "/api/servicos"
status "/api/generos"
```

Expected, na ordem: `200, 200, 400, 400, 400, 400, 200, 400, 400, 200, 400, 404, 200, 200`.

Depois confira o conteúdo:

```bash
curl -s "$B/api/filmes" | head -c 400
curl -s "$B/api/filmes/603" | head -c 600
curl -s "$B/api/filmes?tipo=xyz"
```

Expected: a primeira resposta tem `pagina`, `totalPaginas`, `total` e `filmes` com `id`, `titulo`, `poster`, `ano`, `nota`; a segunda tem `sinopse`, `elenco`, `trailer` e `ondeAssistir` com as cinco chaves; a terceira é `{"erro":"Parâmetro \"tipo\" inválido."}`. Nenhuma resposta contém o token.

- [ ] **Step 9: Verificar a falta da chave**

Pare o servidor, renomeie `.env.local` para `.env.local.bak`, rode `npm run dev` e execute `status "/api/generos"`.

Expected: `500`. Restaure o nome do arquivo e reinicie o servidor.

- [ ] **Step 10: Commit**

```bash
git add app/api lib/api
git commit -m "feat: add API routes that proxy TMDB"
```

---

### Task 4: Hooks de dados no cliente

**Files:**
- Create: `lib/buscarJson.ts`, `lib/paginas.ts`, `app/provedores.tsx`, `hooks/useFiltros.ts`, `hooks/useFilmes.ts`, `hooks/useBusca.ts`, `hooks/useFilme.ts`, `hooks/useCatalogos.ts`

**Interfaces:**
- Consumes: as rotas da Tarefa 3; `analisarFiltros`, `escreverFiltros`, `contarFiltrosAtivos`, `FILTROS_PADRAO`.
- Produces:
  - `ErroApi` (com `status`) e `buscarJson<T>(url, sinal?)` de `@/lib/buscarJson`.
  - `juntarPaginas(paginas: PaginaFilmes[] | undefined): Filme[]` de `@/lib/paginas`.
  - `Provedores({ children })` de `@/app/provedores`.
  - `useFiltros(): { filtros: Filtros; definir(parcial: Partial<Filtros>): void; limpar(): void; ativos: number }`.
  - `ConsultaFilmes` (tipo), `useFilmes(filtros): ConsultaFilmes`, `useBusca(q): ConsultaFilmes`.
  - `useFilme(id): UseQueryResult<FilmeDetalhe, Error>`.
  - `useServicos(): UseQueryResult<Servico[], Error>`, `useGeneros(): UseQueryResult<Genero[], Error>`.

- [ ] **Step 1: Criar `lib/buscarJson.ts`**

```ts
export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroApi";
  }
}

const MENSAGEM_PADRAO = "Não foi possível carregar os dados.";

export async function buscarJson<T>(url: string, sinal?: AbortSignal): Promise<T> {
  const resposta = await fetch(url, { signal: sinal });
  if (!resposta.ok) {
    let mensagem = MENSAGEM_PADRAO;
    try {
      const corpo: unknown = await resposta.json();
      if (
        typeof corpo === "object" &&
        corpo !== null &&
        "erro" in corpo &&
        typeof corpo.erro === "string"
      ) {
        mensagem = corpo.erro;
      }
    } catch {
      // corpo sem JSON: fica a mensagem padrão
    }
    throw new ErroApi(resposta.status, mensagem);
  }
  return (await resposta.json()) as T;
}
```

- [ ] **Step 2: Criar `lib/paginas.ts`**

O TMDB pode repetir um filme em páginas vizinhas quando a popularidade muda entre duas chamadas. A grade usa o id como chave, então a repetição é removida aqui.

```ts
import type { Filme, PaginaFilmes } from "@/lib/tipos";

export function juntarPaginas(paginas: PaginaFilmes[] | undefined): Filme[] {
  const vistos = new Set<number>();
  const filmes: Filme[] = [];
  for (const pagina of paginas ?? []) {
    for (const filme of pagina.filmes) {
      if (!vistos.has(filme.id)) {
        vistos.add(filme.id);
        filmes.push(filme);
      }
    }
  }
  return filmes;
}
```

- [ ] **Step 3: Criar `app/provedores.tsx`**

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function Provedores({ children }: { children: ReactNode }) {
  const [cliente] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 4: Criar `hooks/useFiltros.ts`**

```ts
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  analisarFiltros,
  contarFiltrosAtivos,
  escreverFiltros,
  FILTROS_PADRAO,
} from "@/lib/filtros/filtros";
import type { Filtros } from "@/lib/tipos";

/** Os filtros vivem na URL. Quem usa este hook precisa estar dentro de <Suspense>. */
export function useFiltros() {
  const params = useSearchParams();
  const router = useRouter();

  const filtros = useMemo(
    () => analisarFiltros(new URLSearchParams(params.toString())).filtros,
    [params],
  );

  const aplicar = useCallback(
    (novos: Filtros) => {
      const consulta = escreverFiltros(novos).toString();
      router.push(consulta ? `/?${consulta}` : "/", { scroll: false });
    },
    [router],
  );

  const definir = useCallback(
    (parcial: Partial<Filtros>) => aplicar({ ...filtros, ...parcial }),
    [aplicar, filtros],
  );

  const limpar = useCallback(() => aplicar(FILTROS_PADRAO), [aplicar]);

  return { filtros, definir, limpar, ativos: contarFiltrosAtivos(filtros) };
}
```

- [ ] **Step 5: Criar `hooks/useFilmes.ts`**

```ts
"use client";

import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { buscarJson } from "@/lib/buscarJson";
import { escreverFiltros } from "@/lib/filtros/filtros";
import type { Filtros, PaginaFilmes } from "@/lib/tipos";

export type ConsultaFilmes = UseInfiniteQueryResult<
  InfiniteData<PaginaFilmes>,
  Error
>;

export function proximaPagina(ultima: PaginaFilmes): number | undefined {
  return ultima.pagina < ultima.totalPaginas ? ultima.pagina + 1 : undefined;
}

export function useFilmes(filtros: Filtros): ConsultaFilmes {
  const consulta = escreverFiltros(filtros).toString();
  return useInfiniteQuery({
    queryKey: ["filmes", consulta],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams(consulta);
      params.set("pagina", String(pageParam));
      return buscarJson<PaginaFilmes>(`/api/filmes?${params}`, signal);
    },
    initialPageParam: 1,
    getNextPageParam: proximaPagina,
  });
}
```

- [ ] **Step 6: Criar `hooks/useBusca.ts`**

```ts
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { buscarJson } from "@/lib/buscarJson";
import type { PaginaFilmes } from "@/lib/tipos";
import { proximaPagina, type ConsultaFilmes } from "./useFilmes";

export function useBusca(q: string): ConsultaFilmes {
  return useInfiniteQuery({
    queryKey: ["busca", q],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams({ q, pagina: String(pageParam) });
      return buscarJson<PaginaFilmes>(`/api/busca?${params}`, signal);
    },
    initialPageParam: 1,
    getNextPageParam: proximaPagina,
    enabled: q.length > 0,
  });
}
```

- [ ] **Step 7: Criar `hooks/useFilme.ts`**

```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { buscarJson, ErroApi } from "@/lib/buscarJson";
import type { FilmeDetalhe } from "@/lib/tipos";

export function useFilme(id: number) {
  return useQuery<FilmeDetalhe, Error>({
    queryKey: ["filme", id],
    queryFn: ({ signal }) =>
      buscarJson<FilmeDetalhe>(`/api/filmes/${id}`, signal),
    retry: (tentativas, erro) =>
      !(erro instanceof ErroApi && erro.status === 404) && tentativas < 1,
  });
}
```

- [ ] **Step 8: Criar `hooks/useCatalogos.ts`**

```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { buscarJson } from "@/lib/buscarJson";
import type { Genero, Servico } from "@/lib/tipos";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function useServicos() {
  return useQuery<Servico[], Error>({
    queryKey: ["servicos"],
    queryFn: ({ signal }) => buscarJson<Servico[]>("/api/servicos", signal),
    staleTime: UM_DIA_MS,
  });
}

export function useGeneros() {
  return useQuery<Genero[], Error>({
    queryKey: ["generos"],
    queryFn: ({ signal }) => buscarJson<Genero[]>("/api/generos", signal),
    staleTime: UM_DIA_MS,
  });
}
```

- [ ] **Step 9: Verificar**

```bash
npm run typecheck && npm run lint
```

Expected: sem erros. Os hooks ainda não têm tela; o comportamento é verificado nas tarefas 6 a 9.

- [ ] **Step 10: Commit**

```bash
git add lib/buscarJson.ts lib/paginas.ts app/provedores.tsx hooks
git commit -m "feat: add client data hooks"
```

---

### Task 5: Casca do app, tema e lista "quero ver"

**Files:**
- Create: `hooks/useMinhaLista.ts`, `components/BotaoTema.tsx`, `components/CampoBusca.tsx`, `components/ContadorLista.tsx`, `components/Cabecalho.tsx`, `components/Rodape.tsx`, `app/not-found.tsx`
- Modify: `app/globals.css` (substituir), `app/layout.tsx` (substituir), `app/page.tsx` (substituir por um marcador temporário)

**Interfaces:**
- Consumes: `Provedores` de `@/app/provedores`; `Filme` de `@/lib/tipos`.
- Produces:
  - `useMinhaLista(): { lista: Filme[]; tem(id: number): boolean; alternar(filme: Filme): void; remover(id: number): void }`.
  - Classes de cor do Tailwind: `bg-fundo`, `bg-superficie`, `text-texto`, `text-texto-suave`, `border-borda`, `border-borda-forte`, `bg-destaque`, `text-destaque`, `text-sobre-destaque` (e as variações `bg-`, `text-`, `border-` de cada token).
  - Chaves do `localStorage`: `catalogo:tema` (`"claro"` ou `"escuro"`) e `catalogo:minha-lista`.
  - `<main id="conteudo">` em todas as páginas.

- [ ] **Step 1: Substituir `app/globals.css`**

As cores são variáveis CSS trocadas pelo tema. Os componentes usam só as classes dos tokens, sem a variante `dark:`.

```css
@import "tailwindcss";

:root {
  color-scheme: light;
  --fundo: #faf8f5;
  --superficie: #ffffff;
  --texto: #1d1b18;
  --texto-suave: #5d574e;
  --borda: #d8d2c8;
  --borda-forte: #857d71;
  --destaque: #8a5a00;
  --sobre-destaque: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="claro"]) {
    color-scheme: dark;
    --fundo: #121214;
    --superficie: #1c1c20;
    --texto: #f2f1ee;
    --texto-suave: #aaa69f;
    --borda: #34343a;
    --borda-forte: #807c75;
    --destaque: #f5c451;
    --sobre-destaque: #1a1400;
  }
}

:root[data-theme="escuro"] {
  color-scheme: dark;
  --fundo: #121214;
  --superficie: #1c1c20;
  --texto: #f2f1ee;
  --texto-suave: #aaa69f;
  --borda: #34343a;
  --borda-forte: #807c75;
  --destaque: #f5c451;
  --sobre-destaque: #1a1400;
}

@theme inline {
  --color-fundo: var(--fundo);
  --color-superficie: var(--superficie);
  --color-texto: var(--texto);
  --color-texto-suave: var(--texto-suave);
  --color-borda: var(--borda);
  --color-borda-forte: var(--borda-forte);
  --color-destaque: var(--destaque);
  --color-sobre-destaque: var(--sobre-destaque);
  --font-sans: var(--font-geist-sans);
}

body {
  background: var(--fundo);
  color: var(--texto);
}

:focus-visible {
  outline: 2px solid var(--destaque);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Criar `hooks/useMinhaLista.ts`**

O estado fica fora do React e é lido com `useSyncExternalStore`, para todos os componentes verem a mesma lista. Se o `localStorage` falhar, a lista continua funcionando na memória.

```ts
"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Filme } from "@/lib/tipos";

const CHAVE = "catalogo:minha-lista";
const VAZIA: Filme[] = [];

let cache: Filme[] = VAZIA;
let cacheBruto: string | null = null;
const ouvintes = new Set<() => void>();

function ehFilme(valor: unknown): valor is Filme {
  if (typeof valor !== "object" || valor === null) return false;
  const v = valor as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.titulo === "string" &&
    (typeof v.poster === "string" || v.poster === null) &&
    (typeof v.ano === "number" || v.ano === null) &&
    (typeof v.nota === "number" || v.nota === null)
  );
}

function interpretar(bruto: string | null): Filme[] {
  if (!bruto) return VAZIA;
  try {
    const dados: unknown = JSON.parse(bruto);
    return Array.isArray(dados) ? dados.filter(ehFilme) : VAZIA;
  } catch {
    return VAZIA;
  }
}

function ler(): Filme[] {
  let bruto: string | null;
  try {
    bruto = localStorage.getItem(CHAVE);
  } catch {
    return cache;
  }
  if (bruto !== cacheBruto) {
    cacheBruto = bruto;
    cache = interpretar(bruto);
  }
  return cache;
}

function gravar(lista: Filme[]) {
  cache = lista;
  try {
    const bruto = JSON.stringify(lista);
    localStorage.setItem(CHAVE, bruto);
    cacheBruto = bruto;
  } catch {
    // armazenamento indisponível: a lista vale só até fechar a aba
  }
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  window.addEventListener("storage", avisar);
  return () => {
    ouvintes.delete(avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function useMinhaLista() {
  const lista = useSyncExternalStore(assinar, ler, () => VAZIA);

  const tem = useCallback(
    (id: number) => lista.some((filme) => filme.id === id),
    [lista],
  );

  const remover = useCallback((id: number) => {
    gravar(ler().filter((filme) => filme.id !== id));
  }, []);

  const alternar = useCallback((filme: Filme) => {
    const atual = ler();
    if (atual.some((item) => item.id === filme.id)) {
      gravar(atual.filter((item) => item.id !== filme.id));
      return;
    }
    const { id, titulo, poster, ano, nota } = filme;
    gravar([{ id, titulo, poster, ano, nota }, ...atual]);
  }, []);

  return { lista, tem, alternar, remover };
}
```

- [ ] **Step 3: Criar `components/BotaoTema.tsx`**

```tsx
"use client";

const CHAVE = "catalogo:tema";

function temaAtual(): "claro" | "escuro" {
  const definido = document.documentElement.dataset.theme;
  if (definido === "claro" || definido === "escuro") return definido;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "escuro"
    : "claro";
}

function alternarTema() {
  const novo = temaAtual() === "escuro" ? "claro" : "escuro";
  document.documentElement.dataset.theme = novo;
  try {
    localStorage.setItem(CHAVE, novo);
  } catch {
    // sem armazenamento: o tema vale só até recarregar
  }
}

export function BotaoTema() {
  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label="Alternar entre tema claro e escuro"
      className="grid size-10 place-items-center rounded-full border border-borda-forte hover:bg-superficie"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  );
}
```

- [ ] **Step 4: Criar `components/CampoBusca.tsx`**

```tsx
import Form from "next/form";

export function CampoBusca() {
  return (
    <Form action="/busca" role="search" className="flex min-w-0 flex-1 gap-2">
      <label htmlFor="campo-busca" className="sr-only">
        Buscar filme pelo nome
      </label>
      <input
        id="campo-busca"
        name="q"
        type="search"
        required
        maxLength={100}
        placeholder="Buscar filme"
        className="min-w-0 flex-1 rounded-full border border-borda-forte bg-superficie px-4 py-2 placeholder:text-texto-suave"
      />
      <button
        type="submit"
        className="rounded-full bg-destaque px-4 py-2 font-medium text-sobre-destaque"
      >
        Buscar
      </button>
    </Form>
  );
}
```

- [ ] **Step 5: Criar `components/ContadorLista.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useMinhaLista } from "@/hooks/useMinhaLista";

export function ContadorLista() {
  const { lista } = useMinhaLista();
  return (
    <Link
      href="/minha-lista"
      className="whitespace-nowrap rounded-full px-3 py-2 font-medium hover:bg-superficie"
    >
      Minha lista
      <span className="ml-1 text-texto-suave">({lista.length})</span>
    </Link>
  );
}
```

- [ ] **Step 6: Criar `components/Cabecalho.tsx`**

```tsx
import Link from "next/link";
import { BotaoTema } from "./BotaoTema";
import { CampoBusca } from "./CampoBusca";
import { ContadorLista } from "./ContadorLista";

export function Cabecalho() {
  return (
    <header className="border-b border-borda">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Catálogo de Streaming
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:order-last sm:ml-0">
          <ContadorLista />
          <BotaoTema />
        </div>
        <div className="flex w-full sm:w-auto sm:flex-1 sm:px-4">
          <CampoBusca />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 7: Criar `components/Rodape.tsx`**

```tsx
export function Rodape() {
  return (
    <footer className="mt-12 border-t border-borda">
      <div className="mx-auto max-w-7xl space-y-1 px-4 py-6 text-sm text-texto-suave">
        <p>
          Este produto usa a API do{" "}
          <a
            href="https://www.themoviedb.org/"
            className="underline"
            rel="noreferrer"
            target="_blank"
          >
            TMDB
          </a>
          , mas não é endossado nem certificado pelo TMDB.
        </p>
        <p>
          Dados de disponibilidade nos streamings fornecidos pelo{" "}
          <a
            href="https://www.justwatch.com/br"
            className="underline"
            rel="noreferrer"
            target="_blank"
          >
            JustWatch
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 8: Substituir `app/layout.tsx`**

O script no `<head>` aplica o tema salvo antes da primeira pintura. `suppressHydrationWarning` é necessário porque esse script altera o `<html>` antes de o React assumir.

```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { Provedores } from "./provedores";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Catálogo de Streaming",
    template: "%s · Catálogo de Streaming",
  },
  description:
    "Os filmes disponíveis agora nos serviços de streaming do Brasil.",
};

const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("catalogo:tema");if(t==="claro"||t==="escuro"){document.documentElement.dataset.theme=t}}catch(e){}})()`;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-destaque focus:px-3 focus:py-2 focus:text-sobre-destaque"
        >
          Pular para o conteúdo
        </a>
        <Provedores>
          <Cabecalho />
          <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
            {children}
          </main>
          <Rodape />
        </Provedores>
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Criar `app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-texto-suave">
        O filme ou a página que você procura não existe.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-destaque px-5 py-2 font-medium text-sobre-destaque"
      >
        Voltar ao catálogo
      </Link>
    </div>
  );
}
```

- [ ] **Step 10: Substituir `app/page.tsx` por um marcador temporário**

A Tarefa 6 substitui este arquivo.

```tsx
export default function Pagina() {
  return <h1 className="text-2xl font-bold">Catálogo</h1>;
}
```

Apague também os arquivos de exemplo do modelo que não são mais usados: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg` (os que existirem).

- [ ] **Step 11: Verificar tipos, lint e build**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: sem erros.

- [ ] **Step 12: Verificar no navegador**

Com `npm run dev`, abra `http://localhost:3000`:

1. Cabeçalho, título "Catálogo" e rodapé com os créditos ao TMDB e ao JustWatch aparecem.
2. O botão de tema troca as cores. Recarregue: o tema escolhido continua, sem piscar a outra cor.
3. No DevTools, apague `catalogo:tema` do `localStorage` e alterne o tema do sistema (Rendering → Emulate CSS prefers-color-scheme): a página acompanha.
4. Aperte Tab a partir do topo: o primeiro foco é "Pular para o conteúdo", e todo elemento focado tem contorno visível.
5. Abra `http://localhost:3000/nao-existe`: aparece "Página não encontrada".

- [ ] **Step 13: Verificar o armazenamento corrompido e bloqueado (Review Focus 3)**

1. No console: `localStorage.setItem("catalogo:minha-lista", "{isto não é json")` e recarregue. Expected: a página abre, o cabeçalho mostra "Minha lista (0)" e não há erro no console.
2. No console: `localStorage.setItem("catalogo:minha-lista", '[{"id":"x"},{"id":603,"titulo":"Matrix","poster":null,"ano":1999,"nota":8.2}]')` e recarregue. Expected: "Minha lista (1)".
3. Nas configurações do navegador, bloqueie cookies e dados do site para `localhost` e recarregue. Expected: a página abre, "Minha lista (0)", e o botão de tema ainda troca as cores. Desfaça o bloqueio depois.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: add app shell, theme switching and watchlist store"
```

---

### Task 6: Grade de filmes e catálogo com rolagem infinita

**Files:**
- Create: `components/Poster.tsx`, `components/BotaoLista.tsx`, `components/CartaoFilme.tsx`, `components/GradeFilmes.tsx`, `components/ResultadoFilmes.tsx`, `components/Catalogo.tsx`
- Modify: `app/page.tsx` (substituir)

**Interfaces:**
- Consumes: `useFiltros`, `useFilmes`, `ConsultaFilmes`, `useMinhaLista`, `juntarPaginas`, `urlImagem`, `Filme`.
- Produces:
  - `Poster({ caminho, titulo, tamanho? })`, com `tamanho` `"w342"` (padrão) ou `"w500"`.
  - `BotaoLista({ filme, comTexto? })`.
  - `CartaoFilme({ filme })`, que renderiza um `<li>`.
  - `GradeFilmes({ children })`, que renderiza o `<ul>` da grade, e `EsqueletosFilmes({ quantidade? })`.
  - `ResultadoFilmes({ consulta, vazio })`, com `consulta: ConsultaFilmes` e `vazio: ReactNode`.
  - `Catalogo()`, que a Tarefa 7 modifica para incluir os filtros.

- [ ] **Step 1: Criar `components/Poster.tsx`**

`unoptimized` evita gastar a cota de otimização de imagens da Vercel; o TMDB já entrega o tamanho pedido.

```tsx
import Image from "next/image";
import { urlImagem } from "@/lib/config";

const DIMENSOES = { w342: [342, 513], w500: [500, 750] } as const;

export function Poster({
  caminho,
  titulo,
  tamanho = "w342",
}: {
  caminho: string | null;
  titulo: string;
  tamanho?: keyof typeof DIMENSOES;
}) {
  const url = urlImagem(caminho, tamanho);
  if (!url) {
    return (
      <div className="grid aspect-[2/3] w-full place-items-center rounded-lg border border-borda bg-superficie p-3 text-center text-sm text-texto-suave">
        Sem pôster
      </div>
    );
  }
  const [largura, altura] = DIMENSOES[tamanho];
  return (
    <Image
      src={url}
      alt={`Pôster de ${titulo}`}
      width={largura}
      height={altura}
      unoptimized
      className="aspect-[2/3] w-full rounded-lg bg-superficie object-cover"
    />
  );
}
```

- [ ] **Step 2: Criar `components/BotaoLista.tsx`**

```tsx
"use client";

import { useMinhaLista } from "@/hooks/useMinhaLista";
import type { Filme } from "@/lib/tipos";

export function BotaoLista({
  filme,
  comTexto = false,
}: {
  filme: Filme;
  comTexto?: boolean;
}) {
  const { tem, alternar } = useMinhaLista();
  const salvo = tem(filme.id);
  const rotulo = salvo
    ? `Remover ${filme.titulo} da minha lista`
    : `Adicionar ${filme.titulo} à minha lista`;

  return (
    <button
      type="button"
      onClick={() => alternar(filme)}
      aria-pressed={salvo}
      aria-label={rotulo}
      title={rotulo}
      className={
        comTexto
          ? "inline-flex items-center gap-2 rounded-full border border-borda-forte bg-superficie px-4 py-2 font-medium"
          : "grid size-10 place-items-center rounded-full border border-borda-forte bg-superficie"
      }
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <path
          d="M6 3h12v18l-6-4-6 4z"
          fill={salvo ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {comTexto && <span>{salvo ? "Na minha lista" : "Quero ver"}</span>}
    </button>
  );
}
```

- [ ] **Step 3: Criar `components/CartaoFilme.tsx`**

O botão fica fora do link, porque um elemento interativo não pode ficar dentro de outro.

```tsx
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
      <div className="absolute right-2 top-2">
        <BotaoLista filme={filme} />
      </div>
    </li>
  );
}
```

- [ ] **Step 4: Criar `components/GradeFilmes.tsx`**

```tsx
import type { ReactNode } from "react";

const CLASSES_GRADE =
  "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function GradeFilmes({ children }: { children: ReactNode }) {
  return <ul className={CLASSES_GRADE}>{children}</ul>;
}

export function EsqueletosFilmes({ quantidade = 12 }: { quantidade?: number }) {
  return (
    <div className={CLASSES_GRADE} aria-hidden="true">
      {Array.from({ length: quantidade }, (_, indice) => (
        <div key={indice}>
          <div className="aspect-[2/3] w-full animate-pulse rounded-lg bg-borda" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-borda" />
          <div className="mt-1 h-3 w-1/3 animate-pulse rounded bg-borda" />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Criar `components/ResultadoFilmes.tsx`**

A sentinela só é observada quando não há erro. Sem essa condição, uma falha na próxima página dispararia novas tentativas sem parar enquanto a sentinela estivesse visível.

```tsx
"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { ConsultaFilmes } from "@/hooks/useFilmes";
import { juntarPaginas } from "@/lib/paginas";
import { CartaoFilme } from "./CartaoFilme";
import { EsqueletosFilmes, GradeFilmes } from "./GradeFilmes";

const CLASSES_BOTAO =
  "rounded-full border border-borda-forte bg-superficie px-5 py-2 font-medium";

function Erro({ mensagem, aoTentar }: { mensagem: string; aoTentar: () => void }) {
  return (
    <div role="alert" className="py-8 text-center">
      <p>{mensagem}</p>
      <button type="button" onClick={aoTentar} className={`mt-3 ${CLASSES_BOTAO}`}>
        Tentar de novo
      </button>
    </div>
  );
}

export function ResultadoFilmes({
  consulta,
  vazio,
}: {
  consulta: ConsultaFilmes;
  vazio: ReactNode;
}) {
  const {
    data,
    error,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = consulta;

  const filmes = useMemo(() => juntarPaginas(data?.pages), [data]);
  const total = data?.pages[0]?.total ?? 0;
  const sentinela = useRef<HTMLDivElement>(null);
  const podeCarregar = hasNextPage && !isFetchingNextPage && !isError;

  useEffect(() => {
    const elemento = sentinela.current;
    if (!elemento || !podeCarregar) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas[0]?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: "600px" },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [podeCarregar, fetchNextPage]);

  if (isPending) {
    return (
      <>
        <p role="status" className="sr-only">
          Carregando filmes…
        </p>
        <EsqueletosFilmes />
      </>
    );
  }

  if (isError && filmes.length === 0) {
    return <Erro mensagem={error.message} aoTentar={() => void refetch()} />;
  }

  if (filmes.length === 0) return <>{vazio}</>;

  return (
    <>
      <p className="mb-4 text-sm text-texto-suave">
        {total.toLocaleString("pt-BR")}{" "}
        {total === 1 ? "filme encontrado" : "filmes encontrados"}
      </p>
      <GradeFilmes>
        {filmes.map((filme) => (
          <CartaoFilme key={filme.id} filme={filme} />
        ))}
      </GradeFilmes>
      <p role="status" className="sr-only">
        {isFetchingNextPage
          ? "Carregando mais filmes…"
          : `${filmes.length} filmes carregados.`}
      </p>
      {isFetchingNextPage && (
        <div className="mt-6">
          <EsqueletosFilmes quantidade={6} />
        </div>
      )}
      {isError && (
        <Erro
          mensagem="Não foi possível carregar mais filmes."
          aoTentar={() => void fetchNextPage()}
        />
      )}
      {hasNextPage && !isError && !isFetchingNextPage && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            className={CLASSES_BOTAO}
          >
            Carregar mais
          </button>
        </div>
      )}
      {!hasNextPage && (
        <p className="mt-8 text-center text-sm text-texto-suave">
          Fim da lista.
        </p>
      )}
      <div ref={sentinela} aria-hidden="true" />
    </>
  );
}
```

- [ ] **Step 6: Criar `components/Catalogo.tsx`**

```tsx
"use client";

import { useFilmes } from "@/hooks/useFilmes";
import { useFiltros } from "@/hooks/useFiltros";
import { ResultadoFilmes } from "./ResultadoFilmes";

export function Catalogo() {
  const { filtros } = useFiltros();
  const consulta = useFilmes(filtros);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Filmes no streaming</h1>
      <ResultadoFilmes
        consulta={consulta}
        vazio={
          <p className="py-12 text-center">
            Nenhum filme com esses filtros. Tente remover algum deles.
          </p>
        }
      />
    </>
  );
}
```

- [ ] **Step 7: Substituir `app/page.tsx`**

`useFiltros` lê a URL com `useSearchParams`, o que exige um limite de `Suspense` para o build.

```tsx
import { Suspense } from "react";
import { Catalogo } from "@/components/Catalogo";
import { EsqueletosFilmes } from "@/components/GradeFilmes";

export default function Pagina() {
  return (
    <Suspense fallback={<EsqueletosFilmes />}>
      <Catalogo />
    </Suspense>
  );
}
```

- [ ] **Step 8: Verificar tipos, lint e build**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: sem erros.

- [ ] **Step 9: Verificar no navegador**

Com `npm run dev`, em `http://localhost:3000`:

1. Aparecem esqueletos e depois a grade com pôster, título, ano e nota.
2. Rolar até o fim carrega mais filmes sozinho. O botão "Carregar mais" também funciona com Tab e Enter.
3. Redimensione de 360px a 1440px: a grade vai de 2 a 6 colunas, sem rolagem horizontal.
4. Clique no marcador de um cartão: o ícone fica preenchido e o contador do cabeçalho sobe. Recarregue: continua marcado.
5. O console não tem erros nem avisos.

- [ ] **Step 10: Verificar filme repetido entre páginas (Review Focus 2)**

Role até carregar pelo menos cinco páginas. Expected: nenhum aviso "Encountered two children with the same key" no console e nenhum filme repetido na grade.

- [ ] **Step 11: Verificar dados faltando no cartão (Review Focus 4)**

Abra `http://localhost:3000/?ordem=lancamento&tipo=free` e role algumas páginas; essa combinação costuma trazer filmes sem pôster e sem votos. Expected: filmes sem pôster mostram o quadro "Sem pôster", filmes sem votos não mostram estrela nem nota, e em nenhum lugar aparece "null", "NaN" ou imagem quebrada.

- [ ] **Step 12: Verificar falha na próxima página (Review Focus 5)**

1. Carregue o catálogo, depois marque "Offline" na aba Network do DevTools e role até o fim. Expected: os filmes carregados continuam, aparece "Não foi possível carregar mais filmes." com "Tentar de novo", e a aba Network não mostra chamadas repetidas a `/api/filmes` sem parar.
2. Desmarque "Offline" e clique em "Tentar de novo". Expected: a próxima página carrega.
3. Com "Offline" marcado, recarregue a página (com o cache do navegador desativado). Expected ao voltar online e recarregar com `/api/filmes` bloqueado em "Network request blocking": mensagem de erro com "Tentar de novo" no lugar da grade.

- [ ] **Step 13: Commit**

```bash
git add components app/page.tsx
git commit -m "feat: add movie grid and catalog with infinite scroll"
```

---

### Task 7: Filtros do catálogo

**Files:**
- Create: `components/ControlesFiltros.tsx`, `components/BarraFiltros.tsx`
- Modify: `components/Catalogo.tsx` (substituir)

**Interfaces:**
- Consumes: `useFiltros`, `useServicos`, `useGeneros`, `urlImagem`, `TIPOS`, `ORDENS`, `ROTULO_TIPO`, `ROTULO_ORDEM`, `ANO_MIN`, `anoMax`.
- Produces: `ControlesFiltros()`, `BarraFiltros()`.

- [ ] **Step 1: Criar `components/ControlesFiltros.tsx`**

O Brasil tem dezenas de serviços no TMDB. A lista mostra os 12 mais relevantes e um botão para ver todos. Os campos de ano só gravam na URL ao sair do campo ou apertar Enter, para um ano digitado pela metade não virar filtro.

```tsx
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

const SERVICOS_VISIVEIS = 12;
const NOTAS = [0, 5, 6, 7, 8, 9];

const CLASSES_CAMPO =
  "rounded-lg border border-borda-forte bg-superficie px-3 py-2";
const CLASSES_ROTULO = "mb-1 block text-sm font-medium";

function alternarId(lista: number[], id: number): number[] {
  return lista.includes(id) ? lista.filter((item) => item !== id) : [...lista, id];
}

function classesEtiqueta(ativa: boolean): string {
  return ativa
    ? "rounded-full border border-destaque bg-destaque px-3 py-1 text-sm font-medium text-sobre-destaque"
    : "rounded-full border border-borda-forte bg-superficie px-3 py-1 text-sm";
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
```

Os dois `as` nos `onChange` são seguros porque as opções dos `<select>` vêm de `TIPOS` e `ORDENS`.

- [ ] **Step 2: Criar `components/BarraFiltros.tsx`**

No celular os filtros abrem em um `<dialog>` nativo com `showModal()`, que já prende o foco, fecha com Esc e devolve o foco ao botão.

```tsx
"use client";

import { useId, useRef } from "react";
import { useFiltros } from "@/hooks/useFiltros";
import { ControlesFiltros } from "./ControlesFiltros";

export function BarraFiltros() {
  const { ativos } = useFiltros();
  const painel = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  return (
    <section aria-label="Filtros" className="mb-6">
      <div className="hidden md:block">
        <ControlesFiltros />
      </div>

      <button
        type="button"
        onClick={() => painel.current?.showModal()}
        className="rounded-full border border-borda-forte bg-superficie px-4 py-2 font-medium md:hidden"
      >
        Filtros{ativos > 0 && ` (${ativos})`}
      </button>

      <dialog
        ref={painel}
        aria-labelledby={idTitulo}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-fundo p-4 text-texto backdrop:bg-black/50"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={idTitulo} className="text-xl font-bold">
            Filtros
          </h2>
          <button
            type="button"
            onClick={() => painel.current?.close()}
            className="rounded-full border border-borda-forte px-4 py-2 font-medium"
          >
            Fechar
          </button>
        </div>
        <ControlesFiltros />
        <button
          type="button"
          onClick={() => painel.current?.close()}
          className="mt-6 w-full rounded-full bg-destaque px-4 py-3 font-medium text-sobre-destaque"
        >
          Ver resultados
        </button>
      </dialog>
    </section>
  );
}
```

- [ ] **Step 3: Substituir `components/Catalogo.tsx`**

```tsx
"use client";

import { useFilmes } from "@/hooks/useFilmes";
import { useFiltros } from "@/hooks/useFiltros";
import { BarraFiltros } from "./BarraFiltros";
import { ResultadoFilmes } from "./ResultadoFilmes";

export function Catalogo() {
  const { filtros } = useFiltros();
  const consulta = useFilmes(filtros);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Filmes no streaming</h1>
      <BarraFiltros />
      <ResultadoFilmes
        consulta={consulta}
        vazio={
          <p className="py-12 text-center">
            Nenhum filme com esses filtros. Tente remover algum deles.
          </p>
        }
      />
    </>
  );
}
```

- [ ] **Step 4: Verificar tipos, lint e build**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: sem erros.

- [ ] **Step 5: Verificar os filtros no navegador**

Com `npm run dev`, em uma janela larga:

1. Marque Netflix: a URL vira `/?servico=8` e a grade recarrega. Marque também Prime Video: `/?servico=8,119` (os ids podem variar) e o total aumenta.
2. Marque dois gêneros: o total diminui (o filme precisa ter os dois).
3. Troque o tipo para "Aluguel": a URL ganha `tipo=rent`. Volte para "Assinatura": `tipo` some da URL.
4. Digite `19` em "Ano, de" e saia do campo: o campo volta ao valor anterior e a URL não muda. Digite `2010`: a URL ganha `anoDe=2010`. Digite `2005` em "Ano, até": `anoDe` desce para `2005`.
5. Escolha nota mínima "8 ou mais" e ordenação "Nota": os filmes vêm em ordem decrescente de nota.
6. O botão voltar do navegador desfaz o último filtro, e os controles acompanham.
7. Copie a URL com vários filtros e abra em outra aba: os mesmos filtros e resultados aparecem.
8. "Limpar filtros" leva a URL de volta a `/`.
9. Escolha uma combinação sem resultado (por exemplo, três gêneros incompatíveis com nota 9): aparece "Nenhum filme com esses filtros."

- [ ] **Step 6: Verificar o painel no celular**

Com a janela em 375px de largura:

1. Os controles somem e aparece o botão "Filtros". Com dois filtros ativos, ele mostra "Filtros (2)".
2. O botão abre o painel em tela cheia. Tab circula só dentro do painel.
3. Esc fecha o painel e o foco volta ao botão "Filtros".
4. Mudar um filtro dentro do painel atualiza a grade por trás; "Ver resultados" fecha o painel.

- [ ] **Step 7: Verificar URL inválida (Review Focus 1)**

Abra `http://localhost:3000/?tipo=xyz&anoDe=abc&servico=;;&notaMin=99&ordem=qualquer&genero=28`.

Expected: o catálogo abre normalmente, com tipo "Assinatura", anos vazios, nota "Qualquer", ordenação "Popularidade" e o gênero de id 28 marcado. Não há mensagem de erro, e a chamada a `/api/filmes` na aba Network responde 200.

- [ ] **Step 8: Commit**

```bash
git add components
git commit -m "feat: add catalog filters with URL state"
```

---

### Task 8: Página de busca

**Files:**
- Create: `components/ResultadoBusca.tsx`, `app/busca/page.tsx`

**Interfaces:**
- Consumes: `useBusca`, `ResultadoFilmes`.
- Produces: `ResultadoBusca({ q })`; rota `/busca?q=`.

- [ ] **Step 1: Criar `components/ResultadoBusca.tsx`**

```tsx
"use client";

import { useBusca } from "@/hooks/useBusca";
import { ResultadoFilmes } from "./ResultadoFilmes";

export function ResultadoBusca({ q }: { q: string }) {
  const consulta = useBusca(q);

  return (
    <>
      <h1 className="text-2xl font-bold">Resultados para “{q}”</h1>
      <p className="mb-4 mt-1 text-sm text-texto-suave">
        A busca mostra qualquer filme. A página de cada um informa se ele está
        em algum streaming no Brasil.
      </p>
      <ResultadoFilmes
        consulta={consulta}
        vazio={
          <p className="py-12 text-center">
            Nenhum filme encontrado para “{q}”. Confira a grafia ou tente outro
            título.
          </p>
        }
      />
    </>
  );
}
```

- [ ] **Step 2: Criar `app/busca/page.tsx`**

A página lê `q` no servidor e passa como prop. Assim o componente cliente não precisa de `useSearchParams` nem de `Suspense`.

```tsx
import type { Metadata } from "next";
import { ResultadoBusca } from "@/components/ResultadoBusca";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

async function lerConsulta(searchParams: Props["searchParams"]): Promise<string> {
  const { q } = await searchParams;
  const texto = Array.isArray(q) ? q[0] : q;
  return (texto ?? "").trim().slice(0, 100);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = await lerConsulta(searchParams);
  return { title: q ? `Busca: ${q}` : "Busca" };
}

export default async function PaginaBusca({ searchParams }: Props) {
  const q = await lerConsulta(searchParams);
  if (!q) {
    return (
      <>
        <h1 className="text-2xl font-bold">Busca</h1>
        <p className="mt-2 text-texto-suave">
          Digite o nome de um filme no campo de busca acima.
        </p>
      </>
    );
  }
  return <ResultadoBusca key={q} q={q} />;
}
```

- [ ] **Step 3: Verificar tipos, lint e build**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: sem erros.

- [ ] **Step 4: Verificar no navegador**

1. Digite "matrix" no cabeçalho e aperte Enter: a URL vira `/busca?q=matrix`, o título da aba é "Busca: matrix · Catálogo de Streaming" e os filmes aparecem.
2. Busque "o senhor dos anéis: a sociedade": acentos e dois-pontos funcionam.
3. Busque "zzzzqqqqxxxx": aparece "Nenhum filme encontrado".
4. Abra `/busca` e `/busca?q=%20%20`: aparece a instrução para digitar um nome, sem chamada a `/api/busca`.
5. Faça uma busca com muitos resultados ("amor") e role: a rolagem infinita funciona.
6. O campo de busca vazio não envia (o navegador pede para preencher).

- [ ] **Step 5: Commit**

```bash
git add components/ResultadoBusca.tsx app/busca
git commit -m "feat: add search page"
```

---

### Task 9: Página de detalhes

**Files:**
- Create: `components/OndeAssistir.tsx`, `components/DetalheFilme.tsx`, `app/filme/[id]/page.tsx`

**Interfaces:**
- Consumes: `useFilme`, `ErroApi`, `obterFilme`, `Poster`, `BotaoLista`, `urlImagem`, `TIPOS`, `ROTULO_TIPO`, `OndeAssistir` (tipo), `FilmeDetalhe`.
- Produces: `OndeAssistir({ opcoes, link })` (componente), `DetalheFilme({ id })`; rota `/filme/[id]`.

- [ ] **Step 1: Criar `components/OndeAssistir.tsx`**

```tsx
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
                      className="flex items-center gap-2 rounded-lg border border-borda bg-superficie px-3 py-2"
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
```

- [ ] **Step 2: Criar `components/DetalheFilme.tsx`**

```tsx
"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { useFilme } from "@/hooks/useFilme";
import { ErroApi } from "@/lib/buscarJson";
import { urlImagem } from "@/lib/config";
import { BotaoLista } from "./BotaoLista";
import { OndeAssistir } from "./OndeAssistir";
import { Poster } from "./Poster";

function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

export function DetalheFilme({ id }: { id: number }) {
  const { data: filme, error, isPending, isError, refetch } = useFilme(id);

  if (isPending) {
    return (
      <>
        <p role="status" className="sr-only">
          Carregando filme…
        </p>
        <div aria-hidden="true" className="grid gap-6 md:grid-cols-[18rem_1fr]">
          <div className="mx-auto aspect-[2/3] w-56 animate-pulse rounded-lg bg-borda md:w-full" />
          <div className="space-y-3">
            <div className="h-8 w-2/3 animate-pulse rounded bg-borda" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-borda" />
            <div className="h-24 animate-pulse rounded bg-borda" />
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    if (error instanceof ErroApi && error.status === 404) notFound();
    return (
      <div role="alert" className="py-12 text-center">
        <p>{error.message}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 rounded-full border border-borda-forte bg-superficie px-5 py-2 font-medium"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  const fundo = urlImagem(filme.fundo, "w1280");
  const fatos = [
    filme.ano !== null ? String(filme.ano) : null,
    filme.duracao !== null ? formatarDuracao(filme.duracao) : null,
    filme.generos.map((genero) => genero.nome).join(", ") || null,
  ].filter((fato): fato is string => fato !== null);

  return (
    <article>
      {fundo && (
        <Image
          src={fundo}
          alt=""
          width={1280}
          height={720}
          unoptimized
          priority
          className="mb-6 hidden aspect-[21/9] w-full rounded-xl object-cover md:block"
        />
      )}

      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        <div className="mx-auto w-56 md:w-full">
          <Poster caminho={filme.poster} titulo={filme.titulo} tamanho="w500" />
        </div>

        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold">{filme.titulo}</h1>
            {fatos.length > 0 && (
              <p className="mt-1 text-texto-suave">{fatos.join(" · ")}</p>
            )}
            <p className="mt-2">
              {filme.nota !== null ? (
                <>
                  <span aria-hidden="true">★</span>{" "}
                  <span className="sr-only">Nota </span>
                  {filme.nota.toFixed(1)} de 10
                </>
              ) : (
                <span className="text-texto-suave">Ainda sem avaliações</span>
              )}
            </p>
            <div className="mt-4">
              <BotaoLista filme={filme} comTexto />
            </div>
          </header>

          <section aria-labelledby="titulo-sinopse">
            <h2 id="titulo-sinopse" className="text-xl font-bold">
              Sinopse
            </h2>
            <p className="mt-2 max-w-prose">
              {filme.sinopse || (
                <span className="text-texto-suave">
                  Sinopse não disponível em português.
                </span>
              )}
            </p>
          </section>

          <OndeAssistir opcoes={filme.ondeAssistir} link={filme.linkOpcoes} />
        </div>
      </div>

      {filme.trailer && (
        <section aria-labelledby="titulo-trailer" className="mt-10">
          <h2 id="titulo-trailer" className="text-xl font-bold">
            Trailer
          </h2>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${filme.trailer}`}
            title={`Trailer de ${filme.titulo}`}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            className="mt-3 aspect-video w-full max-w-3xl rounded-xl border border-borda"
          />
        </section>
      )}

      {filme.elenco.length > 0 && (
        <section aria-labelledby="titulo-elenco" className="mt-10">
          <h2 id="titulo-elenco" className="text-xl font-bold">
            Elenco principal
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {filme.elenco.map((pessoa) => {
              const foto = urlImagem(pessoa.foto, "w185");
              return (
                <li key={pessoa.id}>
                  {foto ? (
                    <Image
                      src={foto}
                      alt=""
                      width={185}
                      height={278}
                      unoptimized
                      className="aspect-[2/3] w-full rounded-lg bg-superficie object-cover"
                    />
                  ) : (
                    <div className="aspect-[2/3] w-full rounded-lg border border-borda bg-superficie" />
                  )}
                  <p className="mt-2 font-medium">{pessoa.nome}</p>
                  {pessoa.personagem && (
                    <p className="text-sm text-texto-suave">
                      {pessoa.personagem}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Criar `app/filme/[id]/page.tsx`**

O título da aba é gerado no servidor com a mesma consulta que a rota de API usa; o cache de dados do Next evita uma segunda chamada ao TMDB.

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetalheFilme } from "@/components/DetalheFilme";
import { obterFilme } from "@/lib/tmdb/consultas";

type Props = { params: Promise<{ id: string }> };

const ID_VALIDO = /^\d{1,9}$/;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!ID_VALIDO.test(id)) return { title: "Filme não encontrado" };
  try {
    const filme = await obterFilme(Number(id));
    return {
      title: filme.titulo,
      description: filme.sinopse.slice(0, 160) || undefined,
    };
  } catch {
    return { title: "Filme" };
  }
}

export default async function PaginaFilme({ params }: Props) {
  const { id } = await params;
  if (!ID_VALIDO.test(id)) notFound();
  return <DetalheFilme id={Number(id)} />;
}
```

- [ ] **Step 4: Verificar tipos, lint e build**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: sem erros.

- [ ] **Step 5: Verificar no navegador**

1. Clique em um cartão do catálogo: abre `/filme/<id>` com imagem de fundo (em tela larga), pôster, título, ano, duração, gêneros, nota, sinopse, "Onde assistir" agrupado por tipo, trailer e elenco. O título da aba é o nome do filme.
2. O botão "Quero ver" vira "Na minha lista" e o contador do cabeçalho sobe.
3. O trailer toca dentro da página.
4. Em 375px de largura tudo fica em uma coluna, sem rolagem horizontal.
5. O botão voltar retorna ao catálogo com os filtros preservados.

- [ ] **Step 6: Verificar filme inexistente e dados faltando (Review Focus 4)**

1. `/filme/abc` e `/filme/999999999`: os dois mostram "Página não encontrada".
2. Busque um filme antigo e obscuro (por exemplo "A Chegada de um Trem à Estação") e abra: expected "Indisponível no Brasil no momento." em "Onde assistir", sem seção de trailer se não houver vídeo, e o quadro "Sem pôster" se não houver imagem.
3. Em nenhuma página aparece "null", "NaN", "undefined" ou "0 min".

- [ ] **Step 7: Commit**

```bash
git add components/OndeAssistir.tsx components/DetalheFilme.tsx app/filme
git commit -m "feat: add movie details page"
```

---

### Task 10: Página "Minha lista"

**Files:**
- Create: `components/ListaSalva.tsx`, `app/minha-lista/page.tsx`

**Interfaces:**
- Consumes: `useMinhaLista`, `CartaoFilme`, `GradeFilmes`.
- Produces: `ListaSalva()`; rota `/minha-lista`.

- [ ] **Step 1: Criar `components/ListaSalva.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useMinhaLista } from "@/hooks/useMinhaLista";
import { CartaoFilme } from "./CartaoFilme";
import { GradeFilmes } from "./GradeFilmes";

export function ListaSalva() {
  const { lista } = useMinhaLista();

  if (lista.length === 0) {
    return (
      <div className="py-12 text-center">
        <p>Sua lista está vazia.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-destaque px-5 py-2 font-medium text-sobre-destaque"
        >
          Explorar o catálogo
        </Link>
      </div>
    );
  }

  return (
    <GradeFilmes>
      {lista.map((filme) => (
        <CartaoFilme key={filme.id} filme={filme} />
      ))}
    </GradeFilmes>
  );
}
```

- [ ] **Step 2: Criar `app/minha-lista/page.tsx`**

```tsx
import type { Metadata } from "next";
import { ListaSalva } from "@/components/ListaSalva";

export const metadata: Metadata = { title: "Minha lista" };

export default function PaginaMinhaLista() {
  return (
    <>
      <h1 className="text-2xl font-bold">Minha lista</h1>
      <p className="mb-6 mt-1 text-sm text-texto-suave">
        A lista fica guardada só neste navegador. Ela não aparece em outros
        aparelhos e some se os dados do site forem apagados.
      </p>
      <ListaSalva />
    </>
  );
}
```

- [ ] **Step 3: Verificar tipos, lint e build**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: sem erros.

- [ ] **Step 4: Verificar no navegador**

1. Com a lista vazia, `/minha-lista` mostra "Sua lista está vazia." e o link para o catálogo.
2. Adicione três filmes no catálogo e abra "Minha lista": os três aparecem, o mais recente primeiro, sem chamada a `/api/*` na aba Network.
3. Clique no marcador de um deles: ele some da lista e o contador desce.
4. Abra o site em duas abas. Adicione um filme em uma: o contador da outra atualiza.
5. Recarregue a página: não há aviso de hidratação no console.

- [ ] **Step 5: Commit**

```bash
git add components/ListaSalva.tsx app/minha-lista
git commit -m "feat: add watchlist page"
```

---

### Task 11: Verificação final, README e publicação

**Files:**
- Create: `docs/roteiro-de-verificacao.md`
- Modify: `README.md` (substituir)

**Interfaces:**
- Consumes: o app completo das tarefas 1 a 10.
- Produces: README, roteiro de verificação preenchido, repositório no GitHub e site na Vercel.

- [ ] **Step 1: Criar `docs/roteiro-de-verificacao.md`**

```markdown
# Roteiro de verificação manual

Rode com `npm run build && npm run start` e marque cada item. Repita a seção "Fluxos" nos dois temas.

## Automático

- [ ] `npm run typecheck` sem erros
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros

## Fluxos

- [ ] O catálogo abre com filmes por assinatura, ordenados por popularidade
- [ ] A rolagem infinita carrega mais filmes; "Carregar mais" funciona com o teclado
- [ ] Cada filtro (serviço, gênero, tipo, ano, nota, ordenação) muda a grade e a URL
- [ ] Uma URL com filtros aberta em outra aba mostra os mesmos resultados
- [ ] O botão voltar desfaz o último filtro
- [ ] "Limpar filtros" volta a URL para `/`
- [ ] Uma combinação sem resultado mostra a mensagem de lista vazia
- [ ] A busca por nome mostra resultados; uma busca sem resultado mostra a mensagem
- [ ] A página de detalhes mostra sinopse, elenco, trailer e onde assistir
- [ ] Um filme sem streaming no Brasil mostra "Indisponível no Brasil no momento."
- [ ] `/filme/abc` e `/filme/999999999` mostram a página 404
- [ ] Adicionar e remover da lista atualiza o contador; a lista sobrevive a recarregar
- [ ] O rodapé credita o TMDB e o JustWatch

## Tema

- [ ] Sem escolha salva, o site segue o tema do sistema
- [ ] O botão alterna o tema e a escolha sobrevive a recarregar, sem piscar

## Celular (375px)

- [ ] Nenhuma página tem rolagem horizontal
- [ ] Os filtros abrem no painel; o botão mostra o número de filtros ativos
- [ ] Todo botão e link tem área de toque de pelo menos 40px

## Teclado e leitor de tela

- [ ] Tab percorre tudo em ordem lógica, com foco sempre visível
- [ ] "Pular para o conteúdo" é o primeiro foco e funciona
- [ ] No painel de filtros, o foco fica preso e Esc fecha
- [ ] Com NVDA ou Narrador: os cartões anunciam título, ano e nota; os botões da lista anunciam o nome do filme e o estado; novos filmes carregados são anunciados

## Falhas

- [ ] `/?tipo=xyz&anoDe=abc` abre o catálogo com os valores padrão
- [ ] Offline durante a rolagem: os filmes carregados continuam e aparece "Tentar de novo"
- [ ] `localStorage` com lixo em `catalogo:minha-lista`: o site abre com a lista vazia

## Lighthouse (aba anônima, modo celular)

- [ ] Acessibilidade: 95 ou mais em `/`, `/filme/603` e `/minha-lista`
- [ ] Desempenho: anote a nota de `/` e de `/filme/603`
- [ ] Contraste: nenhum aviso nos dois temas
```

- [ ] **Step 2: Executar o roteiro**

```bash
npm run build && npm run start
```

Percorra o roteiro inteiro, marcando os itens no arquivo. Corrija o que falhar antes de seguir, e repita o item. Se o Lighthouse apontar contraste insuficiente, ajuste o token correspondente em `app/globals.css` (nos dois blocos do tema escuro, que precisam ficar iguais) e rode de novo.

Expected: todos os itens marcados.

- [ ] **Step 3: Tirar as capturas de tela**

Salve em `docs/capturas/`: `catalogo-claro.png`, `catalogo-escuro.png`, `detalhes.png` e `celular-filtros.png`.

- [ ] **Step 4: Substituir `README.md`**

````markdown
# Catálogo de Streaming

Os filmes disponíveis agora nos serviços de streaming do Brasil, com filtros por serviço, tipo, gênero, ano e nota, busca por nome e uma lista "quero ver".

**Demonstração:** <URL da Vercel>

![Catálogo no tema claro](docs/capturas/catalogo-claro.png)
![Catálogo no tema escuro](docs/capturas/catalogo-escuro.png)
![Página de detalhes](docs/capturas/detalhes.png)

## Tecnologias

Next.js (App Router), React, TypeScript, Tailwind CSS e TanStack Query. Dados do TMDB.

## Como rodar

1. Crie uma conta no [TMDB](https://www.themoviedb.org/) e copie o "API Read Access Token" em Configurações → API.
2. Copie `.env.example` para `.env.local` e preencha `TMDB_API_TOKEN`.
3. Rode:

```bash
npm install
npm run dev
```

O site abre em http://localhost:3000.

## Decisões técnicas

- **A chave do TMDB fica no servidor.** O navegador fala com cinco rotas `/api/*`, que validam os parâmetros e repassam a chamada. Não é um proxy genérico: cada rota aceita só o que o app usa, para a chave não servir a outros fins.
- **Os filtros vivem na URL.** Ela é a única fonte de verdade. Isso dá links compartilháveis e botão voltar sem biblioteca de estado. A mesma função de validação roda no navegador e no servidor.
- **Rolagem infinita com alternativa.** As páginas carregam ao chegar ao fim da grade, e o botão "Carregar mais" atende quem navega por teclado.
- **Só `lib/tmdb/` conhece o formato do TMDB.** O resto do app usa tipos próprios, então uma mudança na API afeta um lugar só.
- **A lista "quero ver" fica no `localStorage`.** Não há contas. Se o armazenamento falhar, o site continua funcionando.
- **Dois temas com variáveis CSS.** Um script no `<head>` aplica o tema salvo antes da primeira pintura.

## Limites conhecidos

- A busca por nome mostra qualquer filme, porque o TMDB não filtra a busca por streaming. A página de detalhes informa a disponibilidade.
- O TMDB entrega até 10.000 filmes por consulta.
- A disponibilidade pode estar algumas horas desatualizada.
- O projeto não tem testes automatizados. A verificação manual está em [docs/roteiro-de-verificacao.md](docs/roteiro-de-verificacao.md).

## Créditos

Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB. Os dados de disponibilidade nos streamings são fornecidos pelo JustWatch.
````

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: add README and manual verification checklist"
```

- [ ] **Step 6: Publicar no GitHub (peça confirmação antes)**

Este passo cria um repositório público na conta do parceiro humano. Pergunte o nome do repositório e se ele deve ser público, e só então rode:

```bash
gh repo create <nome-do-repositorio> --public --source=. --remote=origin --push
```

Antes do push, confirme que a chave não está no histórico:

```bash
git log --all --oneline -- .env.local
```

Expected: nenhuma linha.

- [ ] **Step 7: Publicar na Vercel (feito pelo parceiro humano)**

Oriente o parceiro humano:

1. Em https://vercel.com/new, importar o repositório do GitHub.
2. Em "Environment Variables", adicionar `TMDB_API_TOKEN` com o token.
3. Clicar em "Deploy".

- [ ] **Step 8: Verificar o site publicado**

Na URL da Vercel:

1. O catálogo carrega e os filtros funcionam.
2. `/filme/603` abre os detalhes.
3. Na aba Network, nenhuma requisição do navegador vai para `api.themoviedb.org` e nenhuma resposta contém o token.

Substitua `<URL da Vercel>` no README pela URL real e faça o commit:

```bash
git add README.md
git commit -m "docs: add live demo URL"
git push
```
