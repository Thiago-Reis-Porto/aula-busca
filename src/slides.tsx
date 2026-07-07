import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Crosshair,
  Dna,
  ExternalLink,
  FlaskConical,
  Gauge,
  GitBranch,
  Home,
  Layers3,
  LineChart,
  Map,
  Maximize2,
  Mountain,
  Network,
  Orbit,
  PauseCircle,
  Route,
  Search,
  Shuffle,
  Timer,
  Waypoints,
} from 'lucide-react';
import React, { type ReactNode, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { slides as editableSlides, type IconName, type SlideBody } from './slidesContent';
import './slides.css';

type Slide = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body: ReactNode;
  note?: string;
  accent?: 'green' | 'blue' | 'coral' | 'amber';
};

const demoLinks = {
  regression: '/#regressao',
  minima: '/#minimos',
  surface: '/#espaco3d',
  algorithms: '/#algoritmos',
  exercise: '/#exercicio',
};

const slides: Slide[] = editableSlides.map((slide) => ({
  ...slide,
  body: renderSlideBody(slide.body),
}));

function renderSlideBody(body: SlideBody): ReactNode {
  switch (body.kind) {
    case 'hero':
      return (
        <HeroVisual compact={body.compact}>
          {body.visual === 'landscape' ? <LandscapeRibbon /> : <ClosingConstellation />}
        </HeroVisual>
      );

    case 'thesis':
      return (
        <div className="thesis-grid">
          {body.items.map((item) => (
            <BigNumber key={item.value} value={item.value} label={item.label} />
          ))}
        </div>
      );

    case 'timeline':
      return <Timeline items={body.items} />;

    case 'iconGrid':
      return <IconGrid items={body.items.map((item) => [slideIcon(item.icon), item.title, item.text])} />;

    case 'regressionDemo':
      return (
        <TwoColumn
          left={<RegressionMini />}
          right={
            <Callout
              icon={slideIcon(body.callout.icon)}
              title={body.callout.title}
              text={body.callout.text}
              link={demoLinks[body.callout.link]}
              linkLabel={body.callout.linkLabel}
            />
          }
        />
      );

    case 'formula':
      return <FormulaPanel formula={body.formula} bullets={body.bullets} />;

    case 'minimaDemo':
      return (
        <TwoColumn
          left={<MinimaMini />}
          right={
            <BulletPanel
              title={body.panel.title}
              bullets={body.panel.bullets}
              link={demoLinks[body.panel.link]}
              linkLabel={body.panel.linkLabel}
            />
          }
        />
      );

    case 'tagCloud':
      return <TagCloud tags={body.tags} />;

    case 'dimensions':
      return (
        <TwoColumn
          left={<CombinatorialBars values={body.bars} />}
          right={
            <Callout
              icon={slideIcon(body.callout.icon)}
              title={body.callout.title}
              text={body.callout.text}
              link={demoLinks[body.callout.link]}
              linkLabel={body.callout.linkLabel}
            />
          }
        />
      );

    case 'pipeline':
      return <Pipeline steps={body.steps} />;

    case 'samplingComparison':
      return (
        <TwoColumn
          left={<SamplingMini mode="grid" />}
          right={<SamplingMini mode="random" />}
        />
      );

    case 'algorithm':
      return (
        <AlgorithmSlide
          icon={slideIcon(body.icon)}
          name={body.name}
          strengths={body.strengths}
          limits={body.limits}
        />
      );

    case 'evolution':
      return <EvolutionPanel steps={body.steps.map((step) => ({ ...step, icon: slideIcon(step.icon) }))} />;

    case 'bayes':
      return (
        <TwoColumn
          left={<BayesMini />}
          right={<BulletPanel title={body.panel.title} bullets={body.panel.bullets} />}
        />
      );

    case 'halving':
      return (
        <TwoColumn
          left={<HalvingPanel rows={body.rows} />}
          right={<BulletPanel title={body.panel.title} bullets={body.panel.bullets} />}
        />
      );

    case 'methodMatrix':
      return <MethodMatrix methods={body.methods} />;

    case 'checklist':
      return <Checklist items={body.items} />;

    case 'decisionTable':
      return <DecisionTable rows={body.rows} />;

    case 'exercise':
      return (
        <ExerciseCard
          title={body.title}
          text={body.text}
          items={body.items}
          link={demoLinks[body.link]}
          linkLabel={body.linkLabel}
        />
      );

    default:
      return null;
  }
}

function slideIcon(name: IconName): ReactNode {
  const icons: Record<IconName, ReactNode> = {
    crosshair: <Crosshair />,
    gauge: <Gauge />,
    route: <Route />,
    timer: <Timer />,
    lineChart: <LineChart />,
    layers: <Layers3 />,
    mountain: <Mountain />,
    pause: <PauseCircle />,
    shuffle: <Shuffle />,
    gitBranch: <GitBranch />,
    dna: <Dna />,
    flask: <FlaskConical />,
  };

  return icons[name];
}

function SlidesApp() {
  const [index, setIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const slide = slides[index];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'A' || target?.tagName === 'BUTTON') {
        return;
      }

      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault();
        setIndex((current) => Math.min(slides.length - 1, current + 1));
      }
      if (['ArrowLeft', 'PageUp'].includes(event.key)) {
        event.preventDefault();
        setIndex((current) => Math.max(0, current - 1));
      }
      if (event.key === 'Home') {
        setIndex(0);
      }
      if (event.key === 'End') {
        setIndex(slides.length - 1);
      }
      if (event.key.toLowerCase() === 'n') {
        setShowNotes((value) => !value);
      }
      if (event.key.toLowerCase() === 'f') {
        void toggleFullscreen();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const progress = ((index + 1) / slides.length) * 100;

  return (
    <div className={`slides-shell accent-${slide.accent ?? 'green'}`}>
      <header className="slides-topbar">
        <a href="/" className="deck-brand" aria-label="Voltar para app interativo">
          <Search size={18} />
          <span>Busca em Espaços</span>
        </a>
        <div className="deck-status">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>/</span>
          <span>{String(slides.length).padStart(2, '0')}</span>
        </div>
      </header>

      <main className="slide-stage">
        <section className="slide-card" aria-live="polite">
          <div className="slide-copy">
            {slide.eyebrow && <p className="slide-eyebrow">{slide.eyebrow}</p>}
            <h1>{slide.title}</h1>
            {slide.subtitle && <p className="slide-subtitle">{slide.subtitle}</p>}
          </div>
          <div className="slide-body">{slide.body}</div>
        </section>
      </main>

      {showNotes && (
        <aside className="speaker-notes">
          <strong>Notas</strong>
          <p>{slide.note ?? 'Sem nota específica para este slide.'}</p>
        </aside>
      )}

      <footer className="slides-controls">
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="control-buttons">
          <button type="button" onClick={() => setIndex(0)} aria-label="Primeiro slide">
            <Home size={17} />
          </button>
          <button type="button" onClick={() => setIndex((current) => Math.max(0, current - 1))} aria-label="Slide anterior">
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => Math.min(slides.length - 1, current + 1))}
            aria-label="Próximo slide"
          >
            <ArrowRight size={17} />
          </button>
          <button type="button" onClick={() => setShowNotes((value) => !value)} aria-label="Alternar notas">
            <Map size={17} />
          </button>
          <button type="button" onClick={() => void toggleFullscreen()} aria-label="Tela cheia">
            <Maximize2 size={17} />
          </button>
        </div>
      </footer>
    </div>
  );
}

function HeroVisual({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return <div className={`hero-visual ${compact ? 'compact' : ''}`}>{children}</div>;
}

function LandscapeRibbon() {
  const points = Array.from({ length: 44 }, (_, index) => {
    const x = (index / 43) * 100;
    const y = 52 + Math.sin(index * 0.72) * 16 + Math.cos(index * 0.21) * 18;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="landscape-ribbon" viewBox="0 0 100 100" role="img" aria-label="Paisagem abstrata de busca">
      <defs>
        <linearGradient id="ribbon" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#00a676" />
          <stop offset="50%" stopColor="#f7b32b" />
          <stop offset="100%" stopColor="#f25f5c" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#ribbon)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="72" cy="30" r="4" fill="#fffdf8" />
      <circle cx="20" cy="72" r="2.8" fill="#00a676" />
      <circle cx="48" cy="48" r="2.8" fill="#f7b32b" />
    </svg>
  );
}

function BigNumber({ value, label }: { value: string; label: string }) {
  return (
    <article className="big-number">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function Timeline({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="timeline">
      {items.map(([time, text], index) => (
        <article key={time}>
          <span>{time}</span>
          <strong>{text}</strong>
          <small>{index + 1}</small>
        </article>
      ))}
    </div>
  );
}

function IconGrid({ items }: { items: Array<[ReactNode, string, string]> }) {
  return (
    <div className="icon-grid">
      {items.map(([icon, title, text]) => (
        <article key={title}>
          <span className="icon-badge">{icon}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

function TwoColumn({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="two-column">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function RegressionMini() {
  return (
    <div className="mini-chart regression-mini">
      <svg viewBox="0 0 520 320" role="img" aria-label="Regressão linear">
        <Grid />
        {[42, 78, 130, 188, 240, 292, 345, 392, 448].map((x, index) => {
          const y = 250 - index * 22 + Math.sin(index * 1.7) * 18;
          const lineY = 260 - x * 0.38;
          return (
            <g key={x}>
              <line x1={x} y1={y} x2={x} y2={lineY} className="residual" />
              <circle cx={x} cy={y} r="7" className="data-dot" />
            </g>
          );
        })}
        <line x1="34" y1="247" x2="485" y2="76" className="fit-line" />
        <text x="34" y="36">perda menor quando a reta se aproxima dos dados</text>
      </svg>
    </div>
  );
}

function MinimaMini() {
  const path = Array.from({ length: 120 }, (_, index) => {
    const x = index / 119;
    const y = 0.5 + Math.sin(x * 21) * 0.18 + Math.cos(x * 7) * 0.25 + (x - 0.66) ** 2 * 0.9;
    return `${30 + x * 460},${260 - y * 190}`;
  }).join(' ');

  return (
    <div className="mini-chart minima-mini">
      <svg viewBox="0 0 520 320" role="img" aria-label="Mínimos locais e globais">
        <Grid />
        <polyline points={path} fill="none" className="landscape-line" />
        <circle cx="170" cy="206" r="9" className="local-dot" />
        <circle cx="336" cy="232" r="10" className="global-dot" />
        <circle cx="420" cy="110" r="8" className="current-dot" />
        <path d="M420 110 C382 135, 360 184, 336 232" className="walk-line" />
        <text x="88" y="282">mínimo local</text>
        <text x="295" y="282">mínimo global</text>
      </svg>
    </div>
  );
}

function Grid() {
  return (
    <g className="chart-grid">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`h-${i}`} x1="30" x2="490" y1={58 + i * 52} y2={58 + i * 52} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={`v-${i}`} y1="38" y2="278" x1={54 + i * 82} x2={54 + i * 82} />
      ))}
    </g>
  );
}

function Callout({
  icon,
  title,
  text,
  link,
  linkLabel,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <article className="callout">
      <span className="icon-badge">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {link && (
        <a href={link}>
          {linkLabel ?? 'Abrir'}
          <ExternalLink size={16} />
        </a>
      )}
    </article>
  );
}

function FormulaPanel({ formula, bullets }: { formula: string; bullets: string[] }) {
  return (
    <div className="formula-panel">
      <code>{formula}</code>
      <ul>
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}

function BulletPanel({ title, bullets, link, linkLabel }: { title: string; bullets: string[]; link?: string; linkLabel?: string }) {
  return (
    <article className="bullet-panel">
      <h3>{title}</h3>
      <ul>
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {link && (
        <a href={link}>
          {linkLabel ?? 'Abrir'}
          <ExternalLink size={16} />
        </a>
      )}
    </article>
  );
}

function TagCloud({ tags }: { tags: string[] }) {
  return (
    <div className="tag-cloud">
      {tags.map((tag, index) => (
        <span key={tag} style={{ ['--delay' as string]: `${index * 0.025}s` }}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function CombinatorialBars({ values }: { values?: Array<[string, string, number]> }) {
  const defaultValues = [
    ['2', '10²', 18],
    ['6', '10⁶', 42],
    ['10', '10¹⁰', 68],
    ['18', '10¹⁸', 100],
  ] as const;

  return (
    <div className="bar-panel">
      {(values ?? defaultValues).map(([dims, label, height]) => (
        <article key={dims}>
          <div className="bar-track">
            <span style={{ height: `${height}%` }} />
          </div>
          <strong>{label}</strong>
          <small>{dims} variáveis</small>
        </article>
      ))}
    </div>
  );
}

function Pipeline({ steps }: { steps: Array<[string, string]> }) {
  return (
    <div className="pipeline">
      {steps.map(([title, text], index) => (
        <React.Fragment key={title}>
          <article>
            <span>{index + 1}</span>
            <strong>{title}</strong>
            <small>{text}</small>
          </article>
          {index < steps.length - 1 && <ArrowRight className="pipe-arrow" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function SamplingMini({ mode }: { mode: 'grid' | 'random' }) {
  const points = useMemo(() => {
    if (mode === 'grid') {
      return Array.from({ length: 6 }, (_, i) =>
        Array.from({ length: 6 }, (_, j) => [58 + i * 66, 50 + j * 38] as const),
      ).flat();
    }
    return [
      [48, 52],
      [76, 185],
      [118, 92],
      [160, 208],
      [205, 68],
      [238, 146],
      [284, 224],
      [320, 80],
      [365, 170],
      [412, 112],
      [94, 132],
      [186, 120],
      [268, 48],
      [346, 236],
      [430, 210],
      [390, 58],
    ] as const;
  }, [mode]);

  return (
    <div className="sampling-card">
      <h3>{mode === 'grid' ? 'Grid search' : 'Random search'}</h3>
      <svg viewBox="0 0 500 280" role="img" aria-label={mode === 'grid' ? 'Amostragem em grade' : 'Amostragem aleatória'}>
        <rect x="30" y="26" width="440" height="220" rx="10" className="plot-bg" />
        <ellipse cx="350" cy="126" rx="70" ry="34" className="good-region" />
        {points.map(([x, y], index) => (
          <circle key={`${x}-${y}-${index}`} cx={x} cy={y} r="6" className="sample-dot" />
        ))}
      </svg>
      <p>{mode === 'grid' ? 'Cobre combinações fixas.' : 'Cobre melhor dimensões importantes.'}</p>
    </div>
  );
}

function AlgorithmSlide({
  icon,
  name,
  strengths,
  limits,
}: {
  icon: ReactNode;
  name: string;
  strengths: string[];
  limits: string[];
}) {
  return (
    <div className="algorithm-slide">
      <div className="algorithm-title">
        <span className="icon-badge">{icon}</span>
        <h3>{name}</h3>
      </div>
      <div className="pros-cons">
        <BulletPanel title="Forças" bullets={strengths} />
        <BulletPanel title="Limites" bullets={limits} />
      </div>
    </div>
  );
}

function EvolutionPanel({
  steps = [
    { icon: <Shuffle />, title: 'População', text: 'várias soluções ao mesmo tempo' },
    { icon: <Crosshair />, title: 'Seleção', text: 'mantém candidatos melhores' },
    { icon: <GitBranch />, title: 'Cruzamento', text: 'combina partes de soluções' },
    { icon: <Dna />, title: 'Mutação', text: 'injeta diversidade' },
  ],
}: {
  steps?: Array<{ icon: ReactNode; title: string; text: string }>;
}) {

  return (
    <div className="evolution-panel">
      {steps.map(({ icon, title, text }) => (
        <article key={title}>
          <span className="icon-badge">{icon}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

function BayesMini() {
  const curve = Array.from({ length: 100 }, (_, index) => {
    const x = index / 99;
    const y = 0.52 + Math.sin(x * 9) * 0.18 + Math.cos(x * 17) * 0.08 - Math.exp(-((x - 0.72) ** 2) / 0.01) * 0.3;
    return `${30 + x * 460},${245 - y * 190}`;
  }).join(' ');
  const uncertaintyTop = Array.from({ length: 100 }, (_, index) => {
    const x = index / 99;
    const y = 0.42 + Math.sin(x * 9) * 0.18 + Math.cos(x * 17) * 0.08 - Math.exp(-((x - 0.72) ** 2) / 0.01) * 0.3;
    return `${30 + x * 460},${245 - y * 190}`;
  }).join(' ');
  const uncertaintyBottom = Array.from({ length: 100 }, (_, index) => {
    const x = 1 - index / 99;
    const y = 0.62 + Math.sin(x * 9) * 0.18 + Math.cos(x * 17) * 0.08 - Math.exp(-((x - 0.72) ** 2) / 0.01) * 0.3;
    return `${30 + x * 460},${245 - y * 190}`;
  }).join(' ');

  return (
    <div className="mini-chart bayes-mini">
      <svg viewBox="0 0 520 320" role="img" aria-label="Bayesian optimization">
        <Grid />
        <polygon points={`${uncertaintyTop} ${uncertaintyBottom}`} className="uncertainty" />
        <polyline points={curve} className="surrogate-line" />
        {[70, 150, 238, 326, 390].map((x, i) => (
          <circle key={x} cx={x} cy={170 + Math.sin(i * 1.6) * 48} r="7" className="sample-dot" />
        ))}
        <circle cx="363" cy="236" r="10" className="next-dot" />
        <text x="310" y="282">próximo ponto promissor</text>
      </svg>
    </div>
  );
}

function HalvingPanel({ rows }: { rows?: Array<[string, string, number]> }) {
  const defaultRows = [
    ['81 configs', '1 época', 81],
    ['27 configs', '3 épocas', 62],
    ['9 configs', '9 épocas', 42],
    ['3 configs', '27 épocas', 24],
    ['1 config', '81 épocas', 12],
  ] as const;

  return (
    <div className="halving-panel">
      {(rows ?? defaultRows).map(([configs, epochs, width], index) => (
        <article key={configs}>
          <span style={{ width: `${width}%` }}>{configs}</span>
          <strong>{epochs}</strong>
          <small>rodada {index + 1}</small>
        </article>
      ))}
    </div>
  );
}

function MethodMatrix({ methods }: { methods: Array<[string, string]> }) {
  return (
    <div className="method-matrix">
      {methods.map(([name, text]) => (
        <article key={name}>
          <strong>{name}</strong>
          <span>{text}</span>
        </article>
      ))}
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className="checklist">
      {items.map((item) => (
        <article key={item}>
          <CheckCircle2 size={22} />
          <span>{item}</span>
        </article>
      ))}
    </div>
  );
}

function DecisionTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="decision-table">
      {rows.map(([context, method]) => (
        <article key={context}>
          <span>{context}</span>
          <strong>{method}</strong>
        </article>
      ))}
    </div>
  );
}

function ExerciseCard({
  title = 'Minimize Rastrigin em 10 dimensões',
  text = 'Compare dois algoritmos com o mesmo orçamento de avaliações.',
  items = [
    'implementar do zero',
    'plotar melhor valor por avaliação',
    'comparar com random search',
    'discutir mínimos locais e sensibilidade',
  ],
  link = demoLinks.exercise,
  linkLabel = 'Ver enunciado no app',
}: {
  title?: string;
  text?: string;
  items?: string[];
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="exercise-card">
      <div>
        <FlaskConical size={34} />
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href={link}>
        {linkLabel}
        <ExternalLink size={16} />
      </a>
    </div>
  );
}

function ClosingConstellation() {
  const nodes = [
    [18, 42, 'Parâmetros', <Cpu />],
    [38, 68, 'Hiperparâmetros', <Gauge />],
    [58, 34, 'Arquitetura', <Network />],
    [78, 61, 'Pipeline', <Waypoints />],
    [50, 52, 'Busca', <Orbit />],
  ] as const;

  return (
    <svg className="constellation" viewBox="0 0 100 100" role="img" aria-label="Busca dentro de buscas">
      {nodes.slice(0, -1).map(([x, y]) => (
        <line key={`${x}-${y}`} x1="50" y1="52" x2={x} y2={y} />
      ))}
      {nodes.map(([x, y, label, icon]) => (
        <g key={label} transform={`translate(${x} ${y})`}>
          <circle r="8" />
          <foreignObject x="-5" y="-5" width="10" height="10">
            <span className="constellation-icon">{icon}</span>
          </foreignObject>
          <text y="16" textAnchor="middle">{label}</text>
        </g>
      ))}
    </svg>
  );
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    return;
  }
  await document.exitFullscreen();
}

ReactDOM.createRoot(document.getElementById('slides-root')!).render(
  <React.StrictMode>
    <SlidesApp />
  </React.StrictMode>,
);
