# 02. Busca em espaço de estados na IA clássica

Embora a aula tenha foco em machine learning e hiperparâmetros, vale entender a
origem clássica do tema: busca em espaço de estados. Essa tradição aparece em
planejamento, jogos, robótica, resolução de problemas e sistemas de decisão.

## 1. Formulação clássica

Um problema de busca em espaço de estados pode ser descrito por:

- **Estado inicial:** onde o agente começa.
- **Ações:** o que pode ser feito em cada estado.
- **Modelo de transição:** resultado de aplicar uma ação.
- **Teste de objetivo:** como saber que chegamos ao objetivo.
- **Custo de caminho:** custo acumulado das ações.

Exemplo:

```text
Estado: posição em um mapa
Ações: mover para cidades vizinhas
Custo: distância, tempo ou combustível
Objetivo: chegar a uma cidade destino
```

Em ML, a formulação muda, mas a intuição continua: existem candidatos, movimentos,
custos e critérios de parada.

## 2. Busca não informada

Busca não informada não usa conhecimento específico sobre quão perto um estado
está do objetivo.

### Busca em largura (BFS)

Explora primeiro todos os estados de profundidade 1, depois profundidade 2, e
assim por diante.

Vantagens:

- completa se o fator de ramificação é finito;
- encontra solução com menor número de passos quando todos os passos têm mesmo custo.

Limitações:

- memória cresce rapidamente;
- inviável em espaços grandes.

### Busca em profundidade (DFS)

Segue um caminho até o fim antes de voltar.

Vantagens:

- usa pouca memória;
- simples.

Limitações:

- pode cair em caminhos longos ou infinitos;
- não garante solução ótima;
- depende muito da ordem de expansão.

### Busca de custo uniforme

Expande o caminho de menor custo acumulado.

Vantagens:

- encontra caminho ótimo com custos positivos;
- generaliza BFS para custos diferentes.

Limitações:

- pode expandir muitos estados;
- não usa noção de direção para o objetivo.

## 3. Busca informada e heurísticas

Uma heurística estima o custo restante até o objetivo:

```text
h(n) = estimativa do custo de n até o objetivo
```

Heurísticas boas reduzem o número de estados expandidos. Heurísticas ruins podem
enganar a busca.

## 4. A*

O A* escolhe o próximo nó usando:

```text
f(n) = g(n) + h(n)
```

Onde:

- `g(n)` é o custo acumulado do início até `n`;
- `h(n)` é a estimativa do custo de `n` até o objetivo.

Se a heurística for admissível, isto é, se não superestima o custo real, o A*
pode garantir solução ótima em condições clássicas.

Aplicações:

- planejamento de rotas;
- jogos;
- robótica;
- puzzles;
- parsing;
- busca em grafos.

Relação com ML:

- heurísticas são conhecimento aproximado;
- modelos aprendidos podem virar heurísticas;
- busca guiada por rede neural aparece em jogos, programação e planejamento.

## 5. Beam search

Beam search é uma busca heurística que mantém apenas os melhores `k` candidatos
em cada nível.

```text
beam width = k
```

Se `k = 1`, a busca fica muito gananciosa. Se `k` é grande, a busca se aproxima
de uma busca mais ampla, mas consome mais memória.

Aplicações em IA moderna:

- decodificação em tradução automática;
- geração de texto;
- reconhecimento de fala;
- geração de sequências;
- captioning de imagens.

Limitação importante:

- beam search sacrifica completude e otimalidade;
- pode gerar candidatos muito parecidos;
- tende a favorecer sequências de alta probabilidade do modelo, não necessariamente
  melhores segundo uma métrica externa.

## 6. Busca local em espaço de estados

Em vez de manter uma fronteira grande de caminhos, busca local mantém um estado
atual e tenta melhorá-lo.

Exemplos:

- hill climbing;
- simulated annealing;
- busca tabu;
- algoritmos genéticos;
- local beam search.

Relação com ML:

- descida do gradiente é uma busca local em espaço contínuo;
- ajuste de hiperparâmetros pode ser feito por vizinhança;
- busca tabu e simulated annealing podem ser aplicadas em espaços discretos ou mistos.

## 7. Monte Carlo Tree Search (MCTS)

MCTS é uma busca em árvore baseada em simulações. A ideia geral:

1. **Selection:** descer pela árvore escolhendo ações promissoras.
2. **Expansion:** adicionar um novo nó.
3. **Simulation/Rollout:** simular consequências.
4. **Backpropagation:** atualizar estatísticas dos nós visitados.

O algoritmo equilibra exploração e explotação. Em jogos, cada nó é um estado do
jogo e cada aresta é uma ação.

Aplicações:

- jogos de tabuleiro;
- planejamento;
- decisão sequencial;
- síntese de programas;
- busca guiada por modelos neurais.

O caso AlphaGo tornou MCTS famoso porque combinou redes neurais profundas com
busca em árvore. Redes de política ajudam a escolher ações promissoras; redes de
valor ajudam a estimar a qualidade de estados.

## 8. Busca em IA clássica vs HPO

Comparação útil:

| IA clássica | HPO / ML |
|---|---|
| estado | configuração de hiperparâmetros |
| ação | mudança em uma configuração |
| custo de caminho | custo/erro acumulado ou score |
| heurística | modelo substituto, prior ou métrica parcial |
| expansão de nós | avaliação de candidatos |
| objetivo | solução, caminho ou política |
| orçamento | memória, tempo, avaliações |

## 9. Onde isso aparece hoje?

Mesmo com deep learning, busca clássica não desapareceu. Ela aparece em:

- planejamento robótico;
- jogos com redes neurais;
- decodificação de modelos generativos;
- raciocínio em LLMs;
- sistemas de recomendação com exploração;
- AutoML e NAS;
- busca por programas;
- otimização combinatória.

## 10. Mensagem didática

Para os alunos, a ponte importante é:

> A ideia de busca é anterior ao machine learning moderno. O que muda em ML é que
> muitas vezes a função objetivo vem de dados, é cara, ruidosa e não tem forma
> analítica simples.

Isso ajuda a conectar BFS/A*/MCTS com grid/random/Bayesian optimization/Hyperband.
