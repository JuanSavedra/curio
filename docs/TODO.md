# TODO do Curiô

Lista viva do que falta. Marque com `[x]` ao terminar e mova para "Feito". Toda tarefa de interface segue o fluxo do impeccable: `shape` (briefing confirmado) antes de `craft`.

### Som
- [ ] `shape` do som: quais sons, quando tocam, onde fica o controle.
- [ ] Canto curto do Curió no acerto e nas celebrações, desligado por padrão, com controle visível e preferência salva.

### Conteúdo
- [ ] Revisão de fatos de todos os decks, um tema por vez, com fontes confiáveis em `learnMore` (até 3 links https por pergunta). Feitos: astronomia, ciências, geografia, história, linguagem. Faltam: matemática, lógica.
  - Astronomia tem a pergunta da luz do Sol repetida (`sunlight` e `sunlight-time`): decidir qual trocar por uma pergunta nova.

### Fase 7: registro e publicação
- [ ] `impeccable document` para tirar o DESIGN.md do modo seed com os tokens reais.
- [ ] Atualizar o README (status e como escrever conteúdo).
- [ ] Publicar no Cloudflare Pages e conferir o limite de arquivos por deploy.
- [ ] Imagem de compartilhamento (Open Graph) e metadados.

## Ideias para mais tarde
- [ ] Funcionar offline (PWA), já que o conteúdo é estático.
- [ ] Desafios com tempo, sempre opcionais.
- [ ] Compartilhar uma pergunta com alguém.
- [ ] Pergunta do dia: uma pergunta por dia, igual para todo mundo, sem precisar de servidor (escolhida pela data).
- [ ] Exportar e importar o progresso em um arquivo, para trocar de aparelho sem cadastro.
- [ ] Mais tipos de pergunta: verdadeiro ou falso, ordenar, completar a lacuna, imagem na pergunta.
- [ ] Imagens e ilustrações nas explicações, sempre com texto alternativo.
- [ ] Contribuição aberta: guia e modelo de deck para outras pessoas enviarem perguntas por pull request.
- [ ] Ajustes de leitura: tamanho de letra e fonte para dislexia, além do modo escuro.
- [ ] Outros idiomas para a interface e as perguntas, se um dia fizer sentido.

## Feito
- [x] Transição entre páginas: uma íris que abre sobre a cor ferrugem da marca (a página antiga encolhe e a tela fica ferrugem por um instante, depois a nova aparece por um círculo de borda suave que cresce do centro), feita só com CSS (`@view-transition` em `src/styles/global.css`, cerca de 1 segundo). Com movimento reduzido vira um fade curto de 150ms. Navegadores sem suporte a view transitions entre páginas (hoje o Firefox) navegam como antes. Falta ver à mão em Chrome/Edge, e conferir que não atrapalha o carregamento do feed.
- [x] Selos por tema concluído: página própria `/selos` (`src/pages/selos/`, `Seals.tsx`, `seals.css`), com um selo por tema que tem perguntas, ganho ao descobrir todas as perguntas do tema (medalha na cor dele, ícone do tema e check); os que faltam aparecem em cinza tracejado com "3 de 16" em texto. Link "Meus selos" na barra lateral, logo abaixo de "Meu álbum". Nada de novo no `localStorage`: sai do progresso que já existe, então quem já concluiu um tema já tem o selo. Selos de dias seguidos e selo na tela `/temas` ficaram de fora (o selo "Concluído" de lá já existe). Falta conferir à mão a 320px, 390px e 1280px.
- [x] Álbum de descobertas: tela `/album` (`src/pages/album/`, `Album.tsx`, `album.css`) com tudo que já foi respondido, em até 4 colunas independentes (3, 2 ou 1 quando não cabem com folga; as colunas seguem a largura da página). Cada tema é uma seção recolhível na cor dele (abre por padrão), com busca por nome do tema logo abaixo do título. Cada descoberta é um cartão que, ao tocar, abre um modal no centro da tela com a pergunta, a resposta certa, a explicação e os links (`<dialog>` nativo: Esc e toque no fundo fecham, o foco volta ao cartão). Só busca os decks que têm descobertas. Tem estado vazio (com convite para começar) e de falha de rede com "Tentar de novo". Link "Meu álbum" no rodapé da barra lateral. Falta conferir à mão a 320px, 390px e 1280px, com teclado e axe-core.
- [x] Referências para aprender mais: campo opcional `learnMore` na pergunta (até 3 itens com `title` e `url` https, validado no schema). Depois de responder, a carta mostra "Quer saber mais?" com os links, que abrem em outra aba e avisam o leitor de tela. Nunca obrigatório. Código em `content.config.ts`, `Card.tsx` e `feed.css`. Só a pergunta `fibonacci` tem link, como exemplo; os outros links entram com a revisão de fatos. Falta conferir à mão a carta com o link a 320px (a explicação fica mais longa).
- [x] Dificuldade na carta: o nível (Filhote, Curioso ou Explorador) aparece no fim da linha do tema e da coleção, com uma bolinha na cor do nível e o texto ("Nível" só para leitor de tela). Sem número, pontos ou ranking. Código em `Card.tsx` e `feed.css`. Falta conferir à mão o contraste da bolinha sobre cada cor de tema e a quebra de linha a 320px.
- [x] Revisar o que errei: o modo **Que errei** do feed (barra lateral, grupo "Mostrar") reúne só as perguntas que errei para tentar de novo sem pressa, sem mudar o progresso dos decks. Feito junto com os filtros do feed, em vez de um deck separado.
- [x] Barra lateral no feed (`Sidebar.tsx`, `sidebar.css`): marca Curiô, filtros de assunto, subtemas, mostrar e dificuldade, e o link para a tela de temas. No celular é uma gaveta aberta pelo botão de menu; a partir de 48rem é uma coluna fixa que pode ser reduzida só ao Curió e às marcas (preferência salva no aparelho). O topo ficou só com o menu, o nome e a sequência de dias. Corrigido junto: os links de pulo da página do tema usavam `.chip`, que só existe no CSS do feed, e ganharam estilo próprio (`.subtopic-link`).
- [x] Subtemas navegáveis: na página `/temas/<tema>` cada subtema abre com barra e contagem próprias e um botão Começar/Continuar/Rever que leva ao feed com `?subtema=` (só quando tem 2 ou mais coleções), e uma fileira de links pula para cada subtema (quando o tema tem 2 ou mais). Sem páginas novas. Código em `TopicPage.tsx`.
- [x] Filtro por dificuldade no feed: campo obrigatório `level` (`easy`, `medium`, `hard`) em toda pergunta, mostrado como **Filhote**, **Curioso** e **Explorador** (`src/data/levels.ts`). Nova fileira "Dificuldade" em `Filters.tsx`, endereço `?nivel=filhote|curioso|explorador`, combinável com tema, subtema e modo. As 64 perguntas dos 8 decks foram classificadas. Com um nível ativo, "Rever as que já respondi" some (esquecer é por deck) e o tema não é dado como concluído.
- [x] Filtros do feed: modos **Novas**, **Que errei** (novo `curio:missed` no `localStorage`) e **Que já vi**, e filtro por **subtema** dentro de um tema (aparece quando o tema tem 2 ou mais). Endereços `?subtema=<pasta>` e `?modo=erradas|vistas`. Nas revisões o progresso dos decks não muda e acertos seguidos e penas não contam, mas a sequência de dias sim. Novo deck `astronomy/stars-and-galaxies` para o subtema existir. Código em `Filters.tsx` e `Feed.tsx`.
- [x] Raiz do projeto enxuta: `PRODUCT.md`, `DESIGN.md` e `TODO.md` foram para `docs/` (o loader do impeccable já procura lá), referências atualizadas no `AGENTS.md` e `.vscode/settings.json` esconde `dist`, `.astro`, `.agents` e os arquivos de lock no explorador.
- [x] Primeiros decks de Ciências, História, Geografia e Linguagem (8 perguntas cada, em `content/<tema>/`). Todos os 7 temas agora têm conteúdo e saíram de "em breve". Build passando. Os fatos ainda entram na revisão de fatos.
- [x] `extract` do botão: um componente só em `src/styles/button.css` (`.button`, `.button--quiet`, `.button--outline`), usado pelo feed e pelas telas de tema. O antigo `.next` virou `.button` e o `.skip` virou `.button--quiet`. Sobre a cor de um tema, o botão quieto usa `--quiet-color`, `--quiet-hover-bg` e `--quiet-hover-color`. Conferido por comparação de pixels (13 de 17 telas idênticas) e axe-core sem violações.
- [x] Idioma do código padronizado em inglês: arquivos, pastas, identificadores, classes e variáveis CSS, chaves do YAML, ids, chaves do `localStorage`, comentários e mensagens de erro de build. Textos da interface, conteúdo das perguntas e endereços públicos seguem em português. Regra e glossário no `AGENTS.md`. Conferido com capturas idênticas antes e depois (a única diferença é a frase de acerto/erro, escolhida por hash do id) e axe-core sem violações.
- [x] Fase 5: temas e progresso. Tela `/temas` com o tema em andamento em destaque, lista que muda de desenho conforme o progresso (novo, em andamento, concluído) e temas "em breve". Página `/temas/<tema>` com as coleções agrupadas por subtema e o progresso de cada uma. Feed filtra por coleção (`?deck=`) e aceita `?rever=1`. Tela de tema concluído pintada com a cor do tema (cor se espalhando, Curió comemorando, penas, versão com fade para movimento reduzido). Sete ícones de tema. Conferido a 320px, 390px e 1280px; axe-core sem violações.
- [x] Regras de produto e design (PRODUCT.md e DESIGN.md seed).
- [x] Fase 1: fundação visual (tokens, paleta com contraste AA, fonte Parkinsans).
- [x] Fase 2: feed de perguntas com filtro por tema, palco do Curió, explicação, teclado e três decks de exemplo.
- [x] Fase 2: conferidos no navegador a falha de rede, o fim de tema e o zoom de 200%; validação dos decks testada com arquivos quebrados; axe-core sem violações WCAG.
- [x] Fase 3: Curió em SVG com volume e contorno quente, quatro reações (esperando, feliz, consolando, comemorando), animações de personagem com versão para movimento reduzido e favicon só com a cabeça.
- [x] Cartas com o mesmo desenho: pergunta, alternativas e palco sempre na mesma posição, carta da altura da tela.
- [x] Fase 4: celebrações. Penas caindo em 3, 5, 10 e a cada 10 acertos seguidos; marcos de 3, 7, 14, 30, 50 e 100 dias com a pílula brilhando; versão para movimento reduzido; asa do Curió comemorando refinada.
- [x] Mais decks: hoje cada tema tem 1 deck de 8 perguntas. A meta é de 20 a 50 perguntas por deck e mais de um deck por tema.
