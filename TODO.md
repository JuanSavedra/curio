# TODO do Curiô

Lista viva do que falta. Marque com `[x]` ao terminar e mova para "Feito". Toda tarefa de interface segue o fluxo do impeccable: `shape` (briefing confirmado) antes de `craft`.

## Agora

### Pendências da fase 2 (feed)
- [ ] Testar com leitor de tela de verdade (NVDA no Windows ou TalkBack no Android). Precisa ser feito à mão.

### Fase 4: celebrações
- [ ] Refinar a asa erguida do Curió comemorando (hoje está boa, mas um pouco pontuda).
- [ ] `shape` das celebrações: quando cada uma acontece e quanto dura.
- [ ] Acerto: penas caindo e o Curió cantando, em até 1,2s, sem bloquear o próximo toque.
- [ ] Sequência de dias: comemoração ao completar 3, 7, 30 dias, sem culpa quando a sequência quebra.
- [ ] Versão com movimento reduzido: fade e troca de cor, sem partículas.
- [ ] Som opcional, desligado por padrão, com controle visível.

## Depois

### Fase 5: temas e progresso
- [ ] `shape` da tela de temas (com hierarquia, sem grade de cartas idênticas).
- [ ] Página por tema com seus decks e o progresso de cada um.
- [ ] Tela de tema concluído, pintada com a cor do tema.
- [ ] Ícone próprio para cada tema.

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
- [x] Regras de produto e design (PRODUCT.md e DESIGN.md seed).
- [x] Fase 1: fundação visual (tokens, paleta com contraste AA, fonte Parkinsans).
- [x] Fase 2: feed de perguntas com filtro por tema, palco do Curió, explicação, teclado e três decks de exemplo.
- [x] Fase 2: conferidos no navegador a falha de rede, o fim de tema e o zoom de 200%; validação dos decks testada com arquivos quebrados; axe-core sem violações WCAG.
- [x] Fase 3: Curió em SVG com volume e contorno quente, quatro reações (esperando, feliz, consolando, comemorando), animações de personagem com versão para movimento reduzido e favicon só com a cabeça.
