# Curiô

Feed de perguntas e respostas em português que troca o scroll de vídeos curtos por curiosidade. Os temas são separados (ciências, matemática, raciocínio lógico etc.), e toda resposta revela uma explicação curta. O mascote é o Curió. É gratuito, sem anúncios, sem cadastro obrigatório e **com custo zero de manutenção**. Essa é uma restrição de projeto: nada que exija servidor pago.

## Leia antes de qualquer trabalho

1. **`docs/PRODUCT.md`**: público, propósito, personalidade, anti-referências, princípios e acessibilidade (WCAG 2.2 AA).
2. **`docs/DESIGN.md`**: identidade visual ("O Ninho Cantante"), regras de cor, tipografia, movimento e a lista de Do's and Don'ts. **As regras são estritas: não as contorne.** Se uma tarefa entrar em conflito com elas, pergunte antes.
3. **`README.md`**: a ideia e a stack em linguagem de usuário.

Os dois `.md` de regras têm títulos de seção em inglês (exigidos pelo formato) e conteúdo em português. Mantenha assim.

## Fluxo de design: impeccable

Todo trabalho de interface segue o skill **impeccable**, que está em `.agents/skills/impeccable/` (leia o `SKILL.md` dele).

- Carregue o contexto com `node .agents/skills/impeccable/scripts/load-context.mjs`.
- O registro é **product**. Carregue `reference/product.md` e a referência do subcomando em uso.
- **Ordem obrigatória:** `shape` (briefing confirmado pelo usuário) antes de `craft` (código). Nunca implemente uma tela sem briefing confirmado.
- O `docs/DESIGN.md` está em **modo seed**: cores exatas e fonte ainda não foram escolhidas (`[to be resolved during implementation]`). Elas são definidas no primeiro `craft`, respeitando as regras do arquivo. Depois que houver código, rode `document` de novo para registrar os tokens reais.

## Stack e decisões técnicas

- **Astro 7** (site estático) com **ilhas React 19**, usadas apenas onde há estado (o player do quiz).
- **Conteúdo:** perguntas em arquivos YAML/MD no repositório, agrupadas em **decks** de cerca de 20 a 50 perguntas por arquivo, organizados em `content/<topic>/<subtopic>/<deck>.yaml` (pastas em inglês, como `content/astronomy/solar-system/basics.yaml`). Cada arquivo tem `title`, `subtopic` (opcional, o nome de exibição) e `questions`, e cada pergunta tem `id`, `level` (`easy`, `medium` ou `hard`; na interface Filhote, Curioso e Explorador), `prompt`, `choices`, `answer` e `explanation`. São validadas com Content Collections + Zod em `src/content.config.ts`. Toda pergunta tem uma **explicação obrigatória**.
- **Fórmulas:** KaTeX renderizado no build.
- **Progresso e sequência de dias:** `localStorage`. Não há backend. Se um dia houver, só plano gratuito (Supabase, Cloudflare D1).
- **Hospedagem:** Cloudflare Pages (gratuito). **Limite de 20.000 arquivos por deploy:** nunca gere uma página ou um JSON por pergunta. Gere páginas por tema/deck e JSON agrupado por deck.

## Idioma: código em inglês, interface em português

- **Código em inglês.** Tudo que a pessoa não vê: nomes de variáveis, funções, tipos e componentes, nomes de arquivos e pastas, classes e variáveis CSS, atributos `data-*`, chaves e ids do YAML (de perguntas, decks e temas), chaves do `localStorage`, comentários e mensagens de erro de build. Isso vale para qualquer arquivo novo e para qualquer arquivo que você editar.
- **Português do Brasil só no que a pessoa vê:** textos da interface (inclui `aria-label`, `title` e `<title>`), o conteúdo das perguntas e explicações, e os endereços públicos (rotas e parâmetros, como `/temas/astronomia` e `?tema=`). Os endereços ficam em `src/lib/routes.ts` e na pasta `src/pages/temas/` (o nome da pasta é a URL). Em todo o resto o código usa o id em inglês, e `TOPICS` em `src/data/topics.ts` liga o id ao nome de exibição e ao endereço (`slug`).
- Documentação (`.md`) e mensagens de commit continuam em português do Brasil.
- **Nomes próprios ficam:** `Curio` (o mascote, sem acento no código) e o pacote `curio`.
- **Glossário** (para o código ficar consistente): tema = `topic`, subtema = `subtopic`, pergunta = `question`, alternativa = `choice`, carta = `card`, descoberta/vista = `discovered`/`seen`, sequência de dias = `streak`, acertos seguidos = `run`, penas = `feathers`. Em código, `theme` só significa claro/escuro (modo), nunca tema de assunto.
- **Tema novo:** id em inglês e slug em português em `src/data/topics.ts`, cor com o mesmo id em `src/styles/tokens.css` (`--<id>`, `--<id>-ink`, `--<id>-bg`) e pasta `content/<id>/`.

## Convenções

- Textos da interface em **português do Brasil**, com o tom definido em `docs/PRODUCT.md` (amigo curioso, acolhedor, nunca professor nem vendedor).
- **Sem travessão (—) nem `--`** em textos da interface ou da documentação.
- Nome do pacote npm: `curio` (sem acento). Nome de exibição: **Curiô**.
- **Commits:** o usuário faz os commits. Não faça commit. Ao fim de cada etapa, sugira uma mensagem no padrão Conventional Commits em pt-BR.

## Status

Fases de criação da interface:

1. ✅ **Fundação visual:** tokens em `src/styles/tokens.css` (paleta OKLCH com contraste AA verificado, fonte Parkinsans servida pelo próprio site, escala, espaço, movimento).
2. ✅ **Feed de perguntas** (`src/components/feed/`): feed misto com barra lateral de filtros (tema, subtema, modo e dificuldade), uma carta por tela com encaixe, palco do Curió, explicação, atalhos de teclado. Decks de exemplo em `content/`.
3. ✅ **O Curió** (`src/components/feed/Curio.tsx` e `curio.css`): quatro reações e animações de personagem.
4. ✅ **Celebrações:** penas (`Feathers.tsx`) em acertos seguidos e marcos de dias. O som ficou para uma etapa própria.
5. ✅ **Temas e progresso:** tela de temas (`src/components/topics/`, rotas `/temas` e `/temas/<slug>`), ícone de cada tema em `Icons.tsx` e tela de tema concluído (`TopicComplete.tsx`). O feed aceita `?tema=`, `?subtema=`, `?modo=erradas|vistas`, `?deck=` e `?rever=1` (nomes definidos em `FEED_QUERY`, em `src/lib/routes.ts`).
6. **Ninho à noite e acabamento:** modo escuro, `audit`, `polish`.
7. **Registro:** `impeccable document` para tirar o `docs/DESIGN.md` do modo seed.

A lista detalhada do que falta está em **`docs/TODO.md`**. Atualize-a ao fim de cada etapa.

Conteúdo: use `$...$` (KaTeX) só para fórmulas de verdade (frações, raízes, potências, π). Números e sequências vão como texto comum.

Atualize esta seção quando uma etapa terminar.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Other scripts: `npm run build` (static build into `dist/`) and `npm run preview`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
