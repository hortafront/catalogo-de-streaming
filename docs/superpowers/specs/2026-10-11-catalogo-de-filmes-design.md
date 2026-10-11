# Catálogo de filmes em streaming: design

Data: 2026-10-11

## Objetivo

Um site que mostra os filmes disponíveis agora nos serviços de streaming do Brasil, com dados da API do TMDB. É um projeto de portfólio, publicado na web para qualquer pessoa ver.

O projeto está pronto quando:

- está publicado em uma URL pública na Vercel;
- o repositório no GitHub tem um README que explica o projeto e as decisões técnicas;
- funciona bem no celular;
- é acessível (teclado, contraste, leitores de tela);
- todo o código é TypeScript.

## Escopo

Na primeira versão o visitante pode:

1. navegar o catálogo em grade, com rolagem infinita;
2. filtrar por serviço de streaming;
3. filtrar por tipo de disponibilidade, gênero, ano e nota mínima, e ordenar o resultado;
4. buscar um filme pelo nome;
5. abrir a página de um filme, com sinopse, elenco, trailer e onde assistir;
6. salvar filmes em uma lista "quero ver", guardada no navegador.

Fora do escopo: contas de usuário, séries de TV, outros países, recomendações personalizadas e testes automatizados.

## Decisões de produto

- **Região:** só Brasil (`watch_region=BR`), interface em português (`language=pt-BR`). A região é uma constante em um único lugar do código, para facilitar uma futura expansão.
- **Tipos de disponibilidade:** os cinco do TMDB, com um filtro: assinatura (`flatrate`), grátis (`free`), com anúncios (`ads`), aluguel (`rent`) e compra (`buy`). O padrão ao abrir o app é assinatura.
- **Busca:** o endpoint de busca do TMDB não aceita filtro de streaming. A busca retorna qualquer filme, e a página de detalhes informa onde assistir ou avisa "Indisponível no Brasil no momento". Os resultados da busca não são filtrados por disponibilidade.
- **Vários serviços marcados:** o filme precisa estar em qualquer um deles (OU).
- **Vários gêneros marcados:** o filme precisa ter todos eles (E).
- **Atribuição:** o rodapé credita o TMDB e o JustWatch, como os termos de uso exigem.

## Arquitetura

Next.js com App Router e TypeScript em modo estrito. Estilo com Tailwind CSS. Dados no cliente com TanStack Query.

Fluxo: navegador → rotas `/api/*` do Next.js → TMDB. A chave do TMDB fica na variável de ambiente `TMDB_API_TOKEN`, lida só no servidor.

### Rotas de API

O proxy não é um repasse genérico. São cinco rotas específicas, que validam os parâmetros e devolvem só os campos que o app usa.

| Rota | Função | Endpoint do TMDB | Cache |
|---|---|---|---|
| `GET /api/filmes` | Catálogo com filtros | `discover/movie` | 1 hora |
| `GET /api/busca` | Busca por nome | `search/movie` | 1 hora |
| `GET /api/filmes/[id]` | Detalhes, elenco, trailer e onde assistir | `movie/{id}` com `append_to_response=credits,videos,watch/providers` | 1 hora |
| `GET /api/servicos` | Serviços de streaming do Brasil | `watch/providers/movie` | 24 horas |
| `GET /api/generos` | Gêneros em português | `genre/movie/list` | 24 horas |

Parâmetros de `/api/filmes`:

| Parâmetro | Valores | Padrão | Mapeia para |
|---|---|---|---|
| `servico` | ids separados por vírgula | todos | `with_watch_providers` (unidos por `\|`) |
| `tipo` | `flatrate`, `free`, `ads`, `rent`, `buy` | `flatrate` | `with_watch_monetization_types` |
| `genero` | ids separados por vírgula | nenhum | `with_genres` (unidos por `,`) |
| `anoDe`, `anoAte` | ano com quatro dígitos | sem limite | `primary_release_date.gte` e `.lte` |
| `notaMin` | 0 a 10 | 0 | `vote_average.gte`, com `vote_count.gte=200` quando maior que 0 |
| `ordem` | `popularidade`, `lancamento`, `nota` | `popularidade` | `sort_by` |
| `pagina` | 1 a 500 | 1 | `page` |

Quando `ordem=nota`, a rota também aplica `vote_count.gte=200`.

Erros das rotas:

- parâmetro inválido: resposta 400, sem chamar o TMDB;
- filme inexistente: 404;
- falha ou limite de requisições do TMDB: 502, com corpo `{ "erro": "mensagem" }`.

### Estado dos filtros

Os filtros ficam nos parâmetros da URL, com os mesmos nomes da rota `/api/filmes` (por exemplo `/?servico=8&genero=28&tipo=flatrate&ordem=popularidade`). A URL é a única fonte de verdade: os controles leem dela e escrevem nela. Não há biblioteca de estado global. Valores iguais ao padrão não aparecem na URL.

### Páginas

| Caminho | Conteúdo |
|---|---|
| `/` | Catálogo com filtros e grade |
| `/busca?q=...` | Resultados da busca |
| `/filme/[id]` | Detalhes do filme |
| `/minha-lista` | Lista "quero ver" |

### Estrutura de pastas

```
app/            páginas e rotas /api
components/     componentes de interface
lib/tmdb/       cliente do TMDB no servidor, tipos e conversão das respostas
lib/filtros/    leitura, validação e escrita dos filtros na URL
hooks/          useFilmes, useBusca, useFilme, useMinhaLista
```

`lib/tmdb/` é o único lugar que conhece o formato das respostas do TMDB. O resto do app usa os tipos próprios do projeto (`Filme`, `FilmeDetalhe`, `Servico`, `Genero`). `lib/filtros/` é compartilhado pelo cliente e pelas rotas de API, para que a validação seja uma só.

## Interface

### Componentes

- **Cabeçalho:** logo, campo de busca, link para "Minha lista" com contador e botão de tema.
- **Barra de filtros:** visível acima da grade no computador. No celular vira um botão "Filtros", que mostra o número de filtros ativos e abre um painel.
- **Grade de filmes:** de 2 colunas no celular até 6 em telas largas.
- **Cartão de filme:** pôster, título, ano, nota e botão de adicionar à lista. O cartão é um link para os detalhes.
- **Página de detalhes:** imagem de fundo, pôster, sinopse, gêneros, duração, nota, elenco principal, trailer do YouTube e o bloco "Onde assistir", agrupado por tipo, com os logos dos serviços.
- **Rodapé:** atribuição ao TMDB e ao JustWatch.

### Filtros do catálogo

| Filtro | Controle |
|---|---|
| Serviço | Logos selecionáveis, vários ao mesmo tempo |
| Tipo | Seleção única entre os cinco tipos |
| Gênero | Etiquetas, várias ao mesmo tempo |
| Ano | Intervalo de e até |
| Nota mínima | Seletor de 0 a 10 |
| Ordenação | Popularidade, lançamento, nota |

Há um botão "Limpar filtros". Cada mudança atualiza a URL e recarrega a grade do início.

### Rolagem infinita

O catálogo e a busca usam `useInfiniteQuery`, com 20 filmes por página. A próxima página é carregada quando o fim da lista entra na tela. Um botão "Carregar mais" fica sempre disponível como alternativa.

### Estados

- **Carregando:** esqueletos de cartão.
- **Sem resultado:** mensagem com sugestão de afrouxar os filtros.
- **Erro:** mensagem com botão "Tentar de novo".
- **Filme sem pôster, sem trailer ou sem disponibilidade no Brasil:** cada caso tem um estado próprio, sem espaço quebrado.
- **Filme inexistente:** página 404 própria.

## Tema

Tema claro e escuro, com as cores em variáveis CSS. O padrão segue a preferência do sistema. O botão do cabeçalho alterna o tema e guarda a escolha no `localStorage`. Um script no início do documento aplica o tema antes da primeira pintura, para a página não piscar com a cor errada.

## Lista "quero ver"

Guardada no `localStorage`, por trás do hook `useMinhaLista`, que oferece adicionar, remover e verificar se um filme está na lista. Cada item guarda id, título, caminho do pôster, ano e nota, para a página `/minha-lista` abrir sem chamar a API.

Se o `localStorage` estiver indisponível, o app funciona normalmente e a lista não persiste. A página da lista informa que ela vale só para aquele navegador.

## Acessibilidade

- Toda a interface é navegável por teclado, com foco sempre visível.
- Contraste no nível AA nos dois temas.
- Texto alternativo nos pôsteres e nome acessível em todo botão de ícone.
- Leitores de tela são avisados quando novos filmes entram na grade.
- O painel de filtros no celular prende o foco enquanto está aberto e fecha com Esc.
- Animações são reduzidas para quem configurou `prefers-reduced-motion`.

## Limites conhecidos

- O TMDB entrega no máximo 500 páginas (10.000 filmes) por consulta. Ao chegar a esse limite, a rolagem para.
- Os dados de disponibilidade vêm do JustWatch e podem estar desatualizados em algumas horas.

## Verificação

Sem testes automatizados nesta versão. A verificação é:

- TypeScript em modo estrito, sem erros;
- ESLint sem erros;
- build de produção sem erros;
- roteiro manual cobrindo catálogo, cada filtro, busca, detalhes, lista, os dois temas, celular e navegação por teclado;
- auditoria com Lighthouse (desempenho e acessibilidade).

## Publicação

Repositório no GitHub ligado à Vercel, no plano gratuito, com `TMDB_API_TOKEN` configurada como variável de ambiente. Um arquivo `.env.example` documenta a variável, e `.env.local` fica fora do git.

O README traz descrição, capturas de tela, como rodar localmente, as decisões técnicas e a atribuição ao TMDB e ao JustWatch.
