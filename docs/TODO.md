# TODO do Curiô

Lista viva do que falta. Marque com `[x]` ao terminar e mova para "Feito". Toda tarefa de interface segue o fluxo do impeccable: `shape` (briefing confirmado) antes de `craft`.

## Agora

### Pendências da fase 2 (feed)
- [ ] Testar com leitor de tela de verdade (NVDA no Windows ou TalkBack no Android). Precisa ser feito à mão.

### Filtros do feed (falta conferir no navegador)
- [ ] Conferir à mão a 320px, 390px e 1280px: segunda fileira de filtros (Novas, Que errei, Que já vi e subtemas), rolagem horizontal no celular, estados vazios de cada modo, `?subtema=` e `?modo=` no endereço, e axe-core. Só o build e o HTML do servidor foram verificados.

### Fase 5: temas e progresso (falta só conferir à mão)
- [ ] Conferir a tela de temas, a página de tema e o tema concluído com teclado e leitor de tela de verdade (junto com o teste da fase 2).
- [ ] Decidir se "Rever" deve guardar que o tema já foi concluído. Hoje rever zera o progresso do deck, e o selo "Concluído" some até terminar de novo.

## Depois

### Som
- [ ] `shape` do som: quais sons, quando tocam, onde fica o controle.
- [ ] Canto curto do Curió no acerto e nas celebrações, desligado por padrão, com controle visível e preferência salva.

### Conteúdo
- [ ] Revisão de fatos de todos os decks.

### Fase 6: ninho à noite e acabamento
- [ ] Modo escuro seguindo a preferência do sistema (quase-preto quente, nunca `#000`).
- [ ] Ajuste do Curió para fundo escuro.
- [ ] `impeccable audit`: acessibilidade, desempenho, responsivo.
- [ ] `impeccable polish`.

### Fase 7: registro e publicação
- [ ] `impeccable document` para tirar o DESIGN.md do modo seed com os tokens reais.
- [ ] Atualizar o README (status e como escrever conteúdo).
- [ ] Publicar no Cloudflare Pages e conferir o limite de arquivos por deploy.
- [ ] Imagem de compartilhamento (Open Graph) e metadados.

## Ideias para mais tarde
- [ ] Funcionar offline (PWA), já que o conteúdo é estático.
- [ ] Desafios com tempo, sempre opcionais.
- [ ] Compartilhar uma pergunta com alguém.
- [ ] Filtro por dificuldade no feed. Antes é preciso criar o campo `level` nas perguntas (schema em `src/content.config.ts`) e classificar todas as perguntas dos decks. Entra junto com as etiquetas de dificuldade, mais abaixo.
- [ ] Subtemas navegáveis dentro de cada tema (Matemática → números primos, frações, geometria), com progresso por subtema. Hoje o subtema existe nos arquivos, mas só agrupa as coleções.
- [ ] Etiquetas de dificuldade nas perguntas (campo opcional no YAML, por exemplo `level`), mostradas de forma discreta na carta e usáveis como filtro. Cuidado para não virar pressão ou ranking.
- [ ] Referências e vídeos para aprender mais, como campo opcional `learnMore` na pergunta, com links para fontes confiáveis. Links externos abrem em nova aba e nunca são obrigatórios.
- [ ] Revisar o que errei: um deck só com as perguntas que errei, para tentar de novo sem pressa.
- [ ] Pergunta do dia: uma pergunta por dia, igual para todo mundo, sem precisar de servidor (escolhida pela data).
- [ ] Álbum de descobertas: tela com tudo que já descobri, por tema, com as explicações para reler.
- [ ] Exportar e importar o progresso em um arquivo, para trocar de aparelho sem cadastro.
- [ ] Mais tipos de pergunta: verdadeiro ou falso, ordenar, completar a lacuna, imagem na pergunta.
- [ ] Imagens e ilustrações nas explicações, sempre com texto alternativo.
- [ ] Busca por assunto nas perguntas e explicações.
- [ ] Meta diária opcional e leve (por exemplo, 5 perguntas), sem culpa se não cumprir.
- [ ] Mais conquistas do Curió além das penas, como selos por tema concluído.
- [ ] Contribuição aberta: guia e modelo de deck para outras pessoas enviarem perguntas por pull request.
- [ ] Ajustes de leitura: tamanho de letra e fonte para dislexia, além do modo escuro.
- [ ] Outros idiomas para a interface e as perguntas, se um dia fizer sentido.

## Feito
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
