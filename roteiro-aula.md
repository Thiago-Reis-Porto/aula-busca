# Roteiro da aula: Busca em Espaços e Hiperparâmetros

**Duração:** 1 hora  
**Público:** graduação em Ciência da Computação ou Engenharia da Computação  
**Objetivo:** mostrar que muitos problemas de IA podem ser entendidos como busca em um espaço de soluções, onde queremos minimizar uma função objetivo com orçamento limitado.

## 0-5 min | Abertura

Comece com uma pergunta:

> Quando treinamos ou ajustamos um modelo de IA, o que exatamente estamos procurando?

Conduza para a ideia central:

- Procuramos uma solução boa dentro de um espaço enorme.
- Uma solução pode ser uma reta, um conjunto de pesos, uma arquitetura, uma configuração de hiperparâmetros ou uma sequência de decisões.
- Como não dá para testar tudo, precisamos de estratégias de busca.

Apresente os quatro conceitos básicos:

- **Estado:** uma solução candidata.
- **Função objetivo:** mede quão boa ou ruim é a solução.
- **Movimento/vizinhança:** define como sair de uma solução para outra.
- **Orçamento:** quantas avaliações conseguimos fazer.

## 5-15 min | Regressão linear como busca simples

Use a demonstração da regressão linear.

Explique:

> Aqui a solução é uma reta. Ela tem dois parâmetros: inclinação e intercepto. Cada combinação desses dois valores gera uma reta diferente.

Mostre manualmente os sliders.

Pontos didáticos:

- A perda mede o erro entre a reta e os pontos.
- O objetivo é minimizar a perda.
- Mesmo um problema simples já pode ser visto como busca em um espaço de parâmetros.
- Nesse caso, o espaço tem só duas dimensões e conseguimos visualizar.

Depois use o botão de descida do gradiente.

Explique:

> O gradiente aponta como a perda muda. A descida do gradiente tenta andar na direção que reduz a perda.

Gancho para a próxima parte:

> Mas isso parece fácil porque o espaço é bem comportado. O problema começa quando a paisagem tem vários vales.

## 15-25 min | Mínimos locais e mínimos globais

Use a demonstração dos mínimos.

Explique:

- **Mínimo global:** melhor solução de todo o espaço.
- **Mínimo local:** melhor solução apenas perto de onde estou.
- Um algoritmo local pode parar em um vale que parece bom, mas não é o melhor.

Faça interações:

1. Escolha um ponto inicial que caia em um mínimo local.
2. Rode a busca.
3. Mude o ponto inicial.
4. Mude a taxa de aprendizado.

Pontos didáticos:

- O ponto inicial importa.
- O tamanho do passo importa.
- Um passo pequeno pode prender a busca.
- Um passo grande pode pular regiões boas ou oscilar.

Frase de transição:

> Então a dificuldade não é só encontrar uma solução boa. É explorar o espaço sem gastar avaliações demais e sem ficar preso cedo.

## 25-35 min | Espaços complexos e hiperparâmetros

Use a seção 3D.

Explique:

> Essa visualização mostra só duas variáveis. Em IA, normalmente temos muitas mais.

Exemplos de hiperparâmetros:

- taxa de aprendizado;
- número de camadas;
- número de neurônios;
- batch size;
- regularização;
- dropout;
- profundidade de árvore;
- número de vizinhos no k-NN.

Mostre o slider de variáveis.

Ponto principal:

> Se eu testar 10 valores para cada variável, com 2 variáveis tenho 100 combinações. Com 10 variáveis, tenho 10 bilhões. Com 18, fica inviável.

Conduza para a maldição da dimensionalidade:

- O espaço cresce exponencialmente.
- Visualizar fica impossível.
- Avaliar cada ponto pode ser caro.
- Por isso precisamos de algoritmos inteligentes de busca.

## 35-50 min | Algoritmos de busca

Use a demonstração dos algoritmos.

Apresente cada algoritmo como uma estratégia diferente.

### Busca aleatória

> Escolhe pontos sem usar muita inteligência. Parece simples demais, mas é uma linha de base forte.

Pontos:

- fácil de implementar;
- paralelizável;
- funciona razoavelmente quando poucas dimensões importam muito;
- não garante refinamento local.

### Busca local / hill climbing

> Começa em uma solução e tenta melhorar olhando vizinhos.

Pontos:

- rápida;
- simples;
- boa quando a superfície é suave;
- ruim com muitos mínimos locais.

### Busca tabu

> É uma busca local com memória. Ela evita voltar imediatamente para lugares já visitados.

Pontos:

- reduz ciclos;
- ajuda a escapar de mínimos locais;
- precisa definir tamanho da memória;
- ainda depende da vizinhança.

### Algoritmo genético

> Em vez de uma solução, mantém uma população de soluções.

Pontos:

- seleção: mantém os melhores;
- cruzamento: combina soluções;
- mutação: injeta diversidade;
- útil em espaços irregulares;
- pode ser caro se a população for grande.

Feche a parte com comparação:

> Não existe algoritmo universalmente melhor. O que muda é o compromisso entre exploração, exploração local, memória, custo e simplicidade.

## 50-57 min | Aplicação em IA

Conecte explicitamente com IA.

Exemplos:

- escolher hiperparâmetros de uma rede neural;
- otimizar arquitetura;
- selecionar features;
- ajustar política de um agente;
- encontrar configuração de treinamento;
- calibrar parâmetros de modelos clássicos.

Diga:

> Treinar um modelo já é uma busca nos pesos. Ajustar hiperparâmetros é uma busca em cima do processo de treinamento. Em muitos casos, temos uma busca dentro de outra busca.

Mostre a ideia de orçamento:

- número de treinamentos possíveis;
- tempo de GPU/CPU;
- tamanho do dataset;
- validação cruzada;
- risco de overfitting no conjunto de validação.

## 57-60 min | Exercício para casa

Proponha a tarefa:

> Implementem do zero um algoritmo de busca para minimizar uma função complexa.

Sugestão principal:

- Função de Rastrigin em 10 dimensões.
- Comparar pelo menos dois métodos:
  - busca aleatória;
  - busca local;
  - busca tabu;
  - algoritmo genético.

Entrega:

- código próprio;
- gráfico da melhor solução ao longo das avaliações;
- comparação com mesma quantidade de avaliações;
- breve análise sobre onde ficou preso, sensibilidade à inicialização, custo e qualidade da solução.

Fechamento:

> A mensagem principal da aula é: muitos problemas de IA são problemas de busca. A dificuldade está em navegar um espaço grande, caro e cheio de armadilhas.
