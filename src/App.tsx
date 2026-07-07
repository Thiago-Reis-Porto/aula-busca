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

type SearchPoint = Point & {
  value: number;
};

type AlgorithmId = 'random' | 'hill' | 'tabu' | 'genetic';

type SearchState = {
  algorithm: AlgorithmId;
  step: number;
  current: SearchPoint;
  population: SearchPoint[];
  best: SearchPoint;
  path: SearchPoint[];
  tabu: string[];
  tabuPoints: SearchPoint[];
  previous: SearchPoint | null;
  radius: number;
  parents: SearchPoint[];
  elite: SearchPoint[];
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
    short: 'Explora sem memória e cria uma base simples de comparação.',
    color: '#2d6cdf',
    lesson: 'Boa para começar: surpreende em espaços grandes quando poucas avaliações cabem no orçamento.',
    flow: ['Sorteia lote', 'Avalia todos', 'Guarda melhor'],
  },
  hill: {
    name: 'Subida/descida local',
    short: 'Move para vizinhos melhores e para quando a vizinhança não ajuda.',
    color: '#00a676',
    lesson: 'Rápida e barata, mas tende a aceitar o mínimo local como se fosse a solução.',
    flow: ['Olha vizinhos', 'Aceita melhora', 'Encolhe o passo'],
  },
  tabu: {
    name: 'Busca tabu',
    short: 'Mantém uma memória curta de regiões já visitadas.',
    color: '#f7b32b',
    lesson: 'A memória permite escapar de ciclos e atravessar regiões temporariamente piores.',
    flow: ['Marca visitados', 'Bloqueia retorno', 'Segue melhor permitido'],
  },
  genetic: {
    name: 'Algoritmo genético',
    short: 'Evolui uma população por seleção, cruzamento e mutação.',
    color: '#f25f5c',
    lesson: 'Explora várias hipóteses ao mesmo tempo e lida bem com superfícies irregulares.',
    flow: ['Seleciona elite', 'Cruza pais', 'Muta filhos'],
  },
};

const regressionBest = linearFit(regressionData);
const curveDomain = { min: -4.5, max: 4.5 };
const searchDomain = { min: -5.12, max: 5.12 };
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
          kicker="4. Estratégias usadas na prática"
          title="Cada algoritmo troca exploração, memória e custo"
          text="A mesma função objetivo pode favorecer estratégias diferentes. O laboratório usa uma superfície com muitos mínimos locais parecida com problemas de ajuste de hiperparâmetros."
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
            <canvas ref={canvasRef} className="canvas search-canvas" aria-label="Espaço de busca 2D" />
            <AlgorithmLegend algorithm={algorithm} />
          </div>

          <div className="control-panel">
            <div className="metric-strip">
              <Metric label="iteração" value={String(state.step)} />
              <Metric label="melhor valor" value={state.best.value.toFixed(3)} />
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
            title="Grade"
            text="Testa combinações pré-definidas. Simples, mas cresce exponencialmente."
          />
          <AlgorithmCard
            title="Aleatória"
            text="Amostra pontos independentes. Forte quando há poucas avaliações disponíveis."
          />
          <AlgorithmCard
            title="Tabu"
            text="Usa memória para evitar ciclos e revisitas recentes."
          />
          <AlgorithmCard
            title="Genético"
            text="Mantém diversidade por população, cruzamento e mutação."
          />
          <AlgorithmCard
            title="Bayesiana"
            text="Aprende um modelo substituto para escolher a próxima avaliação."
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
      { label: 'avaliados agora', value: String(state.population.length) },
      { label: 'decisão', value: 'melhor do lote' },
      { label: 'memória', value: 'só o melhor' },
    ];
  }

  if (state.algorithm === 'hill') {
    const moved = state.previous ? distance(state.previous, state.current) : 0;
    return [
      { label: 'vizinhos', value: String(state.population.length) },
      { label: 'raio local', value: state.radius.toFixed(2) },
      { label: 'movimento', value: moved > 0.03 ? moved.toFixed(2) : 'parou' },
    ];
  }

  if (state.algorithm === 'tabu') {
    return [
      { label: 'candidatos', value: String(state.population.length) },
      { label: 'memória tabu', value: String(state.tabuPoints.length) },
      { label: 'regra', value: 'evitar retorno' },
    ];
  }

  return [
    { label: 'população', value: String(state.population.length) },
    { label: 'elite', value: String(state.elite.length) },
    { label: 'mutação', value: state.radius.toFixed(2) },
  ];
}

function algorithmLegendItems(algorithm: AlgorithmId) {
  const base = [
    { label: 'alvo global', kind: 'target' },
    { label: 'melhor até agora', kind: 'best' },
  ];

  if (algorithm === 'hill') {
    return [
      { label: 'vizinhos testados', kind: 'algorithm' },
      { label: 'raio local', kind: 'radius' },
      ...base,
    ];
  }

  if (algorithm === 'tabu') {
    return [
      { label: 'candidatos permitidos', kind: 'algorithm' },
      { label: 'regiões tabu', kind: 'tabu' },
      ...base,
    ];
  }

  if (algorithm === 'genetic') {
    return [
      { label: 'filhos', kind: 'algorithm' },
      { label: 'elite e pais', kind: 'elite' },
      ...base,
    ];
  }

  return [{ label: 'amostras sorteadas', kind: 'algorithm' }, ...base];
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
              Problema sugerido: minimize a função de Rastrigin em 10 dimensões. Compare pelo menos
              dois métodos, por exemplo busca aleatória e busca tabu, usando o mesmo orçamento de
              avaliações.
            </p>
            <p>
              Extensão para IA: substituir a função sintética por validação de hiperparâmetros de
              um modelo simples, como k-NN, árvore de decisão ou MLP pequeno.
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
  clearCanvas(ctx, width, height, '#17201d');
  const side = Math.min(width, height);
  const offsetX = (width - side) / 2;
  const offsetY = (height - side) / 2;
  const cells = 108;
  const cell = side / cells;
  const color = algorithmDetails[state.algorithm].color;

  for (let row = 0; row < cells; row += 1) {
    for (let col = 0; col < cells; col += 1) {
      const point = canvasToSearch(offsetX + (col + 0.5) * cell, offsetY + (row + 0.5) * cell, side, offsetX, offsetY);
      const value = objective2D(point.x, point.y);
      ctx.fillStyle = heatColor(clamp(value / 82, 0, 1));
      ctx.fillRect(offsetX + col * cell, offsetY + row * cell, cell + 0.5, cell + 0.5);
    }
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(offsetX, offsetY, side, side);

  if (state.algorithm === 'tabu') {
    drawTabuMemory(ctx, side, offsetX, offsetY, state.tabuPoints);
  }

  if (state.algorithm === 'hill') {
    const center = state.previous ?? state.current;
    const canvasPoint = searchToCanvas(center, side, offsetX, offsetY);
    const radius = (state.radius / (searchDomain.max - searchDomain.min)) * side;
    ctx.save();
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = hexToRgba(color, 0.82);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvasPoint.x, canvasPoint.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (state.algorithm === 'genetic' && state.parents.length === 2) {
    drawGeneticParents(ctx, side, offsetX, offsetY, state.parents, bestOf(state.population), color);
  }

  if (state.path.length > 1) {
    drawSearchPath(ctx, side, offsetX, offsetY, state.path);
  }

  drawSearchPopulation(ctx, side, offsetX, offsetY, state, color);

  const best = searchToCanvas(state.best, side, offsetX, offsetY);
  drawStar(ctx, best.x, best.y, 10, 4.6, '#ffffff', '#18201d');

  const global = searchToCanvas({ x: 0, y: 0 }, side, offsetX, offsetY);
  ctx.strokeStyle = '#00a676';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(global.x - 10, global.y);
  ctx.lineTo(global.x + 10, global.y);
  ctx.moveTo(global.x, global.y - 10);
  ctx.lineTo(global.x, global.y + 10);
  ctx.stroke();

  const current = searchToCanvas(state.current, side, offsetX, offsetY);
  drawCircle(ctx, current.x, current.y, 6.4, color, '#ffffff', 2);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillText('função objetivo 2D: verde = baixo custo, vermelho = alto custo', offsetX + 14, offsetY + 22);
}

function drawSearchPath(
  ctx: CanvasRenderingContext2D,
  side: number,
  offsetX: number,
  offsetY: number,
  path: SearchPoint[],
) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  path.forEach((point, index) => {
    const canvasPoint = searchToCanvas(point, side, offsetX, offsetY);
    if (index === 0) {
      ctx.moveTo(canvasPoint.x, canvasPoint.y);
    } else {
      ctx.lineTo(canvasPoint.x, canvasPoint.y);
    }
  });
  ctx.stroke();

  const previous = path[path.length - 2];
  const current = path[path.length - 1];
  if (previous && current && distance(previous, current) > 0.04) {
    const from = searchToCanvas(previous, side, offsetX, offsetY);
    const to = searchToCanvas(current, side, offsetX, offsetY);
    drawArrow(ctx, from.x, from.y, to.x, to.y, 'rgba(255, 255, 255, 0.9)', 2);
  }
}

function drawSearchPopulation(
  ctx: CanvasRenderingContext2D,
  side: number,
  offsetX: number,
  offsetY: number,
  state: SearchState,
  color: string,
) {
  if (state.algorithm === 'genetic') {
    state.elite.forEach((point) => {
      const canvasPoint = searchToCanvas(point, side, offsetX, offsetY);
      drawCircle(ctx, canvasPoint.x, canvasPoint.y, 6.3, 'rgba(255, 255, 255, 0.12)', '#ffffff', 1.5);
    });
  }

  state.population.forEach((point) => {
    const canvasPoint = searchToCanvas(point, side, offsetX, offsetY);
    if (state.algorithm === 'random') {
      drawCircle(ctx, canvasPoint.x, canvasPoint.y, 4.9, hexToRgba(color, 0.78));
      return;
    }

    if (state.algorithm === 'genetic') {
      drawCircle(ctx, canvasPoint.x, canvasPoint.y, 3.8, hexToRgba(color, 0.66));
      return;
    }

    drawCircle(ctx, canvasPoint.x, canvasPoint.y, 4.7, 'rgba(255,255,255,0.08)', hexToRgba(color, 0.9), 1.5);
  });

  if (state.algorithm === 'genetic') {
    topPoints(state.population, 6).forEach((point) => {
      const canvasPoint = searchToCanvas(point, side, offsetX, offsetY);
      drawCircle(ctx, canvasPoint.x, canvasPoint.y, 5.6, 'rgba(255, 255, 255, 0.05)', '#ffffff', 1.4);
    });
  }
}

function drawTabuMemory(
  ctx: CanvasRenderingContext2D,
  side: number,
  offsetX: number,
  offsetY: number,
  tabuPoints: SearchPoint[],
) {
  const square = Math.max(16, (0.52 / (searchDomain.max - searchDomain.min)) * side);
  ctx.save();
  ctx.setLineDash([4, 4]);
  tabuPoints.forEach((point, index) => {
    const canvasPoint = searchToCanvas(point, side, offsetX, offsetY);
    const alpha = 0.1 + (index / Math.max(1, tabuPoints.length - 1)) * 0.2;
    ctx.fillStyle = `rgba(247, 179, 43, ${alpha})`;
    ctx.strokeStyle = 'rgba(247, 179, 43, 0.72)';
    ctx.lineWidth = 1.2;
    ctx.fillRect(canvasPoint.x - square / 2, canvasPoint.y - square / 2, square, square);
    ctx.strokeRect(canvasPoint.x - square / 2, canvasPoint.y - square / 2, square, square);
  });
  ctx.restore();
}

function drawGeneticParents(
  ctx: CanvasRenderingContext2D,
  side: number,
  offsetX: number,
  offsetY: number,
  parents: SearchPoint[],
  child: SearchPoint,
  color: string,
) {
  const first = searchToCanvas(parents[0], side, offsetX, offsetY);
  const second = searchToCanvas(parents[1], side, offsetX, offsetY);
  const offspring = searchToCanvas(child, side, offsetX, offsetY);
  const midX = (first.x + second.x) / 2;
  const midY = (first.y + second.y) / 2;

  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = hexToRgba(color, 0.72);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  ctx.lineTo(second.x, second.y);
  ctx.stroke();
  ctx.restore();

  drawCircle(ctx, first.x, first.y, 7, 'rgba(255, 255, 255, 0.08)', '#ffffff', 1.8);
  drawCircle(ctx, second.x, second.y, 7, 'rgba(255, 255, 255, 0.08)', '#ffffff', 1.8);
  drawArrow(ctx, midX, midY, offspring.x, offspring.y, hexToRgba(color, 0.9), 2);
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

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  fill: string,
  stroke: string,
) {
  ctx.beginPath();
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    if (index === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
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

function objective2D(x: number, y: number) {
  return 20 + x * x + y * y - 10 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y));
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
  const current = randomSearchPoint();
  const population =
    algorithm === 'genetic'
      ? Array.from({ length: 30 }, randomSearchPoint)
      : Array.from({ length: algorithm === 'random' ? 18 : 12 }, randomSearchPoint);
  const best = bestOf([current, ...population]);
  const elite = algorithm === 'genetic' ? topPoints(population, 8) : [];
  return {
    algorithm,
    step: 0,
    current,
    population,
    best,
    path: [algorithm === 'genetic' || algorithm === 'random' ? best : current],
    tabu: [],
    tabuPoints: [],
    previous: null,
    radius: algorithm === 'genetic' ? mutationRadius(0) : algorithm === 'hill' ? 1.05 : 0.85,
    parents: [],
    elite,
  };
}

function stepSearch(state: SearchState): SearchState {
  if (state.algorithm === 'random') {
    const population = Array.from({ length: 22 }, randomSearchPoint);
    const best = bestOf([state.best, ...population]);
    return {
      ...state,
      step: state.step + 1,
      current: best,
      population,
      best,
      path: appendPath(state.path, best),
      previous: state.current,
      parents: [],
      elite: [],
    };
  }

  if (state.algorithm === 'hill') {
    const radius = Math.max(0.18, 1.05 * Math.exp(-state.step / 80));
    const candidates = Array.from({ length: 16 }, () => neighbor(state.current, radius));
    const winner = bestOf([state.current, ...candidates]);
    const current = winner.value <= state.current.value ? winner : state.current;
    const best = bestOf([state.best, current]);
    return {
      ...state,
      step: state.step + 1,
      current,
      population: candidates,
      best,
      path: appendPath(state.path, current),
      previous: state.current,
      radius,
      parents: [],
      elite: [],
    };
  }

  if (state.algorithm === 'tabu') {
    const tabuSet = new Set(state.tabu);
    const candidates = Array.from({ length: 26 }, () => neighbor(state.current, 0.85)).filter(
      (point) => !tabuSet.has(tabuKey(point)),
    );
    const fallback = candidates.length > 0 ? candidates : Array.from({ length: 10 }, randomSearchPoint);
    const current = bestOf(fallback);
    const best = bestOf([state.best, current]);
    const tabu = [...state.tabu, tabuKey(state.current)].slice(-16);
    const tabuPoints = [...state.tabuPoints, state.current].slice(-16);
    return {
      ...state,
      step: state.step + 1,
      current,
      population: fallback,
      best,
      path: appendPath(state.path, current),
      tabu,
      tabuPoints,
      previous: state.current,
      radius: 0.85,
      parents: [],
      elite: [],
    };
  }

  const sorted = [...state.population].sort((a, b) => a.value - b.value);
  const elite = sorted.slice(0, 8);
  const children: SearchPoint[] = [];
  const parents: SearchPoint[] = [];
  while (children.length < 30) {
    const a = elite[Math.floor(Math.random() * elite.length)];
    const b = elite[Math.floor(Math.random() * elite.length)];
    if (parents.length === 0) {
      parents.push(a, b);
    }
    const mix = Math.random();
    const mutation = Math.max(0.1, 1.05 * Math.exp(-state.step / 110));
    children.push(
      makeSearchPoint(
        clamp(lerp(a.x, b.x, mix) + randomNormal() * mutation, searchDomain.min, searchDomain.max),
        clamp(lerp(a.y, b.y, 1 - mix) + randomNormal() * mutation, searchDomain.min, searchDomain.max),
      ),
    );
  }
  const best = bestOf([state.best, ...children]);
  return {
    ...state,
    step: state.step + 1,
    current: best,
    population: children,
    best,
    path: appendPath(state.path, best),
    previous: state.current,
    radius: mutationRadius(state.step),
    parents,
    elite,
  };
}

function randomSearchPoint() {
  return makeSearchPoint(randomRange(searchDomain.min, searchDomain.max), randomRange(searchDomain.min, searchDomain.max));
}

function makeSearchPoint(x: number, y: number): SearchPoint {
  return { x, y, value: objective2D(x, y) };
}

function neighbor(point: SearchPoint, radius: number) {
  return makeSearchPoint(
    clamp(point.x + randomNormal() * radius, searchDomain.min, searchDomain.max),
    clamp(point.y + randomNormal() * radius, searchDomain.min, searchDomain.max),
  );
}

function bestOf(points: SearchPoint[]) {
  return points.reduce((best, point) => (point.value < best.value ? point : best), points[0]);
}

function topPoints(points: SearchPoint[], count: number) {
  return [...points].sort((a, b) => a.value - b.value).slice(0, count);
}

function appendPath(path: SearchPoint[], point: SearchPoint) {
  return [...path, point].slice(-90);
}

function mutationRadius(step: number) {
  return Math.max(0.1, 1.05 * Math.exp(-step / 110));
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function tabuKey(point: SearchPoint) {
  return `${Math.round(point.x * 2)}:${Math.round(point.y * 2)}`;
}

function searchToCanvas(point: Point, side: number, offsetX: number, offsetY: number) {
  return {
    x: offsetX + normalize(point.x, searchDomain.min, searchDomain.max) * side,
    y: offsetY + (1 - normalize(point.y, searchDomain.min, searchDomain.max)) * side,
  };
}

function canvasToSearch(x: number, y: number, side: number, offsetX: number, offsetY: number) {
  return {
    x: lerp(searchDomain.min, searchDomain.max, clamp((x - offsetX) / side, 0, 1)),
    y: lerp(searchDomain.max, searchDomain.min, clamp((y - offsetY) / side, 0, 1)),
  };
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

function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomNormal() {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
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
