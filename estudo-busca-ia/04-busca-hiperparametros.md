# 04. Busca de hiperparâmetros

Busca de hiperparâmetros, ou HPO, é o problema de escolher uma configuração que
melhore o desempenho de um algoritmo de machine learning.

## 1. Definição

Formalmente, queremos encontrar:

```text
lambda* = argmin_lambda E(lambda)
```

Onde `lambda` é uma configuração de hiperparâmetros e `E(lambda)` é uma estimativa
do erro de generalização, geralmente medida em validação ou validação cruzada.

Na prática:

```text
configuração -> treinar modelo -> avaliar validação -> registrar score
```

## 2. O que pode ser hiperparâmetro?

### Modelos clássicos

k-NN:

- `k`;
- métrica de distância;
- pesos por distância.

SVM:

- `C`;
- kernel;
- `gamma`;
- grau do polinômio.

Random Forest:

- número de árvores;
- profundidade máxima;
- número de atributos por split;
- tamanho mínimo de folha;
- bootstrap.

Gradient Boosting:

- taxa de aprendizado;
- número de estimadores;
- profundidade;
- subsampling;
- regularização.

### Redes neurais

- taxa de aprendizado;
- scheduler;
- otimizador;
- batch size;
- número de camadas;
- largura das camadas;
- dropout;
- weight decay;
- inicialização;
- data augmentation;
- número de épocas;
- early stopping;
- arquitetura.

### Pipeline completo

- normalização;
- imputação de valores faltantes;
- seleção de atributos;
- redução de dimensionalidade;
- algoritmo;
- hiperparâmetros do algoritmo;
- threshold de decisão;
- calibração de probabilidades.

## 3. Espaço de busca

Um bom espaço de busca é mais importante do que parece. Se o ótimo não está no
espaço, nenhum algoritmo vai encontrá-lo.

Exemplo ruim:

```text
learning_rate: [0.1, 0.2, 0.3, 0.4]
```

Exemplo melhor:

```text
learning_rate: log-uniforme entre 1e-5 e 1e-1
```

Por que escala logarítmica?

Porque diferenças multiplicativas costumam importar mais que diferenças lineares.
`1e-4` para `1e-3` pode ser muito mais relevante que `0.300` para `0.301`.

## 4. Tipos de distribuição

Distribuições comuns:

- uniforme;
- log-uniforme;
- inteiro uniforme;
- categórica;
- ordinal;
- boolean;
- normal/truncada;
- escolhas condicionais.

Exemplo de espaço condicional:

```text
modelo: ["svm", "random_forest"]

se modelo = "svm":
  C
  kernel
  gamma

se modelo = "random_forest":
  n_estimators
  max_depth
  max_features
```

Esse tipo de estrutura aparece no problema CASH: escolher o algoritmo e seus
hiperparâmetros ao mesmo tempo.

## 5. Orçamento

Orçamento pode significar:

- número de trials;
- tempo total;
- número de épocas;
- número de amostras;
- número de folds;
- número de GPUs;
- dinheiro;
- emissão/energia;
- latência permitida em produção.

Sem orçamento definido, HPO vira tentativa e erro sem critério.

Perguntas práticas:

- Quantas avaliações cabem?
- Cada avaliação custa segundos, minutos ou horas?
- Posso rodar em paralelo?
- Posso interromper trials ruins?
- Posso usar uma aproximação barata primeiro?
- Preciso otimizar uma ou várias métricas?

## 6. Avaliação de configurações

Formas comuns:

- holdout treino/validação;
- k-fold cross-validation;
- nested cross-validation;
- validação temporal;
- validação por grupos;
- validação estratificada.

A escolha depende do problema.

Para séries temporais, não se deve embaralhar livremente. Para dados com grupos,
exemplos do mesmo grupo não devem cair em treino e validação ao mesmo tempo.
Para classificação desbalanceada, estratificação pode ser necessária.

## 7. Risco de vazamento

Vazamento ocorre quando informação do conjunto de validação ou teste entra no
treinamento ou na escolha de configuração.

Exemplos:

- normalizar usando média do dataset inteiro;
- selecionar features antes da divisão;
- usar teste para escolher hiperparâmetros;
- fazer data augmentation contaminando amostras;
- exemplos correlacionados em treino e validação;
- tuning repetido no mesmo conjunto de validação sem teste final.

Regra:

> Tudo que é aprendido a partir dos dados deve estar dentro do pipeline avaliado.

## 8. Métrica de objetivo

Escolher a métrica errada otimiza o comportamento errado.

Exemplos:

- acurácia pode ser ruim em dataset desbalanceado;
- AUC pode não refletir threshold operacional;
- F1 ignora calibração;
- log loss pune excesso de confiança;
- latência pode importar tanto quanto acurácia;
- fairness pode ser um objetivo ou restrição.

Em produção, HPO frequentemente vira problema multiobjetivo:

```text
maximizar qualidade
minimizar latência
minimizar memória
minimizar custo
respeitar restrições de fairness
```

## 9. Multi-fidelity HPO

Nem toda avaliação precisa usar o orçamento completo. Podemos avaliar candidatos
com baixa fidelidade:

- poucas épocas;
- subconjunto dos dados;
- imagem em menor resolução;
- modelo menor;
- fold único;
- menos árvores;
- menos steps de RL;
- proxy task.

Depois alocamos mais recurso aos candidatos promissores.

Essa ideia fundamenta:

- Successive Halving;
- Hyperband;
- ASHA;
- BOHB;
- Fabolas;
- PBT.

## 10. Early stopping e pruning

Se uma configuração está claramente ruim após poucas épocas, pode ser interrompida.

Vantagens:

- economiza recurso;
- permite testar mais candidatos;
- aumenta eficiência em deep learning.

Riscos:

- algumas configurações começam devagar e melhoram depois;
- métricas iniciais podem ser ruidosas;
- comparar curvas em épocas diferentes pode ser injusto;
- pruning agressivo pode reduzir diversidade.

## 11. Paralelismo

HPO é naturalmente paralelizável, mas nem todo algoritmo paraleliza igual.

Busca aleatória:

- paralelismo simples;
- cada trial é independente.

Bayesian optimization:

- sequencial por natureza;
- precisa adaptar para batch/parallel BO;
- pode usar estratégias como constant liar ou Thompson sampling.

Hyperband/ASHA:

- bom para ambientes distribuídos;
- usa early stopping;
- escala bem em muitos workers.

PBT:

- desenhado para treinamento distribuído;
- modelos treinam simultaneamente e trocam pesos/hiperparâmetros.

## 12. Resultado de HPO não é só o melhor trial

Depois de rodar HPO, analise:

- distribuição dos scores;
- sensibilidade por hiperparâmetro;
- importância dos hiperparâmetros;
- curvas de aprendizado;
- correlação entre custo e qualidade;
- robustez a sementes;
- estabilidade da melhor região;
- trade-offs entre métricas.

Uma boa prática é não confiar cegamente no melhor ponto observado. Muitas vezes
vale retreinar as melhores configurações com múltiplas sementes.

## 13. Checklist prático

Antes de rodar HPO:

- Definir métrica principal.
- Definir restrições.
- Separar treino, validação e teste corretamente.
- Definir orçamento.
- Definir espaço de busca em escalas adequadas.
- Escolher algoritmo compatível com o tipo de espaço.
- Registrar seeds, versões e dados.
- Decidir paralelismo.
- Decidir se haverá early stopping.

Depois de rodar:

- Retreinar a melhor configuração.
- Avaliar no teste apenas no final.
- Repetir com seeds se o problema for ruidoso.
- Analisar importância dos hiperparâmetros.
- Reportar orçamento e número de trials.
- Comparar contra baseline simples.

## 14. Mensagem didática

HPO não é apertar um botão mágico. É um processo experimental. O algoritmo de
busca ajuda, mas o resultado depende de:

- espaço bem definido;
- avaliação correta;
- orçamento adequado;
- métrica alinhada ao problema;
- cuidado com vazamento;
- interpretação crítica dos resultados.
