# Contas e listas "quero assistir" / "já assisti": design

Data: 2026-10-18

## Objetivo

O usuário entra com email e senha (Supabase Auth) e marca filmes em duas listas guardadas na conta dele: **Quero assistir** e **Já assisti**. A página inicial ganha abas para navegar entre o catálogo e essas duas listas.

A funcionalidade está pronta quando:

- dá para criar conta, entrar e sair;
- um usuário logado marca, troca de lista e desmarca filmes no cartão, no destaque e na página do filme;
- as marcações persistem ao recarregar e em outro navegador com a mesma conta;
- um usuário não consegue ler nem alterar as marcações de outro (RLS);
- as abas da home mostram o catálogo e as duas listas, e a aba escolhida fica na URL.

## Decisões de produto

- **Login obrigatório para marcar.** Sem login, os botões de marcação levam para `/entrar?voltar=<página atual>`. O catálogo, a busca e as páginas de filme continuam abertos a todos.
- **Um filme fica em uma lista só.** Marcar "Já assisti" num filme que está em "Quero assistir" troca de lista. Clicar no estado ativo desmarca.
- **Só dois estados.** Sem nota, resenha ou data em que assistiu.
- **Conta:** criar conta, entrar e sair. Sem confirmação de email (desligada no painel do Supabase) e sem "esqueci minha senha". As duas coisas podem entrar depois sem refazer o desenho.
- **A lista antiga do `localStorage` é descartada.** Não há importação para a conta.
- **A "Minha lista" deixa de existir.** `/minha-lista` redireciona para `/?aba=quero-assistir`, e o item sai da navegação.

## Arquitetura

Sessão em cookie com `@supabase/ssr`. O navegador lê e grava as marcações direto no Supabase com `supabase-js`, protegido por Row Level Security. Não há rotas `/api` novas.

No Next 16, o arquivo `middleware.ts` virou `proxy.ts`, e a função exportada se chama `proxy`. O runtime é sempre Node.

### Arquivos novos

```
proxy.ts                         renova a sessão em cada requisição; não bloqueia rotas
supabase/esquema.sql             tabela, índice e regras RLS; colado no SQL Editor do painel
lib/supabase/config.ts           lê NEXT_PUBLIC_SUPABASE_URL e _PUBLISHABLE_KEY; diz se está configurado
lib/supabase/navegador.ts        createBrowserClient (instância única)
lib/supabase/servidor.ts         createServerClient com cookies() do Next
lib/auth/caminhoSeguro.ts        valida o parâmetro ?voltar=
lib/auth/mensagens.ts            mensagemErroAuth(erro): texto em português
lib/abas.ts                      lerAba(param): "catalogo" | "quero-assistir" | "assistidos"
app/entrar/page.tsx              formulário de entrar / criar conta
app/entrar/acoes.ts              Server Actions: entrar, criarConta, sair
components/ProvedorSessao.tsx    contexto com o usuário atual
components/BotoesMarcacao.tsx    substitui BotaoLista
components/AbasInicio.tsx        tablist da home
components/ListaMarcada.tsx      grade de uma das duas listas
components/MenuConta.tsx         "Entrar" ou email + "Sair" no cabeçalho
hooks/useMarcacoes.ts            substitui useMinhaLista
```

### Arquivos alterados

- `app/layout.tsx`: busca o usuário com `getUser()` no servidor e envolve o app em `ProvedorSessao`.
- `app/page.tsx`: lê `?aba=` e mostra o catálogo atual ou uma `ListaMarcada`.
- `app/minha-lista/page.tsx`: vira `redirect("/?aba=quero-assistir")`.
- `components/Cabecalho.tsx`: inclui `MenuConta`.
- `components/Navegacao.tsx`: remove "Minha lista" e o contador.
- `components/CartaoFilme.tsx`, `components/Destaque.tsx`, `components/DetalheFilme.tsx`: trocam `BotaoLista` por `BotoesMarcacao`.
- `.env.example`, `README.md`, `docs/roteiro-de-verificacao.md`.

### Arquivos removidos

`hooks/useMinhaLista.ts`, `components/BotaoLista.tsx`, `components/ListaSalva.tsx`.

### Dependências novas

`@supabase/supabase-js`, `@supabase/ssr`; `vitest` (dev).

## Dados

Tabela `public.filmes_marcados`:

| coluna | tipo | regra |
|---|---|---|
| `usuario_id` | `uuid` | `not null default auth.uid()`, referencia `auth.users(id) on delete cascade` |
| `filme_id` | `integer` | `not null`, id do TMDB |
| `estado` | `text` | `not null`, `check (estado in ('quero_assistir', 'assistido'))` |
| `titulo` | `text` | `not null` |
| `poster` | `text` | pode ser nulo |
| `ano` | `integer` | pode ser nulo |
| `nota` | `numeric` | pode ser nulo |
| `atualizado_em` | `timestamptz` | `not null default now()` |

- Chave primária `(usuario_id, filme_id)`: é ela que garante um filme em uma lista só.
- Marcar ou trocar de lista é `upsert` em `(usuario_id, filme_id)` com `estado` e `atualizado_em = now()`. Desmarcar é `delete`.
- `titulo`, `poster`, `ano` e `nota` são uma cópia do `Filme` no momento da marcação, para a grade abrir sem chamar o TMDB.
- RLS ligado, com quatro regras (`select`, `insert`, `update`, `delete`) para o papel `authenticated`, todas com `usuario_id = (select auth.uid())` em `using` e/ou `with check`.

Variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. As duas podem ser públicas. Quem protege os dados é o RLS.

## Login e sessão

- **`proxy.ts`** cria o cliente do servidor com os cookies da requisição e chama `getUser()` para renovar o token, devolvendo os cookies atualizados. O `matcher` ignora `_next/static`, `_next/image` e arquivos de imagem.
- **`/entrar`** tem um formulário com email e senha e dois modos (`?modo=criar` para criar conta), com um link para trocar entre eles. O envio chama as Server Actions:
  - `entrar` → `signInWithPassword`; `criarConta` → `signUp`. Se der certo, `redirect(caminhoSeguro(voltar))`. Se der erro, devolve a mensagem de `mensagemErroAuth` (via `useActionState`) e mantém o email digitado.
  - Mensagens: "Email ou senha incorretos", "Esse email já tem conta", "A senha precisa ter pelo menos 6 caracteres" e, para qualquer outro erro, "Não foi possível entrar agora. Tente de novo."
  - Quem já está logado e abre `/entrar` é redirecionado para `/`.
- **`caminhoSeguro(voltar)`** aceita só caminhos que começam com `/`, sem `//` nem `/\` no começo. Qualquer outro valor vira `/`.
- **`sair`** chama `signOut` e redireciona para `/`. No cliente, o `ProvedorSessao` recebe o evento de saída e remove as consultas `["marcacoes", ...]` do React Query.
- **`ProvedorSessao`** recebe o usuário inicial do `layout.tsx` (assim o cabeçalho não pisca) e se mantém atualizado com `onAuthStateChange`. Expõe `{ usuario, configurado }`.
- **`MenuConta`** mostra o link "Entrar" para quem não está logado e, para quem está, o email e um botão "Sair" (um `form` com a action `sair`).

## Marcações

### `useMarcacoes()`

```ts
type Estado = "quero_assistir" | "assistido";

useMarcacoes(): {
  queroAssistir: Filme[];       // mais recente primeiro
  assistidos: Filme[];
  estadoDe(id: number): Estado | null;
  marcar(filme: Filme, estado: Estado): void;
  desmarcar(id: number): void;
  carregando: boolean;
  erro: Error | null;
  tentarDeNovo(): void;
}
```

- Consulta com a chave `["marcacoes", usuario.id]`: um `select` de todas as linhas do usuário, ordenado por `atualizado_em desc`. Sem usuário, a consulta fica desligada e as listas vêm vazias.
- `marcar` e `desmarcar` são mutações otimistas: atualizam o cache com `setQueryData`, guardam o estado anterior, e se o Supabase der erro restauram o estado e mostram um aviso curto ("Não foi possível salvar. Tente de novo."). No fim invalidam a consulta.

### `BotoesMarcacao({ filme, comTexto?, sobreImagem? })`

- Tem a mesma interface de variantes que o `BotaoLista` de hoje.
- Sem texto (no cartão), são dois botões redondos com ícone sobre o pôster: marcador (quero assistir) e check (já assisti). O ícone do estado ativo aparece preenchido.
- Com texto (no destaque e no detalhe), são dois botões, "Quero assistir" e "Já assisti".
- Cada botão tem `aria-pressed` e um rótulo que descreve a ação, por exemplo "Marcar Matrix como já assistido" e "Tirar Matrix de quero assistir".
- Clicar no estado ativo chama `desmarcar`, e clicar no outro chama `marcar`.
- Sem login, o clique faz `router.push("/entrar?voltar=" + caminho atual com query)`.
- Com o Supabase não configurado, os botões não aparecem.

## Abas da home

- `lerAba(param)` devolve `"catalogo"` (padrão e para qualquer valor desconhecido), `"quero-assistir"` ou `"assistidos"`.
- `AbasInicio` renderiza `role="tablist"` com três `Link` (`role="tab"`, `aria-selected`, `aria-controls`). As setas esquerda/direita movem o foco entre as abas, e só a aba ativa tem `tabIndex=0`. Os rótulos mostram o tamanho de cada lista: "Quero assistir (3)". Sem login, a contagem não aparece.
- O painel (`role="tabpanel"`) mostra:
  - **Catálogo:** `Destaque` e as fileiras de hoje, sem mudança.
  - **Quero assistir / Já assisti:** `ListaMarcada`, que usa `GradeFilmes` e `CartaoFilme`.
    - Lista vazia: "Nenhum filme aqui ainda." e um link para `/?aba=catalogo`.
    - Sem login: "Entre para montar suas listas." e um botão para `/entrar?voltar=/?aba=<aba>`.
    - Carregando: o mesmo esqueleto da grade do catálogo.
    - Erro: mensagem e botão "Tentar de novo", no padrão do catálogo.
    - Supabase não configurado: "Login indisponível: configure o Supabase."

## Erros

| situação | comportamento |
|---|---|
| variáveis do Supabase ausentes | o catálogo funciona; `proxy.ts` não faz nada; abas de lista e `/entrar` mostram "Login indisponível: configure o Supabase."; os botões de marcação não aparecem |
| falha ao carregar marcações | a aba mostra o erro com "Tentar de novo" |
| falha ao marcar/desmarcar | rollback otimista e aviso curto |
| sessão expirada (401) | o `ProvedorSessao` recebe `SIGNED_OUT`, o app passa a tratar o usuário como deslogado e o próximo clique leva ao login |

## Testes

- **Vitest** só para as funções puras, em `lib/**/*.test.ts`, com o script `npm test`:
  - `caminhoSeguro`: aceita `/`, `/filme/603` e `/?aba=assistidos`; rejeita `//evil.com`, `/\evil.com`, `https://evil.com`, `javascript:alert(1)`, string vazia e `null`.
  - `lerAba`: os três valores válidos, mais `undefined`, `""` e `"xyz"` (que viram `"catalogo"`).
  - `mensagemErroAuth`: cada código conhecido do Supabase (`invalid_credentials`, `user_already_exists`, `weak_password`) e um código desconhecido.
- **Antes de cada commit:** `npm run typecheck`, `npm run lint`, `npm test`. Antes de terminar: `npm run build`.
- **Roteiro manual** (adicionado a `docs/roteiro-de-verificacao.md`):
  - criar conta, sair, entrar de novo;
  - email/senha errados mostram a mensagem certa;
  - deslogado, clicar em marcar leva ao login e, depois de entrar, volta para a mesma página;
  - marcar, trocar de lista, desmarcar e recarregar para conferir que persistiu;
  - abas: `?aba=xyz` cai em Catálogo; o botão voltar troca de aba; as setas do teclado funcionam;
  - `/minha-lista` redireciona para `/?aba=quero-assistir`;
  - RLS: com a conta A marque filmes; com a conta B confirme que as listas estão vazias; no console da conta B, um `select` sem filtro em `filmes_marcados` não retorna as linhas da A;
  - sem variáveis do Supabase, o catálogo abre normalmente.

## Configuração do Supabase (passo a passo para o README)

1. Criar o projeto em supabase.com (plano gratuito).
2. Authentication → Sign In / Providers → Email: deixar ligado e **desligar "Confirm email"**.
3. SQL Editor: colar e rodar `supabase/esquema.sql`.
4. Project Settings → API: copiar a URL e a publishable key para `.env.local`.
5. Na Vercel, adicionar as mesmas duas variáveis.

## Fora do escopo

Confirmação de email, recuperação de senha, login social, nota/resenha/data de quando assistiu, importar a lista antiga do `localStorage`, listas públicas ou compartilhadas e séries de TV.
