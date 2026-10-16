---
name: Curiô
description: Um feed de perguntas que troca o scroll vazio por curiosidade, guiado pelo Curió.
---

<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Curiô

> Os títulos das seções ficam em inglês porque são exigidos pelo formato DESIGN.md (Stitch) e lidos pelo impeccable. O conteúdo é em português.

## 1. Overview

**Creative North Star: "O Ninho Cantante"**

O Curiô é um lugar quente e seguro, como um ninho, onde cada acerto vira canto. A interface é viva e colorida: cada tema tem sua cor, cada toque responde e cada descoberta é comemorada. Mesmo assim, o fluxo de responder perguntas é sempre claro, previsível e rápido. O padrão de acabamento é o da Nintendo e de Animal Crossing (acolhimento e encanto para qualquer idade), e a energia de celebração é a do Duolingo, sem a pressão e a culpa.

**Cena física (decide o tema):** uma avó e o neto no sofá da sala numa tarde clara, revezando o celular para responder; ou alguém no ônibus às oito da manhã, com sol batendo na tela. Por isso o tema padrão é **claro e quente** (creme tingido de ferrugem, nunca branco puro). O modo escuro ("o ninho à noite") segue a preferência do sistema, com o mesmo calor e nunca preto puro.

Este sistema rejeita explicitamente: **Perguntados e apps cheios de anúncio** (poluição, popups, pressa), **plataforma escolar / EAD** (cinza institucional, cara de prova), **cassino e dark patterns** (roletas, urgência falsa, culpa) e **visual infantil demais** (cores chapadas sem critério, fontes "divertidas" ilegíveis).

**Key Characteristics:**
- Paleta completa: uma cor de marca (o castanho-ferrugem do peito do curió) e uma cor própria para cada tema.
- Uma única família sans arredondada e calorosa para tudo.
- Movimento responsivo em toda interação (150 a 250ms) e celebrações coreografadas apenas nos momentos que merecem.
- Superfícies planas e macias, com profundidade vinda de cor e de sombras quentes discretas.
- O Curió aparece como personagem: guia, reage e comemora.

## 2. Colors

Uma paleta quente e viva, ancorada no peito castanho-ferrugem do curió, em que cada tema ganha uma cor própria e a cor sempre diz onde você está.

### Primary
- **Ferrugem do Curió** ([to be resolved during implementation]: laranja-castanho quente e saturado, em OKLCH): cor da marca. É usada no logo, na ação principal (o botão "próxima" / "continuar"), na sequência de dias e nos momentos de celebração do Curió.

### Secondary
- **Cores de tema** ([to be resolved during implementation]: uma por tema, por exemplo Ciências, Matemática, Raciocínio Lógico, História, Geografia, Astronomia, Linguagem): cada tema tem uma cor viva própria com luminosidade parecida entre todas, para que nenhum tema "grite" mais que outro. A cor do tema pinta o cabeçalho da carta, o chip do tema, a barra de progresso daquele tema e o fundo da tela de tema concluído.

### Tertiary
- **Estados de resposta** ([to be resolved during implementation]): um verde de acerto e um tom de erro **quente e gentil** (coral ou rosado, nunca vermelho-alarme). Os dois precisam ser claramente distintos das cores de tema e nunca aparecem sem ícone ou texto.

### Neutral
- **Creme do Ninho** ([to be resolved during implementation]): fundo claro padrão, creme tingido levemente em direção à ferrugem (croma 0,005 a 0,01).
- **Plumagem Escura** ([to be resolved during implementation]): texto principal e base do modo escuro. Um quase-preto quente, inspirado na plumagem do curió macho, nunca `#000`.
- **Penugem** ([to be resolved during implementation]): segunda camada neutra para painéis, barras e áreas secundárias, levemente mais quente que o fundo.

### Named Rules
**The Plumage Rule.** Nunca use `#000` nem `#fff`. Todo neutro é tingido de ferrugem. Se um cinza parecer "de sistema", está errado.

**The Theme Owns Its Color Rule.** Cada tema tem exatamente uma cor, e essa cor nunca é reaproveitada para outro significado (botão genérico, alerta, decoração). A cor é o endereço do tema.

**The Kind Error Rule.** Errar nunca é vermelho-alarme. O tom de erro é quente e gentil, porque errar também ensina.

**The Contrast Floor Rule.** Cor viva não é desculpa. Todo texto sobre cor de tema ou de marca passa WCAG AA (4,5:1 para texto normal, 3:1 para texto grande e componentes). Se não passa, escureça o tom ou troque a cor do texto, nunca aceite.

## 3. Typography

**Display Font:** [font pairing to be chosen at implementation]
**Body Font:** a mesma família (uma única sans arredondada e calorosa)

**Character:** uma sans de terminais arredondados e formas abertas, gostosa de olhar em qualquer tamanho, que soa como a voz de um amigo. Legível para uma criança aprendendo a ler e para um avô de óculos. Uma família só, com o contraste construído por peso e tamanho.

### Hierarchy
- **Display** ([to be resolved]): celebrações e telas de tema concluído. Nunca dentro do fluxo de responder.
- **Headline** ([to be resolved]): o enunciado da pergunta. É o texto mais importante da tela e precisa ser lido de relance.
- **Title** ([to be resolved]): nomes de temas e títulos de seção.
- **Body** ([to be resolved]): explicações e curiosidades depois da resposta. Máximo de 65 a 75 caracteres por linha.
- **Label** ([to be resolved]): alternativas de resposta, botões, chips e contadores. Nunca em caixa alta corrida.

Escala fixa em rem (registro product), com razão entre 1,2 e 1,25. Sem tamanhos fluidos com clamp no fluxo do app.

### Named Rules
**The One Voice Rule.** Uma única família tipográfica em todo o produto. Fontes "divertidas" de display, cursivas ou de quadrinhos são proibidas, inclusive em celebrações.

**The Reflex Font Ban.** A fonte não pode ser escolhida por reflexo. Antes de escolher, liste as três primeiras que vêm à cabeça para "app educativo arredondado" e descarte as que aparecem por padrão em todo lugar (Nunito, Fredoka, Baloo, Poppins, Quicksand) e as da lista de rejeição do impeccable (Inter, DM Sans, Outfit, Plus Jakarta Sans, Space Grotesk e as demais). A escolha final precisa de suporte completo a português (acentos, ç, til) e precisa ser servida pelo próprio site (sem custo e sem dependência externa em tempo de execução).

## 4. Elevation

O sistema é **macio e plano por padrão**. A profundidade vem principalmente de camadas de cor (creme, penugem, cor de tema). Quando houver sombra, ela é quente (tingida de ferrugem, nunca cinza ou preta), difusa e baixa. A elevação aparece como **resposta**: a carta ou o botão "levanta" um pouco no hover, "afunda" no toque e assenta no lugar.

### Named Rules
**The Soft Lift Rule.** Superfícies em repouso são planas ou quase planas. Sombra cresce só como resposta a hover, foco ou arraste. Se a sombra parece de app de 2014 (escura, curta e dura), está errada.

**The No Glass Rule.** Glassmorphism, blur decorativo e vidro fosco são proibidos.

### Motion (parte da elevação e do estado)
- **Interações do dia a dia** (hover, foco, toque, troca de carta, revelar explicação): 150 a 250ms, com saída exponencial (ease-out-quart, quint ou expo). Animar apenas `transform` e `opacity`, nunca propriedades de layout.
- **Celebrações** (acerto, sequência de dias, tema concluído, conquista): coreografadas e ricas, por exemplo penas caindo como confete, o Curió cantando com notas musicais saindo do bico e a cor do tema se espalhando pela tela. Duram no máximo cerca de 1,2s e nunca bloqueiam o próximo toque.
- **Sem bounce e sem elastic na interface.** Botões, cartas e painéis usam saída exponencial. O próprio Curió, como personagem ilustrado, pode ter animação de personagem (piscar, inclinar a cabeça, bater as asas), que é ilustração, não easing de UI.
- **Movimento reduzido:** com `prefers-reduced-motion`, as celebrações viram fade e troca de cor, sem partículas e sem deslocamento. O feedback de acerto e erro continua perfeitamente claro.

## 5. Components

[Seed: nenhum componente existe ainda. Re-run `/impeccable document` depois da implementação para documentar botões, cartas de pergunta, alternativas, chips de tema, barra de progresso e navegação.]

## 6. Do's and Don'ts

### Do:
- **Do** dar a cada tema exatamente uma cor viva e usá-la de forma consistente em carta, chip, progresso e tela de conclusão.
- **Do** fazer toda interação responder: hover, foco visível, toque e transição em todo elemento clicável, entre 150 e 250ms com saída exponencial.
- **Do** guardar as animações mais ricas (penas, canto do Curió, cor se espalhando) para acerto, sequência e tema concluído.
- **Do** mostrar acerto e erro sempre com ícone e texto, além da cor.
- **Do** tratar o erro com gentileza: tom quente, mensagem acolhedora e a curiosidade logo em seguida.
- **Do** manter alternativas de resposta grandes (alvo mínimo de 44×44px) e fáceis de acertar com o polegar.
- **Do** usar o Curió como personagem com reações (feliz, pensativo, comemorando, consolando), sempre com a mesma personalidade.
- **Do** passar WCAG AA em todo texto sobre cor, sem exceção.

### Don't:
- **Don't** parecer **Perguntados e apps cheios de anúncio**: nada de popups, banners, vidas que acabam, pedidos de compra ou cronômetro estressante por padrão.
- **Don't** parecer **plataforma escolar / EAD (Moodle, apostila, simulado)**: nada de cinza institucional, tabelas de nota ou linguagem de prova.
- **Don't** usar **cassino e dark patterns**: nada de roletas, baús surpresa, urgência falsa, contadores artificiais ou mensagens de culpa por perder a sequência.
- **Don't** ficar **infantil demais**: nada de cores chapadas sem critério, fontes "divertidas" ilegíveis ou excesso de elementos fofos. O teste é se um adulto ficaria constrangido de usar em público. Se ficaria, está errado.
- **Don't** usar `border-left` ou `border-right` maior que 1px como faixa colorida em cartas, alertas ou itens de lista.
- **Don't** usar texto com gradiente (`background-clip: text`).
- **Don't** usar glassmorphism ou blur decorativo.
- **Don't** fazer grades de cartas idênticas (ícone + título + texto repetidos). A lista de temas precisa de hierarquia e variação.
- **Don't** abrir modal como primeira solução. Explicações, resultados e configurações aparecem inline ou em painéis progressivos.
- **Don't** usar bounce ou elastic em componentes de interface.
- **Don't** animar propriedades de layout (width, height, top, left, margin).
- **Don't** usar vermelho-alarme para erro nem `#000` / `#fff` em qualquer lugar.
- **Don't** usar travessão (—) nem `--` em textos da interface. Use vírgula, dois-pontos, ponto ou parênteses.
