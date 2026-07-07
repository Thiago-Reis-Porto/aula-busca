# 07. Ferramentas, prática e boas escolhas

Este arquivo resume ferramentas úteis para HPO, otimização e AutoML, além de
recomendações práticas para escolher o método.

## 1. scikit-learn

Ferramentas principais:

- `GridSearchCV`;
- `RandomizedSearchCV`;
- `HalvingGridSearchCV`;
- `HalvingRandomSearchCV`.

Bom para:

- modelos clássicos;
- pipelines;
- validação cruzada;
- ensino;
- baseline.

Cuidados:

- `HalvingGridSearchCV` e `HalvingRandomSearchCV` são experimentais em algumas versões;
- pipelines devem incluir pré-processamento para evitar vazamento;
- `n_jobs` ajuda, mas pode consumir muita memória.

Exemplo conceitual:

```python
from sklearn.model_selection import RandomizedSearchCV

search = RandomizedSearchCV(
    estimator=model,
    param_distributions=space,
    n_iter=50,
    scoring="f1_macro",
    cv=5,
    n_jobs=-1,
)
search.fit(X_train, y_train)
```

## 2. Optuna

Optuna é uma biblioteca moderna de HPO com API define-by-run.

Características:

- TPE;
- random sampler;
- GP sampler;
- CMA-ES sampler;
- NSGA-II/III para multiobjetivo;
- pruning;
- espaços condicionais dinâmicos;
- paralelização;
- visualizações.

Bom para:

- HPO em Python;
- espaços condicionais;
- deep learning;
- experimentos customizados;
- integração com PyTorch, Keras, XGBoost e outros.

Exemplo conceitual:

```python
import optuna

def objective(trial):
    lr = trial.suggest_float("lr", 1e-5, 1e-1, log=True)
    depth = trial.suggest_int("depth", 2, 10)
    dropout = trial.suggest_float("dropout", 0.0, 0.5)

    score = train_and_validate(lr=lr, depth=depth, dropout=dropout)
    return score

study = optuna.create_study(direction="minimize")
study.optimize(objective, n_trials=100)
```

## 3. Ray Tune

Ray Tune é voltado a HPO distribuído.

Características:

- execução distribuída;
- integração com Optuna, HyperOpt e outros;
- schedulers como ASHA;
- Population Based Training;
- suporte a múltiplos recursos;
- tolerância a falhas.

Bom para:

- muitos trials;
- múltiplas GPUs;
- clusters;
- deep learning;
- RL;
- treinamento caro.

Cuidados:

- mais infraestrutura;
- mais configuração;
- logs e checkpoints precisam ser planejados.

## 4. KerasTuner

KerasTuner é integrado ao ecossistema Keras.

Tuners comuns:

- RandomSearch;
- BayesianOptimization;
- Hyperband.

Bom para:

- alunos usando Keras;
- busca simples de arquitetura;
- tuning de learning rate, unidades, camadas e dropout.

Exemplo de uso conceitual:

```python
def build_model(hp):
    units = hp.Int("units", min_value=32, max_value=512, step=32)
    lr = hp.Float("lr", min_value=1e-4, max_value=1e-2, sampling="log")
    return make_model(units=units, lr=lr)
```

## 5. Hyperopt

Hyperopt popularizou TPE em Python.

Bom para:

- TPE;
- espaços condicionais;
- uso histórico em HPO;
- integração com hyperopt-sklearn.

Hoje, em muitos projetos novos, Optuna acaba sendo mais ergonômico, mas Hyperopt
continua importante historicamente.

## 6. SMAC

SMAC é forte para configuração automática de algoritmos e espaços condicionais.

Bom para:

- algorithm configuration;
- AutoML;
- CASH;
- benchmarks de HPO;
- espaços com muitos categóricos.

## 7. Ax e BoTorch

Ax e BoTorch são ferramentas associadas a Bayesian optimization, especialmente
com PyTorch.

BoTorch é útil quando você quer controle sobre:

- modelos substitutos;
- funções de aquisição;
- otimização multiobjetivo;
- restrições;
- batch BO;
- pesquisa avançada.

Ax fornece uma camada mais aplicada sobre experimentação.

## 8. SciPy optimize

SciPy oferece métodos gerais de otimização:

- `differential_evolution`;
- `dual_annealing`;
- `minimize` com Nelder-Mead, Powell, COBYLA, BFGS etc.

Bom para:

- funções matemáticas;
- simulações;
- problemas contínuos;
- exercícios;
- baseline sem ML pesado.

Menos adequado quando:

- o espaço tem muitos categóricos;
- há pipelines complexos;
- você precisa de pruning e tracking de trials.

## 9. Nevergrad

Nevergrad, da Meta, foca otimização sem derivada.

Inclui:

- algoritmos evolutivos;
- CMA-ES;
- differential evolution;
- otimização para variáveis mistas;
- benchmarks.

Bom para:

- derivative-free optimization;
- funções caixa-preta;
- pesquisa com muitos otimizadores.

## 10. AutoML

Ferramentas AutoML vão além de HPO:

- auto-sklearn;
- TPOT;
- AutoGluon;
- H2O AutoML;
- Auto-PyTorch;
- FLAML.

Elas podem automatizar:

- pré-processamento;
- seleção de modelo;
- hiperparâmetros;
- ensembling;
- pipelines.

Cuidados:

- definir orçamento;
- evitar vazamento;
- entender o que foi testado;
- comparar com baseline simples;
- avaliar interpretabilidade;
- checar custo de inferência.

## 11. Como escolher na prática?

### Cenário 1: aula introdutória

Use:

- grid search;
- random search;
- busca local;
- genetic algorithm simples.

Objetivo: clareza conceitual.

### Cenário 2: projeto pequeno com scikit-learn

Use:

- `RandomizedSearchCV`;
- `HalvingRandomSearchCV`;
- Optuna com TPE.

Objetivo: resultado bom sem complexidade excessiva.

### Cenário 3: deep learning em uma GPU

Use:

- Optuna + pruning;
- KerasTuner Hyperband;
- random search bem definido;
- early stopping.

Objetivo: economizar treinamento.

### Cenário 4: muitas GPUs ou cluster

Use:

- Ray Tune + ASHA;
- PBT;
- BOHB;
- Optuna distribuído.

Objetivo: paralelismo e orçamento grande.

### Cenário 5: função contínua sem gradiente

Use:

- CMA-ES;
- differential evolution;
- PSO;
- Nelder-Mead se baixa dimensão.

Objetivo: otimização caixa-preta contínua.

### Cenário 6: múltiplos objetivos

Use:

- NSGA-II/III;
- Bayesian optimization multiobjetivo;
- Optuna multi-objective;
- análise de Pareto.

Objetivo: trade-off entre qualidade, custo, latência e memória.

## 12. O que registrar em experimentos

Registre:

- dataset e versão;
- divisão treino/validação/teste;
- métrica;
- espaço de busca;
- algoritmo de busca;
- número de trials;
- orçamento por trial;
- seeds;
- hardware;
- tempo total;
- melhor configuração;
- resultado no teste final;
- logs de curvas de aprendizado.

Sem isso, o experimento fica difícil de reproduzir e difícil de defender.

## 13. Erros comuns

- Usar teste como validação.
- Comparar algoritmos com orçamentos diferentes.
- Não definir espaço de busca explicitamente.
- Usar escala linear para learning rate.
- Rodar poucos trials e tirar conclusão forte.
- Não repetir sementes em problemas ruidosos.
- Otimizar acurácia em dataset desbalanceado.
- Ignorar custo de inferência.
- Escolher algoritmo complexo sem baseline random search.
- Não salvar todos os trials.

## 14. Recomendação prática para alunos

Para um primeiro projeto de HPO:

1. Defina um baseline manual.
2. Rode random search.
3. Rode TPE ou Hyperband.
4. Compare com o mesmo orçamento.
5. Plote melhor score ao longo do número de avaliações.
6. Reavalie os melhores com sementes diferentes.
7. Faça teste final apenas uma vez.

## 15. Mensagem didática

Ferramentas ajudam, mas não substituem método experimental. HPO bom depende de
validação correta, espaço de busca bem pensado e comparação justa.
