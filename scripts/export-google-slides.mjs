import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

const root = process.cwd();
const sourcePath = path.join(root, 'src', 'slidesContent.ts');
const outDir = path.join(root, 'exports', 'google-slides');
const outPath = path.join(outDir, 'aula-busca-espacos.pptx');

const colors = {
  bg: '101713',
  bg2: '17231D',
  ink: 'FFFDF8',
  muted: 'CFCBC0',
  line: '516058',
  panel: '243129',
  green: '00A676',
  blue: '2D6CDF',
  amber: 'F7B32B',
  coral: 'F25F5C',
  white: 'FFFFFF',
};

const accentMap = {
  green: colors.green,
  blue: colors.blue,
  amber: colors.amber,
  coral: colors.coral,
};

const demoLinks = {
  regression: '/#regressao',
  minima: '/#minimos',
  surface: '/#espaco3d',
  algorithms: '/#algoritmos',
  exercise: '/#exercicio',
};

const slides = loadSlides(sourcePath);

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Thiago';
pptx.company = 'Aula Busca';
pptx.subject = 'Busca em espaços e hiperparâmetros';
pptx.title = 'Busca em Espaços';
pptx.lang = 'pt-BR';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'pt-BR',
};
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';

slides.forEach((content, index) => {
  const slide = pptx.addSlide();
  const accent = accentMap[content.accent ?? 'green'];
  slide.background = { color: colors.bg };
  drawBackground(slide, accent);
  drawFrame(slide, content, index, slides.length, accent);
  drawTitle(slide, content, accent);
  drawBody(slide, content.body, accent);
  if (content.note && typeof slide.addNotes === 'function') {
    slide.addNotes(content.note);
  }
});

fs.mkdirSync(outDir, { recursive: true });
await pptx.writeFile({ fileName: outPath });

const readmePath = path.join(outDir, 'README.md');
fs.writeFileSync(
  readmePath,
  `# Export para Google Slides

Arquivo gerado:

\`\`\`text
aula-busca-espacos.pptx
\`\`\`

Para importar no Google Slides:

1. Abra o Google Drive.
2. Envie o arquivo \`aula-busca-espacos.pptx\`.
3. Clique com o botão direito no arquivo.
4. Use \`Abrir com > Apresentações Google\`.

Para regenerar depois de editar \`src/slidesContent.ts\`:

\`\`\`bash
npm run export:pptx
\`\`\`
`,
);

console.log(`PPTX gerado em ${path.relative(root, outPath)}`);

function loadSlides(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const sandbox = {
    exports: {},
    module: { exports: {} },
    require: () => {
      throw new Error('slidesContent.ts deve conter apenas dados, sem imports runtime.');
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: filePath });
  return sandbox.exports.slides ?? sandbox.module.exports.slides;
}

function drawBackground(slide, accent) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: colors.bg },
    line: { color: colors.bg },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: -1.3,
    y: -1.1,
    w: 4.1,
    h: 4.1,
    fill: { color: accent, transparency: 76 },
    line: { color: accent, transparency: 100 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 9.4,
    y: 4.5,
    w: 4.8,
    h: 4.8,
    fill: { color: colors.white, transparency: 92 },
    line: { color: colors.white, transparency: 100 },
  });
  for (let x = 0.4; x < 13.2; x += 0.75) {
    slide.addShape(pptx.ShapeType.line, {
      x,
      y: 0,
      w: 0,
      h: 7.5,
      line: { color: '243029', transparency: 55, width: 0.35 },
    });
  }
  for (let y = 0.35; y < 7.4; y += 0.75) {
    slide.addShape(pptx.ShapeType.line, {
      x: 0,
      y,
      w: 13.333,
      h: 0,
      line: { color: '243029', transparency: 55, width: 0.35 },
    });
  }
}

function drawFrame(slide, content, index, total, accent) {
  slide.addText('Busca em Espaços', {
    x: 0.36,
    y: 0.19,
    w: 2.1,
    h: 0.26,
    fontFace: 'Aptos',
    fontSize: 11,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 0.17,
    y: 0.23,
    w: 0.11,
    h: 0.11,
    fill: { color: accent },
    line: { color: accent },
  });
  slide.addText(`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, {
    x: 11.92,
    y: 0.18,
    w: 1.05,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color: colors.ink,
    align: 'right',
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.26,
    y: 7.18,
    w: 10.6 * ((index + 1) / total),
    h: 0,
    line: { color: accent, width: 2.2, beginArrowType: 'none', endArrowType: 'none' },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.26 + 10.6 * ((index + 1) / total),
    y: 7.18,
    w: 10.6 * (1 - (index + 1) / total),
    h: 0,
    line: { color: colors.line, width: 1.2 },
  });
  if (content.body?.kind && content.body.kind !== 'hero') {
    slide.addText(content.body.kind, {
      x: 11.1,
      y: 6.95,
      w: 1.7,
      h: 0.18,
      fontSize: 6.5,
      color: colors.muted,
      align: 'right',
      margin: 0,
    });
  }
}

function drawTitle(slide, content, accent) {
  if (content.eyebrow) {
    slide.addText(content.eyebrow.toUpperCase(), {
      x: 0.92,
      y: 2.42,
      w: 4.85,
      h: 0.24,
      fontSize: 8.5,
      bold: true,
      color: accent,
      margin: 0,
      fit: 'shrink',
    });
  }
  slide.addText(content.title, {
    x: 0.9,
    y: 2.78,
    w: 5.1,
    h: 2.0,
    fontFace: 'Aptos Display',
    fontSize: chooseTitleSize(content.title),
    bold: true,
    breakLine: false,
    color: colors.ink,
    margin: 0,
    fit: 'shrink',
  });
  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 0.93,
      y: 5.0,
      w: 5.2,
      h: 0.85,
      fontSize: 15,
      color: colors.muted,
      margin: 0,
      fit: 'shrink',
      breakLine: false,
    });
  }
}

function drawBody(slide, body, accent) {
  switch (body.kind) {
    case 'hero':
      drawHero(slide, body.visual, accent);
      break;
    case 'thesis':
      drawCards(slide, body.items.map((item) => [item.value, item.label]), accent, { bigNumbers: true });
      break;
    case 'timeline':
      drawTimeline(slide, body.items, accent);
      break;
    case 'iconGrid':
      drawCards(slide, body.items.map((item) => [item.title, item.text]), accent);
      break;
    case 'regressionDemo':
      drawRegression(slide, accent);
      drawCallout(slide, body.callout.title, body.callout.text, accent, body.callout.link, body.callout.linkLabel);
      break;
    case 'formula':
      drawFormula(slide, body.formula, body.bullets, accent);
      break;
    case 'minimaDemo':
      drawMinima(slide, accent);
      drawBulletPanel(slide, body.panel.title, body.panel.bullets, accent, body.panel.link, body.panel.linkLabel);
      break;
    case 'tagCloud':
      drawTagCloud(slide, body.tags, accent);
      break;
    case 'dimensions':
      drawBars(slide, body.bars, accent);
      drawCallout(slide, body.callout.title, body.callout.text, accent, body.callout.link, body.callout.linkLabel);
      break;
    case 'pipeline':
      drawPipeline(slide, body.steps, accent);
      break;
    case 'samplingComparison':
      drawSampling(slide, accent);
      break;
    case 'algorithm':
      drawAlgorithm(slide, body.name, body.strengths, body.limits, accent);
      break;
    case 'evolution':
      drawCards(slide, body.steps.map((step) => [step.title, step.text]), accent, { columns: 4 });
      break;
    case 'bayes':
      drawBayes(slide, accent);
      drawBulletPanel(slide, body.panel.title, body.panel.bullets, accent);
      break;
    case 'halving':
      drawHalving(slide, body.rows, accent);
      drawBulletPanel(slide, body.panel.title, body.panel.bullets, accent);
      break;
    case 'methodMatrix':
      drawCards(slide, body.methods, accent, { compact: true });
      break;
    case 'checklist':
      drawChecklist(slide, body.items, accent);
      break;
    case 'decisionTable':
      drawDecisionTable(slide, body.rows, accent);
      break;
    case 'exercise':
      drawExercise(slide, body, accent);
      break;
    default:
      break;
  }
}

function drawHero(slide, visual, accent) {
  const x = 6.2;
  const y = 1.25;
  const w = 6.25;
  const h = 5.55;
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: colors.panel, transparency: 5 },
    line: { color: colors.line, transparency: 10 },
  });
  if (visual === 'closing') {
    const nodes = [
      [7.1, 3.0, 'Parâmetros'],
      [8.3, 4.55, 'Hiperparâmetros'],
      [9.8, 2.65, 'Arquitetura'],
      [11.3, 4.25, 'Pipeline'],
      [9.45, 3.55, 'Busca'],
    ];
    nodes.slice(0, -1).forEach(([nx, ny]) => {
      slide.addShape(pptx.ShapeType.line, { x: 9.45, y: 3.55, w: nx - 9.45, h: ny - 3.55, line: { color: colors.line, width: 1 } });
    });
    nodes.forEach(([nx, ny, label], i) => {
      slide.addShape(pptx.ShapeType.ellipse, { x: nx - 0.18, y: ny - 0.18, w: 0.36, h: 0.36, fill: { color: i === 4 ? accent : colors.panel }, line: { color: accent, width: 1.2 } });
      slide.addText(label, { x: nx - 0.58, y: ny + 0.23, w: 1.16, h: 0.22, fontSize: 7.5, bold: true, color: colors.ink, align: 'center', margin: 0 });
    });
    return;
  }

  const points = [
    [6.2, 4.9],
    [6.55, 5.55],
    [7.1, 3.25],
    [7.65, 4.2],
    [8.2, 4.25],
    [8.75, 2.15],
    [9.3, 2.55],
    [9.75, 4.05],
    [10.25, 4.75],
    [10.75, 3.22],
    [11.25, 5.18],
    [11.9, 3.8],
    [12.45, 2.42],
  ];
  points.slice(0, -1).forEach((point, i) => {
    const next = points[i + 1];
    slide.addShape(pptx.ShapeType.line, {
      x: point[0],
      y: point[1],
      w: next[0] - point[0],
      h: next[1] - point[1],
      line: { color: i < 4 ? colors.green : i < 8 ? colors.amber : colors.coral, width: 9, beginArrowType: 'none', endArrowType: 'none' },
    });
  });
  slide.addShape(pptx.ShapeType.ellipse, { x: 10.45, y: 2.95, w: 0.48, h: 0.48, fill: { color: colors.white }, line: { color: colors.white } });
  slide.addShape(pptx.ShapeType.ellipse, { x: 7.25, y: 4.72, w: 0.27, h: 0.27, fill: { color: colors.green }, line: { color: colors.green } });
  slide.addShape(pptx.ShapeType.ellipse, { x: 9.55, y: 3.82, w: 0.33, h: 0.33, fill: { color: colors.amber }, line: { color: colors.amber } });
}

function drawCards(slide, pairs, accent, opts = {}) {
  const columns = opts.columns ?? 2;
  const gap = 0.15;
  const startX = 6.2;
  const startY = opts.compact ? 1.5 : 2.0;
  const cardW = (6.25 - gap * (columns - 1)) / columns;
  const cardH = opts.compact ? 0.73 : columns === 4 ? 1.55 : 1.52;
  pairs.forEach(([title, text], i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = startX + col * (cardW + gap);
    const y = startY + row * (cardH + 0.17);
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      rectRadius: 0.06,
      fill: { color: colors.panel, transparency: 6 },
      line: { color: colors.line, transparency: 8 },
    });
    if (opts.bigNumbers) {
      slide.addText(String(title), { x: x + 0.22, y: y + 0.22, w: 0.9, h: 0.5, fontSize: 34, bold: true, color: accent, margin: 0 });
      slide.addText(text, { x: x + 0.24, y: y + 0.92, w: cardW - 0.45, h: 0.35, fontSize: 14, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
    } else {
      slide.addText(title, { x: x + 0.18, y: y + 0.18, w: cardW - 0.35, h: 0.28, fontSize: opts.compact ? 12 : 15, bold: true, color: accent, margin: 0, fit: 'shrink' });
      slide.addText(text, { x: x + 0.18, y: y + 0.55, w: cardW - 0.35, h: cardH - 0.65, fontSize: opts.compact ? 9.2 : 10.8, color: colors.muted, margin: 0.02, fit: 'shrink', breakLine: false });
    }
  });
}

function drawTimeline(slide, items, accent) {
  items.forEach(([time, text], i) => {
    const y = 1.48 + i * 0.82;
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.1, y, w: 6.2, h: 0.62, rectRadius: 0.04, fill: { color: colors.panel, transparency: 6 }, line: { color: colors.line, transparency: 12 } });
    slide.addShape(pptx.ShapeType.rect, { x: 6.1, y, w: 0.06, h: 0.62, fill: { color: accent }, line: { color: accent } });
    slide.addText(time, { x: 6.35, y: y + 0.17, w: 0.7, h: 0.18, fontSize: 10, bold: true, color: accent, margin: 0 });
    slide.addText(text, { x: 7.2, y: y + 0.14, w: 4.5, h: 0.25, fontSize: 14, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
  });
}

function drawCallout(slide, title, text, accent, linkKey, linkLabel) {
  slide.addShape(pptx.ShapeType.roundRect, { x: 9.7, y: 2.08, w: 2.75, h: 2.95, rectRadius: 0.08, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
  slide.addShape(pptx.ShapeType.roundRect, { x: 9.95, y: 2.34, w: 0.45, h: 0.42, rectRadius: 0.04, fill: { color: accent }, line: { color: accent } });
  slide.addText(title, { x: 9.95, y: 3.0, w: 2.2, h: 0.35, fontSize: 14, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
  slide.addText(text, { x: 9.95, y: 3.42, w: 2.15, h: 0.95, fontSize: 10.8, color: colors.muted, margin: 0, fit: 'shrink', breakLine: false });
  if (linkKey) {
    slide.addShape(pptx.ShapeType.roundRect, { x: 9.9, y: 4.36, w: 1.55, h: 0.42, rectRadius: 0.04, fill: { color: accent }, line: { color: accent } });
    slide.addText(linkLabel ?? 'Abrir demo', { x: 9.95, y: 4.42, w: 1.45, h: 0.28, fontSize: 10, bold: true, color: colors.bg, margin: 0.04, hyperlink: { url: demoLinks[linkKey] } });
  }
}

function drawBulletPanel(slide, title, bullets, accent, linkKey, linkLabel) {
  slide.addShape(pptx.ShapeType.roundRect, { x: 9.7, y: 2.05, w: 2.75, h: 3.15, rectRadius: 0.08, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
  slide.addText(title, { x: 9.95, y: 2.35, w: 2.15, h: 0.3, fontSize: 14, bold: true, color: colors.ink, margin: 0 });
  bullets.forEach((bullet, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x: 10.0, y: 2.87 + i * 0.34, w: 0.08, h: 0.08, fill: { color: accent }, line: { color: accent } });
    slide.addText(bullet, { x: 10.18, y: 2.8 + i * 0.34, w: 1.9, h: 0.17, fontSize: 9.8, color: colors.muted, margin: 0, fit: 'shrink' });
  });
  if (linkKey) {
    slide.addShape(pptx.ShapeType.roundRect, { x: 9.95, y: 4.65, w: 1.55, h: 0.42, rectRadius: 0.04, fill: { color: accent }, line: { color: accent } });
    slide.addText(linkLabel ?? 'Abrir', { x: 10.0, y: 4.72, w: 1.45, h: 0.18, fontSize: 10, bold: true, color: colors.bg, margin: 0, hyperlink: { url: demoLinks[linkKey] } });
  }
}

function drawRegression(slide, accent) {
  slide.addShape(pptx.ShapeType.roundRect, { x: 6.1, y: 1.72, w: 3.25, h: 3.15, rectRadius: 0.07, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
  const points = [
    [6.45, 4.15],
    [6.78, 3.95],
    [7.15, 3.55],
    [7.45, 3.25],
    [7.85, 3.15],
    [8.15, 2.75],
    [8.52, 2.48],
    [8.9, 2.22],
  ];
  points.forEach(([x, y]) => {
    const lineY = 4.4 - (x - 6.25) * 0.72;
    slide.addShape(pptx.ShapeType.line, { x, y, w: 0, h: lineY - y, line: { color: colors.coral, transparency: 35, width: 1 } });
    slide.addShape(pptx.ShapeType.ellipse, { x: x - 0.045, y: y - 0.045, w: 0.09, h: 0.09, fill: { color: colors.ink }, line: { color: colors.ink } });
  });
  slide.addShape(pptx.ShapeType.line, { x: 6.35, y: 4.35, w: 2.75, h: -2.0, line: { color: accent, width: 2.4 } });
}

function drawMinima(slide, accent) {
  slide.addShape(pptx.ShapeType.roundRect, { x: 6.1, y: 1.72, w: 3.25, h: 3.15, rectRadius: 0.07, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
  const curve = [
    [6.35, 3.55],
    [6.7, 2.95],
    [7.05, 3.45],
    [7.45, 2.15],
    [7.85, 4.0],
    [8.25, 3.1],
    [8.65, 4.35],
    [9.0, 2.4],
  ];
  curve.slice(0, -1).forEach((point, i) => {
    const next = curve[i + 1];
    slide.addShape(pptx.ShapeType.line, { x: point[0], y: point[1], w: next[0] - point[0], h: next[1] - point[1], line: { color: accent, width: 2.2 } });
  });
  slide.addShape(pptx.ShapeType.ellipse, { x: 6.98, y: 3.35, w: 0.16, h: 0.16, fill: { color: colors.amber }, line: { color: colors.amber } });
  slide.addShape(pptx.ShapeType.ellipse, { x: 8.57, y: 4.27, w: 0.17, h: 0.17, fill: { color: colors.green }, line: { color: colors.green } });
  slide.addShape(pptx.ShapeType.ellipse, { x: 8.92, y: 2.32, w: 0.14, h: 0.14, fill: { color: colors.coral }, line: { color: colors.coral } });
}

function drawFormula(slide, formula, bullets, accent) {
  slide.addShape(pptx.ShapeType.roundRect, { x: 6.2, y: 1.55, w: 5.9, h: 1.2, rectRadius: 0.08, fill: { color: accent }, line: { color: accent } });
  slide.addText(formula, { x: 6.52, y: 1.95, w: 5.25, h: 0.36, fontSize: 23, bold: true, color: colors.bg, margin: 0, fit: 'shrink' });
  bullets.forEach((bullet, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x: 6.35, y: 3.08 + i * 0.47, w: 0.1, h: 0.1, fill: { color: accent }, line: { color: accent } });
    slide.addText(bullet, { x: 6.58, y: 2.98 + i * 0.47, w: 5.2, h: 0.25, fontSize: 13, color: colors.ink, margin: 0 });
  });
}

function drawTagCloud(slide, tags, accent) {
  let x = 6.1;
  let y = 1.55;
  tags.forEach((tag) => {
    const w = Math.min(2.1, 0.45 + tag.length * 0.078);
    if (x + w > 12.35) {
      x = 6.1;
      y += 0.62;
    }
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.42, rectRadius: 0.05, fill: { color: colors.panel, transparency: 4 }, line: { color: colors.line } });
    slide.addText(tag, { x: x + 0.11, y: y + 0.12, w: w - 0.2, h: 0.12, fontSize: 10.2, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
    x += w + 0.15;
  });
  slide.addShape(pptx.ShapeType.line, { x: 6.1, y: y + 0.7, w: 5.8, h: 0, line: { color: accent, width: 1.5 } });
}

function drawBars(slide, bars, accent) {
  bars.forEach(([dims, label, height], i) => {
    const x = 6.15 + i * 0.78;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.0, w: 0.58, h: 2.35, rectRadius: 0.04, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.0 + 2.35 * (1 - height / 100), w: 0.58, h: 2.35 * (height / 100), fill: { color: accent }, line: { color: accent } });
    slide.addText(label, { x: x - 0.02, y: 4.5, w: 0.7, h: 0.22, fontSize: 13, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
    slide.addText(`${dims} variáveis`, { x: x - 0.02, y: 4.78, w: 0.78, h: 0.16, fontSize: 7.4, color: colors.muted, margin: 0, fit: 'shrink' });
  });
}

function drawPipeline(slide, steps, accent) {
  steps.forEach(([title, text], i) => {
    const x = 6.12 + i * 1.18;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 2.1, w: 1.0, h: 1.45, rectRadius: 0.06, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
    slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.12, y: 2.26, w: 0.26, h: 0.26, fill: { color: accent }, line: { color: accent } });
    slide.addText(String(i + 1), { x: x + 0.18, y: 2.33, w: 0.14, h: 0.06, fontSize: 7, bold: true, color: colors.bg, margin: 0, align: 'center' });
    slide.addText(title, { x: x + 0.12, y: 2.8, w: 0.76, h: 0.2, fontSize: 10.5, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
    slide.addText(text, { x: x + 0.12, y: 3.1, w: 0.76, h: 0.22, fontSize: 7.2, color: colors.muted, margin: 0, fit: 'shrink' });
    if (i < steps.length - 1) {
      slide.addShape(pptx.ShapeType.line, { x: x + 1.04, y: 2.82, w: 0.12, h: 0, line: { color: accent, width: 1.2, endArrowType: 'triangle' } });
    }
  });
}

function drawSampling(slide, accent) {
  drawSamplingPanel(slide, 6.1, 1.65, 'Grid search', true, accent);
  drawSamplingPanel(slide, 9.35, 1.65, 'Random search', false, accent);
}

function drawSamplingPanel(slide, x, y, title, grid, accent) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.75, h: 3.45, rectRadius: 0.07, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
  slide.addText(title, { x: x + 0.2, y: y + 0.22, w: 2.2, h: 0.24, fontSize: 14, bold: true, color: colors.ink, margin: 0 });
  slide.addShape(pptx.ShapeType.ellipse, { x: x + 1.72, y: y + 1.52, w: 0.65, h: 0.35, fill: { color: accent, transparency: 58 }, line: { color: accent } });
  const dots = grid
    ? Array.from({ length: 25 }, (_, i) => [x + 0.42 + (i % 5) * 0.43, y + 0.78 + Math.floor(i / 5) * 0.42])
    : [[0.4, 0.8], [0.7, 2.1], [1.05, 1.08], [1.36, 2.45], [1.75, 0.85], [2.05, 1.75], [2.22, 2.5], [1.45, 1.42], [2.3, 1.05], [0.9, 1.65]].map(([dx, dy]) => [x + dx, y + dy]);
  dots.forEach(([dx, dy]) => {
    slide.addShape(pptx.ShapeType.ellipse, { x: dx, y: dy, w: 0.08, h: 0.08, fill: { color: colors.ink }, line: { color: colors.ink } });
  });
}

function drawAlgorithm(slide, name, strengths, limits, accent) {
  slide.addShape(pptx.ShapeType.roundRect, { x: 6.15, y: 1.6, w: 5.85, h: 0.76, rectRadius: 0.06, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
  slide.addShape(pptx.ShapeType.roundRect, { x: 6.38, y: 1.78, w: 0.38, h: 0.38, rectRadius: 0.04, fill: { color: accent }, line: { color: accent } });
  slide.addText(name, { x: 6.95, y: 1.83, w: 4.6, h: 0.2, fontSize: 16, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
  drawBulletList(slide, 6.35, 2.75, 'Forças', strengths, accent);
  drawBulletList(slide, 9.35, 2.75, 'Limites', limits, accent);
}

function drawBulletList(slide, x, y, title, items, accent) {
  slide.addText(title, { x, y, w: 2.2, h: 0.22, fontSize: 14, bold: true, color: colors.ink, margin: 0 });
  items.forEach((item, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x, y: y + 0.52 + i * 0.4, w: 0.08, h: 0.08, fill: { color: accent }, line: { color: accent } });
    slide.addText(item, { x: x + 0.18, y: y + 0.44 + i * 0.4, w: 2.35, h: 0.16, fontSize: 10.2, color: colors.muted, margin: 0, fit: 'shrink' });
  });
}

function drawBayes(slide, accent) {
  slide.addShape(pptx.ShapeType.roundRect, { x: 6.1, y: 1.72, w: 3.25, h: 3.15, rectRadius: 0.07, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
  const curve = [[6.35, 3.6], [6.75, 3.0], [7.15, 3.55], [7.55, 2.8], [7.95, 3.25], [8.35, 4.2], [8.75, 2.4], [9.05, 2.85]];
  curve.slice(0, -1).forEach((point, i) => {
    const next = curve[i + 1];
    slide.addShape(pptx.ShapeType.line, { x: point[0], y: point[1], w: next[0] - point[0], h: next[1] - point[1], line: { color: accent, width: 2.2 } });
  });
  [6.55, 7.2, 7.86, 8.5].forEach((x, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x, y: 3.4 - Math.sin(i) * 0.42, w: 0.11, h: 0.11, fill: { color: colors.ink }, line: { color: colors.ink } });
  });
  slide.addShape(pptx.ShapeType.ellipse, { x: 8.68, y: 4.1, w: 0.16, h: 0.16, fill: { color: colors.green }, line: { color: colors.green } });
}

function drawHalving(slide, rows, accent) {
  rows.forEach(([configs, epochs, width], i) => {
    const y = 1.9 + i * 0.55;
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.12, y, w: 2.95 * (width / 100), h: 0.34, rectRadius: 0.04, fill: { color: accent }, line: { color: accent } });
    slide.addText(configs, { x: 6.25, y: y + 0.09, w: 1.25, h: 0.1, fontSize: 8.5, bold: true, color: colors.bg, margin: 0, fit: 'shrink' });
    slide.addText(epochs, { x: 9.25, y: y + 0.08, w: 0.8, h: 0.1, fontSize: 8.5, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
  });
}

function drawChecklist(slide, items, accent) {
  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 6.1 + col * 3.1;
    const y = 1.7 + row * 0.85;
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.85, h: 0.58, rectRadius: 0.05, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
    slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.16, y: y + 0.18, w: 0.17, h: 0.17, fill: { color: accent }, line: { color: accent } });
    slide.addText(item, { x: x + 0.46, y: y + 0.17, w: 2.15, h: 0.18, fontSize: 9.6, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
  });
}

function drawDecisionTable(slide, rows, accent) {
  rows.forEach(([context, method], i) => {
    const y = 1.55 + i * 0.62;
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.1, y, w: 6.05, h: 0.45, rectRadius: 0.04, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
    slide.addText(context, { x: 6.3, y: y + 0.13, w: 2.95, h: 0.12, fontSize: 9.2, color: colors.muted, margin: 0, fit: 'shrink' });
    slide.addText(method, { x: 9.4, y: y + 0.11, w: 2.55, h: 0.14, fontSize: 10.5, bold: true, color: accent, margin: 0, fit: 'shrink' });
  });
}

function drawExercise(slide, body, accent) {
  slide.addShape(pptx.ShapeType.roundRect, { x: 6.1, y: 1.65, w: 5.95, h: 3.95, rectRadius: 0.08, fill: { color: colors.panel, transparency: 5 }, line: { color: colors.line } });
  slide.addShape(pptx.ShapeType.roundRect, { x: 6.45, y: 2.0, w: 0.48, h: 0.45, rectRadius: 0.05, fill: { color: accent }, line: { color: accent } });
  slide.addText(body.title, { x: 7.15, y: 2.0, w: 4.3, h: 0.38, fontSize: 18, bold: true, color: colors.ink, margin: 0, fit: 'shrink' });
  slide.addText(body.text, { x: 7.15, y: 2.52, w: 4.1, h: 0.38, fontSize: 12, color: colors.muted, margin: 0, fit: 'shrink' });
  body.items.forEach((item, i) => {
    slide.addShape(pptx.ShapeType.ellipse, { x: 6.55, y: 3.16 + i * 0.38, w: 0.08, h: 0.08, fill: { color: accent }, line: { color: accent } });
    slide.addText(item, { x: 6.72, y: 3.07 + i * 0.38, w: 4.8, h: 0.16, fontSize: 10.5, color: colors.ink, margin: 0, fit: 'shrink' });
  });
}

function chooseTitleSize(title) {
  if (title.length > 58) return 32;
  if (title.length > 44) return 38;
  return 44;
}
