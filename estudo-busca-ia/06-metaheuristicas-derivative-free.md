# 06. Metaheurísticas e otimização sem derivada

Muitos problemas de IA e ML não têm gradiente disponível ou confiável. Isso ocorre
em hiperparâmetros categóricos, pipelines, arquitetura, simulações, métricas não
diferenciáveis e funções caixa-preta.

Nesses casos, entram métodos de **derivative-free optimization** e metaheurísticas.

## 1. O que é uma metaheurística?

Uma metaheurística é uma estratégia geral para explorar espaços de busca difíceis.
Ela não garante ótimo global na maioria dos casos, mas costuma encontrar soluções
boas em tempo razoável.

Características:

- pouca suposição sobre a função objetivo;
- aplicável a muitos problemas;
- frequentemente estocástica;
- pode lidar com mínimos locais;
- geralmente precisa de orçamento experimental.

## 2. Hill climbing

Hill climbing mantém uma solução atual e move para um vizinho melhor.

Pseudocódigo:

```text
solução = inicial
enquanto houver vizinho melhor:
  solução = melhor vizinho
retorne solução
```

Vantagens:

- muito simples;
- barato por iteração;
- boa introdução a busca local.

Limitações:

- prende em mínimos locais;
- sofre em platôs;
- depende da vizinhança;
- depende da inicialização.

Variações:

- random-restart hill climbing;
- steepest ascent/descent;
- first improvement;
- stochastic hill climbing.

## 3. Random restart

Uma forma simples de reduzir o problema de mínimos locais é reiniciar várias vezes:

```text
melhor = vazio
para i em 1..R:
  solução = hill_climbing(inicial aleatório)
  atualize melhor
```

É uma ideia simples, mas muito importante. Vários métodos modernos usam alguma
forma de múltiplos inícios, população ou reinicialização.

## 4. Simulated annealing

Simulated annealing modifica a busca local permitindo aceitar movimentos piores.

Probabilidade típica:

```text
P(aceitar piora) = exp(-delta / T)
```

Onde:

- `delta` é o quanto piorou;
- `T` é a temperatura.

Com temperatura alta, o algoritmo explora. Com temperatura baixa, torna-se mais
ganancioso.

Quando usar:

- espaços combinatórios;
- problemas com muitos mínimos locais;
- quando vizinhança é fácil de definir.

Cuidados:

- escolher schedule de temperatura;
- definir número de iterações por temperatura;
- balancear exploração e convergência.

## 5. Busca tabu

Busca tabu mantém memória de movimentos ou soluções recentes para evitar ciclos.

Componentes:

- solução atual;
- vizinhança;
- lista tabu;
- melhor solução global;
- critério de aspiração.

Critério de aspiração:

```text
mesmo se um movimento é tabu, aceite se ele melhora o melhor global
```

Boa para:

- problemas combinatórios;
- escalonamento;
- roteamento;
- seleção de features;
- configuração discreta.

## 6. Algoritmos genéticos

Algoritmos genéticos trabalham com população.

Fluxo:

```text
inicializar população
avaliar fitness
repetir:
  selecionar pais
  aplicar crossover
  aplicar mutação
  avaliar filhos
  formar nova população
```

Operadores:

- seleção por torneio;
- roleta;
- elitismo;
- crossover de um ponto, dois pontos ou uniforme;
- mutação;
- reparo de soluções inválidas.

Aplicações em ML:

- seleção de features;
- seleção de arquitetura;
- otimização de hiperparâmetros;
- evolução de políticas;
- neuroevolução;
- otimização multiobjetivo.

## 7. Genetic Programming

Genetic Programming evolui programas, expressões ou árvores.

Aplicações:

- regressão simbólica;
- construção de features;
- pipelines de ML;
- regras de decisão;
- programas pequenos.

Exemplo associado a AutoML:

- TPOT usa programação genética para explorar pipelines de ML.

## 8. Evolution Strategies

Evolution Strategies são métodos evolutivos voltados a otimização contínua.

Ideia:

- amostrar perturbações;
- avaliar candidatos;
- mover distribuição para regiões melhores.

Em deep learning e RL, evolution strategies também foram exploradas como alternativa
ou complemento ao gradiente, especialmente quando o sinal de recompensa é ruidoso
ou a diferenciação é difícil.

## 9. CMA-ES

CMA-ES adapta uma distribuição normal multivariada. Ela aprende:

- média da distribuição;
- escala global;
- covariância entre dimensões.

Por que isso importa?

Se duas dimensões interagem, uma busca independente por coordenada pode ser ruim.
CMA-ES aprende direções promissoras no espaço.

Boa escolha quando:

- variáveis são contínuas;
- função é não convexa;
- não há gradiente;
- dimensão é moderada;
- avaliações não são absurdamente caras.

## 10. Differential Evolution

Differential Evolution usa diferenças entre indivíduos para propor novos pontos.

Pseudointuição:

```text
mutante = a + F * (b - c)
trial = crossover(mutante, alvo)
se trial é melhor, substitui alvo
```

Vantagens:

- simples;
- robusto;
- global;
- bom para funções multimodais contínuas.

Hiperparâmetros do método:

- tamanho da população;
- fator de mutação `F`;
- taxa de crossover `CR`;
- estratégia de mutação.

## 11. Particle Swarm Optimization

PSO é inspirado por comportamento coletivo.

Cada partícula atualiza sua velocidade com base em:

- inércia;
- melhor posição pessoal;
- melhor posição do grupo.

Fórmula conceitual:

```text
velocidade = inércia
           + atração para melhor pessoal
           + atração para melhor global
posição = posição + velocidade
```

Boa para:

- otimização contínua;
- demonstrações visuais;
- problemas com avaliação relativamente barata.

Cuidados:

- convergência prematura;
- ajuste de inércia e coeficientes;
- tratamento de bounds.

## 12. Ant Colony Optimization

Ant Colony Optimization é mais comum em problemas combinatórios como rotas.

Ideia:

- soluções são construídas passo a passo;
- caminhos bons recebem mais feromônio;
- evaporação reduz influência antiga;
- combina reforço positivo e exploração.

Aplicações:

- traveling salesman problem;
- roteamento;
- escalonamento;
- seleção de features;
- problemas discretos de configuração.

## 13. Harmony Search, Firefly, Bat, etc.

Há muitas metaheurísticas inspiradas em fenômenos naturais. Algumas são usadas em
trabalhos aplicados, mas é importante ser crítico.

Perguntas para avaliar uma metaheurística:

- Ela melhora sobre random search forte?
- Foi comparada com orçamento igual?
- Há ablação dos componentes?
- A implementação é reprodutível?
- Funciona em benchmarks diversos?
- Ou só em poucos problemas escolhidos?

Para aula de graduação, vale mencionar que existem muitas, mas enfatizar as mais
consolidadas: simulated annealing, tabu, genéticos, differential evolution, CMA-ES
e PSO.

## 14. Direct search

Direct search não usa derivadas e geralmente explora padrões geométricos locais.

Métodos:

- Nelder-Mead;
- pattern search;
- Powell;
- coordinate search;
- COBYLA.

Bom para:

- baixa ou média dimensão;
- funções suaves mas sem gradiente;
- problemas com custo moderado;
- otimização local.

Ruim para:

- espaços categóricos complexos;
- alta dimensão;
- funções muito ruidosas;
- busca global ampla.

## 15. Multi-start e híbridos

Na prática, métodos híbridos são comuns:

- random search para inicializar Bayesian optimization;
- genetic algorithm com busca local;
- Hyperband com TPE;
- evolutionary search com weight sharing;
- MCTS com rede neural;
- simulated annealing com tabu;
- CMA-ES com restarts.

Boa ideia didática:

> Algoritmos reais frequentemente combinam uma estratégia de exploração ampla com
> uma estratégia de refinamento local.

## 16. Quando metaheurísticas fazem sentido em ML?

Fazem sentido quando:

- não há gradiente;
- o espaço é discreto, misto ou condicional;
- a métrica é não diferenciável;
- há múltiplos objetivos;
- queremos explorar arquiteturas;
- o problema é combinatório;
- queremos baseline sem muitas suposições.

Podem ser ruins quando:

- cada avaliação é extremamente cara;
- há algoritmo model-based mais eficiente;
- o espaço é grande demais sem estrutura;
- não há orçamento suficiente para população;
- o método tem muitos hiperparâmetros próprios.

## 17. Comparação rápida

| Método | Tipo | Exploração | Exige gradiente | Bom para |
|---|---|---:|---:|---|
| Hill climbing | local | baixa | não | vizinhança simples |
| Simulated annealing | local estocástico | média | não | mínimos locais |
| Tabu | local com memória | média | não | combinatório |
| Genético | populacional | alta | não | misto, discreto, NAS |
| CMA-ES | populacional contínuo | média/alta | não | contínuo não convexo |
| Differential Evolution | populacional contínuo | alta | não | multimodal contínuo |
| PSO | enxame contínuo | média/alta | não | contínuo intuitivo |
| Nelder-Mead | direct local | baixa | não | baixa dimensão |

## 18. Mensagem didática

Metaheurísticas são úteis porque muitos problemas reais não são bonitos:

- não são convexos;
- não são diferenciáveis;
- não são baratos;
- não são contínuos;
- não são determinísticos.

Mas elas devem ser comparadas contra baselines fortes. Em HPO, random search,
TPE, Hyperband/ASHA e BOHB são pontos de comparação importantes.
