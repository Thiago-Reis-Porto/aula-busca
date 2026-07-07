# Estudo: buscas em IA, machine learning e hiperparâmetros

Este diretório é um material de estudo para apoiar a aula sobre busca em espaços,
otimização e busca de hiperparâmetros em IA e machine learning.

O foco é dar uma visão conceitual e prática: o que está sendo buscado, como o
espaço é representado, por que a busca é difícil, quais algoritmos existem, quando
usar cada família e quais cuidados metodológicos importam em ML.

## Ordem sugerida

1. [Fundamentos de busca e otimização](./01-fundamentos-busca.md)
2. [Busca em espaço de estados na IA clássica](./02-busca-estado-planejamento-ia.md)
3. [Otimização em machine learning](./03-otimizacao-em-ml.md)
4. [Busca de hiperparâmetros](./04-busca-hiperparametros.md)
5. [Algoritmos para HPO e AutoML](./05-algoritmos-hpo-automl.md)
6. [Metaheurísticas e otimização sem derivada](./06-metaheuristicas-derivative-free.md)
7. [Ferramentas, prática e boas escolhas](./07-ferramentas-e-pratica.md)
8. [Exercícios e projetos](./08-exercicios-e-projetos.md)
9. [Referências anotadas](./referencias.md)

## Ideia central

Em IA, “buscar” significa explorar um conjunto de possibilidades para encontrar
uma solução que satisfaça algum critério. A solução pode ser:

- um caminho em um grafo;
- uma sequência de ações;
- os pesos de uma rede neural;
- uma configuração de hiperparâmetros;
- uma arquitetura de rede;
- uma política em aprendizado por reforço;
- uma combinação de pré-processamento, modelo e validação.

O problema prático quase nunca é apenas “achar o melhor”. O problema real é achar
algo bom com orçamento finito, sob incerteza, ruído, alto custo de avaliação e
espaços grandes demais para busca exaustiva.

## Mapa mental dos tópicos

```text
Busca em IA
├─ Espaço de estados
│  ├─ BFS, DFS, custo uniforme
│  ├─ A*, IDA*, beam search
│  └─ MCTS e planejamento
├─ Otimização de modelos
│  ├─ gradiente, SGD, Adam
│  ├─ perdas, mínimos locais, não convexidade
│  └─ hipergradientes e bilevel optimization
├─ Busca de hiperparâmetros
│  ├─ grid, random, quasi-Monte Carlo
│  ├─ Bayesian optimization: GP, TPE, SMAC
│  ├─ multi-fidelity: Successive Halving, Hyperband, ASHA, BOHB
│  ├─ população: genético, CMA-ES, PBT, PSO, differential evolution
│  └─ NAS e AutoML
└─ Prática experimental
   ├─ validação correta
   ├─ orçamento
   ├─ paralelismo
   ├─ overfitting no conjunto de validação
   └─ análise dos resultados
```

## Como usar para preparar a aula

- Use os arquivos `01` a `04` para consolidar a narrativa didática.
- Use os arquivos `05` e `06` para ampliar a lista de algoritmos além dos que já
  aparecem no app.
- Use o arquivo `07` para transformar teoria em prática com bibliotecas.
- Use o arquivo `08` para escolher exercícios de casa ou atividades em laboratório.
- Use `referencias.md` quando quiser citar papers, recomendar leitura ou verificar
  a origem de uma ideia.
