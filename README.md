# O Gato Preto Café — Sistema de Gestão

> Pacote de publicação: os scripts, relatórios de auditoria e evidências de testes citados neste documento estão no ZIP completo da V4.2.9, não neste pacote.

**Projeto Integrador (PI) | Análise e Desenvolvimento de Sistemas | FATEC Guaratinguetá**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat-square&logo=github&logoColor=white) ![Versão](https://img.shields.io/badge/Prot%C3%B3tipo-V4.2.9-1764b5?style=flat-square)

Sistema web interno desenvolvido para demonstrar a centralização das atividades de gestão do O Gato Preto Café, com módulos de pedidos, estoque, financeiro e administração.

**[Acessar o protótipo online](https://ricardo-ls1.github.io/PI/)** · **[Documentação técnica](DOCUMENTACAO.md)**

> Projeto acadêmico em fase de prototipação. Os registros e as credenciais de demonstração são fictícios. O sistema não deve ser utilizado para operações reais.

## V4.2.9 — Homologação e estabilização

- Correção de 19 cenários negativos confirmados: cronologia de obrigações, créditos, quitações e integridade de backups.
- Roteiro independente: 1/20 antes, 20/20 depois; formulários: 3/7 antes, 7/7 depois; 100 sequências de 100 passos com modelo de conferência independente.
- Chave localStorage, dados demonstrativos, CSS e interface preservados. Recursos estáticos com `?v=4.2.9`. Exporte um backup antes de atualizar; dados inconsistentes não são reparados automaticamente.
- Consulte auditoria independente, testes, rastreabilidade e integração.
- A aprovação restringe-se aos cenários executados. O projeto continua um protótipo acadêmico, não homologado para uso comercial.

## V4.2.8 — Auditoria e estabilização

- Validações adicionais em backups, datas de estorno e devolução, valores monetários, pagamentos antecipados e vínculos de compras.
- CMV indisponível quando não há baixa original verificável; não inventa custos nem movimentações históricas.
- Edição de pedido aberto após estorno integral, com preservação dos itens do recebimento original.
- Verificação de sessão na gravação e detecção de alterações concorrentes já persistidas; não constitui transação entre abas.
- Dados locais inválidos não são substituídos automaticamente por dados fictícios. Backups inconsistentes podem ser rejeitados.
- Escapamento adicional de atributos e CSV, atalhos demonstrativos restritos às credenciais fictícias originais, ordenação monetária corrigida.
- Índices em memória reduzem buscas repetidas na validação e gravação. Nenhuma dependência nova de execução.
- Recursos estáticos com `?v=4.2.8`. Chave local e CSS preservados. Faça backup antes da atualização.
- Consulte AUDITORIA_COMPLETA_V4.2.7.md, TESTES_V4.2.8.md e MATRIZ_INTEGRACAO_V4.2.8.md. A aprovação é limitada aos cenários executados, não representa homologação comercial.

## V4.2.7 — Consistência financeira e rastreabilidade

- Devoluções a fornecedores com crédito/reembolso exigem compra original vinculada; datas anteriores à compra e valores/quantidades excessivos são bloqueados.
- Créditos e correções/cancelamentos de obrigações aparecem como eventos sem movimentação de caixa no histórico e no relatório de movimentações. Não se somam novamente aos valores atuais das despesas.
- Despesas manuais novas recebem natureza operacional. Compras de mercadorias devem ser registradas no estoque. Despesas legadas sem natureza podem ser classificadas conscientemente em Financeiro → Corrigir despesas, sem criar estoque ou alterar valores.
- Pagamentos antecipados podem ser parciais, estornados e novamente recebidos. A conclusão cobra somente o saldo líquido devido; estornos anteriores à venda não reduzem a venda que foi concluída depois.
- Novos pagamentos/recebimentos futuros são bloqueados; o vencimento de uma obrigação é separado da data de registro/pagamento. Registros antigos com data futura ficam consultáveis no histórico, fora do caixa realizado enquanto a data estiver no futuro.
- Estornos de devoluções mostram os itens efetivamente vinculados; estornos sem vínculo de item são identificados como financeiros. O histórico de obrigações distingue despesas pendentes e canceladas de pagamentos efetuados.
- Chave de armazenamento, registros anteriores, identidade visual e arquitetura HTML/CSS/JS preservados. Não é necessário restaurar a demonstração. Faça backup antes de publicar.
- Consulte TESTES_V4.2.7.md e auditoria original.

## V4.2.6 — Históricos em ordem cronológica

- Em Financeiro → Histórico financeiro, selecione **Ordenar por**: mais recentes primeiro (padrão) ou mais antigos primeiro. A ordem considera os instantes originais, incluindo milissegundos, quando disponíveis.
- A data do lançamento financeiro continua sendo o filtro de período. A coluna **Registro / quitação** mostra data e horário do lançamento ou confirmação de pagamento; em quitações novas, o cadastro original permanece separado. Operações retroativas não recebem uma hora efetiva presumida.
- Os registros sem horário conhecido são identificados e aparecem ao final em ambas as ordens. Empates são resolvidos pelo identificador, sem modificar os dados.
- Receitas, despesas, relatórios detalhados, pedidos, movimentações de estoque e atividades administrativas usam o mesmo padrão; o fluxo de caixa diário continua em ordem de data para preservar a evolução acumulada.
- CSV e relatório para impressão acompanham a ordem da consulta de relatório; não é necessário restaurar os dados demonstrativos. Recursos estáticos versionados com `?v=4.2.6`.
- Relatório de testes V4.2.6.

## V4.2.5 — Ciclo de vida dos pedidos

- Pedidos em andamento podem ser cancelados; vendas concluídas continuam concluídas e aceitam somente estornos e devoluções elegíveis. A próxima etapa do pedido fica em destaque; as demais ações permitidas ficam no menu de três pontos.
- Estorno registra a devolução financeira, sem repor estoque. Devolução física exige condição e confirmação; somente produtos aproveitáveis podem retornar ao estoque. O valor original e o histórico ficam preservados.
- Pagamento antecipado exige confirmação de devolução e permissão financeira para cancelar. O sistema registra operações internas, não movimenta dinheiro bancário.
- Dados anteriores e chave localStorage preservados. Não é necessário restaurar a demonstração. Recursos versionados com `?v=4.2.5`.
- Relatório de testes V4.2.5. Testes reproduzíveis: `node tests/validar-pedidos-v425.cjs` e `python tests/validar-pedidos-v425-browser.py`.

## V4.2.4 — Estoque flexível, indicadores claros e ações compactas

- Em Estoque → Cadastrar produtos ou Gerenciar produtos, marque ou desmarque **Monitorar estoque mínimo**. Desativar o mínimo não desativa o controle de saldo. Produtos ativos esgotados continuam gerando alertas independentemente do mínimo.
- Na consulta de pedidos, uma única coluna **Ações** reúne a próxima etapa do pedido e o menu de três pontos com as demais operações, inclusive detalhes, edição, finalização e cancelamento, conforme a situação.
- Os indicadores expansíveis explicam os termos em linguagem cotidiana, com fórmulas, exemplos e valores calculados a partir dos filtros atuais. Os cálculos financeiros permanecem iguais.
- A base demonstrativa nova ou restaurada inclui produtos com mínimo ligado e desligado. Registros existentes não são substituídos; produtos antigos sem a configuração mantêm o monitoramento ligado. Não é necessário restaurar a base para atualizar o sistema.
- Todos os HTML usam recursos com `?v=4.2.4`. Relatório de testes V4.2.4.

## V4.2.3 — Refinamento visual das tabelas

Todas as tabelas utilizam um padrão compartilhado de células com espaçamento e hierarquia. No histórico de estoque, motivo, origem, vínculo com pedido e custo aparecem separados, com classificação discreta. Datas e valores numéricos mantêm a legibilidade, e as colunas monetárias são alinhadas à direita no desktop. Em dispositivos móveis, os registros continuam expansíveis; em tablets e janelas intermediárias, tabelas extensas podem rolar horizontalmente dentro de seu próprio contêiner, sem deslocar a página.

A base demonstrativa, as regras de negócio, os indicadores e o localStorage permanecem intactos. Não é necessário restaurar dados. Todos os arquivos HTML referenciam CSS/JS com `?v=4.2.3`.

Relatório de validação V4.2.3 · `python tests/validar-tabelas-browser.py` (Chromium e Playwright, somente para testes).

## V4.2.2 — Indicadores autoexplicativos

Todos os cartões de indicadores da visão geral, dos resumos e dos dashboards de pedidos, estoque, financeiro e administração possuem uma seta expansível. Clique no cartão ou acione seu cabeçalho pelo teclado para consultar o significado, a regra e a memória de cálculo. Os cartões começam recolhidos e as memórias são atualizadas com os filtros. Em telas móveis, cartões abertos ocupam a largura disponível para facilitar a leitura.

- A consulta de estoque detalha as regras de custo, valor de estoque, lucro unitário e margem dos produtos, respeitando a permissão financeira.
- Totais das consultas e prévias de relatórios financeiros também são explicáveis; o documento impresso mantém critérios textuais, sem controles interativos.
- **Financeiro → Custos e rentabilidade:** nova margem operacional estimada, calculada como resultado operacional dividido pelas vendas líquidas reconhecidas, multiplicado por 100. Na base completa, 48,29%.
- Margens, comparações e percentuais de gráficos são apresentados com duas casas decimais. Quantidades e precisão interna de custo permanecem inalteradas.
- Dados incompletos e ausência de vendas positivas recebem explicações específicas; valores desconhecidos não são substituídos por zero.

**Atualização não destrutiva:** a V4.2.2 mantém a mesma base demonstrativa V4.2.1, chave de armazenamento, permissões e regras financeiras. Não é necessário restaurar os registros para receber as novas explicações. As referências CSS/JS usam `?v=4.2.2`.

Relatório de validação V4.2.2 · `node tests/validar-indicadores.cjs` · `node tests/validar-demonstracao.cjs`.

## V4.2.1 — Base demonstrativa integrada

A base inicial fictícia agora contém custos de abertura, compras pagas e pendentes vinculadas às despesas, vendas com custos históricos, devolução parcial com estorno e desperdício. Os preços e saldos finais do catálogo original foram preservados. Os indicadores são calculados a partir dos registros, sem valores fixos na interface.

**Para quem já utilizou uma versão anterior:** a atualização não substitui os registros do navegador. Se desejar experimentar os novos dados, exporte antes um backup em **Administração → Backup e restauração**; depois, use **Administração → Configurar sistema → Restaurar dados de demonstração** (ou a opção equivalente no login). Confirme somente se desejar substituir os registros locais. Uma instalação sem registros locais recebe a nova base automaticamente.

Em **Financeiro → Custos e rentabilidade**, deixe os filtros de data em branco para visualizar todo o histórico fictício. O resultado esperado é margem bruta de aproximadamente 62,13%, CMV de R$ 183,27 e estoque atual de R$ 520,73. Outros períodos produzem resultados diferentes.

Relatório de validação V4.2.1 · Teste reproduzível: `node tests/validar-demonstracao.cjs` (Node.js é necessário somente para executar o teste).

## V4.2 — Integração financeira, custos e consultas

A V4.2 mantém a interface azul da V4.1.1 e acrescenta:

- Entrada de estoque por compra com lançamento vinculado de despesa paga ou pendente.
- Custos de aquisição, média ponderada móvel, custo de venda registrado e indicadores de rentabilidade separados do caixa.
- Classificação de entradas e saídas; perdas sem duplicar despesas; devolução ao fornecedor com crédito ou reembolso informado.
- Devolução parcial de itens vendidos, com reposição e estorno financeiro opcional; correções e reversões de despesas com histórico.
- Consultas de pedidos por número ou produto, resumos com nomes históricos e quantidades, seletores e notificações descritivos; vendas identificadas no financeiro e nos relatórios quando autorizadas.
- Migração aditiva da chave `gato-preto-cafe-v1` e versionamento das referências CSS/JS. Custos anteriores desconhecidos permanecem desconhecidos.

**Validação:** consulte TESTES_V4.2.md e [DOCUMENTACAO.md](DOCUMENTACAO.md). Trata-se de uma versão candidata para demonstração acadêmica, não homologada para uso financeiro real. Faça backup antes de substituir a versão publicada. O localStorage não oferece controle transacional multiusuário nem segurança de servidor.

## Sumário

- [Contextualização](#contextualização)
- [Problemática](#problemática)
- [Solução proposta](#solução-proposta)
- [Objetivos](#objetivos)
- [Funcionalidades](#funcionalidades)
- [Perfis de acesso](#perfis-de-acesso)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Execução local](#execução-local)
- [Relatórios gerenciais](#relatórios-gerenciais)
- [Modelagem e documentação](#modelagem-e-documentação)
- [Evolução do protótipo](#evolução-do-protótipo)
- [Testes e validação](#testes-e-validação)
- [Limitações e melhorias futuras](#limitações-e-melhorias-futuras)
- [Equipe](#equipe)

## Contextualização

O projeto foi desenvolvido no contexto da disciplina de Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas da FATEC Guaratinguetá, tendo como empresa parceira o O Gato Preto Café, estabelecimento localizado em Guaratinguetá (SP).

A proposta relaciona os conhecimentos de levantamento de requisitos, modelagem de sistemas, lógica de programação e desenvolvimento web a uma necessidade identificada no ambiente empresarial.

## Problemática

Durante o levantamento inicial, foram identificados controles realizados por meio de planilhas e pedidos organizados pelo WhatsApp. A distribuição de informações entre diferentes ferramentas dificulta a consulta centralizada de dados e o acompanhamento das operações.

O projeto busca atender à necessidade de organizar os registros de pedidos, acompanhar os níveis de estoque e facilitar a análise das receitas e despesas do estabelecimento.

## Solução proposta

A solução consiste em um protótipo navegável de um sistema de gestão web de uso interno, destinado aos proprietários e gerentes. A interface reúne operações administrativas e gerenciais em um único ambiente, com indicadores, filtros, históricos e relatórios.

A versão atual simula os processos de negócio no próprio navegador, permitindo avaliar a organização das funcionalidades e a experiência de uso antes de uma eventual implementação com servidor e banco de dados.

## Objetivos

### Objetivo geral

Propor um sistema de gestão que centralize as informações operacionais e financeiras do estabelecimento, apoiando a organização das atividades e a tomada de decisões.

### Objetivos específicos

- Organizar o registro e o acompanhamento dos pedidos.
- Facilitar o controle de produtos e das movimentações de estoque.
- Registrar recebimentos, despesas e consultar o fluxo de caixa.
- Apresentar informações gerenciais por meio de indicadores e gráficos.
- Diferenciar os perfis de acesso de administrador e gerente.
- Representar, em uma interface navegável, os requisitos identificados na modelagem do projeto.

## Funcionalidades

### Dashboard gerencial

- Painel inicial de acompanhamento das operações.
- Dashboards específicos nos módulos de pedidos, estoque e financeiro.
- Indicadores calculados a partir dos registros locais, com filtros de período.
- Gráficos de pizza, rosca, linhas, área e barras horizontais e verticais.
- Exibição em tela cheia para acompanhamento gerencial e apresentações.

### Gestão de pedidos

- Registro de pedidos com seleção de produtos, quantidades e cálculo de valores.
- Verificação de disponibilidade dos produtos no momento do registro.
- Consulta por número, data e situação do pedido.
- Atualização de status, finalização e cancelamento com justificativa.
- Histórico de registros e alterações.

O fluxo de situação contempla pedidos pendentes, em preparo, prontos, concluídos e cancelados. As transições adotadas são propostas para a demonstração.

### Gestão de estoque

- Cadastro e consulta de produtos, categorias, unidades e preços.
- Registro de entradas e saídas com atualização dos saldos.
- Ajustes de estoque mediante justificativa.
- Histórico das movimentações.
- Identificação de produtos com quantidade abaixo do estoque mínimo.

### Gestão financeira

- Registro de recebimentos e despesas.
- Associação opcional de recebimentos a pedidos.
- Consulta de receitas e despesas com filtros.
- Controle de despesas pagas e pendentes.
- Acompanhamento do fluxo de caixa e do histórico financeiro.
- Geração de relatórios e exportação CSV.

### Administração

- Cadastro, edição, ativação e inativação de usuários.
- Definição de perfis e permissões individuais por módulo.
- Configuração de informações do estabelecimento e formas de pagamento.
- Restauração da base de dados fictícia para demonstração.

### Interface e usabilidade

A interface dispõe de menu recolhível, tema claro e escuro, adaptação a diferentes dimensões de tela e validação de campos de data. A preferência de tema é mantida no navegador.

## Perfis de acesso

| Funcionalidade | Administrador | Gerente |
| --- | :---: | :---: |
| Dashboard | Sim | Sim |
| Pedidos | Sim | Sim |
| Estoque | Sim | Sim |
| Financeiro | Sim | Sim |
| Administração | Sim | Não |

A tabela representa os acessos padrão. Um administrador pode personalizar o acesso aos módulos operacionais por conta. O dashboard e o menu respeitam as permissões simuladas.

### Credenciais de demonstração

| Perfil | Usuário | Senha inicial |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Gerente | `gerente` | `gerente123` |

As credenciais são públicas e fictícias. O controle de acesso é executado no front-end e não constitui um mecanismo de segurança para uso em produção.

## Tecnologias utilizadas

| Tecnologia | Aplicação |
| --- | --- |
| HTML5 | Estrutura das páginas e formulários |
| CSS3 | Estilização, responsividade e temas |
| JavaScript | Lógica de negócio simulada, validações e interatividade |
| LocalStorage | Persistência de dados e preferências no navegador |
| SVG e CSS | Representação visual dos gráficos |
| Git e GitHub | Versionamento e organização do código |
| GitHub Pages | Publicação estática do protótipo |

O projeto utiliza tecnologias nativas do navegador, sem dependências externas de execução, frameworks ou servidor de aplicação.

## Estrutura do projeto

```text
PI/
├── assets/          # Recursos visuais
├── css/             # Estilos da interface
├── js/              # Lógica e comportamento do sistema
├── pages/           # Páginas internas
│   ├── administracao.html
│   ├── dashboard.html
│   ├── estoque.html
│   ├── financeiro.html
│   └── pedidos.html
├── index.html       # Entrada do sistema
├── DOCUMENTACAO.md  # Rastreabilidade e regras de demonstração
└── README.md        # Apresentação do projeto
```

A aplicação funciona como um conjunto de páginas estáticas. A lógica de manipulação dos registros e as preferências são executadas no navegador; não existe uma API de back-end nem um banco de dados centralizado nesta versão.

## Execução local

É possível acessar o sistema pelo GitHub Pages ou executar uma cópia localmente. Para a execução local, recomenda-se servir os arquivos por HTTP, evitando diferenças no tratamento do armazenamento entre páginas abertas pelo protocolo `file://`.

Clone o repositório:

```bash
git clone https://github.com/Ricardo-LS1/PI.git
cd PI
```

Com o Python 3 instalado, inicie um servidor estático:

```bash
python3 -m http.server 8000
```

Acesse [http://localhost:8000/](http://localhost:8000/) e utilize uma das contas de demonstração. O Python é necessário apenas para esse método de execução local, não para utilizar o sistema publicado.

## Relatórios gerenciais

No módulo Financeiro, a área **Relatórios financeiros** permite selecionar o tipo de relatório e o período desejado. Os registros podem ser exportados em CSV ou apresentados em um documento para impressão.

Para gerar um PDF, selecione **Imprimir / salvar PDF** e escolha a opção de salvar como PDF na janela do navegador, preferencialmente em papel A4. O documento inclui informações consolidadas, indicadores, gráfico e tabelas. A paginação depende das configurações do navegador.

## Modelagem e documentação

O desenvolvimento do protótipo tem como referência os materiais acadêmicos produzidos pelo grupo:

- **Diagrama Gato Preto Café Revisado:** modelagem dos atores, casos de uso e operações associadas.
- **Sistema de Gestão do O Gato Preto Café:** apresentação do contexto empresarial e da proposta de solução.

A rastreabilidade contempla os 21 casos de uso dos módulos de pedidos, estoque, financeiro e administração. A correspondência entre esses casos de uso e os controles do protótipo, além das regras de negócio propostas e dos registros de testes, está descrita na [documentação técnica](DOCUMENTACAO.md).

## Evolução do protótipo

| Versão | Descrição |
| --- | --- |
| V1 | Primeira versão do protótipo, utilizada como base para a evolução da interface e das funcionalidades. |
| V2 | Ampliação dos dashboards, visualizações gráficas, relatórios, permissões por conta e recursos de usabilidade. |
| V3 | Gráficos interativos, pesquisa global, notificações, ordenação, paginação, menu recolhível e ajustes visuais. |
| V4 | Redesign adaptativo: interface azul mais limpa, navegação inferior mobile, ações priorizadas e informações detalhadas sob demanda. |
| V4.1 | Notificações contextuais, filtros automáticos, destaque de registros e login mobile compacto. |
| V4.1.1 | Correção do cabeçalho mobile, menu da conta, indicadores compactos, áreas de segurança e responsividade. |
| V4.2 | Integração compras/financeiro, custos, devoluções, correções e identificação de registros. |
| V4.2.1 | Base fictícia integrada, custos históricos, indicadores calculáveis e restauração explícita. |
| V4.2.2 | Indicadores autoexplicativos, memórias dinâmicas, margem operacional e percentuais padronizados. |
| V4.2.3 | Padronização de células, hierarquia de informações, datas e colunas numéricas. |
| V4.2.5 | Ciclo de pedidos, estornos e devoluções independentes. |
| V4.2.6 | Ordenação cronológica dos históricos e registro separado da quitação. |
| V4.2.6.1 | Confirmação de estornos e acesso direto ao histórico. |
| V4.2.7 | Consistência financeira e rastreabilidade das integrações. |
| V4.2.8 | Auditoria, validações, rastreabilidade e estabilização. |
| V4.2.9 | Homologação parcial, cronologia de obrigações e integridade de backups. |
| V4.2.4 | Monitoramento mínimo opcional, explicações didáticas e ações compactas por pedido. |

A V2 introduz filtros de período independentes, ações rápidas na consulta de pedidos, aprimoramentos de responsividade, modo de tela cheia e uma base fictícia de demonstração ampliada.

Os dados previamente armazenados podem ser mantidos quando a origem do site permanece a mesma. A opção de restaurar os dados de demonstração substitui os registros locais.

## Interface V4, V4.1 e V4.1.1

- Desktop: menu lateral recolhível, cabeçalho compacto, quatro indicadores prioritários (conforme permissões) e painéis analíticos expansíveis.
- Mobile: navegação inferior, menu da conta compacto, seletor de funcionalidades e registros expansíveis.
- Dados, permissões, validações, relatórios e armazenamento local da V3 permanecem com a mesma lógica. A V4 usa HTML, CSS e JavaScript sem novas dependências.

### Novidades da V4.1

- Clique no título ou no conteúdo da notificação para abrir diretamente a funcionalidade relacionada: estoque baixo ou esgotados (mesmo sem mínimo monitorado), pedidos no status correspondente ou despesas pendentes.
- O registro é localizado pelo identificador, destacado temporariamente e expandido no celular; a paginação abre na página correta. Os demais registros do filtro continuam disponíveis. Use **Limpar filtros** para retornar à consulta geral.
- Notificações já resolvidas ou registros indisponíveis exibem uma mensagem contextual, sem alterar os dados. A marcação manual como lida permanece disponível.
- O login mobile concentra marca, formulário e aviso acadêmico na área útil da tela. Abra **Acesso de demonstração** para escolher um perfil ou restaurar os dados. A rolagem continua disponível em telas excepcionalmente baixas, com teclado aberto ou com informações adicionais expandidas.
- Nenhuma alteração na chave, no formato de dados ou nas regras de autenticação simulada.

### Novidades da V4.1.1

- Cabeçalho mobile unificado no fluxo da página: marca à esquerda, busca, notificações e menu à direita. O perfil, o cargo, o tema, a tela cheia (quando suportada) e a saída ficam no menu da conta.
- Indicadores em duas colunas nas larguras mobile usuais; uma coluna abaixo de 301 px. A barra inferior preserva o módulo ativo e reserva espaço para conteúdo e áreas de segurança.
- Menu da conta também recolhível em telas intermediárias até 1100 px, sem alterar a navegação lateral desktop. Em orientação horizontal acima de 760 px, permanece o layout de tablet/desktop.
- Melhorias nos formulários, filtros, tabelas, modais e controles de toque. Login compacto e navegação contextual da V4.1 preservados.
- Nenhuma mudança nas regras de negócio, nas credenciais demonstrativas ou na chave e no formato dos dados locais.

## Testes e validação

Conforme o registro técnico da V2, foram realizadas verificações de sintaxe JavaScript, referências entre páginas, controles operacionais e comportamento visual em diferentes larguras de tela. Também foi inspecionado um PDF de fluxo de caixa.

Essas verificações ocorreram em ambiente controlado, com armazenamento simulado. A validação completa em hospedagem real, incluindo persistência entre páginas, exportação CSV e compatibilidade com dispositivos físicos, ainda precisa ser concluída.

A V4 foi verificada em Chromium com carregamento offline dos arquivos e armazenamento simulado em memória, nas larguras de 360, 390, 768, 1024, 1366 e 1920 px. A publicação e os testes em dispositivos reais ainda devem ser realizados.

A V4.1 foi verificada no Chromium offline em seis dimensões de tela: 162 combinações de telas e funcionalidades, 42 cenários de destino contextual e seis layouts de login. Nenhum erro JavaScript foi capturado nos testes. A navegação HTTP foi bloqueada pelo ambiente; foram simulados os parâmetros de URL, a limpeza da URL, o redirecionamento do login e o armazenamento. A validação em publicação real e com teclado virtual físico permanece pendente.

A V4.1.1 foi verificada em 13 dimensões de tela, nos dois temas, com 702 combinações de telas e funcionalidades, 130 verificações do cabeçalho, 120 cenários de menu da conta, 80 verificações de navegação inferior, 52 aberturas de modais de busca/notificações e 26 layouts de login. Foram repetidos 21 cenários de navegação contextual e testes de operações. Não foram capturadas exceções JavaScript nem rolagem horizontal indevida da página na matriz. As verificações foram offline, com armazenamento e parâmetros de URL simulados; a publicação real permanece pendente.

Consulte o detalhamento em [DOCUMENTACAO.md](DOCUMENTACAO.md) e no relatório de testes V4.1.1.

## Limitações e melhorias futuras

### Limitações atuais

- Dados armazenados exclusivamente no navegador, sem sincronização entre dispositivos.
- Autenticação e autorização simuladas, sem proteção de produção.
- Movimentações manuais e integração demonstrativa entre pedidos, estoque e recebimentos na conclusão de pedidos; a integração é local, sem servidor.
- Ausência de integração automática com WhatsApp e Excel.
- Regras operacionais de demonstração ainda sujeitas à validação com a empresa.

### Possíveis melhorias

- Implementação de back-end e banco de dados centralizado.
- Autenticação segura e autorização no servidor.
- Evolução e validação empresarial dos vínculos já demonstrados entre pedidos, estoque e financeiro.
- Auditoria de operações, backups e testes automatizados.
- Validação de usabilidade com os usuários da empresa e em diferentes dispositivos.

Esses itens representam possibilidades de evolução, não funcionalidades já implementadas ou compromissos de entrega.

## Equipe

Projeto desenvolvido por Ricardo, Luiz e Matheus, integrantes do Projeto Integrador.

**Instituição:** FATEC Guaratinguetá — Centro Paula Souza  
**Curso:** Análise e Desenvolvimento de Sistemas (ADS)  
**Disciplina:** Projeto Integrador (PI)  
**Ano:** 2026

---

Projeto acadêmico desenvolvido para fins de estudo e demonstração.


## Edição de código legível da V4.2.6

Esta edição reorganiza o código-fonte com indentação e comentários, sem introduzir funcionalidades. Consulte o [guia de leitura](GUIA_DO_CODIGO.md) e a validação da formatação.

## V4.2.6.1 — Confirmação de estornos

A devolução exige informar explicitamente o valor a devolver, inclusive zero quando não houver estorno. A confirmação indica o efeito financeiro e disponibiliza acesso direto ao histórico do pedido quando houver lançamento. O tipo da movimentação fica visível no celular e a consulta é atualizada ao restaurar uma página financeira. A camada de dados, os cálculos, a chave de armazenamento e os registros existentes permanecem inalterados. Consulte TESTES_V4.2.6.1.md.
