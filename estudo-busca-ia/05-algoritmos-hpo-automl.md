# 05. Algoritmos para HPO e AutoML

Este arquivo lista famílias de algoritmos para busca de hiperparâmetros e AutoML,
incluindo vários além dos que aparecem no app inicial.

## 1. Grid search

Grid search testa todas as combinações em uma grade pré-definida.

Exemplo:

```text
learning_rate = [1e-4, 1e-3, 1e-2]
batch_size = [32, 64, 128]
dropout = [0.0, 0.2, 0.5]

total = 3 * 3 * 3 = 27 trials
```

Vantagens:

- simples;
- reprodutível;
- fácil de explicar;
- bom para poucos hiperparâmetros discretos.

Desvantagens:

- explode combinatoriamente;
- desperdiça avaliações em dimensões pouco importantes;
- ruim para variáveis contínuas;
- exige discretização manual.

Quando usar:

- aula introdutória;
- baseline;
- poucos parâmetros;
- quando valores já são bem conhecidos.

## 2. Random search

Random search amostra configurações aleatórias a partir de distribuições.

Vantagens:

- simples;
- paralelizável;
- geralmente melhor que grid quando poucas dimensões importam;
- permite distribuições logarítmicas;
- forte baseline.

Desvantagens:

- não aprende com resultados anteriores;
- pode desperdiçar trials em regiões ruins;
- não refina sistematicamente uma região promissora.

Ideia importante do paper de Bergstra e Bengio: se só alguns hiperparâmetros são
realmente importantes, grid search desperdiça muitas avaliações repetindo valores
dos parâmetros irrelevantes, enquanto random search cobre melhor os valores dos
parâmetros importantes.

## 3. Latin Hypercube Sampling e Quasi-Monte Carlo

Esses métodos tentam cobrir o espaço melhor que amostragem aleatória pura.

Latin Hypercube:

- divide cada dimensão em faixas;
- garante cobertura marginal melhor;
- útil para inicialização de populações ou HPO simples.

Quasi-Monte Carlo:

- usa sequências de baixa discrepância, como Sobol ou Halton;
- busca cobertura uniforme do espaço;
- pode ser uma opção forte antes de usar métodos mais complexos.

Vantagens:

- simples;
- boa cobertura inicial;
- paralelizável.

Desvantagens:

- não usa feedback de avaliações;
- pode ser menos adequado para espaços condicionais complexos.

## 4. Bayesian Optimization

Bayesian optimization trata a função objetivo como caixa-preta cara. Ela mantém
um modelo probabilístico aproximado da função e escolhe novos pontos por uma
função de aquisição.

Fluxo:

```text
1. Avaliar alguns pontos iniciais
2. Ajustar modelo substituto
3. Usar função de aquisição para escolher próximo ponto
4. Avaliar ponto
5. Atualizar modelo
6. Repetir
```

Componentes:

- **surrogate model:** modelo da função objetivo;
- **acquisition function:** regra para escolher próximo ponto;
- **histórico:** pares configuração-score já observados.

Funções de aquisição comuns:

- Expected Improvement (EI);
- Probability of Improvement (PI);
- Upper Confidence Bound (UCB);
- Thompson sampling;
- entropy search e variações.

Vantagens:

- eficiente quando avaliações são caras;
- usa informação acumulada;
- bom para dezenas ou centenas de trials.

Desvantagens:

- pode escalar mal em muitas dimensões;
- implementação mais complexa;
- paralelismo exige adaptações;
- modelos substitutos podem sofrer com espaços categóricos/condicionais.

## 5. Gaussian Process Bayesian Optimization

Gaussian Process (GP) é o surrogate clássico de Bayesian optimization.

Ele fornece:

- média prevista;
- incerteza da previsão;
- forma natural de equilibrar exploração e explotação.

Bom para:

- espaços contínuos de baixa ou média dimensão;
- avaliações caras;
- funções relativamente suaves.

Limitações:

- custo cresce com número de observações;
- lida pior com muitos categóricos;
- lida pior com espaços altamente condicionais;
- pode ser pesado para muitos trials.

## 6. TPE: Tree-structured Parzen Estimator

TPE é uma alternativa de Bayesian optimization muito usada em HPO.

Em vez de modelar diretamente `p(y | x)`, ele modela distribuições de bons e maus
hiperparâmetros:

```text
l(x): distribuição dos bons pontos
g(x): distribuição dos demais pontos
```

A busca favorece configurações mais prováveis em `l(x)` do que em `g(x)`.

Vantagens:

- funciona bem em espaços mistos;
- lida com condicionais;
- popular em Hyperopt e Optuna;
- bom padrão prático para muitos problemas.

Desvantagens:

- depende de escolhas internas como quantil;
- pode precisar de trials iniciais aleatórios;
- nem sempre modela interações complexas perfeitamente.

## 7. SMAC

SMAC significa Sequential Model-Based Algorithm Configuration.

Ele usa modelos substitutos, tradicionalmente Random Forests, para modelar a
performance de configurações. É muito associado a configuração automática de
algoritmos e AutoML.

Vantagens:

- bom para espaços categóricos, inteiros e condicionais;
- forte em configuração de algoritmos;
- base importante para Auto-WEKA e AutoML clássico.

Desvantagens:

- mais complexo;
- depende da qualidade do modelo substituto;
- pode exigir ajustes para ambientes muito distribuídos.

## 8. Successive Halving

Successive Halving avalia muitos candidatos com pouco recurso e mantém apenas os
melhores para rodadas seguintes.

Exemplo:

```text
Rodada 1: 81 candidatos com 1 época
Rodada 2: 27 candidatos com 3 épocas
Rodada 3: 9 candidatos com 9 épocas
Rodada 4: 3 candidatos com 27 épocas
Rodada 5: 1 candidato com 81 épocas
```

Vantagens:

- economiza recurso;
- simples;
- bom quando desempenho inicial prediz desempenho futuro.

Desvantagens:

- pode eliminar candidatos que aprendem devagar;
- depende da escolha de recurso mínimo e fator;
- exige métrica intermediária.

## 9. Hyperband

Hyperband generaliza Successive Halving testando diferentes agressividades de
alocação de recurso.

Ideia:

- algumas rodadas começam com muitos candidatos e pouco recurso;
- outras começam com menos candidatos e mais recurso;
- isso reduz a sensibilidade a uma única escolha de orçamento inicial.

Vantagens:

- forte baseline multi-fidelity;
- bom para deep learning;
- pode acelerar HPO em ordem de grandeza;
- não exige modelo substituto.

Desvantagens:

- amostragem inicial geralmente é aleatória;
- não usa feedback para escolher novos candidatos de forma modelada;
- depende de avaliação parcial ser informativa.

## 10. ASHA

ASHA significa Asynchronous Successive Halving Algorithm.

Ele adapta Successive Halving para ambientes distribuídos e assíncronos. Em vez
de esperar todos os trials de uma rodada terminarem, vai promovendo candidatos
conforme resultados chegam.

Vantagens:

- escala bem com muitos workers;
- evita ociosidade;
- muito usado em sistemas distribuídos;
- bom quando trials têm durações diferentes.

Desvantagens:

- comparações assíncronas podem ser mais ruidosas;
- ainda depende da qualidade dos sinais parciais.

## 11. BOHB

BOHB combina Bayesian optimization com Hyperband.

Ideia:

- Hyperband faz alocação multi-fidelity de recursos;
- um modelo tipo TPE guia a escolha de configurações;
- busca equilibrar bom desempenho a qualquer momento e convergência eficiente.

Vantagens:

- combina exploração ampla com aprendizado sobre boas regiões;
- forte em muitos benchmarks;
- bom para deep learning e HPO caro.

Desvantagens:

- mais complexo;
- precisa de implementação cuidadosa;
- herda limitações de sinais multi-fidelity.

## 12. Population Based Training (PBT)

PBT treina uma população de modelos simultaneamente. Periodicamente:

1. modelos ruins copiam pesos de modelos bons;
2. seus hiperparâmetros são perturbados;
3. o treinamento continua.

Diferença importante:

> PBT não busca apenas um valor fixo de hiperparâmetro. Ele pode descobrir schedules
> ao longo do treinamento.

Exemplo:

- taxa de aprendizado começa alta;
- depois diminui;
- dropout muda durante o treinamento;
- exploração continua enquanto o modelo aprende.

Vantagens:

- bom para treinamento longo;
- bom para deep RL;
- aprende schedules;
- aproveita pesos já treinados.

Desvantagens:

- exige treinamento distribuído;
- mais difícil de reproduzir;
- mais complexo de implementar;
- pode ser caro.

## 13. Algoritmos evolutivos

Algoritmos evolutivos mantêm uma população de soluções e aplicam seleção, mutação
e recombinação.

Famílias:

- Genetic Algorithms;
- Evolution Strategies;
- Genetic Programming;
- Differential Evolution;
- CMA-ES;
- NSGA-II para multiobjetivo.

Vantagens:

- robustos em espaços irregulares;
- não precisam de gradiente;
- lidam com múltiplas soluções simultâneas;
- paralelizáveis;
- aplicáveis a NAS e AutoML.

Desvantagens:

- podem exigir muitas avaliações;
- há muitos hiperparâmetros do próprio algoritmo;
- convergência pode ser lenta.

## 14. CMA-ES

CMA-ES é uma estratégia evolutiva para otimização contínua sem derivadas. Ela
amostra candidatos de uma distribuição normal multivariada e adapta a matriz de
covariância.

Intuição:

- se bons candidatos aparecem em uma direção, aumente a variância naquela direção;
- aprenda a escala e correlação entre dimensões;
- mova a distribuição para regiões melhores.

Bom para:

- funções contínuas;
- não convexas;
- com interações entre variáveis;
- quando gradientes não existem ou não são confiáveis.

Limitações:

- pode ser caro em alta dimensão;
- menos natural para muitos categóricos;
- precisa de bounds e tratamento de restrições.

## 15. Differential Evolution

Differential Evolution é uma metaheurística populacional para espaços contínuos.
Ela cria novos candidatos combinando diferenças entre membros da população.

Ideia simplificada:

```text
novo = melhor + F * (individuo_a - individuo_b)
```

Depois aplica crossover e seleção.

Vantagens:

- simples;
- robusto;
- sem gradiente;
- bom para funções multimodais.

Desvantagens:

- pode exigir muitas avaliações;
- desempenho depende de população, mutação e recombinação;
- menos eficiente quando avaliações são extremamente caras.

## 16. Particle Swarm Optimization (PSO)

PSO mantém partículas no espaço de busca. Cada partícula tem posição e velocidade,
e é atraída por:

- seu melhor ponto individual;
- o melhor ponto do grupo ou vizinhança.

Vantagens:

- simples de explicar;
- busca populacional;
- sem gradiente;
- intuitivo para espaços contínuos.

Desvantagens:

- sensível a hiperparâmetros;
- pode convergir prematuramente;
- menos usado em HPO moderno do que TPE/BO/Hyperband, mas ainda relevante.

## 17. Simulated Annealing

Simulated annealing aceita ocasionalmente movimentos piores para escapar de
mínimos locais. A probabilidade de aceitar piora diminui com a “temperatura”.

Ideia:

```text
temperatura alta -> aceita mais exploração
temperatura baixa -> fica mais seletivo
```

Vantagens:

- simples;
- aplicável a espaços discretos e contínuos;
- escapa de mínimos locais.

Desvantagens:

- depende muito do schedule de temperatura;
- pode ser lento;
- não usa modelo da função objetivo.

## 18. Busca tabu

Busca tabu é uma busca local com memória. Ela evita retornar a soluções ou regiões
recentemente visitadas.

Componentes:

- vizinhança;
- lista tabu;
- critério de aspiração;
- melhor solução global observada.

Vantagens:

- reduz ciclos;
- boa para espaços combinatórios;
- fácil de conectar com mínimos locais.

Desvantagens:

- depende da definição de vizinhança;
- tamanho da memória importa;
- pode exigir muitos ajustes.

## 19. Nelder-Mead e direct search

Nelder-Mead mantém um simplex de `n + 1` pontos em `n` dimensões. Ele transforma
esse simplex por reflexão, expansão, contração e encolhimento.

Vantagens:

- não precisa de gradiente;
- bom para baixa dimensão;
- útil quando avaliações são moderadamente caras.

Desvantagens:

- busca local;
- pode falhar em alta dimensão;
- sensível à escala das variáveis;
- não é ideal para categóricos.

Outros métodos direct search:

- pattern search;
- coordinate search;
- Powell;
- COBYLA para restrições.

## 20. Racing algorithms

Racing elimina candidatos ruins usando testes estatísticos ou comparações
progressivas.

Ideia:

- avalie candidatos em instâncias/folds/recursos;
- elimine quem está claramente pior;
- continue avaliando candidatos promissores.

Racing é útil quando há múltiplas instâncias de problema ou folds e queremos
economizar avaliação.

## 21. Multiobjetivo: NSGA-II, NSGA-III e Pareto

Quando há múltiplos objetivos, não existe um único “melhor” ponto. Exemplo:

```text
maximizar acurácia
minimizar latência
minimizar memória
```

Em vez de uma solução, buscamos uma fronteira de Pareto: soluções em que melhorar
um objetivo piora outro.

Métodos comuns:

- NSGA-II;
- NSGA-III;
- MO-CMA-ES;
- Bayesian optimization multiobjetivo;
- scalarization;
- constraints.

## 22. Neural Architecture Search (NAS)

NAS automatiza a busca por arquiteturas de redes neurais.

Três componentes:

- **search space:** quais arquiteturas são permitidas;
- **search strategy:** como explorar;
- **performance estimation:** como estimar qualidade sem treinar tudo completamente.

Estratégias:

- reinforcement learning;
- evolução;
- Bayesian optimization;
- busca diferenciável;
- weight sharing;
- preditores de desempenho.

Exemplos:

- NAS com reinforcement learning;
- ENAS com compartilhamento de pesos;
- DARTS com relaxação contínua;
- regularized evolution.

Cuidados:

- NAS pode ser extremamente caro;
- resultados podem depender de benchmark;
- weight sharing pode introduzir vieses;
- comparação justa exige orçamento claro.

## 23. AutoML e CASH

AutoML amplia HPO para escolher também:

- pré-processamento;
- features;
- algoritmo;
- hiperparâmetros;
- ensemble;
- validação.

O problema CASH combina seleção de algoritmo e hiperparâmetros:

```text
escolher algoritmo + configurar hiperparâmetros
```

Exemplo:

```text
pipeline:
  imputador
  normalizador
  seletor de atributos
  modelo
  hiperparâmetros do modelo
```

Sistemas associados:

- Auto-WEKA;
- auto-sklearn;
- TPOT;
- Hyperopt-sklearn;
- AutoGluon;
- Auto-PyTorch.

## 24. Como escolher uma família de algoritmo?

| Situação | Boas opções |
|---|---|
| poucos hiperparâmetros discretos | grid, random |
| baseline forte e barato | random, quasi-Monte Carlo |
| avaliações caras e baixa dimensão | Bayesian optimization com GP |
| espaço misto/condicional | TPE, SMAC, Optuna |
| deep learning com muitas épocas | Hyperband, ASHA, BOHB |
| treinamento distribuído e schedules | PBT |
| função contínua sem gradiente | CMA-ES, differential evolution, PSO |
| espaço combinatório | tabu, simulated annealing, genético |
| múltiplos objetivos | NSGA-II, NSGA-III, BO multiobjetivo |
| arquitetura neural | NAS, evolução, DARTS, ENAS |
| pipeline completo | AutoML, CASH |

## 25. Mensagem didática

Não existe algoritmo universalmente melhor. A escolha depende de:

- custo de avaliação;
- tipo do espaço;
- número de dimensões;
- ruído;
- paralelismo;
- necessidade de early stopping;
- métrica;
- restrições;
- maturidade da implementação.

Para ensino, uma boa sequência é:

```text
grid -> random -> local search -> Bayesian optimization -> Hyperband/ASHA -> evolutivos/PBT/NAS
```
