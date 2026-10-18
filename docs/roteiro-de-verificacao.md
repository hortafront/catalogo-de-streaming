# Roteiro de verificação manual

Rode com `npm run build && npm run start` e marque cada item. Repita a seção "Fluxos" nos dois temas.

## Automático

- [ ] `npm run typecheck` sem erros
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros
- [ ] `npm test` sem falhas

## Conta

- [ ] Deslogado, o cabeçalho mostra "Entrar"
- [ ] Criar conta com senha de 5 caracteres é barrado pelo navegador
- [ ] Criar conta com senha válida leva para `/` e o cabeçalho mostra o email sem recarregar
- [ ] "Sair" volta o cabeçalho para "Entrar"
- [ ] Senha errada mostra "Email ou senha incorretos."
- [ ] Criar conta com um email já usado mostra "Esse email já tem conta."
- [ ] Logado, `/entrar` redireciona para `/`
- [ ] `/entrar?voltar=//evil.com` e `/entrar?voltar=%2F%09%2Fevil.com`: depois de entrar, cai em `/`
- [ ] Logado em duas abas, "Sair" na segunda: ao voltar para a primeira, o cabeçalho mostra "Entrar"

## Marcações

- [ ] Deslogado, o marcador de um cartão leva para `/entrar?voltar=%2F`; depois de entrar, volta para `/`
- [ ] Em `/filme/603`, "Quero assistir" fica pressionado na hora e continua assim depois de recarregar
- [ ] "Já assisti" troca de lista: ele fica pressionado, "Quero assistir" solta, e a linha no Supabase tem `estado = assistido`
- [ ] Clicar de novo no estado ativo desmarca, e a linha some da tabela
- [ ] Offline (DevTools → Network), marcar desfaz e mostra "Não foi possível salvar. Tente de novo.", que some em cerca de 4 s
- [ ] Cinco cliques rápidos em "Quero assistir" terminam pressionado, e continua assim depois de recarregar

## Abas e listas

- [ ] `/` abre na aba Catálogo, com o destaque e as fileiras
- [ ] "Quero assistir" muda a URL para `/?aba=quero-assistir` e mostra a grade; o botão voltar retorna ao Catálogo
- [ ] `/?aba=xyz` mostra o Catálogo
- [ ] Com Tab na aba ativa, as setas movem o foco e o Enter troca de aba
- [ ] `/minha-lista` redireciona para `/?aba=quero-assistir`
- [ ] Deslogado, "Já assisti" mostra "Entre para montar suas listas."; depois de entrar, volta para `/?aba=assistidos`
- [ ] Conta A com 2 em "Quero assistir" e 1 em "Já assisti": as abas mostram (2) e (1)
- [ ] Sair e entrar com a conta B na mesma aba, sem recarregar: as listas aparecem vazias desde o primeiro quadro
- [ ] RLS: no SQL Editor, personificando B, `select * from filmes_marcados;` volta 0 linhas; personificando A, 3; como B, `update filmes_marcados set estado = 'assistido';` afeta 0 linhas
- [ ] Um filme sem pôster marcado aparece na aba com o pôster padrão e "Ano desconhecido"

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
- [ ] Com NVDA ou Narrador: os cartões anunciam título, ano e nota; os botões de marcação anunciam o nome do filme e o estado; novos filmes carregados são anunciados

## Falhas

- [ ] `/?tipo=xyz&anoDe=abc` abre o catálogo com os valores padrão
- [ ] Offline durante a rolagem: os filmes carregados continuam e aparece "Tentar de novo"
- [ ] Sem as variáveis do Supabase: o catálogo abre normalmente; as abas de lista e `/entrar` mostram "Login indisponível: configure o Supabase."
- [ ] Sem `TMDB_API_TOKEN`: as rotas respondem 500 e a tela mostra a mensagem de erro

## Lighthouse (aba anônima, modo celular)

- [ ] Acessibilidade: 95 ou mais em `/`, `/filme/603` e `/?aba=quero-assistir`
- [ ] Desempenho: anote a nota de `/` e de `/filme/603`
- [ ] Contraste: nenhum aviso nos dois temas
