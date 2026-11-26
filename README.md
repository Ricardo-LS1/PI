# O Gato Preto Café — Sistema de Gestão

**Projeto Integrador (PI) | Análise e Desenvolvimento de Sistemas | FATEC Guaratinguetá**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat-square&logo=github&logoColor=white) ![Versão](https://img.shields.io/badge/Prot%C3%B3tipo-V4.1-1764b5?style=flat-square)

Sistema web interno desenvolvido para demonstrar a centralização das atividades de gestão do O Gato Preto Café, com módulos de pedidos, estoque, financeiro e administração.

**[Acessar o protótipo online](https://ricardo-ls1.github.io/PI/)** · **[Documentação técnica](DOCUMENTACAO.md)**

> Projeto acadêmico em fase de prototipação. Os registros e as credenciais de demonstração são fictícios. O sistema não deve ser utilizado para operações reais.

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

A V2 introduz filtros de período independentes, ações rápidas na consulta de pedidos, aprimoramentos de responsividade, modo de tela cheia e uma base fictícia de demonstração ampliada.

Os dados previamente armazenados podem ser mantidos quando a origem do site permanece a mesma. A opção de restaurar os dados de demonstração substitui os registros locais.

## Interface V4 e V4.1

- Desktop: menu lateral recolhível, cabeçalho compacto, quatro indicadores prioritários (conforme permissões) e painéis analíticos expansíveis.
- Mobile: navegação inferior, menu da conta compacto, seletor de funcionalidades e registros expansíveis.
- Dados, permissões, validações, relatórios e armazenamento local da V3 permanecem com a mesma lógica. A V4 usa HTML, CSS e JavaScript sem novas dependências.

### Novidades da V4.1

- Clique no título ou no conteúdo da notificação para abrir diretamente a funcionalidade relacionada: estoque baixo (ou esgotados entre os itens críticos), pedidos no status correspondente ou despesas pendentes.
- O registro é localizado pelo identificador, destacado temporariamente e expandido no celular; a paginação abre na página correta. Os demais registros do filtro continuam disponíveis. Use **Limpar filtros** para retornar à consulta geral.
- Notificações já resolvidas ou registros indisponíveis exibem uma mensagem contextual, sem alterar os dados. A marcação manual como lida permanece disponível.
- O login mobile concentra marca, formulário e aviso acadêmico na área útil da tela. Abra **Acesso de demonstração** para escolher um perfil ou restaurar os dados. A rolagem continua disponível em telas excepcionalmente baixas, com teclado aberto ou com informações adicionais expandidas.
- Nenhuma alteração na chave, no formato de dados ou nas regras de autenticação simulada.

## Testes e validação

Conforme o registro técnico da V2, foram realizadas verificações de sintaxe JavaScript, referências entre páginas, controles operacionais e comportamento visual em diferentes larguras de tela. Também foi inspecionado um PDF de fluxo de caixa.

Essas verificações ocorreram em ambiente controlado, com armazenamento simulado. A validação completa em hospedagem real, incluindo persistência entre páginas, exportação CSV e compatibilidade com dispositivos físicos, ainda precisa ser concluída.

A V4 foi verificada em Chromium com carregamento offline dos arquivos e armazenamento simulado em memória, nas larguras de 360, 390, 768, 1024, 1366 e 1920 px. A publicação e os testes em dispositivos reais ainda devem ser realizados.

A V4.1 foi verificada no Chromium offline em seis dimensões de tela: 162 combinações de telas e funcionalidades, 42 cenários de destino contextual e seis layouts de login. Nenhum erro JavaScript foi capturado nos testes. A navegação HTTP foi bloqueada pelo ambiente; foram simulados os parâmetros de URL, a limpeza da URL, o redirecionamento do login e o armazenamento. A validação em publicação real e com teclado virtual físico permanece pendente.

Consulte o detalhamento em [DOCUMENTACAO.md](DOCUMENTACAO.md).

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
