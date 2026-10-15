# TODO do Curiô

Lista viva do que falta. Marque com `[x]` ao terminar e mova para "Feito". Toda tarefa de interface segue o fluxo do impeccable: `shape` (briefing confirmado) antes de `craft`.

## Agora

### Pendências da fase 2 (feed)
- [ ] Testar com leitor de tela de verdade (NVDA no Windows ou TalkBack no Android). Precisa ser feito à mão.

### Fase 5: temas e progresso (falta só conferir à mão)
- [ ] Conferir a tela de temas, a página de tema e o tema concluído com teclado e leitor de tela de verdade (junto com o teste da fase 2).
- [ ] Decidir se "Rever" deve guardar que o tema já foi concluído. Hoje rever zera o progresso do deck, e o selo "Concluído" some até terminar de novo.
- [ ] `extract`: `.botao` (temas.css) e `.proxima` (feed.css) têm o mesmo desenho em dois arquivos; unificar num botão só.

## Depois

### Som
- [ ] `shape` do som: quais sons, quando tocam, onde fica o controle.
- [ ] Canto curto do Curió no acerto e nas celebrações, desligado por padrão, com controle visível e preferência salva.

### Conteúdo
- [ ] Decks para os 4 temas que ainda não têm perguntas: Ciências, História, Geografia, Linguagem.
- [ ] Guia curto de como escrever uma pergunta e uma explicação (tom, tamanho, quando usar fórmula). Limites para todas as cartas terem o mesmo desenho: pergunta com até uns 80 caracteres (4 linhas no celular), alternativa com até uma linha e explicação com até uns 200 caracteres (cabe na carta do computador sem ela crescer).
- [ ] Aviso no build quando uma pergunta, alternativa ou explicação passar do limite de tamanho.
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

## Feito
- [x] Fase 5: temas e progresso. Tela `/temas` com o tema em andamento em destaque, lista que muda de desenho conforme o progresso (novo, em andamento, concluído) e temas "em breve". Página `/temas/<tema>` com as coleções agrupadas por subtema e o progresso de cada uma. Feed filtra por coleção (`?deck=`) e aceita `?rever=1`. Tela de tema concluído pintada com a cor do tema (cor se espalhando, Curió comemorando, penas, versão com fade para movimento reduzido). Sete ícones de tema. Conferido a 320px, 390px e 1280px; axe-core sem violações.
- [x] Regras de produto e design (PRODUCT.md e DESIGN.md seed).
- [x] Fase 1: fundação visual (tokens, paleta com contraste AA, fonte Parkinsans).
- [x] Fase 2: feed de perguntas com filtro por tema, palco do Curió, explicação, teclado e três decks de exemplo.
- [x] Fase 2: conferidos no navegador a falha de rede, o fim de tema e o zoom de 200%; validação dos decks testada com arquivos quebrados; axe-core sem violações WCAG.
- [x] Fase 3: Curió em SVG com volume e contorno quente, quatro reações (esperando, feliz, consolando, comemorando), animações de personagem com versão para movimento reduzido e favicon só com a cabeça.
- [x] Cartas com o mesmo desenho: pergunta, alternativas e palco sempre na mesma posição, carta da altura da tela.
- [x] Fase 4: celebrações. Penas caindo em 3, 5, 10 e a cada 10 acertos seguidos; marcos de 3, 7, 14, 30, 50 e 100 dias com a pílula brilhando; versão para movimento reduzido; asa do Curió comemorando refinada.
