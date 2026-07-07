# 03. Otimização em machine learning

Em machine learning, otimização aparece em dois níveis:

1. **Treinamento do modelo:** ajustar parâmetros aprendíveis, como pesos de uma rede.
2. **Busca externa:** ajustar hiperparâmetros, arquiteturas, pipelines e decisões de treinamento.

Esses dois níveis são relacionados, mas não são a mesma coisa.

## 1. Parâmetros vs hiperparâmetros

**Parâmetros** são aprendidos diretamente pelo algoritmo a partir dos dados.

Exemplos:

- pesos de regressão linear;
- pesos de uma rede neural;
- centróides em k-means;
- parâmetros de uma distribuição.

**Hiperparâmetros** controlam o processo ou a estrutura do modelo.

Exemplos:

- taxa de aprendizado;
- regularização;
- profundidade de árvore;
- número de vizinhos no k-NN;
- número de camadas;
- tamanho de batch;
- dropout;
- tipo de otimizador;
- número de épocas;
- estratégia de data augmentation.

## 2. Treinamento como minimização de perda

Um modelo com parâmetros `w` é treinado minimizando uma função de perda:

```text
min_w L_train(w)
```

Em aprendizado supervisionado:

```text
L_train(w) = média da perda entre predição e rótulo nos dados de treino
```

Exemplos de perdas:

- MSE para regressão;
- cross-entropy para classificação;
- hinge loss para SVM;
- negative log-likelihood;
- perdas contrastivas;
- perdas de ranking.

## 3. Gradiente descendente

O gradiente indica a direção de maior aumento da função. Para minimizar, andamos
na direção oposta:

```text
w_{t+1} = w_t - eta * grad L(w_t)
```

Onde:

- `w_t` são os parâmetros atuais;
- `eta` é a taxa de aprendizado;
- `grad L(w_t)` é o gradiente da perda.

Variações:

- batch gradient descent;
- stochastic gradient descent (SGD);
- mini-batch SGD;
- SGD com momentum;
- RMSProp;
- Adam;
- AdamW;
- métodos de segunda ordem ou quase segunda ordem.

## 4. Por que otimização em ML é difícil?

Mesmo no treinamento, a superfície pode ter:

- alta dimensionalidade;
- não convexidade;
- saddle points;
- regiões planas;
- vales estreitos;
- ruído por mini-batches;
- múltiplas soluções equivalentes;
- sensibilidade à inicialização;
- instabilidade numérica.

Em deep learning, curiosamente, nem todo mínimo local ruim é o principal problema.
Muitas vezes, a dificuldade está em:

- estabilidade do treinamento;
- generalização;
- escala da taxa de aprendizado;
- normalização;
- inicialização;
- regularização;
- interação entre hiperparâmetros.

## 5. Generalização e validação

Treinar bem não basta. O objetivo real é generalizar.

Fluxo padrão:

```text
treino -> aprende parâmetros
validação -> escolhe hiperparâmetros/modelo
teste -> estima desempenho final
```

Erro comum:

```text
usar o conjunto de teste várias vezes para escolher hiperparâmetros
```

Isso vaza informação e torna a estimativa final otimista.

## 6. Overfitting de hiperparâmetros

Hiperparâmetros também podem overfitar o conjunto de validação. Quanto mais
configurações testamos, maior a chance de achar uma que foi bem por sorte.

Consequências:

- o melhor trial pode não ser robusto;
- comparar muitos modelos no mesmo conjunto de validação aumenta viés;
- o conjunto de teste deve ser usado apenas no fim;
- nested cross-validation pode ser necessária em avaliações científicas.

## 7. Otimização externa: hiperparâmetros

Busca de hiperparâmetros pode ser formulada como:

```text
lambda* = argmin_lambda L_val(A(D_train, lambda), D_val)
```

Onde:

- `lambda` são hiperparâmetros;
- `A` é o algoritmo de treinamento;
- `D_train` é o conjunto de treino;
- `D_val` é o conjunto de validação;
- `L_val` é a perda de validação.

Essa formulação mostra que cada avaliação de `lambda` envolve treinar um modelo.
Por isso HPO costuma ser caro.

## 8. Otimização bilevel

A busca de hiperparâmetros pode ser vista como um problema em dois níveis:

```text
nível interno:  w*(lambda) = argmin_w L_train(w, lambda)
nível externo: lambda* = argmin_lambda L_val(w*(lambda), lambda)
```

O nível interno aprende pesos. O nível externo escolhe hiperparâmetros.

Isso aparece em:

- meta-learning;
- diferenciação através do treinamento;
- hypergradients;
- busca diferenciável de arquitetura;
- ajuste automático de regularização;
- aprendizado de schedules.

## 9. Hipergradientes

Alguns métodos tentam calcular gradientes da perda de validação em relação aos
hiperparâmetros. Em vez de tratar o treinamento como caixa-preta, diferenciam o
processo de treinamento.

Exemplos de hiperparâmetros potencialmente diferenciáveis:

- taxa de aprendizado;
- peso de regularização;
- pesos de exemplos;
- parâmetros de data augmentation contínua;
- parâmetros de arquitetura relaxados.

Limitações:

- alto custo de memória;
- necessidade de diferenciar várias etapas de treinamento;
- dificuldade com hiperparâmetros discretos;
- instabilidade;
- complexidade de implementação.

## 10. Arquitetura como hiperparâmetro

Em redes neurais, a própria arquitetura pode ser vista como hiperparâmetro:

- número de camadas;
- largura das camadas;
- tipos de operações;
- conexões residuais;
- kernel size;
- normalização;
- attention heads;
- profundidade do transformer.

Neural Architecture Search (NAS) automatiza parte dessa escolha. Métodos de NAS
podem usar:

- reinforcement learning;
- evolução;
- Bayesian optimization;
- busca diferenciável;
- weight sharing;
- preditores de desempenho.

## 11. Relação entre perda de treino e paisagem de hiperparâmetros

Uma configuração de hiperparâmetros produz um processo de treinamento. O resultado
observado é uma métrica de validação. Assim, a paisagem de HPO pode ser:

- ruidosa;
- não suave;
- descontínua;
- condicional;
- cara;
- com múltiplos objetivos;
- dependente de semente;
- dependente de fidelidade, como número de épocas.

Por isso, HPO é normalmente tratado como black-box optimization.

## 12. Mensagem didática

Uma frase útil para a aula:

> Treinar um modelo é uma busca nos parâmetros. Ajustar hiperparâmetros é uma
> busca sobre o próprio processo de treinamento.

Essa frase ajuda a explicar por que HPO pode ser mais caro que o treinamento de
um único modelo: cada ponto no espaço de hiperparâmetros exige uma execução de
treinamento e validação.
