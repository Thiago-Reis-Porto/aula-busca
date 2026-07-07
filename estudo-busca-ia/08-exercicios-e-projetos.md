# 08. Exercícios e projetos

Este arquivo reúne ideias de exercícios para casa, laboratório e projetos curtos.

## 1. Exercício base: Rastrigin em 10 dimensões

Problema:

Minimizar a função de Rastrigin em 10 dimensões.

```text
f(x) = A*n + sum_i [x_i^2 - A*cos(2*pi*x_i)]
A = 10
x_i em [-5.12, 5.12]
```

Objetivo:

- implementar pelo menos dois algoritmos do zero;
- comparar com o mesmo orçamento de avaliações;
- plotar melhor valor encontrado ao longo do tempo.

Algoritmos sugeridos:

- busca aleatória;
- hill climbing com random restart;
- simulated annealing;
- busca tabu;
- algoritmo genético;
- differential evolution simplificado;
- PSO simplificado.

Entrega:

- código;
- gráfico de convergência;
- tabela de resultados;
- análise curta.

Perguntas para responder:

- Qual algoritmo encontrou melhor solução?
- Qual foi mais estável?
- Qual foi mais sensível à inicialização?
- O que aconteceu quando aumentou a dimensão?
- O que aconteceu quando reduziu o orçamento?

## 2. Exercício: busca aleatória vs grid search

Problema:

Otimizar hiperparâmetros de um modelo simples, como Random Forest ou SVM.

Tarefa:

- definir uma grade;
- definir distribuições aleatórias equivalentes;
- rodar grid search e random search com orçamento comparável;
- comparar resultados.

Pontos didáticos:

- grid search testa combinações fixas;
- random search cobre melhor parâmetros contínuos;
- orçamento deve ser igual ou comparável.

## 3. Exercício: learning rate em rede neural pequena

Problema:

Treinar uma MLP em MNIST, Fashion-MNIST ou dataset tabular simples.

Hiperparâmetros:

- learning rate;
- batch size;
- dropout;
- número de camadas;
- unidades por camada;
- weight decay.

Tarefa:

- rodar random search;
- usar escala logarítmica para learning rate;
- aplicar early stopping;
- plotar curva de aprendizado dos melhores trials.

Perguntas:

- O melhor learning rate está em qual ordem de grandeza?
- Dropout ajudou ou atrapalhou?
- Batch size afetou estabilidade?
- Os melhores trials tiveram treinamento estável?

## 4. Exercício: implementação de busca tabu

Problema:

Selecionar subconjunto de features para um classificador.

Representação:

```text
vetor binário de tamanho d
1 = feature usada
0 = feature removida
```

Vizinhança:

- inverter um bit;
- trocar uma feature dentro por uma fora.

Função objetivo:

```text
erro de validação + penalidade por número de features
```

Tarefa:

- implementar busca local;
- implementar busca tabu;
- comparar.

Discussão:

- lista tabu evitou ciclos?
- a penalidade reduziu o número de features?
- houve trade-off entre simplicidade e desempenho?

## 5. Exercício: simulated annealing para seleção de features

Mesmo problema do exercício anterior, mas usando simulated annealing.

Variáveis:

- temperatura inicial;
- taxa de resfriamento;
- número de iterações;
- tipo de vizinho.

Perguntas:

- temperatura alta ajudou a escapar de mínimos locais?
- resfriamento rápido piorou resultados?
- como escolher temperatura inicial?

## 6. Exercício: algoritmo genético para hiperparâmetros

Problema:

Otimizar hiperparâmetros de uma árvore de decisão ou Random Forest.

Cromossomo:

```text
max_depth
min_samples_leaf
max_features
criterion
```

Operadores:

- seleção por torneio;
- crossover uniforme;
- mutação por parâmetro;
- elitismo.

Entrega:

- melhor score por geração;
- diversidade da população;
- comparação com random search.

Perguntas:

- o algoritmo convergiu cedo?
- mutação foi suficiente para manter diversidade?
- elitismo ajudou ou reduziu exploração?

## 7. Exercício: Hyperband conceitual

Implementar uma versão simplificada de Successive Halving.

Problema:

Treinar modelos por número crescente de épocas.

Fluxo:

```text
comece com N configurações
treine cada uma por poucas épocas
mantenha top 1/factor
aumente épocas
repita
```

Comparar com:

- random search com orçamento completo;
- random search com mesmo total de épocas.

Perguntas:

- early stopping economizou quanto?
- algum candidato eliminado cedo parecia promissor depois?
- qual fator funcionou melhor?

## 8. Exercício: Optuna na prática

Tarefa:

- escolher um dataset;
- definir pipeline;
- rodar Optuna com TPE;
- ativar pruning se o modelo permitir;
- visualizar importância dos hiperparâmetros.

Entrega:

- notebook;
- espaço de busca;
- número de trials;
- melhor configuração;
- gráfico de otimização;
- resultado em teste.

## 9. Exercício: multiobjetivo

Problema:

Escolher modelo considerando qualidade e latência.

Objetivos:

```text
maximizar F1
minimizar tempo de inferência
```

Tarefa:

- testar várias configurações;
- construir gráfico F1 vs latência;
- identificar fronteira de Pareto.

Perguntas:

- o modelo mais acurado é aceitável em latência?
- qual solução escolheria para produção?
- como justificaria o trade-off?

## 10. Projeto: mini AutoML

Construir um sistema simples que busca:

- pré-processamento;
- modelo;
- hiperparâmetros.

Modelos:

- Logistic Regression;
- k-NN;
- Random Forest;
- Gradient Boosting.

Pré-processamento:

- normalização sim/não;
- PCA sim/não;
- imputação simples.

Busca:

- random search;
- TPE via Optuna;
- algoritmo genético.

Entrega:

- comparação de algoritmos;
- melhor pipeline;
- análise de custo;
- resultado final em teste.

## 11. Projeto: NAS simplificado

Buscar arquiteturas MLP pequenas.

Espaço:

- número de camadas: 1 a 4;
- unidades por camada: 32 a 512;
- ativação: relu/tanh/gelu;
- dropout: 0 a 0.5;
- learning rate.

Algoritmos:

- random search;
- algoritmo genético;
- Hyperband ou successive halving.

Discussão:

- arquitetura maior sempre melhora?
- há overfitting?
- custo de treinamento aumentou quanto?

## 12. Rubrica sugerida

| Critério | Peso |
|---|---:|
| Implementação correta do algoritmo | 25% |
| Definição clara do espaço de busca | 15% |
| Comparação justa por orçamento | 20% |
| Visualizações e análise de convergência | 15% |
| Discussão crítica dos resultados | 15% |
| Reprodutibilidade e organização | 10% |

## 13. Regras para comparação justa

- Mesmo orçamento de avaliações.
- Mesma métrica.
- Mesma divisão de dados.
- Mesmas sementes quando fizer sentido.
- Mesmo limite de tempo ou mesma quantidade de recursos.
- Reportar média e desvio se houver repetição.

## 14. Perguntas de reflexão

- O algoritmo encontrou ótimo global ou apenas uma boa solução?
- Como você sabe?
- Qual foi o custo computacional?
- A solução é robusta?
- O espaço de busca escolhido era razoável?
- O resultado mudaria com outro conjunto de validação?
- O método escolhido foi melhor que random search?
- O ganho justifica a complexidade?

## 15. Sugestão de atividade em sala

Divida a turma em grupos:

- grupo 1: random search;
- grupo 2: hill climbing;
- grupo 3: simulated annealing;
- grupo 4: tabu;
- grupo 5: genético;
- grupo 6: PSO.

Todos otimizam a mesma função 2D ou 10D com o mesmo orçamento. No fim, cada grupo
mostra:

- melhor valor;
- trajetória;
- dificuldade;
- sensibilidade aos hiperparâmetros do algoritmo.

Isso torna visível que o algoritmo de busca também tem hiperparâmetros.
