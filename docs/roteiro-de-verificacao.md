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
- [ ] "Limpar filtros" volta a URL para `/explorar`
- [ ] Uma combinação sem resultado mostra a mensagem de lista vazia
- [ ] A busca por nome mostra resultados; uma busca sem resultado mostra a mensagem
- [ ] A página de detalhes mostra sinopse, elenco, trailer e onde assistir
- [ ] Um filme sem streaming no Brasil mostra "Indisponível no Brasil no momento."
- [ ] `/filme/abc` e `/filme/999999999` mostram a página 404
- [ ] Adicionar e remover da lista atualiza o contador; a lista sobrevive a recarregar
- [ ] O rodapé credita o TMDB e o JustWatch

## Tema

- [ ] Sem escolha salva, o site abre no tema escuro
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
- [ ] Sem `TMDB_API_TOKEN`: as rotas respondem 500 e a tela mostra a mensagem de erro

## Lighthouse (aba anônima, modo celular)

- [ ] Acessibilidade: 95 ou mais em `/`, `/filme/603` e `/minha-lista`
- [ ] Desempenho: anote a nota de `/` e de `/filme/603`
- [ ] Contraste: nenhum aviso nos dois temas
