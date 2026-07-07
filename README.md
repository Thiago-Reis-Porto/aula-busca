# Busca em Espaços: aula interativa

App de apoio para uma aula de graduação sobre busca em espaço, otimização e busca
de hiperparâmetros em IA.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173/`.

Slides da aula:

```text
http://localhost:5173/slides.html
```

Para editar o texto dos slides, altere:

```text
src/slidesContent.ts
```

O arquivo `slides.html` só carrega a apresentação. Os componentes visuais ficam em
`src/slides.tsx` e o estilo em `src/slides.css`.

Para gerar uma versão importável no Google Slides:

```bash
npm run export:pptx
```

Isso cria:

```text
exports/google-slides/aula-busca-espacos.pptx
```

No Google Drive, envie esse `.pptx` e use `Abrir com > Apresentações Google`.

Atalhos dos slides:

- seta direita ou espaço: próximo slide;
- seta esquerda: slide anterior;
- `N`: alternar notas do apresentador;
- `F`: tela cheia.

## Build

```bash
npm run build
```

## Teste visual

```bash
npx playwright install chromium
npm run test:visual
```

O teste abre a seção 3D em desktop e mobile, captura screenshots e verifica se o
canvas WebGL não está vazio.

## Roteiro sugerido

1. **Mapa**: apresentar estado, função objetivo, movimento e orçamento.
2. **Regressão**: ajustar inclinação/intercepto e conectar perda com espaço de parâmetros.
3. **Mínimos**: mudar ponto inicial e taxa de aprendizado para mostrar mínimos locais.
4. **Espaço 3D**: discutir por que visualizar duas dimensões não resolve problemas reais.
5. **Algoritmos**: comparar busca aleatória, descida local, tabu e genético.
6. **Exercício**: implementar do zero uma busca para Rastrigin em 10 dimensões ou para
   hiperparâmetros de um modelo simples.

## Stack

- Vite
- React
- TypeScript
- Three.js
- Canvas 2D
- Lucide React
