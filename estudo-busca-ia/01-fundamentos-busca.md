# 01. Fundamentos de busca e otimização

## 1. O que é busca?

Busca é o processo de explorar um conjunto de possibilidades para encontrar uma
solução que atende a algum critério. Esse critério pode ser:

- chegar a um estado objetivo;
- minimizar uma função de custo;
- maximizar uma recompensa;
- minimizar erro de validação;
- encontrar uma solução aceitável antes de acabar o orçamento.

Na IA clássica, o espaço costuma ser descrito como um conjunto de estados e ações.
Em machine learning, o espaço geralmente é um conjunto de vetores de parâmetros,
hiperparâmetros, arquiteturas ou pipelines.

## 2. Componentes de um problema de busca

Um problema de busca costuma ter:

- **Representação:** como uma solução é descrita.
- **Espaço de busca:** conjunto de todas as soluções candidatas.
- **Estado inicial:** ponto de partida, quando existe.
- **Operadores ou movimentos:** como gerar novas soluções.
- **Função objetivo:** como medir qualidade, custo, perda ou recompensa.
- **Critério de parada:** quando encerrar a busca.
- **Orçamento:** limite de tempo, memória, avaliações, épocas, dados ou dinheiro.

Exemplo simples:

```text
Problema: ajustar uma reta y = ax + b
Representação: vetor [a, b]
Espaço: todos os pares possíveis de inclinação e intercepto
Função objetivo: erro médio quadrático
Movimento: mudar a e b
Objetivo: minimizar o erro
```

Exemplo em hiperparâmetros:

```text
Problema: configurar uma Random Forest
Representação: {n_estimators, max_depth, max_features, min_samples_leaf}
Espaço: combinações possíveis desses valores
Função objetivo: erro de validação
Movimento: testar outra configuração
Objetivo: achar boa configuração com poucas avaliações
```

## 3. Espaços discretos, contínuos e mistos

O espaço de busca pode ser:

- **Discreto:** número de camadas, tipo de ativação, algoritmo escolhido.
- **Contínuo:** taxa de aprendizado, regularização, dropout.
- **Inteiro:** número de árvores, tamanho de batch, número de vizinhos.
- **Condicional:** só existe `dropout_rate` se `use_dropout = true`.
- **Hierárquico:** escolher um modelo ativa hiperparâmetros específicos daquele modelo.
- **Misto:** combina variáveis contínuas, inteiras, categóricas e condicionais.

Isso é importante porque nem todo algoritmo lida bem com todo tipo de espaço.
Gradiente funciona naturalmente em espaços contínuos diferenciáveis. TPE e SMAC
funcionam melhor em espaços mistos e condicionais. Grid search é simples, mas
explode rápido. Algoritmos evolutivos lidam bem com espaços irregulares, mas
podem exigir muitas avaliações.

## 4. Busca global e busca local

Uma busca **local** explora a vizinhança de uma solução atual. Exemplos:

- hill climbing;
- descida do gradiente;
- busca tabu;
- simulated annealing;
- Nelder-Mead;
- coordinate descent.

Uma busca **global** tenta cobrir regiões mais amplas do espaço. Exemplos:

- busca aleatória;
- algoritmos genéticos;
- differential evolution;
- particle swarm optimization;
- CMA-ES;
- Bayesian optimization;
- Hyperband;
- MCTS em árvores de decisão.

Na prática, muitos métodos misturam as duas coisas. Um algoritmo genético faz
exploração global por população, mas também pode convergir localmente. Bayesian
optimization alterna exploração e explotação via função de aquisição.
Hyperband começa amplo e vai concentrando recursos nos candidatos melhores.

## 5. Mínimo local e mínimo global

Em otimização, normalmente queremos minimizar uma função:

```text
min_x f(x)
```

Um **mínimo global** é o melhor ponto de todo o espaço:

```text
f(x*) <= f(x), para todo x no espaço
```

Um **mínimo local** é melhor apenas que seus vizinhos:

```text
f(x*) <= f(x), para x perto de x*
```

Em machine learning, muitas superfícies de perda são não convexas, ruidosas e
altamente dimensionais. Isso significa que:

- pode haver muitos vales;
- a inicialização importa;
- o tamanho do passo importa;
- a superfície observada pode ter ruído;
- o melhor ponto no conjunto de validação pode não generalizar.

## 6. Exploração e explotação

Um dos dilemas centrais em busca é:

- **Exploração:** testar regiões ainda pouco conhecidas.
- **Explotação:** insistir em regiões que já parecem boas.

Busca aleatória explora bastante, mas usa pouco conhecimento acumulado. Busca
local explota muito, mas pode prender cedo. Bayesian optimization tenta escolher
o próximo ponto equilibrando incerteza e promessa. Algoritmos evolutivos mantêm
diversidade para não colapsar cedo. Bandits alocam mais recursos para opções
promissoras, mas ainda preservam alguma exploração.

## 7. Dimensionalidade e explosão combinatória

Se cada hiperparâmetro tem 10 valores possíveis:

```text
d = 2  -> 10^2  = 100 combinações
d = 6  -> 10^6  = 1.000.000 combinações
d = 18 -> 10^18 combinações
```

Esse crescimento exponencial aparece em:

- seleção de hiperparâmetros;
- seleção de features;
- busca por arquiteturas;
- planejamento;
- jogos;
- geração de sequências;
- busca por políticas em aprendizado por reforço.

Por isso, testar tudo geralmente não é uma opção.

## 8. Função objetivo como caixa-preta

Em HPO, a função objetivo costuma ser uma caixa-preta:

```text
configuração de hiperparâmetros -> treinar modelo -> validar -> score
```

Você fornece uma configuração e observa um resultado. Mas normalmente:

- não há fórmula fechada;
- não há gradiente direto;
- a avaliação é cara;
- a avaliação tem ruído;
- o custo varia entre configurações;
- o espaço pode ser condicional.

Isso explica por que tantos métodos de HPO vêm da área de **black-box optimization**
e **derivative-free optimization**.

## 9. Ruído e aleatoriedade

Em ML, duas avaliações da mesma configuração podem dar resultados diferentes por:

- inicialização aleatória;
- ordem dos batches;
- divisão treino/validação;
- data augmentation;
- paralelismo não determinístico;
- ambiente de hardware/software;
- número pequeno de épocas;
- conjuntos de validação pequenos.

Consequências:

- o melhor observado pode ser apenas sorte;
- comparar algoritmos com uma única semente é frágil;
- early stopping pode eliminar uma configuração que melhoraria depois;
- repetir trials reduz variância, mas aumenta custo.

## 10. O que torna uma busca difícil?

Uma busca fica difícil quando há:

- espaço grande;
- muitas dimensões;
- variáveis mistas;
- dependências condicionais;
- muitos mínimos locais;
- função objetivo cara;
- função objetivo ruidosa;
- restrições;
- múltiplos objetivos;
- avaliações paralelas;
- necessidade de parar cedo;
- risco de overfitting no processo de seleção.

Esse é exatamente o cenário comum em IA moderna.

## 11. Vocabulário essencial

- **Candidato:** uma solução testável.
- **Trial:** uma avaliação de uma configuração.
- **Fitness:** qualidade de uma solução, termo comum em algoritmos evolutivos.
- **Loss/perda:** valor a minimizar durante treinamento ou validação.
- **Score:** métrica a maximizar ou minimizar.
- **Surrogate model:** modelo aproximado da função objetivo.
- **Acquisition function:** regra que escolhe o próximo ponto em Bayesian optimization.
- **Budget:** recurso limitado usado na busca.
- **Fidelity:** nível de aproximação da avaliação, como poucas épocas ou subconjunto dos dados.
- **Pruning/early stopping:** interrupção antecipada de candidatos ruins.
- **CASH:** Combined Algorithm Selection and Hyperparameter optimization.

## 12. Ideia para explicar em aula

Uma boa analogia é pensar no espaço de busca como um mapa com vales e montanhas:

- cada ponto é uma solução;
- a altura é o erro;
- queremos achar vales baixos;
- só podemos medir alguns pontos;
- algumas medições são caras;
- o mapa pode ter muitas dimensões;
- alguns vales parecem bons de perto, mas não são os melhores.

Essa analogia conecta diretamente a demonstração 2D, mínimos locais, superfície 3D
e busca de hiperparâmetros.
