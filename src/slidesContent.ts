export type SlideAccent = 'green' | 'blue' | 'coral' | 'amber';

export type DemoLinkKey = 'regression' | 'minima' | 'surface' | 'algorithms' | 'exercise';

export type IconName =
  | 'crosshair'
  | 'gauge'
  | 'route'
  | 'timer'
  | 'lineChart'
  | 'layers'
  | 'mountain'
  | 'pause'
  | 'shuffle'
  | 'gitBranch'
  | 'dna'
  | 'flask';

export type SlideBody =
  | { kind: 'hero'; visual: 'landscape' | 'closing'; compact?: boolean }
  | { kind: 'thesis'; items: Array<{ value: string; label: string }> }
  | { kind: 'timeline'; items: Array<[string, string]> }
  | { kind: 'iconGrid'; items: Array<{ icon: IconName; title: string; text: string }> }
  | {
      kind: 'regressionDemo';
      callout: { icon: IconName; title: string; text: string; link: DemoLinkKey; linkLabel: string };
    }
  | { kind: 'formula'; formula: string; bullets: string[] }
  | {
      kind: 'minimaDemo';
      panel: { title: string; bullets: string[]; link: DemoLinkKey; linkLabel: string };
    }
  | { kind: 'tagCloud'; tags: string[] }
  | {
      kind: 'dimensions';
      bars: Array<[string, string, number]>;
      callout: { icon: IconName; title: string; text: string; link: DemoLinkKey; linkLabel: string };
    }
  | { kind: 'pipeline'; steps: Array<[string, string]> }
  | { kind: 'samplingComparison' }
  | { kind: 'algorithm'; icon: IconName; name: string; strengths: string[]; limits: string[] }
  | { kind: 'evolution'; steps: Array<{ icon: IconName; title: string; text: string }> }
  | { kind: 'bayes'; panel: { title: string; bullets: string[] } }
  | { kind: 'halving'; rows: Array<[string, string, number]>; panel: { title: string; bullets: string[] } }
  | { kind: 'methodMatrix'; methods: Array<[string, string]> }
  | { kind: 'checklist'; items: string[] }
  | { kind: 'decisionTable'; rows: Array<[string, string]> }
  | { kind: 'exercise'; title: string; text: string; items: string[]; link: DemoLinkKey; linkLabel: string };

export type EditableSlide = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  note?: string;
  accent?: SlideAccent;
  body: SlideBody;
};

// Edite este array para alterar títulos, textos, bullets, notas, cores e ordem dos slides.
// O HTML só carrega a aplicação; o conteúdo da apresentação fica aqui.
export const slides: EditableSlide[] = [
  {
    eyebrow: 'IA, otimização e hiperparâmetros',
    title: 'Busca em espaços',
    subtitle: 'Como encontrar boas soluções quando não dá para testar tudo.',
    accent: 'green',
    body: { kind: 'hero', visual: 'landscape' },
    note:
      'Abra perguntando: quando treinamos ou ajustamos um modelo de IA, o que exatamente estamos procurando?',
  },
  {
    eyebrow: 'Mensagem da aula',
    title: 'Buscar é navegar um espaço grande com orçamento pequeno.',
    accent: 'blue',
    body: {
      kind: 'thesis',
      items: [
        { value: '1', label: 'definir o espaço' },
        { value: '2', label: 'medir qualidade' },
        { value: '3', label: 'escolher próximos pontos' },
        { value: '4', label: 'parar sem testar tudo' },
      ],
    },
    note: 'Use este slide como contrato da aula. Tudo depois volta para estes quatro movimentos.',
  },
  {
    eyebrow: 'Roteiro de 1 hora',
    title: 'Do problema simples ao espaço real de IA',
    accent: 'amber',
    body: {
      kind: 'timeline',
      items: [
        ['0-5', 'Modelo mental de busca'],
        ['5-15', 'Regressão como espaço de parâmetros'],
        ['15-25', 'Mínimos locais e globais'],
        ['25-35', 'Dimensionalidade e hiperparâmetros'],
        ['35-50', 'Algoritmos de busca'],
        ['50-60', 'Aplicações e exercício'],
      ],
    },
  },
  {
    eyebrow: 'Vocabulário',
    title: 'Quatro peças aparecem em quase toda busca',
    accent: 'green',
    body: {
      kind: 'iconGrid',
      items: [
        { icon: 'crosshair', title: 'Estado', text: 'Uma solução candidata: reta, pesos, pipeline ou arquitetura.' },
        { icon: 'gauge', title: 'Objetivo', text: 'Função que mede perda, custo, recompensa ou qualidade.' },
        { icon: 'route', title: 'Movimento', text: 'Como gerar vizinhos, mutações ou novas configurações.' },
        { icon: 'timer', title: 'Orçamento', text: 'Tempo, memória, épocas, trials, GPU ou dinheiro.' },
      ],
    },
    note: 'Este é o vocabulário que os alunos devem levar para qualquer algoritmo visto depois.',
  },
  {
    eyebrow: 'Exemplo mínimo',
    title: 'Ajustar uma reta já é busca',
    subtitle: 'A solução é o par: inclinação e intercepto.',
    accent: 'coral',
    body: {
      kind: 'regressionDemo',
      callout: {
        icon: 'lineChart',
        title: 'Espaço de parâmetros',
        text: 'Cada ponto no espaço representa uma reta. A perda diz se aquela reta é boa ou ruim.',
        link: 'regression',
        linkLabel: 'Abrir demo',
      },
    },
    note: 'Mostre os sliders da demo. Primeiro ajuste manualmente, depois rode a descida do gradiente.',
  },
  {
    eyebrow: 'Gradiente',
    title: 'Quando a paisagem é suave, dá para seguir a inclinação',
    accent: 'blue',
    body: {
      kind: 'formula',
      formula: 'wₜ₊₁ = wₜ − η · ∇L(wₜ)',
      bullets: [
        'w são os parâmetros aprendidos',
        'η é a taxa de aprendizado',
        '∇L indica como a perda muda',
        'a direção oposta ao gradiente reduz a perda localmente',
      ],
    },
    note: 'Não precisa aprofundar cálculo. O ponto é: o gradiente é uma bússola local, não um mapa global.',
  },
  {
    eyebrow: 'Armadilha',
    title: 'Localmente bom não significa globalmente melhor',
    accent: 'amber',
    body: {
      kind: 'minimaDemo',
      panel: {
        title: 'O resultado depende de',
        bullets: ['ponto inicial', 'tamanho do passo', 'forma da função objetivo', 'ruído da avaliação', 'critério de parada'],
        link: 'minima',
        linkLabel: 'Abrir mínimos',
      },
    },
    note: 'Mostre um ponto inicial preso em mínimo local. Depois mude o início e a taxa de aprendizado.',
  },
  {
    eyebrow: 'Hiperparâmetros',
    title: 'Em ML, muitas escolhas ficam fora do treinamento',
    accent: 'green',
    body: {
      kind: 'tagCloud',
      tags: [
        'learning rate',
        'batch size',
        'dropout',
        'weight decay',
        'nº de camadas',
        'largura',
        'profundidade',
        'kernel',
        'k no k-NN',
        'data augmentation',
        'scheduler',
        'otimizador',
      ],
    },
  },
  {
    eyebrow: 'Dimensionalidade',
    title: 'O número de combinações cresce rápido demais',
    accent: 'coral',
    body: {
      kind: 'dimensions',
      bars: [
        ['2', '10²', 18],
        ['6', '10⁶', 42],
        ['10', '10¹⁰', 68],
        ['18', '10¹⁸', 100],
      ],
      callout: {
        icon: 'layers',
        title: '10 valores por variável',
        text: 'Com 2 variáveis temos 100 combinações. Com 18 variáveis, passamos de 10¹⁸ combinações.',
        link: 'surface',
        linkLabel: 'Abrir espaço 3D',
      },
    },
    note: 'Aqui vale deixar claro: a visualização 3D ainda é uma mentira útil, porque mostra só duas dimensões.',
  },
  {
    eyebrow: 'HPO como caixa-preta',
    title: 'Uma configuração vira um experimento completo',
    accent: 'blue',
    body: {
      kind: 'pipeline',
      steps: [
        ['Configurar', 'hiperparâmetros'],
        ['Treinar', 'modelo'],
        ['Validar', 'métrica'],
        ['Registrar', 'score'],
        ['Escolher', 'próximo trial'],
      ],
    },
    note: 'A avaliação é cara porque cada ponto pode significar treinar um modelo inteiro.',
  },
  {
    eyebrow: 'Baselines',
    title: 'Grid search é simples. Random search costuma ser mais forte.',
    accent: 'amber',
    body: { kind: 'samplingComparison' },
    note:
      'Explique a ideia de Bergstra e Bengio: se poucas dimensões importam, random cobre melhor os valores delas.',
  },
  {
    eyebrow: 'Busca local',
    title: 'Subida/descida local explora vizinhos',
    accent: 'green',
    body: {
      kind: 'algorithm',
      icon: 'mountain',
      name: 'Hill climbing / busca local',
      strengths: ['simples', 'barata por passo', 'boa em paisagens suaves'],
      limits: ['mínimos locais', 'platôs', 'depende da vizinhança'],
    },
  },
  {
    eyebrow: 'Memória',
    title: 'Busca tabu tenta não repetir os mesmos erros',
    accent: 'amber',
    body: {
      kind: 'algorithm',
      icon: 'pause',
      name: 'Busca tabu',
      strengths: ['evita ciclos', 'escapa de vales locais', 'boa em problemas combinatórios'],
      limits: ['definir vizinhança', 'tamanho da memória', 'ainda é local'],
    },
  },
  {
    eyebrow: 'Populações',
    title: 'Algoritmos genéticos mantêm diversidade',
    accent: 'coral',
    body: {
      kind: 'evolution',
      steps: [
        { icon: 'shuffle', title: 'População', text: 'várias soluções ao mesmo tempo' },
        { icon: 'crosshair', title: 'Seleção', text: 'mantém candidatos melhores' },
        { icon: 'gitBranch', title: 'Cruzamento', text: 'combina partes de soluções' },
        { icon: 'dna', title: 'Mutação', text: 'injeta diversidade' },
      ],
    },
    note: 'Conectar seleção, cruzamento e mutação com exploração e explotação.',
  },
  {
    eyebrow: 'Model-based',
    title: 'Bayesian optimization aprende onde vale testar',
    accent: 'blue',
    body: {
      kind: 'bayes',
      panel: {
        title: 'Ideia',
        bullets: [
          'cria um modelo substituto da função objetivo',
          'estima incerteza',
          'usa função de aquisição',
          'bom quando cada avaliação é cara',
        ],
      },
    },
  },
  {
    eyebrow: 'Multi-fidelity',
    title: 'Não dê orçamento completo para todo mundo',
    accent: 'green',
    body: {
      kind: 'halving',
      rows: [
        ['81 configs', '1 época', 81],
        ['27 configs', '3 épocas', 62],
        ['9 configs', '9 épocas', 42],
        ['3 configs', '27 épocas', 24],
        ['1 config', '81 épocas', 12],
      ],
      panel: {
        title: 'Famílias importantes',
        bullets: ['Successive Halving', 'Hyperband', 'ASHA', 'BOHB', 'pruning / early stopping'],
      },
    },
    note: 'Exemplo: muitas configurações com poucas épocas, poucas configurações com muitas épocas.',
  },
  {
    eyebrow: 'Além do básico',
    title: 'Outros algoritmos que aparecem em IA e AutoML',
    accent: 'amber',
    body: {
      kind: 'methodMatrix',
      methods: [
        ['TPE', 'BO para espaços mistos e condicionais'],
        ['SMAC', 'configuração de algoritmos com Random Forest'],
        ['CMA-ES', 'otimização contínua sem derivada'],
        ['Differential Evolution', 'população para funções multimodais'],
        ['PSO', 'enxame de partículas'],
        ['PBT', 'população que aprende schedules'],
        ['NAS / DARTS', 'busca por arquiteturas neurais'],
        ['MCTS', 'planejamento e jogos com simulação'],
      ],
    },
  },
  {
    eyebrow: 'Prática experimental',
    title: 'A busca só é boa se a avaliação for correta',
    accent: 'coral',
    body: {
      kind: 'checklist',
      items: [
        'separar treino, validação e teste',
        'evitar vazamento no pré-processamento',
        'comparar com mesmo orçamento',
        'usar métrica alinhada ao problema',
        'registrar todos os trials',
        'reavaliar melhores configurações com seeds diferentes',
      ],
    },
    note: 'Este slide é importante para alunos não confundirem tuning com tentativa descontrolada.',
  },
  {
    eyebrow: 'Resumo',
    title: 'Não existe algoritmo universalmente melhor',
    accent: 'blue',
    body: {
      kind: 'decisionTable',
      rows: [
        ['Pouco orçamento e baseline', 'random search'],
        ['Avaliação cara', 'Bayesian optimization / TPE'],
        ['Deep learning com épocas', 'Hyperband / ASHA / pruning'],
        ['Espaço combinatório', 'tabu / genético / annealing'],
        ['Contínuo sem gradiente', 'CMA-ES / differential evolution'],
        ['Vários objetivos', 'Pareto / NSGA-II / BO multiobjetivo'],
      ],
    },
  },
  {
    eyebrow: 'Atividade',
    title: 'Exercício para casa',
    subtitle: 'Implementar uma busca do zero e comparar com uma linha de base.',
    accent: 'green',
    body: {
      kind: 'exercise',
      title: 'Resolva caixeiro viajante ou mochila 0/1',
      text: 'Compare dois algoritmos com o mesmo orçamento de avaliações.',
      items: [
        'implementar do zero',
        'plotar melhor valor por avaliação',
        'comparar com random search',
        'discutir representação, vizinhança e sensibilidade',
      ],
      link: 'exercise',
      linkLabel: 'Ver enunciado no app',
    },
    note: 'Sugestão principal: caixeiro viajante pequeno; alternativa: mochila 0/1. Exigir gráfico de melhor valor por avaliação.',
  },
  {
    eyebrow: 'Fechamento',
    title: 'IA é cheia de buscas dentro de buscas',
    subtitle:
      'Treinar ajusta parâmetros. HPO ajusta o processo. AutoML ajusta o pipeline. O desafio é navegar bem com custo limitado.',
    accent: 'coral',
    body: { kind: 'hero', visual: 'closing', compact: true },
  },
];
