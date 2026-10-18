# Contas e listas "quero assistir" / "já assisti": plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Login com email e senha (Supabase) e duas listas por usuário, "Quero assistir" e "Já assisti", navegáveis por abas na home.

**Architecture:** Sessão em cookie com `@supabase/ssr`. O `proxy.ts` renova o token, e o layout passa ao cliente uma promise do usuário, que os componentes resolvem com `use()` dentro de `<Suspense>` (o projeto usa `cacheComponents: true`). O navegador lê e grava as marcações direto na tabela `filmes_marcados`, protegida por RLS, através de React Query com mutações otimistas.

**Tech Stack:** Next.js 16.4 (App Router, `cacheComponents`, `proxy.ts`), React 19.3, TanStack Query 5, `@supabase/supabase-js`, `@supabase/ssr`, Tailwind 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-18-contas-e-listas-design.md`

## Global Constraints

- Todo texto da interface em português, com os textos exatos da spec.
- Antes de escrever código que usa uma API do Next, consulte `node_modules/next/dist/docs/` (o AGENTS.md exige). `middleware.ts` não existe mais: use `proxy.ts` com `export async function proxy(request: NextRequest)`.
- `cacheComponents: true`: `cookies()`, `searchParams` e `use(promessaUsuario)` só podem ser lidos dentro de um `<Suspense>`.
- Variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, lidas com `process.env.NEXT_PUBLIC_...` escrito por extenso (o Next só substitui no bundle quando o nome aparece literal).
- Nunca use a `service_role`/secret key.
- Valores de estado no banco e no código: `"quero_assistir"` e `"assistido"`. Valores de aba na URL: `catalogo`, `quero-assistir`, `assistidos`.
- Chave do React Query: `["marcacoes", usuarioId]`.
- Sem o Supabase configurado, o catálogo, a busca e a página de filme continuam funcionando.
- Siga o estilo do código ao redor: nomes em português, comentários curtos só onde o porquê não é óbvio, classes Tailwind do tema existente (`bg-destaque`, `text-sobre-destaque`, `text-texto-suave`, `border-borda-forte`, `bg-superficie`, `text-tela`, `bg-sala`).
- Antes de cada commit: `npm run typecheck`, `npm run lint` e `npm test` sem erros.

## Review Focus

- **Login pela Server Action e o cabeçalho:** depois de "Entrar", o cabeçalho deve mostrar o email sem recarregar a página. Se o layout não renderizar de novo, o cabeçalho continua mostrando "Entrar". Verificação manual na Task 3, passo 7.
- **Trocar de conta na mesma aba:** a conta B não pode ver, nem por um instante, as listas da conta A que ficaram em cache. Coberto pela chave `["marcacoes", usuarioId]` e pelo `removeQueries` ao sair. Verificação manual na Task 5, passo 8.
- **Cliques rápidos seguidos no mesmo filme:** o estado final tem que ser o do último clique, e depois de recarregar ele continua igual. Coberto por `cancelQueries` no `onMutate`. Verificação manual na Task 4, passo 7.
- **`voltar` com query string:** voltar para `/?aba=assistidos` não pode perder o `?aba=`. Teste `linkEntrar` na Task 1.
- **Filme sem pôster, ano ou nota:** ao ser salvo e lido de volta, ele aparece na grade com "Ano desconhecido" e sem nota. A coluna `nota numeric` pode chegar como string do PostgREST, então o conversor usa `Number()`. Verificação manual na Task 5, passo 8.

---

## Mapa de arquivos

```
vitest.config.ts                 Task 1
lib/auth/caminhoSeguro.ts (+test) Task 1   caminhoSeguro, linkEntrar
lib/abas.ts (+test)              Task 1   Aba, lerAba
lib/auth/mensagens.ts (+test)    Task 1   mensagemErroAuth
lib/supabase/config.ts           Task 2
lib/supabase/navegador.ts        Task 2
lib/supabase/servidor.ts         Task 2
lib/supabase/sessao.ts           Task 2
proxy.ts                         Task 2
supabase/esquema.sql             Task 2
components/ProvedorSessao.tsx    Task 3
app/entrar/page.tsx              Task 3
app/entrar/acoes.ts              Task 3
components/FormularioEntrar.tsx  Task 3
components/MenuConta.tsx         Task 3
hooks/useAviso.ts                Task 4
components/Aviso.tsx             Task 4
hooks/useMarcacoes.ts            Task 4
components/BotoesMarcacao.tsx    Task 4
components/AbasInicio.tsx        Task 5
components/ListaMarcada.tsx      Task 5
```

---

### Task 1: Vitest e funções puras

**Files:**
- Create: `vitest.config.ts`, `lib/auth/caminhoSeguro.ts`, `lib/auth/caminhoSeguro.test.ts`, `lib/abas.ts`, `lib/abas.test.ts`, `lib/auth/mensagens.ts`, `lib/auth/mensagens.test.ts`
- Modify: `package.json` (script `test`, devDependency `vitest`)

**Interfaces:**
- Produces:
  - `caminhoSeguro(valor: string | null | undefined): string`
  - `linkEntrar(caminho: string): string`, que devolve `"/entrar?voltar=" + encodeURIComponent(caminho)`
  - `type Aba = "catalogo" | "quero-assistir" | "assistidos"`, `ABAS: readonly Aba[]` (nessa ordem), `lerAba(valor: string | string[] | undefined): Aba`
  - `mensagemErroAuth(erro: { code?: string } | null | undefined): string`

- [ ] **Step 1: Instalar e configurar o Vitest**

Run: `npm install -D vitest`
Adicionar `"test": "vitest run"` em `scripts`. Criar `vitest.config.ts` com `defineConfig({ test: { include: ["lib/**/*.test.ts"] }, resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } } })`.

- [ ] **Step 2: Escrever os testes que falham**

`lib/auth/caminhoSeguro.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { caminhoSeguro, linkEntrar } from "./caminhoSeguro";

describe("caminhoSeguro", () => {
  it.each(["/", "/filme/603", "/?aba=assistidos", "/busca?q=matrix"])(
    "aceita %s",
    (caminho) => expect(caminhoSeguro(caminho)).toBe(caminho),
  );
  it.each([
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "filme/603",
    "",
    null,
    undefined,
  ])("rejeita %s", (caminho) => expect(caminhoSeguro(caminho)).toBe("/"));
});

describe("linkEntrar", () => {
  it("codifica o caminho de volta", () => {
    expect(linkEntrar("/?aba=assistidos")).toBe(
      "/entrar?voltar=%2F%3Faba%3Dassistidos",
    );
  });
});
```

`lib/abas.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { lerAba } from "./abas";

describe("lerAba", () => {
  it.each(["catalogo", "quero-assistir", "assistidos"] as const)(
    "aceita %s",
    (aba) => expect(lerAba(aba)).toBe(aba),
  );
  it.each([undefined, "", "xyz", ["assistidos", "x"]])(
    "%s vira catalogo",
    (valor) => expect(lerAba(valor)).toBe("catalogo"),
  );
});
```
(Um array em `?aba=` é tratado como inválido.)

`lib/auth/mensagens.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { mensagemErroAuth } from "./mensagens";

describe("mensagemErroAuth", () => {
  it.each([
    ["invalid_credentials", "Email ou senha incorretos."],
    ["user_already_exists", "Esse email já tem conta."],
    ["email_exists", "Esse email já tem conta."],
    ["weak_password", "A senha precisa ter pelo menos 6 caracteres."],
    ["outra_coisa", "Não foi possível entrar agora. Tente de novo."],
  ])("%s", (code, texto) => expect(mensagemErroAuth({ code })).toBe(texto));

  it("sem código", () => {
    expect(mensagemErroAuth(null)).toBe(
      "Não foi possível entrar agora. Tente de novo.",
    );
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL, os três arquivos acusam os módulos `./caminhoSeguro`, `./abas` e `./mensagens` como inexistentes.

- [ ] **Step 4: Implementar as três funções** nos arquivos de `Produces`. `caminhoSeguro` aceita só strings que começam com `/` e cujo segundo caractere não é `/` nem `\`.

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test`
Expected: PASS em todos os casos.

- [ ] **Step 6: Typecheck, lint e commit**

```bash
npm run typecheck && npm run lint
git add vitest.config.ts package.json package-lock.json lib/auth lib/abas.ts lib/abas.test.ts
git commit -m "test: add vitest and auth/tab helpers"
```

---

### Task 2: Infraestrutura do Supabase

**Files:**
- Create: `lib/supabase/config.ts`, `lib/supabase/navegador.ts`, `lib/supabase/servidor.ts`, `lib/supabase/sessao.ts`, `proxy.ts`, `supabase/esquema.sql`
- Modify: `package.json`, `.env.example`, `README.md` (seção de configuração)

**Interfaces:**
- Produces:
  - `config.ts`: `SUPABASE_URL: string`, `SUPABASE_CHAVE: string` (vazias se ausentes), `supabaseConfigurado: boolean`
  - `navegador.ts`: `clienteNavegador(): SupabaseClient` (cria uma vez e reutiliza; só chame se `supabaseConfigurado`)
  - `servidor.ts` (com `import "server-only"`): `criarClienteServidor(): Promise<SupabaseClient>`, com `createServerClient` e `cookies: { getAll, setAll }` sobre `await cookies()`. O `setAll` fica num `try/catch` vazio, com o comentário de que em Server Components o `proxy.ts` é quem grava.
  - `sessao.ts` (com `import "server-only"`): `type Usuario = { id: string; email: string }`, `obterUsuario: () => Promise<Usuario | null>`, envolvida em `cache` do React. Devolve `null` se não estiver configurado, se não houver usuário ou se acontecer qualquer erro.

- [ ] **Step 1: Instalar dependências**

Run: `npm install @supabase/supabase-js @supabase/ssr`

- [ ] **Step 2: Criar `config.ts`, `navegador.ts`, `servidor.ts` e `sessao.ts`** com as assinaturas acima.

- [ ] **Step 3: Criar `proxy.ts` na raiz**

Siga o padrão oficial do `@supabase/ssr` para Next: crie a `NextResponse.next({ request })`, o `createServerClient`, cujo `setAll` grava os cookies na requisição e numa nova resposta, e chame `await supabase.auth.getUser()`. Se `!supabaseConfigurado`, devolva `NextResponse.next()` sem fazer nada. O proxy não redireciona. Use:
```ts
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 4: Criar `supabase/esquema.sql`**

```sql
create table public.filmes_marcados (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  filme_id integer not null,
  estado text not null check (estado in ('quero_assistir', 'assistido')),
  titulo text not null,
  poster text,
  ano integer,
  nota numeric,
  atualizado_em timestamptz not null default now(),
  primary key (usuario_id, filme_id)
);

alter table public.filmes_marcados enable row level security;

create policy "ler as proprias marcacoes" on public.filmes_marcados
  for select to authenticated using (usuario_id = (select auth.uid()));
create policy "criar as proprias marcacoes" on public.filmes_marcados
  for insert to authenticated with check (usuario_id = (select auth.uid()));
create policy "alterar as proprias marcacoes" on public.filmes_marcados
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy "apagar as proprias marcacoes" on public.filmes_marcados
  for delete to authenticated using (usuario_id = (select auth.uid()));
```

- [ ] **Step 5: `.env.example` e README**

No `.env.example`, acrescente as duas variáveis vazias, com o comentário `# Supabase → Project Settings → API Keys (publishable, nunca a secret)`. No README, adicione a seção "Configurar o Supabase" com os 5 passos da spec ("Configuração do Supabase").

- [ ] **Step 6: Pausa para o usuário rodar o SQL**

Peça ao usuário para colar `supabase/esquema.sql` no SQL Editor do painel e rodar. Expected: "Success. No rows returned", e a tabela aparece no Table Editor com o selo "RLS enabled".

- [ ] **Step 7: Verificar**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: tudo passa. Depois rode `npm run dev` e abra `/`. O catálogo carrega como antes, e no DevTools → Application → Cookies aparece um cookie `sb-...` só depois de existir sessão. Agora ainda não deve aparecer nenhum, e o terminal não mostra erros.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json lib/supabase proxy.ts supabase .env.example README.md
git commit -m "feat: add supabase clients, session proxy and schema"
```

---

### Task 3: Sessão, página de entrar e menu da conta

**Files:**
- Create: `components/ProvedorSessao.tsx`, `app/entrar/page.tsx`, `app/entrar/acoes.ts`, `components/FormularioEntrar.tsx`, `components/MenuConta.tsx`
- Modify: `app/layout.tsx`, `components/Cabecalho.tsx`, `docs/roteiro-de-verificacao.md`

**Interfaces:**
- Consumes: `obterUsuario`, `Usuario`, `criarClienteServidor`, `clienteNavegador`, `supabaseConfigurado` (Task 2); `caminhoSeguro`, `mensagemErroAuth` (Task 1).
- Produces:
  - `ProvedorSessao({ usuario: Promise<Usuario | null>; children })`
  - `useSessao(): { usuario: Usuario | null; configurado: boolean }`. Chama `use()`, então quem usa precisa estar dentro de um `<Suspense>`.
  - Server Actions: `type EstadoFormulario = { erro: string | null; email: string }`, `entrar(estado: EstadoFormulario, dados: FormData): Promise<EstadoFormulario>`, `criarConta(...)` com a mesma assinatura, `sair(): Promise<void>`. Os campos do `FormData` são `email`, `senha` e `voltar`.

- [ ] **Step 1: `ProvedorSessao`**

Um contexto que guarda a promise. Num `useEffect`, assine `clienteNavegador().auth.onAuthStateChange((evento, sessao) => ...)`: se `sessao?.user.id ?? null` for diferente do `usuario?.id ?? null` resolvido, chame `router.refresh()`. Num segundo efeito, quando o usuário resolvido for `null`, chame `queryClient.removeQueries({ queryKey: ["marcacoes"] })`. Se `!supabaseConfigurado`, não assine nada.

- [ ] **Step 2: Layout**

Em `app/layout.tsx`, chame `const usuario = obterUsuario()` **sem await** e envolva o conteúdo de `<Provedores>` com `<ProvedorSessao usuario={usuario}>`. O `ProvedorSessao` fica dentro de `Provedores`, porque precisa do `QueryClient`.

- [ ] **Step 3: Server Actions em `app/entrar/acoes.ts`** (`"use server"`)

- `entrar`: lê `email`, `senha` e `voltar`. Se `!supabaseConfigurado`, devolve `{ erro: "Login indisponível: configure o Supabase.", email }`. Se o campo vier vazio, devolve `{ erro: "Preencha email e senha.", email }`. Senão chama `signInWithPassword`. Se der erro, devolve `{ erro: mensagemErroAuth(error), email }`. Se der certo, `redirect(caminhoSeguro(voltar))`.
- `criarConta`: igual, mas com `signUp({ email, password })`.
- `sair`: `signOut()` e depois `redirect("/")`.

- [ ] **Step 4: `/entrar`**

`app/entrar/page.tsx` com `metadata = { title: "Entrar" }`. A página renderiza `<Suspense fallback={null}><Conteudo searchParams={searchParams} /></Suspense>`. O `Conteudo` é async e faz o seguinte: se `!supabaseConfigurado`, mostra "Login indisponível: configure o Supabase."; se `await obterUsuario()` devolver alguém, chama `redirect("/")`; nos outros casos, `modo = searchParams.modo === "criar" ? "criar" : "entrar"`, `voltar = caminhoSeguro(searchParams.voltar)` e `<FormularioEntrar key={modo} modo={modo} voltar={voltar} />`.

`FormularioEntrar` (client) usa `useActionState(modo === "criar" ? criarConta : entrar, { erro: null, email: "" })`, com estes elementos:
- `h1` com classe `cartaz`: "Entrar" ou "Criar conta"
- input `email`: `type="email" required autoComplete="email" defaultValue={estado.email}`
- input `senha`: `type="password" required minLength={6}`, com `autoComplete` `current-password` (entrar) ou `new-password` (criar)
- `<input type="hidden" name="voltar" value={voltar}>`
- `<p role="alert">` com `estado.erro`, quando houver
- botão de enviar: "Entrar" / "Criar conta"; durante o envio, "Entrando…" / "Criando conta…" e `disabled`
- link pra trocar de modo: "Não tem conta? Criar conta" → `/entrar?modo=criar&voltar=…`; "Já tem conta? Entrar" → `/entrar?voltar=…` (com o `voltar` em `encodeURIComponent`)

Coloque o formulário centralizado, com `max-w-sm`, e reuse as classes de botão do projeto (`rounded-full bg-destaque px-5 py-2 font-medium text-sobre-destaque`).

- [ ] **Step 5: `MenuConta` no cabeçalho**

Client. Se `!configurado`, devolve `null`. Sem usuário, mostra `<Link href="/entrar">Entrar</Link>`. Com usuário, mostra o `email` (`truncate max-w-40`, escondido abaixo de `sm`) e `<form action={sair}><button>Sair</button></form>`. No `Cabecalho.tsx`, coloque o menu ao lado do `BotaoTema`, dentro de `<Suspense fallback={<div className="w-16" />}>`.

- [ ] **Step 6: Typecheck, lint, testes e build**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: tudo passa, e o build não mostra erros de "blocking-route" nem de "Uncached data".

- [ ] **Step 7: Verificação manual** (`npm run dev`)

1. O cabeçalho mostra "Entrar". Clique e crie uma conta com uma senha de 5 caracteres. O navegador barra, por causa do `minLength`.
2. Crie a conta com uma senha válida. Você é levado pra `/` e o cabeçalho mostra o email **sem recarregar a página**.
3. Clique em "Sair". O cabeçalho volta a mostrar "Entrar".
4. Entre com a senha errada: aparece "Email ou senha incorretos."
5. Tente criar uma conta com o mesmo email: aparece "Esse email já tem conta."
6. Logado, abra `/entrar`: você é redirecionado pra `/`.
7. Abra `/entrar?voltar=//evil.com` e entre: você cai em `/`.

- [ ] **Step 8: Roteiro e commit**

Acrescente os itens do passo 7 em `docs/roteiro-de-verificacao.md`, numa seção "Conta".
```bash
git add app/layout.tsx app/entrar components/ProvedorSessao.tsx components/FormularioEntrar.tsx components/MenuConta.tsx components/Cabecalho.tsx docs/roteiro-de-verificacao.md
git commit -m "feat: add email/password sign in with supabase"
```

---

### Task 4: Marcar filmes

**Files:**
- Create: `hooks/useAviso.ts`, `components/Aviso.tsx`, `hooks/useMarcacoes.ts`, `components/BotoesMarcacao.tsx`
- Modify: `app/layout.tsx` (incluir `<Aviso />`), `components/CartaoFilme.tsx`, `components/Destaque.tsx`, `components/DetalheFilme.tsx`, `docs/roteiro-de-verificacao.md`
- Delete: `components/BotaoLista.tsx`

**Interfaces:**
- Consumes: `useSessao` (Task 3), `clienteNavegador`, `supabaseConfigurado` (Task 2), `linkEntrar` (Task 1), `Filme` (`lib/tipos.ts`).
- Produces:
  - `avisar(texto: string): void` e `useAviso(): string | null`. O aviso some depois de 4000 ms, e um aviso novo reinicia o tempo. O estado fica fora do React, no mesmo padrão de `useSyncExternalStore` que o `useMinhaLista` usava.
  - `type Estado = "quero_assistir" | "assistido"` (exportado de `hooks/useMarcacoes.ts`)
  - `useMarcacoes(): { queroAssistir: Filme[]; assistidos: Filme[]; estadoDe(id: number): Estado | null; marcar(filme: Filme, estado: Estado): void; desmarcar(id: number): void; carregando: boolean; erro: Error | null; tentarDeNovo(): void }`
  - `BotoesMarcacao({ filme: Filme; comTexto?: boolean; sobreImagem?: boolean })`

- [ ] **Step 1: `useAviso` e `Aviso`**

O `Aviso` renderiza sempre um `<div role="status" aria-live="polite">`, fixo embaixo e no centro da tela, e o texto só aparece quando há aviso. Inclua `<Aviso />` no layout, logo depois do `<Rodape />`.

- [ ] **Step 2: `useMarcacoes`**

- `useQuery` com `queryKey: ["marcacoes", usuario?.id]`, `enabled: configurado && !!usuario`, e um `select` de `filme_id, estado, titulo, poster, ano, nota` ordenado por `atualizado_em desc`. Se der erro, lance `new Error("Não foi possível carregar suas listas.")`. Converta cada linha em `{ filme: { id: filme_id, titulo, poster, ano, nota: nota === null ? null : Number(nota) }, estado }`.
- `marcar`: `upsert({ usuario_id: usuario.id, filme_id, estado, titulo, poster, ano, nota, atualizado_em: new Date().toISOString() }, { onConflict: "usuario_id,filme_id" })`. Antes de gravar, tire só os campos de `Filme` do objeto, porque `FilmeDetalhe` traz campos a mais.
- `desmarcar`: `delete().eq("filme_id", id)`. O RLS já limita ao próprio usuário.
- As duas são `useMutation` com `onMutate` (faz `cancelQueries`, guarda o estado anterior e chama `setQueryData`; o filme marcado vai pro começo da lista), `onError` (restaura e chama `avisar("Não foi possível salvar. Tente de novo.")`) e `onSettled` (`invalidateQueries`).
- Sem usuário: as listas vêm vazias, `estadoDe` devolve `null` e `carregando` é `false`.

- [ ] **Step 3: `BotoesMarcacao`**

- Envolva tudo num `<Suspense fallback={null}>` interno, porque o componente usa `useSessao`. Se `!supabaseConfigurado`, devolva `null`.
- São dois botões, na ordem "quero assistir" e "já assisti". Ícones: o marcador `M6 3h12v18l-6-4-6 4z` do `BotaoLista` atual, e o check `M5 12l5 5L20 7`. O ícone do botão ativo usa `fill="currentColor"` (o check com traço mais grosso).
- Ao clicar: sem usuário, `router.push(linkEntrar(location.pathname + location.search))`. Se o botão já está ativo, `desmarcar(filme.id)`. Senão, `marcar(filme, estadoDoBotao)`.
- Cada botão tem `aria-pressed`, e `aria-label` e `title` iguais a estes textos:
  - quero assistir, inativo: `Marcar ${titulo} como quero assistir`; ativo: `Tirar ${titulo} de quero assistir`
  - já assisti, inativo: `Marcar ${titulo} como já assistido`; ativo: `Tirar ${titulo} de já assistidos`
- Variantes de estilo: as mesmas três do `BotaoLista` (sem texto / `comTexto` + `sobreImagem` / `comTexto`), aplicadas a cada botão. Sem texto, os dois ficam lado a lado com `flex gap-1`. Os textos visíveis são "Quero assistir" e "Já assisti".

- [ ] **Step 4: Trocar `BotaoLista` por `BotoesMarcacao`** em `CartaoFilme.tsx:34`, `Destaque.tsx:65` e `DetalheFilme.tsx:74`, mantendo as mesmas props. Depois apague `components/BotaoLista.tsx`.

- [ ] **Step 5: Typecheck, lint, testes e build**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: tudo passa.

- [ ] **Step 6: Verificação manual básica** (`npm run dev`)

1. Deslogado, clique no marcador de um cartão na home: vai pra `/entrar?voltar=%2F`. Entre e volte pra `/`.
2. Na página `/filme/603`, clique em "Quero assistir": o botão fica pressionado na hora. Recarregue e ele continua pressionado.
3. Clique em "Já assisti": esse fica pressionado e o "Quero assistir" solta. No Table Editor do Supabase, a linha tem `estado = assistido`.
4. Clique de novo em "Já assisti": os dois soltam, e a linha some da tabela.
5. Com o DevTools → Network em "Offline", marque um filme: o botão volta ao estado anterior e aparece "Não foi possível salvar. Tente de novo.", que some em cerca de 4 s.

- [ ] **Step 7: Cliques rápidos**

Clique 5 vezes seguidas, rápido, em "Quero assistir" no mesmo filme. Expected: o botão termina pressionado (número ímpar de cliques), e depois de recarregar continua igual.

- [ ] **Step 8: Roteiro e commit**

Acrescente os itens dos passos 6 e 7 ao roteiro, na seção "Marcações".
```bash
git add hooks/useAviso.ts hooks/useMarcacoes.ts components/Aviso.tsx components/BotoesMarcacao.tsx components/CartaoFilme.tsx components/Destaque.tsx components/DetalheFilme.tsx app/layout.tsx docs/roteiro-de-verificacao.md
git rm components/BotaoLista.tsx
git commit -m "feat: mark movies as want to watch or watched"
```

---

### Task 5: Abas da home e fim da "Minha lista"

**Files:**
- Create: `components/AbasInicio.tsx`, `components/ListaMarcada.tsx`
- Modify: `app/page.tsx`, `components/Navegacao.tsx`, `next.config.ts`, `README.md`, `docs/roteiro-de-verificacao.md`
- Delete: `app/minha-lista/page.tsx`, `components/ListaSalva.tsx`, `hooks/useMinhaLista.ts`

**Interfaces:**
- Consumes: `Aba`, `ABAS`, `lerAba` (Task 1); `useMarcacoes`, `Estado` (Task 4); `useSessao` (Task 3); `linkEntrar` (Task 1); `GradeFilmes`, `EsqueletosFilmes`, `CartaoFilme`.
- Produces: `AbasInicio({ atual: Aba })`, `ListaMarcada({ estado: Estado; aba: Aba })`. Ids: `aba-<valor>` em cada aba e `painel-inicio` no painel.

- [ ] **Step 1: `app/page.tsx`**

Mantenha o `h1` sr-only e a constante `FILEIRAS`. A página recebe `searchParams` (`PageProps<"/">`) e renderiza `<Suspense fallback={<EsqueletosFilmes />}><Conteudo searchParams={searchParams} /></Suspense>`. O `Conteudo` (async) faz `const aba = lerAba((await searchParams).aba)` e renderiza `<AbasInicio atual={aba} />` seguido de `<div role="tabpanel" id="painel-inicio" aria-labelledby={`aba-${aba}`}>`. Dentro do painel vai o `Destaque` + `FILEIRAS` quando `aba === "catalogo"`, `<ListaMarcada estado="quero_assistir" aba={aba} />` ou `<ListaMarcada estado="assistido" aba={aba} />`.

- [ ] **Step 2: `AbasInicio`** (client)

- Use `<div role="tablist" aria-label="Seções do início">` com um `Link` por item de `ABAS`. Cada link tem `id="aba-<valor>"`, `role="tab"`, `aria-selected`, `aria-controls="painel-inicio"`, `tabIndex` 0 só na aba ativa (-1 nas outras) e `href` `/?aba=<valor>` (`/` para catálogo). Use `scroll={false}`.
- Rótulos: "Catálogo", "Quero assistir" e "Já assisti". Com usuário logado e a lista carregada, os dois últimos mostram a contagem: "Quero assistir (3)".
- Teclado: `ArrowRight` e `ArrowLeft` movem o foco pra aba seguinte ou anterior, dando a volta nas pontas. `Home` e `End` vão pra primeira e pra última. As setas só movem o foco; quem ativa a aba é o Enter, que segue o link.
- Visual: o mesmo estilo de pílulas da `Navegacao` (ativa `bg-texto/15 text-texto`, inativa `text-texto-suave hover:text-texto`), com `mb-6`.

- [ ] **Step 3: `ListaMarcada`** (client)

Pega `queroAssistir` ou `assistidos` conforme o `estado`. Os estados, em ordem:
- `!configurado` → "Login indisponível: configure o Supabase."
- sem usuário → "Entre para montar suas listas." e um botão `Link` "Entrar" pra `linkEntrar(aba === "catalogo" ? "/" : `/?aba=${aba}`)`
- `carregando` → `<EsqueletosFilmes />`
- `erro` → `erro.message` e o botão "Tentar de novo" (`tentarDeNovo`), no mesmo visual do erro em `FileiraFilmes`
- lista vazia → "Nenhum filme aqui ainda." e um link "Ver o catálogo" pra `/`
- senão → `<GradeFilmes>` com `<CartaoFilme>` para cada filme

- [ ] **Step 4: Remover a "Minha lista"**

- Em `next.config.ts`, adicione `async redirects() { return [{ source: "/minha-lista", destination: "/?aba=quero-assistir", permanent: false }]; }`.
- Apague `app/minha-lista/page.tsx`, `components/ListaSalva.tsx` e `hooks/useMinhaLista.ts`.
- Em `Navegacao.tsx`, tire "Minha lista" de `PAGINAS`, além do contador e do import de `useMinhaLista`.
- No README, troque as menções à lista no `localStorage` pela descrição nova (contas e as duas listas).
- No roteiro, remova os itens antigos de `catalogo:minha-lista` e troque `/minha-lista` por `/?aba=quero-assistir` no item de acessibilidade.

- [ ] **Step 5: Garantir que não sobrou referência**

Use o Grep para `useMinhaLista|ListaSalva|BotaoLista|minha-lista` em `app`, `components` e `hooks`. Expected: nenhum resultado.

- [ ] **Step 6: Typecheck, lint, testes e build**

Run: `npm run typecheck && npm run lint && npm test && npm run build`
Expected: tudo passa, sem avisos de blocking-route.

- [ ] **Step 7: Verificação manual das abas** (`npm run dev`)

1. `/` mostra a aba Catálogo selecionada, com o destaque e as fileiras.
2. Clique em "Quero assistir": a URL vira `/?aba=quero-assistir` e aparece a grade. O botão voltar do navegador retorna ao Catálogo.
3. `/?aba=xyz` mostra o Catálogo.
4. Com Tab, foque a aba ativa. As setas movem o foco e o Enter troca de aba.
5. `/minha-lista` redireciona pra `/?aba=quero-assistir`.
6. Deslogado, a aba "Já assisti" mostra "Entre para montar suas listas.". Clique em Entrar, faça o login, e você volta pra `/?aba=assistidos`.

- [ ] **Step 8: Contas diferentes e dados incompletos**

1. Com a conta A, marque 2 filmes como "Quero assistir" e 1 como "Já assisti". As contagens mostram (2) e (1).
2. Saia e entre com a conta B, na mesma aba e sem recarregar. As duas listas aparecem vazias desde o primeiro quadro, sem mostrar nada da A antes.
3. RLS: no SQL Editor do Supabase, escolha a role `authenticated` e personifique ("impersonate") o usuário B. Rode `select * from filmes_marcados;` e o resultado deve ser 0 linhas. Personifique o A e rode de novo: 3 linhas. Por fim, ainda como B, rode `update filmes_marcados set estado = 'assistido';` e o resultado deve ser 0 linhas afetadas.
4. Busque um filme sem pôster (em `/busca`, procure um título obscuro), marque-o e abra a aba: o cartão mostra o pôster padrão e "Ano desconhecido", sem quebrar.

- [ ] **Step 9: Roteiro e commit**

Acrescente os itens dos passos 7 e 8 ao roteiro, na seção "Abas e listas".
```bash
git add app/page.tsx components/AbasInicio.tsx components/ListaMarcada.tsx components/Navegacao.tsx next.config.ts README.md docs/roteiro-de-verificacao.md
git rm app/minha-lista/page.tsx components/ListaSalva.tsx hooks/useMinhaLista.ts
git commit -m "feat: add home tabs for watch lists and drop old saved list"
```
