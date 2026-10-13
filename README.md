# Curiô 🐦

> Troque o scroll infinito de vídeos curtos por perguntas que despertam a curiosidade.

O **Curiô** é um site de perguntas e respostas gratuito, sem anúncios e de custo zero para manter. A ideia é oferecer o mesmo formato rápido e viciante dos vídeos curtos, mas com algo que estimule o conhecimento: você desliza, responde, e logo em seguida descobre uma curiosidade sobre o assunto.

## A ideia

- **Vários temas, cada um com sua identidade:** ciências, matemática, raciocínio lógico, história, geografia, astronomia, linguagem e o que mais for interessante.
- **Formato de feed:** cartas em sequência vertical, uma pergunta por vez, no ritmo de quem rola um feed.
- **A resposta é só o começo:** toda pergunta vem com uma explicação curta. O objetivo não é apenas acertar, é sair sabendo algo novo e querer a próxima.
- **Grátis de verdade:** sem anúncios, sem compras no app, sem cadastro obrigatório.
- **Custo zero para manter:** site estático, sem servidor e sem banco de dados pago.

## Por que existe

As alternativas que existem hoje (como o Perguntados) são cheias de anúncios, e as opções abertas são pequenas, estão em inglês ou estão abandonadas. Não existe um lugar bem cuidado, em português, que trate o aprendizado com a mesma fluidez de um app de vídeos curtos.

## Stack

| Parte | Escolha | Motivo |
|---|---|---|
| Framework | [Astro](https://astro.build) | Quase todo o conteúdo é estático, e o Astro gera páginas rápidas e boas para SEO. |
| Interatividade | React (ilhas do Astro) | Usado apenas no player do quiz, onde há estado. |
| Conteúdo | Arquivos YAML/MD no repositório (Content Collections + Zod) | O Git funciona como banco de dados, e cada pergunta é validada no build. |
| Fórmulas | KaTeX, renderizado no build | Matemática legível sem custo no navegador. |
| Progresso | `localStorage` | Sem conta e sem servidor. Um backend gratuito pode entrar no futuro, se for preciso. |
| Hospedagem | Cloudflare Pages | Plano gratuito com banda ilimitada. |

### Organização do conteúdo

As perguntas ficam agrupadas em **decks** (cerca de 20 a 50 perguntas por arquivo), organizados por tema e subtema:

```
content/
  ciencias/astronomia/sistema-solar.yaml
  matematica/probabilidade/basico.yaml
  logica/sequencias/nivel-1.yaml
```

> ⚠️ O Cloudflare Pages gratuito aceita até 20.000 arquivos por deploy. Por isso as perguntas são publicadas agrupadas por deck, e nunca como um arquivo por pergunta.

## Rodando localmente

Requer Node.js 22.12 ou superior.

```sh
npm install
npm run dev       # servidor de desenvolvimento em localhost:4321
npm run build     # gera o site estático em ./dist
npm run preview   # serve o build localmente
```

## Status

🌱 Ideia saindo do papel. O projeto ainda é o template inicial do Astro com React.
