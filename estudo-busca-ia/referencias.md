# Referências anotadas

Esta bibliografia prioriza papers, livros abertos e documentações oficiais.

## HPO e AutoML

### Random search

- Bergstra, J.; Bengio, Y. **Random Search for Hyper-Parameter Optimization**.
  Journal of Machine Learning Research, 2012.  
  https://www.jmlr.org/papers/volume13/bergstra12a/bergstra12a.pdf

  Leitura essencial para explicar por que random search é um baseline forte e
  por que grid search desperdiça avaliações quando poucos hiperparâmetros dominam
  o desempenho.

### Bayesian optimization

- Snoek, J.; Larochelle, H.; Adams, R. **Practical Bayesian Optimization of
  Machine Learning Algorithms**. NeurIPS, 2012.  
  https://arxiv.org/abs/1206.2944

  Referência clássica para Bayesian optimization aplicada a ML. Discute Gaussian
  processes, custo variável e paralelismo.

- Frazier, P. I. **A Tutorial on Bayesian Optimization**. 2018.  
  https://arxiv.org/abs/1807.02811

  Tutorial teórico e didático sobre Bayesian optimization.

### TPE

- Bergstra, J.; Bardenet, R.; Bengio, Y.; Kégl, B. **Algorithms for
  Hyper-Parameter Optimization**. NeurIPS, 2011.  
  https://papers.nips.cc/paper_files/paper/2011/hash/86e8f7ab32cfd12577bc2619bc635690-Abstract.html

  Introduz e populariza ideias associadas ao Tree-structured Parzen Estimator
  para espaços de hiperparâmetros.

### SMAC e configuração de algoritmos

- Hutter, F.; Hoos, H. H.; Leyton-Brown, K. **Sequential Model-Based Optimization
  for General Algorithm Configuration**. LION, 2011.  
  https://www.cs.ubc.ca/labs/algorithms/Projects/SMAC/papers/11-LION5-SMAC.pdf

  Base do SMAC e da configuração automática de algoritmos com modelos substitutos.

### Hyperband, Successive Halving e ASHA

- Jamieson, K.; Talwalkar, A. **Non-stochastic Best Arm Identification and
  Hyperparameter Optimization**. AISTATS, 2016.  
  https://arxiv.org/abs/1502.07943

  Fundamenta a relação entre HPO, best-arm identification e alocação progressiva
  de recursos.

- Li, L.; Jamieson, K.; DeSalvo, G.; Rostamizadeh, A.; Talwalkar, A.
  **Hyperband: A Novel Bandit-Based Approach to Hyperparameter Optimization**.
  JMLR, 2018.  
  https://arxiv.org/abs/1603.06560

  Referência principal para Hyperband e HPO multi-fidelity baseado em bandits.

- Li, L.; Jamieson, K.; Rostamizadeh, A.; Gonina, E.; Hardt, M.; Recht, B.;
  Talwalkar, A. **A System for Massively Parallel Hyperparameter Tuning**. 2018.  
  https://arxiv.org/abs/1810.05934

  Apresenta ASHA e discute HPO massivamente paralelo.

### BOHB

- Falkner, S.; Klein, A.; Hutter, F. **BOHB: Robust and Efficient Hyperparameter
  Optimization at Scale**. ICML, 2018.  
  https://arxiv.org/abs/1807.01774

  Combina Bayesian optimization com Hyperband.

### Fabolas e multi-fidelity

- Klein, A.; Falkner, S.; Bartels, S.; Hennig, P.; Hutter, F. **Fast Bayesian
  Optimization of Machine Learning Hyperparameters on Large Datasets**. AISTATS,
  2017.  
  https://arxiv.org/abs/1605.07079

  Usa tamanho do dataset como fidelidade e modela custo e desempenho.

### Population Based Training

- Jaderberg, M. et al. **Population Based Training of Neural Networks**. 2017.  
  https://arxiv.org/abs/1711.09846

  Importante para explicar busca de schedules e treinamento populacional.

### Gradientes de hiperparâmetros e bilevel optimization

- Maclaurin, D.; Duvenaud, D.; Adams, R. **Gradient-based Hyperparameter
  Optimization through Reversible Learning**. ICML, 2015.  
  https://arxiv.org/abs/1502.03492

  Mostra como diferenciar através do treinamento para otimizar hiperparâmetros.

- Franceschi, L.; Frasconi, P.; Salzo, S.; Grazzi, R.; Pontil, M. **Bilevel
  Programming for Hyperparameter Optimization and Meta-Learning**. ICML, 2018.  
  https://arxiv.org/abs/1806.04910

  Conecta HPO baseada em gradiente e meta-learning via programação bilevel.

### AutoML

- Hutter, F.; Kotthoff, L.; Vanschoren, J. **Automated Machine Learning:
  Methods, Systems, Challenges**. Springer, 2019.  
  https://www.automl.org/book/

  Livro aberto com capítulos sobre HPO, meta-learning, NAS e sistemas AutoML.

- Thornton, C.; Hutter, F.; Hoos, H. H.; Leyton-Brown, K. **Auto-WEKA:
  Combined Selection and Hyperparameter Optimization of Classification
  Algorithms**. KDD, 2013.  
  https://www.cs.ubc.ca/labs/algorithms/Projects/autoweka/papers/13-001.pdf

  Referência importante para o problema CASH.

- Feurer, M. et al. **Efficient and Robust Automated Machine Learning**. NeurIPS,
  2015.  
  https://proceedings.neurips.cc/paper_files/paper/2015/hash/11d0e6287202fced83f79975ec59a3a6-Abstract.html

  Paper do auto-sklearn.

### Revisões

- Bischl, B. et al. **Hyperparameter Optimization: Foundations, Algorithms, Best
  Practices and Open Challenges**. WIREs Data Mining and Knowledge Discovery,
  2023.  
  https://arxiv.org/abs/2107.05847

  Revisão ampla, prática e moderna sobre HPO.

- Yu, T.; Zhu, H. **Hyper-Parameter Optimization: A Review of Algorithms and
  Applications**. 2020.  
  https://arxiv.org/abs/2003.05689

  Revisão mais panorâmica sobre HPO.

## Neural Architecture Search

- Zoph, B.; Le, Q. V. **Neural Architecture Search with Reinforcement Learning**.
  2016.  
  https://arxiv.org/abs/1611.01578

  NAS com controlador treinado por reinforcement learning.

- Pham, H. et al. **Efficient Neural Architecture Search via Parameter Sharing**.
  ICML, 2018.  
  https://arxiv.org/abs/1802.03268

  ENAS, com compartilhamento de pesos para reduzir custo de busca.

- Liu, H.; Simonyan, K.; Yang, Y. **DARTS: Differentiable Architecture Search**.
  ICLR, 2019.  
  https://arxiv.org/abs/1806.09055

  Busca diferenciável de arquiteturas via relaxação contínua.

- Elsken, T.; Metzen, J. H.; Hutter, F. **Neural Architecture Search: A Survey**.
  JMLR, 2019.  
  https://www.jmlr.org/papers/v20/18-598.html

  Survey fundamental de NAS.

## Metaheurísticas e derivative-free optimization

### CMA-ES

- Hansen, N. **The CMA Evolution Strategy: A Tutorial**. 2016.  
  https://arxiv.org/abs/1604.00772

  Tutorial principal para CMA-ES.

### Differential Evolution

- Storn, R.; Price, K. **Differential Evolution: A Simple and Efficient Heuristic
  for Global Optimization over Continuous Spaces**. Journal of Global
  Optimization, 1997.  
  https://link.springer.com/article/10.1023/A:1008202821328

  Paper clássico de Differential Evolution.

### Simulated Annealing

- Kirkpatrick, S.; Gelatt, C. D.; Vecchi, M. P. **Optimization by Simulated
  Annealing**. Science, 1983.  
  https://doi.org/10.1126/science.220.4598.671

  Referência clássica de simulated annealing.

### Particle Swarm Optimization

- Kennedy, J.; Eberhart, R. **Particle Swarm Optimization**. IEEE International
  Conference on Neural Networks, 1995.  
  https://doi.org/10.1109/ICNN.1995.488968

  Paper original de PSO.

### Nelder-Mead

- Nelder, J. A.; Mead, R. **A Simplex Method for Function Minimization**. The
  Computer Journal, 1965.  
  https://doi.org/10.1093/comjnl/7.4.308

  Método direct search clássico para otimização sem derivada.

## Busca em espaço de estados, árvores e planejamento

### A*

- Hart, P. E.; Nilsson, N. J.; Raphael, B. **A Formal Basis for the Heuristic
  Determination of Minimum Cost Paths**. IEEE Transactions on Systems Science and
  Cybernetics, 1968.  
  https://doi.org/10.1109/TSSC.1968.300136

  Paper original do A*.

### Monte Carlo Tree Search

- Browne, C. B. et al. **A Survey of Monte Carlo Tree Search Methods**. IEEE
  Transactions on Computational Intelligence and AI in Games, 2012.  
  https://repository.essex.ac.uk/4117/

  Survey clássico de MCTS.

- Silver, D. et al. **Mastering the Game of Go with Deep Neural Networks and Tree
  Search**. Nature, 2016.  
  https://www.nature.com/articles/nature16961

  AlphaGo: exemplo marcante de combinação entre deep learning e busca em árvore.

### Beam search

- Vijayakumar, A. K. et al. **Diverse Beam Search: Decoding Diverse Solutions
  from Neural Sequence Models**. 2016.  
  https://arxiv.org/abs/1610.02424

  Útil para discutir beam search em modelos de sequência e limitações de diversidade.

## Documentações oficiais úteis

- scikit-learn: **Tuning the hyper-parameters of an estimator**  
  https://scikit-learn.org/stable/modules/grid_search.html

- Optuna: **Samplers**  
  https://optuna.readthedocs.io/en/stable/reference/samplers/index.html

- Ray Tune: **Hyperparameter Tuning**  
  https://docs.ray.io/en/latest/tune/index.html

- KerasTuner: **Getting started with KerasTuner**  
  https://keras.io/keras_tuner/getting_started/

- SciPy: **differential_evolution**  
  https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.differential_evolution.html

- SciPy: **dual_annealing**  
  https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.dual_annealing.html

- SciPy: **Nelder-Mead**  
  https://docs.scipy.org/doc/scipy/reference/optimize.minimize-neldermead.html
