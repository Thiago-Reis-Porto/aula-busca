import {
  BrainCircuit,
  ChevronRight,
  FlaskConical,
  Gauge,
  GraduationCap,
  LineChart,
  Mountain,
  Pause,
  Play,
  RefreshCcw,
  Route,
  Search,
  Shuffle,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  type DependencyList,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';

type Point = {
  x: number;
  y: number;
};

type RouteSolution = {
  order: number[];
  value: number;
};

type RouteMove = {
  i: number;
  j: number;
  cityA: number;
  cityB: number;
};

type TspCity = Point & {
  label: string;
};

type MapViewport = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type AlgorithmId = 'random' | 'hill' | 'tabu' | 'genetic';

type SearchState = {
  algorithm: AlgorithmId;
  step: number;
  current: RouteSolution;
  population: RouteSolution[];
  best: RouteSolution;
  tabu: string[];
  tabuMoves: RouteMove[];
  previous: RouteSolution | null;
  activeMove: RouteMove | null;
  mutationRate: number;
  parents: RouteSolution[];
  elite: RouteSolution[];
};

const regressionData: Point[] = [
  { x: 0.7, y: 1.7 },
  { x: 1.4, y: 2.2 },
  { x: 2.2, y: 3.1 },
  { x: 2.9, y: 3.8 },
  { x: 3.5, y: 3.9 },
  { x: 4.2, y: 4.7 },
  { x: 5.1, y: 5.1 },
  { x: 5.9, y: 6.2 },
  { x: 6.6, y: 6.5 },
  { x: 7.4, y: 7.0 },
  { x: 8.1, y: 7.9 },
  { x: 9.0, y: 8.3 },
];

const sections = [
  {
    id: 'intro',
    label: 'Mapa',
    title: 'Busca em espaços',
    icon: Search,
  },
  {
    id: 'regressao',
    label: 'Regressão',
    title: 'O que estamos procurando?',
    icon: LineChart,
  },
  {
    id: 'minimos',
    label: 'Mínimos',
    title: 'Local nem sempre é global',
    icon: Mountain,
  },
  {
    id: 'espaco3d',
    label: '3D',
    title: 'Quando o espaço cresce',
    icon: BrainCircuit,
  },
  {
    id: 'algoritmos',
    label: 'Algoritmos',
    title: 'Estratégias de busca',
    icon: Route,
  },
  {
    id: 'exercicio',
    label: 'Exercício',
    title: 'Tarefa para casa',
    icon: GraduationCap,
  },
];

const algorithmDetails: Record<
  AlgorithmId,
  {
    name: string;
    short: string;
    color: string;
    lesson: string;
    flow: string[];
  }
> = {
  random: {
    name: 'Busca aleatória',
    short: 'Sorteia rotas completas e guarda o menor ciclo encontrado.',
    color: '#2d6cdf',
    lesson: 'Boa linha de base: mesmo sem inteligência, mostra o tamanho do espaço de permutações.',
    flow: ['Sorteia rotas', 'Mede distância', 'Guarda menor'],
  },
  hill: {
    name: 'Subida/descida local',
    short: 'Troca dois trechos da rota e aceita só quando encurta o caminho.',
    color: '#00a676',
    lesson: 'No caixeiro viajante, a busca local melhora rápido com 2-opt, mas pode travar numa rota que parece boa.',
    flow: ['Testa 2-opt', 'Aceita melhora', 'Repete local'],
  },
  tabu: {
    name: 'Busca tabu',
    short: 'Permite piorar temporariamente e bloqueia trocas recentes.',
    color: '#f7b32b',
    lesson: 'A memória curta evita desfazer a mesma troca e ajuda a atravessar rotas intermediárias piores.',
    flow: ['Marca troca', 'Evita retorno', 'Segue permitido'],
  },
  genetic: {
    name: 'Algoritmo genético',
    short: 'Evolui uma população de rotas por seleção, crossover e mutação.',
    color: '#f25f5c',
    lesson: 'A população mantém rotas diferentes competindo, útil quando boas partes de caminhos podem ser recombinadas.',
    flow: ['Seleciona elite', 'Cruza rotas', 'Muta trechos'],
  },
};

const regressionBest = linearFit(regressionData);
const curveDomain = { min: -4.5, max: 4.5 };
const tspCities: TspCity[] = [
  { label: 'A', x: 0.12, y: 0.28 },
  { label: 'B', x: 0.25, y: 0.13 },
  { label: 'C', x: 0.44, y: 0.2 },
  { label: 'D', x: 0.63, y: 0.1 },
  { label: 'E', x: 0.84, y: 0.22 },
  { label: 'F', x: 0.75, y: 0.43 },
  { label: 'G', x: 0.9, y: 0.66 },
  { label: 'H', x: 0.61, y: 0.78 },
  { label: 'I', x: 0.42, y: 0.68 },
  { label: 'J', x: 0.2, y: 0.82 },
  { label: 'K', x: 0.09, y: 0.56 },
  { label: 'L', x: 0.36, y: 0.45 },
];
const tspOptimalSolution = solveTspExactly(tspCities);
const surfaceBumps = [
  { x: -2.85, z: -2.05, height: 26, widthX: 0.55, widthZ: 0.95, angle: -0.45 },
  { x: 2.2, z: -1.75, height: 21, widthX: 1.05, widthZ: 0.48, angle: 0.7 },
  { x: -0.15, z: 2.65, height: 17, widthX: 0.8, widthZ: 0.62, angle: 0.18 },
  { x: 3.05, z: 1.15, height: 31, widthX: 0.48, widthZ: 0.82, angle: -0.95 },
  { x: -0.7, z: -0.62, height: 12, widthX: 0.35, widthZ: 0.36, angle: 0.4 },
  { x: -1.45, z: 1.05, height: -34, widthX: 0.88, widthZ: 0.7, angle: -0.2 },
  { x: 1.18, z: 2.2, height: -18, widthX: 0.95, widthZ: 0.84, angle: 0.65 },
  { x: -3.0, z: 0.62, height: -13, widthX: 0.66, widthZ: 0.48, angle: -0.55 },
];

function App() {
  return (
    <div className="app-shell">
      <TopBar />
      <main>
        <IntroSection />
        <RegressionLab />
        <MinimaLab />
        <SurfaceSection />
        <AlgorithmLab />
        <ExerciseSection />
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <a className="brand" href="#intro" aria-label="Ir para o início">
        <span className="brand-mark">
          <Search size={18} />
        </span>
        <span>
          <strong>Busca em Espaços</strong>
          <small>IA, otimização e hiperparâmetros</small>
        </span>
      </a>
      <nav className="nav-pills" aria-label="Seções da aula">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <a key={section.id} href={`#${section.id}`}>
              <Icon size={16} />
              <span>{section.label}</span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}

function IntroSection() {
  return (
    <section className="lesson-section intro-section" id="intro">
      <div className="section-inner intro-grid">
        <div className="intro-copy">
          <p className="eyebrow">Aula interativa para graduação</p>
          <h1>Buscar é escolher uma solução quando o espaço é grande demais para olhar tudo.</h1>
          <p className="lead">
            Em IA, a mesma ideia aparece ao ajustar pesos, escolher hiperparâmetros, selecionar
            arquiteturas, planejar ações e comparar soluções candidatas sob custo limitado.
          </p>
          <div className="intro-actions" aria-label="Atalhos da apresentação">
            <a className="primary-link" href="#regressao">
              Começar pela regressão
              <ChevronRight size={18} />
            </a>
            <a className="secondary-link" href="#algoritmos">
              Ver algoritmos
            </a>
          </div>
        </div>

        <div className="concept-board" aria-label="Mapa conceitual da aula">
          <ConceptNode icon={<Target size={20} />} title="Estado" text="Uma hipótese candidata" />
          <ConceptNode icon={<Gauge size={20} />} title="Função objetivo" text="Erro, custo ou perda" />
          <ConceptNode icon={<SlidersHorizontal size={20} />} title="Movimento" text="Como gerar vizinhos" />
          <ConceptNode icon={<FlaskConical size={20} />} title="Orçamento" text="Quantas avaliações cabem" />
        </div>
      </div>
    </section>
  );
}

function ConceptNode({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="concept-node">
      <span>{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

function RegressionLab() {
  const [{ slope, intercept }, setLine] = useState({ slope: 0.45, intercept: 2.7 });
  const [running, setRunning] = useState(false);
  const loss = regressionLoss(slope, intercept);
  const bestLoss = regressionLoss(regressionBest.slope, regressionBest.intercept);

  const stepDescent = useCallback(() => {
    setLine((line) => {
      const gradient = regressionGradient(line.slope, line.intercept);
      return {
        slope: clamp(line.slope - gradient.slope * 0.0038, -0.8, 2.1),
        intercept: clamp(line.intercept - gradient.intercept * 0.0038, -1.2, 6.2),
      };
    });
  }, []);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const timer = window.setInterval(stepDescent, 80);
    return () => window.clearInterval(timer);
  }, [running, stepDescent]);

  const regressionCanvas = useCanvas(
    (ctx, width, height) => {
      drawRegression(ctx, width, height, slope, intercept);
    },
    [slope, intercept],
  );

  const lossCanvas = useCanvas(
    (ctx, width, height) => {
      drawLossLandscape(ctx, width, height, slope, intercept);
    },
    [slope, intercept],
  );

  return (
    <section className="lesson-section band-soft" id="regressao">
      <div className="section-inner">
        <SectionHeader
          kicker="1. Parâmetros como posição no espaço"
          title="Ajustar uma reta já é um problema de busca"
          text="A reta é definida por dois parâmetros. Cada combinação de inclinação e intercepto tem uma perda; o objetivo é encontrar uma combinação com perda baixa."
        />

        <div className="lab-grid">
          <div className="visual-panel regression-layout">
            <canvas ref={regressionCanvas} className="canvas regression-canvas" aria-label="Regressão linear" />
            <canvas ref={lossCanvas} className="canvas loss-canvas" aria-label="Mapa de perda" />
          </div>

          <div className="control-panel">
            <div className="metric-strip">
              <Metric label="MSE atual" value={loss.toFixed(3)} />
              <Metric label="MSE ótimo" value={bestLoss.toFixed(3)} />
            </div>
            <Slider
              label="Inclinação"
              min={-0.8}
              max={2.1}
              step={0.01}
              value={slope}
              onChange={(value) => setLine((line) => ({ ...line, slope: value }))}
              valueLabel={slope.toFixed(2)}
            />
            <Slider
              label="Intercepto"
              min={-1.2}
              max={6.2}
              step={0.01}
              value={intercept}
              onChange={(value) => setLine((line) => ({ ...line, intercept: value }))}
              valueLabel={intercept.toFixed(2)}
            />
            <div className="button-row">
              <button className="icon-button primary" type="button" onClick={() => setRunning((value) => !value)}>
                {running ? <Pause size={17} /> : <Play size={17} />}
                {running ? 'Pausar' : 'Descer gradiente'}
              </button>
              <button className="icon-button" type="button" onClick={stepDescent}>
                <SkipForward size={17} />
                Passo
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => setLine({ slope: regressionBest.slope, intercept: regressionBest.intercept })}
              >
                <Sparkles size={17} />
                Ótimo
              </button>
            </div>
            <p className="teaching-note">
              Em modelos reais, a linha vira uma rede neural, a perda pode depender de milhões de
              pesos e cada avaliação pode custar tempo de GPU.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MinimaLab() {
  const [startX, setStartX] = useState(3.25);
  const [x, setX] = useState(3.25);
  const [learningRate, setLearningRate] = useState(0.16);
  const [path, setPath] = useState<number[]>([3.25]);
  const [running, setRunning] = useState(false);
  const samples = useMemo(() => sampleCurve(), []);
  const minima = useMemo(() => findLocalMinima(samples), [samples]);
  const globalMin = minima.reduce((best, item) => (item.y < best.y ? item : best), minima[0]);
  const currentLoss = ruggedCurve(x);
  const estimatedStep = -learningRate * derivative1D(x);

  const step = useCallback(() => {
    setX((current) => {
      const next = clamp(current - learningRate * derivative1D(current), curveDomain.min, curveDomain.max);
      setPath((items) => [...items.slice(-80), next]);
      return next;
    });
  }, [learningRate]);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const timer = window.setInterval(step, 110);
    return () => window.clearInterval(timer);
  }, [running, step]);

  const canvasRef = useCanvas(
    (ctx, width, height) => {
      drawMinima(ctx, width, height, samples, minima, globalMin, x, path, learningRate);
    },
    [samples, minima, globalMin, x, path, learningRate],
  );

  const reset = () => {
    setRunning(false);
    setX(startX);
    setPath([startX]);
  };

  return (
    <section className="lesson-section" id="minimos">
      <div className="section-inner">
        <SectionHeader
          kicker="2. A armadilha da vizinhança"
          title="Um mínimo local pode parecer suficiente"
          text="Métodos locais enxergam a vizinhança imediata. Se a superfície tem muitos vales, a posição inicial e o tamanho do passo mudam o resultado."
        />

        <div className="lab-grid reverse">
          <div className="control-panel">
            <div className="metric-strip">
              <Metric label="x atual" value={x.toFixed(2)} />
              <Metric label="f(x)" value={currentLoss.toFixed(3)} />
              <Metric label="próximo passo" value={formatSigned(estimatedStep)} />
              <Metric label="global" value={globalMin.y.toFixed(3)} />
            </div>
            <Slider
              label="Ponto inicial"
              min={curveDomain.min}
              max={curveDomain.max}
              step={0.01}
              value={startX}
              valueLabel={startX.toFixed(2)}
              onChange={(value) => {
                setStartX(value);
                setX(value);
                setPath([value]);
                setRunning(false);
              }}
            />
            <Slider
              label="Taxa de aprendizado"
              min={0.03}
              max={0.72}
              step={0.01}
              value={learningRate}
              valueLabel={learningRate.toFixed(2)}
              onChange={setLearningRate}
            />
            <div className="button-row">
              <button className="icon-button primary" type="button" onClick={() => setRunning((value) => !value)}>
                {running ? <Pause size={17} /> : <Play size={17} />}
                {running ? 'Pausar' : 'Executar'}
              </button>
              <button className="icon-button" type="button" onClick={step}>
                <SkipForward size={17} />
                Passo
              </button>
              <button className="icon-button" type="button" onClick={reset}>
                <RefreshCcw size={17} />
                Reiniciar
              </button>
            </div>
            <p className="teaching-note">
              Taxas maiores deixam o salto mais evidente: ajudam a atravessar vales rasos, mas
              também podem passar direto por uma boa região.
            </p>
          </div>

          <div className="visual-panel">
            <canvas ref={canvasRef} className="canvas tall-canvas" aria-label="Curva com mínimos locais" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SurfaceSection() {
  const [ruggedness, setRuggedness] = useState(1.4);
  const [variables, setVariables] = useState(18);

  return (
    <section className="lesson-section band-dark" id="espaco3d">
      <div className="section-inner">
        <SectionHeader
          kicker="3. O problema cresce em dimensão"
          title="Hiperparâmetros formam uma paisagem difícil de ver"
          text="A visualização mostra só duas dimensões. Em IA, as outras podem ser taxa de aprendizado, regularização, profundidade, largura, batch size, dropout e política de dados."
          contrast
        />

        <div className="surface-grid">
          <Surface3D ruggedness={ruggedness} />
          <div className="control-panel dark-panel">
            <div className="metric-strip">
              <Metric label="dimensões totais" value={String(variables)} />
              <Metric label="corte visível" value="2D" />
            </div>
            <Slider
              label="Rugosidade"
              min={0.8}
              max={2.8}
              step={0.1}
              value={ruggedness}
              valueLabel={ruggedness.toFixed(1)}
              onChange={setRuggedness}
            />
            <Slider
              label="Variáveis no problema"
              min={2}
              max={80}
              step={1}
              value={variables}
              valueLabel={String(variables)}
              onChange={setVariables}
            />
            <p className="teaching-note">
              Com muitas variáveis, uma grade com 10 valores por variável exige 10^d avaliações.
              Para d = {variables}, isso já passa de {formatPowerOfTen(variables)} combinações.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Surface3D({ ruggedness }: { ruggedness: number }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(7.4, 5.8, 8.6);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    const ambient = new THREE.AmbientLight(0xffffff, 0.74);
    const directional = new THREE.DirectionalLight(0xffffff, 1.2);
    directional.position.set(4, 7, 5);
    scene.add(ambient, directional);

    const surface = createSurfaceMesh(ruggedness);
    group.add(surface.mesh, surface.wireframe);

    const markerGeometry = new THREE.SphereGeometry(0.17, 24, 24);
    const markerStemGeometry = new THREE.CylinderGeometry(0.028, 0.028, 0.7, 14);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: '#00d68f',
      emissive: '#00d68f',
      emissiveIntensity: 0.8,
      roughness: 0.28,
      depthTest: false,
      depthWrite: false,
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(surface.minimum.x, surface.minimum.y + 0.62, surface.minimum.z);
    marker.renderOrder = 20;
    const markerStem = new THREE.Mesh(markerStemGeometry, markerMaterial);
    markerStem.position.set(surface.minimum.x, surface.minimum.y + 0.3, surface.minimum.z);
    markerStem.renderOrder = 19;
    group.add(markerStem, marker);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(360, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let animationFrame = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let tilt = -0.08;
    let spin = -0.65;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) {
        return;
      }
      spin += (event.clientX - lastX) * 0.008;
      tilt = clamp(tilt + (event.clientY - lastY) * 0.006, -0.55, 0.42);
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);

    const animate = () => {
      if (!dragging) {
        spin += 0.0025;
      }
      group.rotation.y = spin;
      group.rotation.x = tilt;
      marker.rotation.y += 0.02;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      host.removeChild(renderer.domElement);
      surface.geometry.dispose();
      surface.material.dispose();
      surface.wireGeometry.dispose();
      surface.wireMaterial.dispose();
      markerGeometry.dispose();
      markerStemGeometry.dispose();
      markerMaterial.dispose();
      renderer.dispose();
    };
  }, [ruggedness]);

  return (
    <div className="surface-panel">
      <div ref={hostRef} className="surface-host" aria-label="Superfície 3D de função objetivo" />
      <div className="surface-caption">
        <span className="legend-dot green" />
        melhor vale visível
        <span className="legend-dot coral" />
        picos de custo alto
      </div>
    </div>
  );
}

function AlgorithmLab() {
  const [algorithm, setAlgorithm] = useState<AlgorithmId>('genetic');
  const [state, setState] = useState(() => createSearchState('genetic'));
  const [running, setRunning] = useState(false);
  const details = algorithmDetails[algorithm];

  useEffect(() => {
    setRunning(false);
    setState(createSearchState(algorithm));
  }, [algorithm]);

  const advance = useCallback(() => {
    setState((current) => stepSearch(current));
  }, []);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const timer = window.setInterval(advance, 170);
    return () => window.clearInterval(timer);
  }, [advance, running]);

  const canvasRef = useCanvas(
    (ctx, width, height) => {
      drawSearchSpace(ctx, width, height, state);
    },
    [state],
  );

  return (
    <section className="lesson-section band-soft" id="algoritmos">
      <div className="section-inner">
        <SectionHeader
          kicker="4. Caixeiro viajante"
          title="Algoritmos procurando a menor rota"
          text="O objetivo é visitar cada cidade uma vez e voltar ao início. O espaço de busca são permutações: com 12 cidades já existem 11! rotas possíveis."
        />

        <div className="algorithm-selector" role="tablist" aria-label="Algoritmos de busca">
          {(Object.keys(algorithmDetails) as AlgorithmId[]).map((id) => (
            <button
              key={id}
              className={id === algorithm ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={id === algorithm}
              onClick={() => setAlgorithm(id)}
            >
              {algorithmDetails[id].name}
            </button>
          ))}
        </div>

        <div className="lab-grid">
          <div className="visual-panel search-visual">
            <canvas ref={canvasRef} className="canvas search-canvas" aria-label="Mapa do problema do caixeiro viajante" />
            <AlgorithmLegend algorithm={algorithm} />
          </div>

          <div className="control-panel">
            <div className="metric-strip">
              <Metric label="iteração" value={String(state.step)} />
              <Metric label="melhor rota" value={formatRouteLength(state.best.value)} />
              <Metric label="ótimo exato" value={formatRouteLength(tspOptimalSolution.value)} />
            </div>
            <div className="algorithm-current" style={{ borderColor: details.color }}>
              <h3>{details.name}</h3>
              <p>{details.short}</p>
            </div>
            <AlgorithmFlow steps={details.flow} color={details.color} />
            <AlgorithmReadout state={state} />
            <div className="button-row">
              <button className="icon-button primary" type="button" onClick={() => setRunning((value) => !value)}>
                {running ? <Pause size={17} /> : <Play size={17} />}
                {running ? 'Pausar' : 'Executar'}
              </button>
              <button className="icon-button" type="button" onClick={advance}>
                <SkipForward size={17} />
                Passo
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={() => {
                  setRunning(false);
                  setState(createSearchState(algorithm));
                }}
              >
                <Shuffle size={17} />
                Nova busca
              </button>
            </div>
            <p className="teaching-note">{details.lesson}</p>
          </div>
        </div>

        <div className="algorithm-cards">
          <AlgorithmCard
            title="Representação"
            text="Uma solução é uma permutação das cidades; a função objetivo é o comprimento do ciclo."
          />
          <AlgorithmCard
            title="Vizinhança 2-opt"
            text="Inverte um trecho da rota para remover cruzamentos e encurtar o caminho."
          />
          <AlgorithmCard
            title="Tabu"
            text="Guarda trocas recentes para não desfazer imediatamente a decisão anterior."
          />
          <AlgorithmCard
            title="Crossover"
            text="Combina a ordem de duas rotas tentando preservar bons blocos de cidades."
          />
          <AlgorithmCard
            title="Mochila"
            text="Outro exemplo visual: escolher itens sob capacidade, maximizando valor."
          />
        </div>
      </div>
    </section>
  );
}

function AlgorithmCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="algorithm-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function AlgorithmFlow({ steps, color }: { steps: string[]; color: string }) {
  return (
    <div className="algorithm-flow" aria-label="Ciclo do algoritmo">
      {steps.map((step, index) => (
        <span key={step} className="algorithm-flow-step" style={{ borderColor: color }}>
          <strong>{index + 1}</strong>
          {step}
        </span>
      ))}
    </div>
  );
}

function AlgorithmReadout({ state }: { state: SearchState }) {
  return (
    <dl className="algorithm-readout">
      {algorithmReadout(state).map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function AlgorithmLegend({ algorithm }: { algorithm: AlgorithmId }) {
  const details = algorithmDetails[algorithm];
  const items = algorithmLegendItems(algorithm);

  return (
    <div className="algorithm-legend" aria-label="Legenda da visualização">
      {items.map((item) => (
        <span key={item.label} className="legend-token">
          <span
            className={`legend-swatch ${item.kind}`}
            style={item.kind === 'algorithm' ? { background: details.color, borderColor: details.color } : undefined}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function algorithmReadout(state: SearchState) {
  if (state.algorithm === 'random') {
    return [
      { label: 'rotas sorteadas', value: String(state.population.length) },
      { label: 'rota atual', value: formatRouteLength(state.current.value) },
      { label: 'gap', value: formatGap(state.best.value) },
    ];
  }

  if (state.algorithm === 'hill') {
    const improved = state.previous ? state.current.value < state.previous.value - 0.01 : false;
    return [
      { label: 'vizinhos 2-opt', value: String(state.population.length) },
      { label: 'rota atual', value: formatRouteLength(state.current.value) },
      { label: 'movimento', value: improved ? 'aceitou' : 'travou' },
    ];
  }

  if (state.algorithm === 'tabu') {
    return [
      { label: 'candidatos', value: String(state.population.length) },
      { label: 'memória tabu', value: String(state.tabuMoves.length) },
      { label: 'troca ativa', value: state.activeMove ? formatMove(state.activeMove) : '-' },
    ];
  }

  return [
    { label: 'população', value: String(state.population.length) },
    { label: 'elite', value: String(state.elite.length) },
    { label: 'mutação', value: `${Math.round(state.mutationRate * 100)}%` },
  ];
}

function algorithmLegendItems(algorithm: AlgorithmId) {
  const base = [
    { label: 'ótimo exato', kind: 'target' },
    { label: 'melhor rota', kind: 'best' },
  ];

  if (algorithm === 'hill') {
    return [
      { label: 'rota atual', kind: 'algorithm' },
      { label: 'troca 2-opt', kind: 'radius' },
      ...base,
    ];
  }

  if (algorithm === 'tabu') {
    return [
      { label: 'rota permitida', kind: 'algorithm' },
      { label: 'trocas tabu', kind: 'tabu' },
      ...base,
    ];
  }

  if (algorithm === 'genetic') {
    return [
      { label: 'filhos', kind: 'algorithm' },
      { label: 'pais e elite', kind: 'elite' },
      ...base,
    ];
  }

  return [{ label: 'rotas sorteadas', kind: 'algorithm' }, ...base];
}

function ExerciseSection() {
  return (
    <section className="lesson-section exercise-section" id="exercicio">
      <div className="section-inner exercise-grid">
        <div>
          <SectionHeader
            kicker="5. Exercício para casa"
            title="Implementar uma busca do zero"
            text="A entrega força a separar representação, vizinhança, função objetivo, orçamento e comparação experimental."
          />
          <div className="exercise-brief">
            <p>
              Problema sugerido: resolva uma instância pequena do caixeiro viajante com 10 a 15
              cidades. Compare pelo menos dois métodos, por exemplo busca aleatória e busca tabu,
              usando o mesmo orçamento de avaliações.
            </p>
            <p>
              Alternativa discreta: problema da mochila 0/1, escolhendo itens sob uma capacidade
              máxima e maximizando o valor total.
            </p>
          </div>
        </div>

        <div className="rubric-panel">
          <h3>Entrega esperada</h3>
          <ol>
            <li>Implementação manual do algoritmo escolhido, sem biblioteca de otimização.</li>
            <li>Gráfico da melhor solução ao longo das avaliações.</li>
            <li>Discussão sobre mínimo local, custo de avaliação e sensibilidade à inicialização.</li>
            <li>Comparação com uma linha de base simples.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  kicker,
  title,
  text,
  contrast = false,
}: {
  kicker: string;
  title: string;
  text: string;
  contrast?: boolean;
}) {
  return (
    <div className={`section-heading ${contrast ? 'contrast' : ''}`}>
      <p className="eyebrow">{kicker}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="metric">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  valueLabel,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  valueLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-control">
      <span>
        {label}
        <strong>{valueLabel}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function useCanvas(draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void, deps: DependencyList) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return undefined;
    }

    let frame = 0;
    const render = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw(ctx, width, height);
      });
    };

    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, deps);

  return ref;
}

function drawRegression(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  slope: number,
  intercept: number,
) {
  const margin = { left: 46, right: 22, top: 24, bottom: 42 };
  const xMax = 10;
  const yMax = 10;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const toX = (x: number) => margin.left + (x / xMax) * plotWidth;
  const toY = (y: number) => margin.top + plotHeight - (y / yMax) * plotHeight;

  clearCanvas(ctx, width, height, '#fffdf8');
  drawGrid(ctx, width, height, margin.left, margin.top, plotWidth, plotHeight);

  ctx.strokeStyle = '#d8d3c6';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + plotHeight);
  ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
  ctx.stroke();

  ctx.save();
  ctx.strokeStyle = 'rgba(242, 95, 92, 0.42)';
  ctx.lineWidth = 2;
  regressionData.forEach((point) => {
    const predicted = slope * point.x + intercept;
    ctx.beginPath();
    ctx.moveTo(toX(point.x), toY(point.y));
    ctx.lineTo(toX(point.x), toY(predicted));
    ctx.stroke();
  });
  ctx.restore();

  ctx.strokeStyle = '#f25f5c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(intercept));
  ctx.lineTo(toX(xMax), toY(slope * xMax + intercept));
  ctx.stroke();

  ctx.fillStyle = '#18201d';
  regressionData.forEach((point) => {
    ctx.beginPath();
    ctx.arc(toX(point.x), toY(point.y), 4.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#514b42';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillText('dados', margin.left + 6, margin.top + 16);
  ctx.fillText('x', margin.left + plotWidth - 5, margin.top + plotHeight + 27);
  ctx.fillText('y', margin.left - 24, margin.top + 10);
}

function drawLossLandscape(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  slope: number,
  intercept: number,
) {
  clearCanvas(ctx, width, height, '#18201d');
  const slopeRange = { min: -0.8, max: 2.1 };
  const interceptRange = { min: -1.2, max: 6.2 };
  const cols = 96;
  const rows = 64;
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const currentSlope = lerp(slopeRange.min, slopeRange.max, col / (cols - 1));
      const currentIntercept = lerp(interceptRange.max, interceptRange.min, row / (rows - 1));
      const loss = regressionLoss(currentSlope, currentIntercept);
      const t = clamp(Math.log1p(loss) / Math.log1p(38), 0, 1);
      ctx.fillStyle = heatColor(t);
      ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth + 0.6, cellHeight + 0.6);
    }
  }

  const pointToCanvas = (currentSlope: number, currentIntercept: number) => ({
    x: normalize(currentSlope, slopeRange.min, slopeRange.max) * width,
    y: (1 - normalize(currentIntercept, interceptRange.min, interceptRange.max)) * height,
  });

  const best = pointToCanvas(regressionBest.slope, regressionBest.intercept);
  const current = pointToCanvas(slope, intercept);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(best.x, best.y, 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(current.x, current.y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillText('mapa da perda: inclinação x intercepto', 14, 22);
}

function drawMinima(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  samples: Point[],
  minima: Point[],
  globalMin: Point,
  currentX: number,
  path: number[],
  learningRate: number,
) {
  const margin = { left: 40, right: 24, top: 24, bottom: 42 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const minY = Math.min(...samples.map((item) => item.y)) - 0.2;
  const maxY = Math.max(...samples.map((item) => item.y)) + 0.2;
  const toX = (x: number) => margin.left + normalize(x, curveDomain.min, curveDomain.max) * plotWidth;
  const toY = (y: number) => margin.top + plotHeight - normalize(y, minY, maxY) * plotHeight;

  clearCanvas(ctx, width, height, '#fffdf8');
  drawGrid(ctx, width, height, margin.left, margin.top, plotWidth, plotHeight);

  const fillGradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + plotHeight);
  fillGradient.addColorStop(0, 'rgba(45, 108, 223, 0.15)');
  fillGradient.addColorStop(1, 'rgba(0, 166, 118, 0.08)');
  ctx.fillStyle = fillGradient;
  ctx.beginPath();
  samples.forEach((point, index) => {
    const x = toX(point.x);
    const y = toY(point.y);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.lineTo(toX(curveDomain.max), margin.top + plotHeight);
  ctx.lineTo(toX(curveDomain.min), margin.top + plotHeight);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#18201d';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  samples.forEach((point, index) => {
    const x = toX(point.x);
    const y = toY(point.y);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  ctx.strokeStyle = 'rgba(247, 179, 43, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  path.forEach((pathX, index) => {
    const y = ruggedCurve(pathX);
    if (index === 0) {
      ctx.moveTo(toX(pathX), toY(y));
    } else {
      ctx.lineTo(toX(pathX), toY(y));
    }
  });
  ctx.stroke();

  path.slice(-18).forEach((pathX, index, recentPath) => {
    const pointAlpha = 0.22 + (index / Math.max(1, recentPath.length - 1)) * 0.58;
    ctx.fillStyle = `rgba(247, 179, 43, ${pointAlpha})`;
    ctx.beginPath();
    ctx.arc(toX(pathX), toY(ruggedCurve(pathX)), 3.2, 0, Math.PI * 2);
    ctx.fill();
  });

  minima.forEach((point) => {
    const isGlobal = Math.abs(point.x - globalMin.x) < 0.02;
    ctx.fillStyle = isGlobal ? '#00a676' : '#f7b32b';
    ctx.strokeStyle = '#fffdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(toX(point.x), toY(point.y), isGlobal ? 6.5 : 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  const proposedX = clamp(currentX - learningRate * derivative1D(currentX), curveDomain.min, curveDomain.max);
  if (Math.abs(proposedX - currentX) > 0.015) {
    drawArrow(
      ctx,
      toX(currentX),
      toY(ruggedCurve(currentX)),
      toX(proposedX),
      toY(ruggedCurve(proposedX)),
      '#f25f5c',
      2.4,
    );
  }

  ctx.fillStyle = '#f25f5c';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(toX(currentX), toY(ruggedCurve(currentX)), 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#514b42';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillText('mínimos locais', margin.left + 8, margin.top + 16);
  ctx.fillText('x', margin.left + plotWidth - 5, margin.top + plotHeight + 27);
  ctx.fillText('f(x)', margin.left - 30, margin.top + 10);
}

function drawSearchSpace(ctx: CanvasRenderingContext2D, width: number, height: number, state: SearchState) {
  clearCanvas(ctx, width, height, '#111a17');
  const viewport = createMapViewport(width, height);
  const color = algorithmDetails[state.algorithm].color;

  drawTspBackground(ctx, viewport);
  drawRoute(ctx, viewport, tspOptimalSolution, 'rgba(0, 166, 118, 0.38)', 2, [8, 8]);
  drawRoutePopulation(ctx, viewport, state, color);

  if (state.algorithm === 'tabu') {
    drawTabuMemory(ctx, viewport, state.tabuMoves);
  }

  if ((state.algorithm === 'hill' || state.algorithm === 'tabu') && state.previous && state.activeMove) {
    drawTwoOptMove(ctx, viewport, state.previous, state.activeMove, color);
  }

  if (state.algorithm === 'genetic' && state.parents.length === 2) {
    drawGeneticParents(ctx, viewport, state.parents, color);
  }

  if (state.previous && state.previous.value !== state.current.value) {
    drawRoute(ctx, viewport, state.previous, 'rgba(255, 253, 248, 0.18)', 1.4, [4, 8]);
  }

  drawRoute(ctx, viewport, state.best, 'rgba(255, 255, 255, 0.96)', 4.2);
  drawRoute(ctx, viewport, state.current, hexToRgba(color, 0.94), 2.5);
  drawCities(ctx, viewport);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('caixeiro viajante: menor ciclo fechado', viewport.left + 14, viewport.top + 24);
}

function createMapViewport(width: number, height: number): MapViewport {
  const inset = 18;

  return {
    left: inset,
    top: inset,
    width: Math.max(1, width - inset * 2),
    height: Math.max(1, height - inset * 2),
  };
}

function drawTspBackground(ctx: CanvasRenderingContext2D, viewport: MapViewport) {
  const gradient = ctx.createLinearGradient(0, viewport.top, viewport.width, viewport.top + viewport.height);
  gradient.addColorStop(0, '#182721');
  gradient.addColorStop(0.54, '#13201c');
  gradient.addColorStop(1, '#0f1715');
  ctx.fillStyle = gradient;
  ctx.fillRect(viewport.left, viewport.top, viewport.width, viewport.height);

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let index = 1; index <= 5; index += 1) {
    const x = viewport.left + (viewport.width * index) / 6;
    const y = viewport.top + (viewport.height * index) / 6;
    ctx.beginPath();
    ctx.moveTo(x, viewport.top);
    ctx.lineTo(x, viewport.top + viewport.height);
    ctx.moveTo(viewport.left, y);
    ctx.lineTo(viewport.left + viewport.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.026)';
  ctx.lineWidth = 0.9;
  for (let from = 0; from < tspCities.length; from += 1) {
    for (let to = from + 1; to < tspCities.length; to += 1) {
      const a = cityToCanvas(tspCities[from], viewport);
      const b = cityToCanvas(tspCities[to], viewport);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
  ctx.lineWidth = 1;
  ctx.strokeRect(viewport.left, viewport.top, viewport.width, viewport.height);
}

function drawRoutePopulation(
  ctx: CanvasRenderingContext2D,
  viewport: MapViewport,
  state: SearchState,
  color: string,
) {
  const routeCount = state.algorithm === 'genetic' ? 8 : 5;
  const routes = topRoutes(state.population, routeCount);

  routes.forEach((route, index) => {
    const alpha = state.algorithm === 'genetic' ? 0.09 + index * 0.012 : 0.08;
    drawRoute(ctx, viewport, route, hexToRgba(color, alpha), 1.2);
  });

  if (state.algorithm === 'genetic') {
    state.elite.slice(0, 4).forEach((route) => {
      drawRoute(ctx, viewport, route, 'rgba(255,255,255,0.16)', 1.6, [2, 7]);
    });
  }
}

function drawRoute(
  ctx: CanvasRenderingContext2D,
  viewport: MapViewport,
  route: RouteSolution,
  stroke: string,
  lineWidth: number,
  dash: number[] = [],
) {
  if (route.order.length < 2) {
    return;
  }

  ctx.save();
  ctx.setLineDash(dash);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  route.order.forEach((cityIndex, index) => {
    const point = cityToCanvas(tspCities[cityIndex], viewport);
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  const start = cityToCanvas(tspCities[route.order[0]], viewport);
  ctx.lineTo(start.x, start.y);
  ctx.stroke();
  ctx.restore();
}

function drawTwoOptMove(
  ctx: CanvasRenderingContext2D,
  viewport: MapViewport,
  previous: RouteSolution,
  move: RouteMove,
  color: string,
) {
  const order = previous.order;
  const before = order[move.i - 1];
  const first = order[move.i];
  const second = order[move.j];
  const after = order[(move.j + 1) % order.length];

  drawCityEdge(ctx, viewport, before, first, 'rgba(242, 95, 92, 0.78)', 2.3, [6, 5]);
  drawCityEdge(ctx, viewport, second, after, 'rgba(242, 95, 92, 0.78)', 2.3, [6, 5]);
  drawCityEdge(ctx, viewport, before, second, hexToRgba(color, 0.94), 3.1);
  drawCityEdge(ctx, viewport, first, after, hexToRgba(color, 0.94), 3.1);
}

function drawTabuMemory(ctx: CanvasRenderingContext2D, viewport: MapViewport, moves: RouteMove[]) {
  moves.forEach((move, index) => {
    const alpha = 0.1 + (index / Math.max(1, moves.length - 1)) * 0.22;
    drawCityEdge(ctx, viewport, move.cityA, move.cityB, `rgba(247, 179, 43, ${alpha})`, 4, [3, 8]);
  });
}

function drawGeneticParents(
  ctx: CanvasRenderingContext2D,
  viewport: MapViewport,
  parents: RouteSolution[],
  color: string,
) {
  drawRoute(ctx, viewport, parents[0], 'rgba(255,255,255,0.24)', 2, [6, 7]);
  drawRoute(ctx, viewport, parents[1], hexToRgba(color, 0.28), 2, [3, 8]);
}

function drawCityEdge(
  ctx: CanvasRenderingContext2D,
  viewport: MapViewport,
  from: number,
  to: number,
  stroke: string,
  lineWidth: number,
  dash: number[] = [],
) {
  const start = cityToCanvas(tspCities[from], viewport);
  const end = cityToCanvas(tspCities[to], viewport);
  ctx.save();
  ctx.setLineDash(dash);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.restore();
}

function drawCities(ctx: CanvasRenderingContext2D, viewport: MapViewport) {
  tspCities.forEach((city, index) => {
    const point = cityToCanvas(city, viewport);
    const isDepot = index === 0;
    drawCircle(ctx, point.x, point.y, isDepot ? 11 : 8, isDepot ? '#f7b32b' : '#fffdf8', '#17201d', 2.4);
    ctx.fillStyle = '#17201d';
    ctx.font = `800 ${isDepot ? 12 : 11}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(city.label, point.x, point.y + 0.4);
  });
}

function cityToCanvas(city: Point, viewport: MapViewport) {
  return {
    x: viewport.left + city.x * viewport.width,
    y: viewport.top + city.y * viewport.height,
  };
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string,
  stroke?: string,
  lineWidth = 1,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  lineWidth: number,
) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const length = Math.hypot(toX - fromX, toY - fromY);
  if (length < 4) {
    return;
  }

  const headLength = Math.min(12, Math.max(7, length * 0.18));
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function createSurfaceMesh(ruggedness: number) {
  const segments = 94;
  const size = 8;
  const half = size / 2;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const low = new THREE.Color('#00a676');
  const mid = new THREE.Color('#f7b32b');
  const high = new THREE.Color('#f25f5c');
  let minimum = { x: 0, z: 0, y: surfaceHeight(0, 0, ruggedness), objective: Infinity };

  for (let zIndex = 0; zIndex <= segments; zIndex += 1) {
    for (let xIndex = 0; xIndex <= segments; xIndex += 1) {
      const x = -half + (xIndex / segments) * size;
      const z = -half + (zIndex / segments) * size;
      const y = surfaceHeight(x, z, ruggedness);
      const objective = surfaceObjective(x, z, ruggedness);
      const t = clamp(normalize(objective, 8, 92), 0, 1);
      const color = t < 0.55 ? low.clone().lerp(mid, t / 0.55) : mid.clone().lerp(high, (t - 0.55) / 0.45);

      if (objective < minimum.objective) {
        minimum = { x, z, y, objective };
      }

      positions.push(x, y, z);
      colors.push(color.r, color.g, color.b);
    }
  }

  for (let zIndex = 0; zIndex < segments; zIndex += 1) {
    for (let xIndex = 0; xIndex < segments; xIndex += 1) {
      const a = zIndex * (segments + 1) + xIndex;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.04,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);

  const wireGeometry = new THREE.WireframeGeometry(geometry);
  const wireMaterial = new THREE.LineBasicMaterial({
    color: '#1d2823',
    transparent: true,
    opacity: 0.16,
  });
  const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);

  return { mesh, geometry, material, wireframe, wireGeometry, wireMaterial, minimum };
}

function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, fill: string) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  left: number,
  top: number,
  plotWidth: number,
  plotHeight: number,
) {
  ctx.strokeStyle = 'rgba(58, 63, 58, 0.09)';
  ctx.lineWidth = 1;
  for (let index = 0; index <= 6; index += 1) {
    const x = left + (index / 6) * plotWidth;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + plotHeight);
    ctx.stroke();
  }
  for (let index = 0; index <= 5; index += 1) {
    const y = top + (index / 5) * plotHeight;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(Math.min(width - 20, left + plotWidth), y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(58, 63, 58, 0.18)';
  ctx.strokeRect(left, top, Math.min(width - left - 20, plotWidth), Math.min(height - top - 24, plotHeight));
}

function regressionLoss(slope: number, intercept: number) {
  const total = regressionData.reduce((sum, point) => {
    const residual = slope * point.x + intercept - point.y;
    return sum + residual * residual;
  }, 0);
  return total / regressionData.length;
}

function regressionGradient(slope: number, intercept: number) {
  const n = regressionData.length;
  return regressionData.reduce(
    (gradient, point) => {
      const residual = slope * point.x + intercept - point.y;
      return {
        slope: gradient.slope + (2 / n) * residual * point.x,
        intercept: gradient.intercept + (2 / n) * residual,
      };
    },
    { slope: 0, intercept: 0 },
  );
}

function linearFit(points: Point[]) {
  const n = points.length;
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / n;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / n;
  const numerator = points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0);
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  const slope = numerator / denominator;
  return {
    slope,
    intercept: meanY - slope * meanX,
  };
}

function ruggedCurve(x: number) {
  return 0.075 * (x + 1.15) ** 2 + 0.62 * Math.sin(2.35 * x) + 0.22 * Math.cos(5.1 * x) + 2.05;
}

function derivative1D(x: number) {
  const h = 0.001;
  return (ruggedCurve(x + h) - ruggedCurve(x - h)) / (2 * h);
}

function sampleCurve() {
  const samples: Point[] = [];
  const count = 720;
  for (let index = 0; index < count; index += 1) {
    const x = lerp(curveDomain.min, curveDomain.max, index / (count - 1));
    samples.push({ x, y: ruggedCurve(x) });
  }
  return samples;
}

function findLocalMinima(samples: Point[]) {
  const minima: Point[] = [];
  for (let index = 1; index < samples.length - 1; index += 1) {
    if (samples[index].y < samples[index - 1].y && samples[index].y < samples[index + 1].y) {
      const previous = minima[minima.length - 1];
      if (!previous || Math.abs(previous.x - samples[index].x) > 0.22) {
        minima.push(samples[index]);
      } else if (samples[index].y < previous.y) {
        minima[minima.length - 1] = samples[index];
      }
    }
  }
  return minima;
}

function surfaceObjective(x: number, z: number, ruggedness: number) {
  const basin =
    34 +
    1.7 * (0.42 * (x + 0.5) ** 2 + 0.58 * (z - 0.35) ** 2 + 0.12 * (x + 0.5) * (z - 0.35));
  const waves =
    ruggedness *
    (3.7 * Math.sin(1.45 * x + 0.72 * z) +
      2.8 * Math.cos(2.05 * z - 0.38 * x) +
      1.6 * Math.sin(2.75 * (x - z)));
  const bumpScale = 0.78 + ruggedness * 0.26;
  const bumps = surfaceBumps.reduce(
    (sum, bump) => sum + bumpScale * bump.height * rotatedGaussian(x, z, bump),
    0,
  );

  return basin + waves + bumps;
}

function surfaceHeight(x: number, z: number, ruggedness: number) {
  return (surfaceObjective(x, z, ruggedness) - 43) * 0.052;
}

function rotatedGaussian(
  x: number,
  z: number,
  bump: { x: number; z: number; widthX: number; widthZ: number; angle: number },
) {
  const dx = x - bump.x;
  const dz = z - bump.z;
  const cos = Math.cos(bump.angle);
  const sin = Math.sin(bump.angle);
  const rotatedX = cos * dx - sin * dz;
  const rotatedZ = sin * dx + cos * dz;

  return Math.exp(-0.5 * ((rotatedX / bump.widthX) ** 2 + (rotatedZ / bump.widthZ) ** 2));
}

function createSearchState(algorithm: AlgorithmId): SearchState {
  const current = randomRouteSolution();
  const population =
    algorithm === 'genetic'
      ? Array.from({ length: 36 }, randomRouteSolution)
      : algorithm === 'random'
        ? Array.from({ length: 24 }, randomRouteSolution)
        : sampleTwoOptNeighbors(current, 18).map((item) => item.route);
  const best = bestRoute([current, ...population]);
  const elite = algorithm === 'genetic' ? topRoutes(population, 8) : [];
  return {
    algorithm,
    step: 0,
    current,
    population,
    best,
    tabu: [],
    tabuMoves: [],
    previous: null,
    activeMove: null,
    mutationRate: algorithm === 'genetic' ? 0.32 : 0,
    parents: [],
    elite,
  };
}

function stepSearch(state: SearchState): SearchState {
  if (state.algorithm === 'random') {
    const population = Array.from({ length: 26 }, randomRouteSolution);
    const current = bestRoute(population);
    const best = bestRoute([state.best, current]);
    return {
      ...state,
      step: state.step + 1,
      current,
      population,
      best,
      previous: state.current,
      activeMove: null,
      tabuMoves: [],
      parents: [],
      elite: [],
    };
  }

  if (state.algorithm === 'hill') {
    const candidates = sampleTwoOptNeighbors(state.current, 22);
    const winner = bestRouteMove(candidates);
    const improved = winner.route.value < state.current.value - 0.01;
    const current = improved ? winner.route : state.current;
    const best = bestRoute([state.best, current]);
    return {
      ...state,
      step: state.step + 1,
      current,
      population: candidates.map((item) => item.route),
      best,
      previous: state.current,
      activeMove: winner.move,
      tabuMoves: [],
      parents: [],
      elite: [],
    };
  }

  if (state.algorithm === 'tabu') {
    const tabuSet = new Set(state.tabu);
    const candidates = sampleTwoOptNeighbors(state.current, 34);
    const allowed = candidates.filter((item) => !tabuSet.has(moveKey(item.move)));
    const pool = allowed.length > 0 ? allowed : candidates;
    const winner = bestRouteMove(pool);
    const current = winner.route;
    const best = bestRoute([state.best, current]);
    const tabu = [...state.tabu, moveKey(winner.move)].slice(-14);
    const tabuMoves = [...state.tabuMoves, winner.move].slice(-14);
    return {
      ...state,
      step: state.step + 1,
      current,
      population: pool.map((item) => item.route),
      best,
      tabu,
      tabuMoves,
      previous: state.current,
      activeMove: winner.move,
      parents: [],
      elite: [],
    };
  }

  const elite = topRoutes(state.population, 8);
  const children: RouteSolution[] = [];
  const parents: RouteSolution[] = [];
  const mutationRate = Math.max(0.08, 0.32 * Math.exp(-state.step / 160));
  while (children.length < 32) {
    const a = elite[randomInt(0, elite.length - 1)];
    const b = elite[randomInt(0, elite.length - 1)];
    if (parents.length === 0) {
      parents.push(a, b);
    }
    let order = orderCrossover(a.order, b.order);
    if (Math.random() < mutationRate) {
      order = applyTwoOpt(order, randomTwoOptMove(order));
    }
    children.push(makeRouteSolution(order));
  }
  const population = [...elite.slice(0, 4), ...children].slice(0, 36);
  const current = bestRoute(population);
  const best = bestRoute([state.best, current]);
  return {
    ...state,
    step: state.step + 1,
    current,
    population,
    best,
    previous: state.current,
    activeMove: null,
    mutationRate,
    parents,
    elite,
  };
}

function solveTspExactly(cities: TspCity[]): RouteSolution {
  const cityCount = cities.length;
  const subsetCount = 1 << (cityCount - 1);
  const costs = Array.from({ length: subsetCount }, () => Array(cityCount).fill(Infinity));
  const parents = Array.from({ length: subsetCount }, () => Array(cityCount).fill(-1));

  for (let city = 1; city < cityCount; city += 1) {
    const mask = 1 << (city - 1);
    costs[mask][city] = cityDistance(cities[0], cities[city]);
    parents[mask][city] = 0;
  }

  for (let mask = 1; mask < subsetCount; mask += 1) {
    for (let last = 1; last < cityCount; last += 1) {
      if ((mask & (1 << (last - 1))) === 0 || !Number.isFinite(costs[mask][last])) {
        continue;
      }

      for (let next = 1; next < cityCount; next += 1) {
        const bit = 1 << (next - 1);
        if ((mask & bit) !== 0) {
          continue;
        }

        const nextMask = mask | bit;
        const candidate = costs[mask][last] + cityDistance(cities[last], cities[next]);
        if (candidate < costs[nextMask][next]) {
          costs[nextMask][next] = candidate;
          parents[nextMask][next] = last;
        }
      }
    }
  }

  const fullMask = subsetCount - 1;
  let bestLast = 1;
  let bestValue = Infinity;
  for (let last = 1; last < cityCount; last += 1) {
    const candidate = costs[fullMask][last] + cityDistance(cities[last], cities[0]);
    if (candidate < bestValue) {
      bestValue = candidate;
      bestLast = last;
    }
  }

  const reversed: number[] = [];
  let mask = fullMask;
  let current = bestLast;
  while (current > 0) {
    reversed.push(current);
    const previous = parents[mask][current];
    mask ^= 1 << (current - 1);
    current = previous;
  }

  const order = [0, ...reversed.reverse()];
  return makeRouteSolution(order, cities);
}

function randomRouteSolution() {
  return makeRouteSolution(randomRouteOrder());
}

function randomRouteOrder() {
  return [0, ...shuffle(Array.from({ length: tspCities.length - 1 }, (_, index) => index + 1))];
}

function makeRouteSolution(order: number[], cities = tspCities): RouteSolution {
  return { order, value: routeDistance(order, cities) };
}

function routeDistance(order: number[], cities = tspCities) {
  return order.reduce((sum, cityIndex, index) => {
    const nextCity = order[(index + 1) % order.length];
    return sum + cityDistance(cities[cityIndex], cities[nextCity]);
  }, 0);
}

function cityDistance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y) * 100;
}

function sampleTwoOptNeighbors(route: RouteSolution, count: number) {
  const seen = new Set<string>();
  const neighbors: Array<{ route: RouteSolution; move: RouteMove }> = [];

  while (neighbors.length < count && seen.size < 160) {
    const move = randomTwoOptMove(route.order);
    const key = `${move.i}:${move.j}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    neighbors.push({ route: makeRouteSolution(applyTwoOpt(route.order, move)), move });
  }

  return neighbors;
}

function randomTwoOptMove(order: number[]): RouteMove {
  const i = randomInt(1, order.length - 2);
  const j = randomInt(i + 1, order.length - 1);
  return {
    i,
    j,
    cityA: order[i],
    cityB: order[j],
  };
}

function applyTwoOpt(order: number[], move: RouteMove) {
  return [
    ...order.slice(0, move.i),
    ...order.slice(move.i, move.j + 1).reverse(),
    ...order.slice(move.j + 1),
  ];
}

function bestRoute(routes: RouteSolution[]) {
  return routes.reduce((best, route) => (route.value < best.value ? route : best), routes[0]);
}

function bestRouteMove(items: Array<{ route: RouteSolution; move: RouteMove }>) {
  return items.reduce((best, item) => (item.route.value < best.route.value ? item : best), items[0]);
}

function topRoutes(routes: RouteSolution[], count: number) {
  return [...routes].sort((a, b) => a.value - b.value).slice(0, count);
}

function moveKey(move: RouteMove) {
  const a = Math.min(move.cityA, move.cityB);
  const b = Math.max(move.cityA, move.cityB);
  return `${a}:${b}`;
}

function orderCrossover(first: number[], second: number[]) {
  const start = randomInt(1, first.length - 3);
  const end = randomInt(start + 1, first.length - 1);
  const child = Array(first.length).fill(-1);
  child[0] = 0;

  for (let index = start; index <= end; index += 1) {
    child[index] = first[index];
  }

  const used = new Set(child.filter((city) => city >= 0));
  let insertAt = 1;
  second.slice(1).forEach((city) => {
    if (used.has(city)) {
      return;
    }
    while (child[insertAt] !== -1) {
      insertAt += 1;
    }
    child[insertAt] = city;
    used.add(city);
  });

  return child;
}

function formatRouteLength(value: number) {
  return value.toFixed(1);
}

function formatGap(value: number) {
  const gap = ((value / tspOptimalSolution.value) - 1) * 100;
  return gap < 0.05 ? 'ótimo' : `+${gap.toFixed(1)}%`;
}

function formatMove(move: RouteMove) {
  return `${tspCities[move.cityA].label}-${tspCities[move.cityB].label}`;
}

function heatColor(t: number) {
  if (t < 0.45) {
    return mixHex('#00a676', '#f7b32b', t / 0.45);
  }
  return mixHex('#f7b32b', '#f25f5c', (t - 0.45) / 0.55);
}

function mixHex(a: string, b: string, amount: number) {
  const colorA = hexToRgb(a);
  const colorB = hexToRgb(b);
  return `rgb(${Math.round(lerp(colorA.r, colorB.r, amount))}, ${Math.round(
    lerp(colorA.g, colorB.g, amount),
  )}, ${Math.round(lerp(colorA.b, colorB.b, amount))})`;
}

function hexToRgba(hex: string, alpha: number) {
  const color = hexToRgb(hex);
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function normalize(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

function lerp(a: number, b: number, amount: number) {
  return a + (b - a) * amount;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function formatSigned(value: number) {
  if (Math.abs(value) < 0.005) {
    return '0.00';
  }
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}`;
}

function formatPowerOfTen(power: number) {
  if (power <= 6) {
    return String(10 ** power);
  }
  return `10^${power}`;
}

export default App;
