# Catálogo de Streaming

Os filmes disponíveis agora nos serviços de streaming do Brasil, com filtros por serviço, tipo, gênero, ano e nota, busca por nome e uma lista "quero ver".

## Tecnologias

Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4 e TanStack Query. Dados do TMDB.

## Como rodar

1. Crie uma conta no [TMDB](https://www.themoviedb.org/) e copie o "API Read Access Token" em Configurações → API.
2. Copie `.env.example` para `.env.local` e preencha `TMDB_API_TOKEN`.
3. Rode:

```bash
npm install
npm run dev
```

O site abre em http://localhost:3000.

Outros comandos: `npm run typecheck`, `npm run lint` e `npm run build`.

## Decisões técnicas

- **A chave do TMDB fica no servidor.** O navegador fala com cinco rotas `/api/*`, que validam os parâmetros e repassam a chamada. Não é um proxy genérico: cada rota aceita só o que o app usa, para a chave não servir a outros fins.
- **Os filtros vivem na URL.** Ela é a única fonte de verdade. Isso dá links compartilháveis e botão voltar sem biblioteca de estado. A mesma função de validação roda no navegador e no servidor.
- **Rolagem infinita com alternativa.** As páginas carregam ao chegar ao fim da grade, e o botão "Carregar mais" atende quem navega por teclado.
- **Só `lib/tmdb/` conhece o formato do TMDB.** O resto do app usa tipos próprios, então uma mudança na API afeta um lugar só.
- **Cache em duas camadas.** As consultas ao TMDB usam `use cache` (1 hora para filmes, 1 dia para serviços e gêneros), e as respostas das rotas levam `Cache-Control` para a CDN. Falhas do TMDB não ficam em cache.
- **A lista "quero ver" fica no `localStorage`.** Não há contas. Se o armazenamento falhar, o site continua funcionando.
- **Dois temas com variáveis CSS.** Um script no `<head>` aplica o tema salvo antes da primeira pintura.

## Limites conhecidos

- A busca por nome mostra qualquer filme, porque o TMDB não filtra a busca por streaming. A página de detalhes informa a disponibilidade.
- O TMDB entrega até 10.000 filmes por consulta.
- A disponibilidade pode estar algumas horas desatualizada.
- O projeto não tem testes automatizados. A verificação manual está em [docs/roteiro-de-verificacao.md](docs/roteiro-de-verificacao.md).

## Créditos

Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB. Os dados de disponibilidade nos streamings são fornecidos pelo JustWatch.
