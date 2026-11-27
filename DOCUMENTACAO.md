# Documentação técnica — O Gato Preto Café (V4.2.9)

> Pacote de publicação: os scripts, relatórios de auditoria e evidências de testes citados neste documento estão no ZIP completo da V4.2.9, não neste pacote.

[Voltar ao README](README.md)

Documento complementar ao README, organizado a partir do registro técnico original do protótipo V2. Descreve a correspondência entre a modelagem e as funcionalidades demonstradas, as escolhas de implementação e as verificações registradas. Não representa homologação do sistema pela empresa.

## Referências do projeto

- Diagrama Gato Preto Café Revisado (5 páginas).
- Sistema de Gestão do O Gato Preto Café (6 páginas).

A modelagem revisada orienta o detalhamento dos casos de uso. Login, painel inicial, exportação CSV, restauração de dados e identidade visual complementam a demonstração. O logotipo SVG é uma proposta gráfica, não uma reprodução do logotipo oficial.

## Matriz de rastreabilidade

### Pedidos

| Caso de uso | Operações representadas | Interface |
| --- | --- | --- |
| Registrar pedido | Escolher produtos e quantidades; conferir disponibilidade; calcular total; gravar registro. | Registrar pedido |
| Consultar pedidos | Buscar número ou nome histórico do produto; filtrar data e situação; conferir itens, quantidades, valor e status. | Consultar pedidos / Ver pedido |
| Atualizar status | Localizar registro; validar transição; definir novo status; armazenar data da alteração. | Atualizar status |
| Cancelar pedido | Somente antes da conclusão; motivo obrigatório e confirmação de devolução de pagamento antecipado quando houver. | Cancelar pedido |
| Estornar venda | Registrar devolução de valor recebido, parcial ou integral, sem alterar a situação concluída. | Pedidos / Financeiro |
| Devolver produtos | Selecionar quantidades e condição; repor apenas produtos aproveitáveis; estorno opcional. | Pedidos / Devolver itens |
| Consultar histórico | Filtrar período e situação; visualizar criação, alterações e cancelamentos com respectivas datas. | Histórico de pedidos |

### Estoque

| Caso de uso | Operações representadas | Interface |
| --- | --- | --- |
| Cadastrar produtos | Informar nome, categoria, unidade, descrição, preço e quantidades inicial e mínima. | Cadastrar produtos |
| Consultar estoque | Pesquisar por nome e categoria; consultar quantidade disponível, preço e unidade. | Consultar estoque |
| Registrar entrada | Selecionar e conferir produto; informar quantidade e data; atualizar saldo e histórico. | Registrar entrada |
| Registrar saída | Selecionar produto; verificar saldo; indicar quantidade e motivo; atualizar saldo e histórico. | Registrar saída |
| Ajustar estoque | Comparar saldo registrado e apurado; justificar correção; atualizar saldo e histórico. | Ajustar estoque |
| Consultar produtos com estoque baixo | Comparar quantidade com mínimo; identificar itens críticos; consultar alertas por categoria. | Estoque baixo |

### Financeiro

| Caso de uso | Operações representadas | Interface |
| --- | --- | --- |
| Registrar recebimentos | Identificar origem e eventual pedido associado; selecionar pagamento; registrar valor e data. | Registrar recebimentos |
| Registrar despesas | Definir descrição e categoria; registrar valor, data e situação. | Registrar despesas |
| Consultar receitas | Filtrar período e pagamento; consultar lançamentos e total. | Consultar receitas |
| Consultar despesas | Filtrar período e categoria; consultar lançamentos e total. | Consultar despesas |
| Consultar fluxo de caixa | Apurar receitas e despesas pagas; exibir saldo e evolução temporal. | Fluxo de caixa |
| Gerar relatórios | Definir tipo e período; consolidar informações; visualizar ou exportar. | Relatórios financeiros |
| Consultar histórico | Pesquisar período e tipo; examinar origem, valor e data de registro. | Histórico financeiro |

### Administração

| Caso de uso | Operações representadas | Interface |
| --- | --- | --- |
| Cadastrar usuários | Informar identificação e credenciais; atribuir perfil e condição de ativação. | Cadastrar usuários |
| Gerenciar usuários e permissões | Editar, ativar ou inativar contas; mudar perfil e configurar permissões por módulo. | Gerenciar usuários e permissões |
| Configurar sistema | Alterar dados do estabelecimento, pagamentos e parâmetros gerais; gravar configurações. | Configurar sistema |

## Regras de demonstração

- **Pedidos:** estados progressivos (Pendente, Em preparo, Pronto, Concluído) admitem avanço direto entre etapas. Cancelamentos exigem motivo e ocorrem antes da conclusão. As regras são propostas, sem validação empresarial registrada.
- **Integração operacional:** disponibilidade é verificada ao montar o pedido, mas não há reserva ou baixa automática. Movimentações e recebimentos são lançados nos módulos próprios.
- **Estoque:** alerta somente quando a quantidade fica abaixo do mínimo. Pedidos utilizam quantidades inteiras; movimentações admitem até três casas decimais. O catálogo demonstra produtos comercializados individualmente.
- **Financeiro:** o saldo do período corresponde às receitas menos despesas pagas, sem incorporar saldo anterior. Despesas pendentes permanecem na consulta, mas não integram o cálculo de caixa. A moeda é BRL.
- **Permissões:** Administração é exclusiva do perfil Administrador. Os acessos operacionais são configuráveis por conta, e a própria sessão administrativa não pode perder seu acesso administrativo. A ausência de acesso ao Estoque não impede a seleção de produtos nos Pedidos, mas oculta os saldos; a ausência de acesso a Pedidos impede novos vínculos de recebimento a pedidos. Lançamentos anteriores permanecem consultáveis no módulo autorizado.
- **Persistência:** informações, sessão e preferências são mantidas localmente. Registros da V1 podem persistir na mesma origem; contas antigas recebem permissões padrão. Restaurar a demonstração substitui a base local.

## Indicadores, filtros e relatórios

- Os indicadores gerais de cada módulo abrangem o histórico disponível; os dashboards expandidos seguem os filtros independentes. Estoque apresenta sua posição corrente.
- O ranking de produtos vendidos considera pedidos concluídos. O gráfico de movimentações de estoque conta registros por tipo, evitando agregar unidades incompatíveis.
- Os campos de data usam máscara brasileira e calendário nativo. Lançamentos sugerem o dia atual, enquanto filtros iniciam vazios. Períodos inválidos preservam o último resultado válido e impedem a exportação.
- Os gráficos são elaborados com SVG e CSS, sem biblioteca gráfica externa.
- A exportação CSV permite análise em planilhas, sem integração automática com o Excel. O PDF utiliza a impressão nativa do navegador, com formato A4, capa gerencial, resumo, gráfico, tabelas e numeração. A apresentação final depende das opções de impressão.
- A tela cheia possui alternativa visual quando a API do navegador não está disponível. A compatibilidade em televisores antigos deve ser verificada no próprio aparelho.

## Verificações registradas na V2

Os itens abaixo correspondem aos testes descritos na documentação original, não a uma nova execução de testes durante a reorganização do README.

| Área | Verificação registrada |
| --- | --- |
| Código e estrutura | Revisão da rastreabilidade, sintaxe JavaScript e caminhos relativos do HTML. |
| Operações | Testes em Chromium com arquivos carregados diretamente e armazenamento simulado: login, filtros, tema, operações de estoque, pedidos, históricos, recebimentos, despesas e permissões. |
| Responsividade | Cinco páginas internas verificadas em larguras de 360, 768, 1920 e 3840 pixels, sem transbordamento horizontal global registrado. |
| Impressão | PDF de fluxo de caixa inspecionado; quebra de página do rodapé corrigida. |

### Validações pendentes

O ambiente original restringiu a navegação direta por HTTP, HTTPS e `file://`. Portanto, não houve homologação da navegação real entre páginas, da persistência real entre páginas, do download CSV pelo navegador nem da publicação. Nem todos os cenários de erro, navegadores, controles remotos, calendários nativos e dispositivos foram testados.

Recomenda-se validar esses pontos em hospedagem real, no Firefox e em outros navegadores, bem como nos dispositivos usados durante a apresentação.

## Segurança e escopo

O protótipo não implementa segurança de produção, API, banco de dados centralizado nem comunicação automática com WhatsApp. As restrições de interface não impedem a inspeção ou alteração do armazenamento local. Utilize apenas dados fictícios.


## Redesign V4

A camada de apresentação foi refinada sem alterações no modelo de dados (`js/dados.js`) ou nos quatro módulos de negócio (`js/pedidos.js`, `js/estoque.js`, `js/financeiro.js`, `js/administracao.js`). A folha `css/v4.css` complementa o CSS original. Os componentes compartilhados em `js/global.js` e o dashboard foram reorganizados.

- Indicadores prioritários: pedidos registrados, estoque baixo, receitas líquidas e saldo do período, conforme as permissões. Indicadores restantes e gráficos ficam disponíveis em seções expansíveis.
- As operações são exibidas antes dos painéis de análise. No celular, o seletor de funcionalidades substitui a barra de abas; a navegação inferior respeita as permissões.
- Tabelas extensas exibem campos prioritários em listas compactas no celular. O botão de detalhes revela as demais colunas e ações; as tabelas desktop mantêm ordenação e paginação.
- A chave e o mecanismo de armazenamento local não foram alterados. Autenticação, autorização e dados permanecem demonstrativos, sem servidor.

O arquivo ZIP de origem não continha os PDFs de referência citados na documentação; a matriz existente foi preservada, mas não foi possível comparar diretamente com os diagramas originais.

### Validação da V4

Verificações realizadas em Chromium com os arquivos locais inseridos diretamente no documento do navegador, sem navegação externa; a API de armazenamento foi simulada em memória, devido ao bloqueio de navegação do ambiente de testes.

| Verificação | Resultado |
| --- | --- |
| Sintaxe de todos os arquivos JavaScript (`node --check`) | Sem erros |
| 162 combinações de telas (dashboard e 26 funcionalidades) em 360, 390, 768, 1024, 1366 e 1920 px | Sem erros JavaScript capturados ou rolagem horizontal da página |
| Cadastro de produto e movimentação de entrada | Saldo atualizado corretamente |
| Registro e conclusão de pedido | Baixa no estoque e recebimento integrado confirmados |
| Registro de despesa pendente, recarregamento simulado e quitação | Registro mantido e situação atualizada |
| Menu recolhível, seletor mobile, expansão de registro, tema, pesquisa, notificações, período e controle de legenda | Verificações funcionais concluídas |
| Perfil Gerente | Administração ausente do menu |

As verificações não equivalem a uma homologação completa. A navegação entre páginas em hospedagem real, o `localStorage` real após atualização do site, a impressão em PDF, os downloads e os testes em dispositivos físicos ainda devem ser validados. Não foram executados todos os cenários de exceção de cada regra de negócio. As capturas da interface foram produzidas no ambiente offline com dados de demonstração.

## V4.1 — Navegação contextual e login compacto

### Implementação

A central de notificações passou a gerar links relativos com os parâmetros `alerta` e `registro`. O módulo de destino valida o tipo de alerta e a permissão existente, seleciona a aba e aplica os filtros. O registro é identificado por ID, inclusive quando está em uma página posterior da tabela. O destaque visual dura cerca de 6,5 segundos, com expansão automática dos detalhes em tela pequena. O botão **Limpar filtros** retorna à consulta geral e remove os parâmetros contextuais. Alterações manuais nos filtros também removem esses parâmetros. Links desatualizados mostram uma mensagem, sem modificar registros. A marcação como lida continua manual, preservando o mecanismo existente.

| Alerta existente | Destino | Filtro |
| --- | --- | --- |
| Produto ativo abaixo do mínimo | Estoque / Estoque baixo | Todos abaixo do mínimo |
| Produto abaixo do mínimo com saldo zero | Estoque / Estoque baixo | Esgotados |
| Pedido pendente | Pedidos / Consultar pedidos | Pendente |
| Pedido em preparo | Pedidos / Consultar pedidos | Em preparo |
| Pedido pronto | Pedidos / Consultar pedidos | Pronto |
| Despesa pendente | Financeiro / Consultar despesas | Pendente |

Não foram criadas notificações de atraso ou vencimento: a versão de origem não define prazos de entrega nem datas de vencimento de despesas. O filtro de esgotados é uma subdivisão dos produtos já considerados críticos, sem alterar a regra original de estoque baixo. O filtro de situação financeira também está disponível na consulta normal.

No login, a área promocional é reduzida à marca em telas de até 760 px, as credenciais demonstrativas ficam em um elemento `details` recolhido inicialmente e o formulário utiliza alturas dinâmicas (`svh`/`dvh`). O fluxo natural de rolagem é preservado para acomodar teclado, telas baixas e seções abertas. O desktop mantém a apresentação de duas colunas quando o layout existente permite.

### Arquivos modificados

| Arquivo | Alteração |
| --- | --- |
| `index.html`, `js/login.js` | Seção de demonstração expansível, comportamento responsivo; autenticação mantida. |
| `css/v4.css` | Login compacto e estilos de links, contexto e destaque de registros. |
| `js/global.js` | Links contextuais, seleção inicial de aba, identificação de registros e paginação direcionada. |
| `js/estoque.js` | Filtro de saldo para estoque baixo e identificação de linhas. |
| `js/pedidos.js` | Identificação das linhas de pedidos, reutilizando filtro de status. |
| `js/financeiro.js` | Filtro de situação da despesa, total correspondente e identificação das linhas. |
| `README.md`, `DOCUMENTACAO.md` | Versão, instruções, escopo e validação. |

`js/dados.js`, `js/administracao.js`, `js/dashboard.js`, `css/style.css`, as páginas internas e o logotipo foram mantidos sem alterações. Não foram adicionadas dependências.

### Validação da V4.1

| Teste | Resultado |
| --- | --- |
| Sintaxe de todos os arquivos JavaScript | Sem erros (`node --check`). |
| 42 cenários contextuais (seis tipos de destino e um registro em página posterior, em seis larguras) | Links gerados, abas e filtros corretos, identificação/destaque, paginação e limpeza de contexto aprovados com parâmetros simulados. |
| 162 combinações de telas e funcionalidades nas seis larguras | Sem erros JavaScript capturados e sem rolagem horizontal da página. |
| Login em 360×640, 390×844, 768×1024, 1024×768, 1366×768 e 1920×1080 | Conteúdo inicial sem rolagem vertical ou horizontal; perfis de demonstração acessíveis. |
| Login em 360×320, com foco no campo de senha | Botão acessível com rolagem; simulação de área reduzida, não teclado físico. |
| Autenticação válida e inválida; perfis Administrador e Gerente | Sessão e destino lógico verificados com armazenamento e redirecionamento simulados. |
| Cadastro e entrada de produto; registro e conclusão de pedido | Saldo e recebimento integrado verificados com armazenamento simulado. |
| Link de registro indisponível | Mensagem contextual e retorno à consulta aprovados. |

Os testes foram realizados com Chromium e inserção direta dos arquivos no documento. A navegação HTTP/HTTPS foi bloqueada pelo ambiente. Os parâmetros de navegação, a limpeza da URL, a mudança de página após login e o armazenamento foram simulados; por isso não constituem uma validação de ponta a ponta em hospedagem real. Permanecem pendentes a publicação no GitHub Pages, a persistência entre páginas e versões em navegador real, o teclado virtual de um smartphone físico, outros navegadores, impressão/PDF e downloads. Os PDFs de modelagem não acompanham o ZIP de origem. A autenticação segue demonstrativa, sem segurança de produção.


## V4.1.1 — Correção de responsividade e refinamento mobile

### Diagnóstico estrutural e implementação

Na V4.1, a marca estava na barra lateral e os controles do topo em um cabeçalho com posicionamento absoluto, limitado a parte da largura da tela. Regras legadas de largura, Flexbox e quebra de texto competiam com os estilos mobile. Os indicadores também herdavam regras de Flexbox de largura mínima; nem todos os grupos estavam cobertos pela grade móvel da V4.

A atualização introduz uma marca mobile dentro do próprio cabeçalho, em fluxo normal, com três controles independentes de 44 × 44 px. O menu da conta é ancorado à direita, com fechamento por clique externo e Escape, altura limitada pela área útil, identificação do usuário e controles existentes. A opção de tela cheia é omitida em mobile quando a API não está disponível; quando disponível, usa a tela cheia nativa sem ocultar a barra inferior. A experiência de apresentação em tela cheia desktop continua disponível. A disponibilidade efetiva da API depende do navegador e suas permissões.

As grades de indicadores abrangem o dashboard, os resumos e os painéis analíticos dos módulos, com duas colunas em telas de 301 a 760 px e uma coluna em larguras menores. O cabeçalho mantém o menu de conta compacto até 1100 px; acima de 760 px, inclusive em orientação horizontal, a navegação lateral desktop é mantida. A navegação inferior possui altura reservada no conteúdo, compensação de `safe-area-inset-*` e ajuste para telas baixas. Ações, modais, filtros e células receberam limites de dimensionamento, sem bloquear a rolagem da página para esconder problemas.

### Arquivos e compatibilidade

| Arquivo | Alteração |
| --- | --- |
| `css/v4.css` | Substituição de regras conflitantes do cabeçalho e consolidação dos estilos responsivos, indicadores, menus e componentes. |
| `js/global.js` | Marca no cabeçalho mobile, ícones, menu da conta, verificação de tela cheia e contador acessível limitado visualmente a 99+. |
| `README.md`, `DOCUMENTACAO.md` | Histórico e descrição da versão corretiva. |
| `TESTES_V4.1.1.md` | Relatório de validação e limitações. |

Os demais 15 arquivos originais permanecem idênticos byte a byte, inclusive `js/dados.js`, os módulos operacionais, login, CSS base e páginas HTML. A chave `gato-preto-cafe-v1` continua inalterada. Nenhuma dependência foi adicionada. Não há migração ou restauração automática de dados introduzida por esta atualização.

### Validação

A matriz de 13 dimensões e dois temas compreendeu 702 combinações de telas e funcionalidades, 130 verificações de cabeçalho, 120 menus da conta, 80 barras de navegação, 52 modais e 26 layouts de login. Também foram repetidos 21 cenários de deep linking e verificações de operações, permissões e tema. Não foram capturadas exceções JavaScript nem falhas nas asserções da matriz. Consulte TESTES_V4.1.1.md para metodologia, resultados e limitações. O ambiente bloqueia navegação HTTP/file; a validação foi feita com Chromium offline e simulação de armazenamento e parâmetros. A captura do problema citada no pedido não foi anexada ao ZIP nem disponibilizada nesta atualização; o diagnóstico foi realizado diretamente sobre os arquivos.


## V4.2 — Extensão das regras de negócio e identificação dos registros

### Diagnóstico e mudanças

A V4.1.1 integrava recebimentos, finalização e cancelamentos, mas uma compra manual de estoque não gerava despesa. Não havia custo médio, CMV, controle de perdas ou correção de despesas. Consultas e seletores de pedidos privilegiavam o número e escondiam a descrição dos produtos, sobretudo em registros recolhidos no celular.

| Operação | Regra implementada |
| --- | --- |
| Compra paga | Aumenta estoque e registra despesa paga vinculada. |
| Compra pendente | Aumenta estoque e registra obrigação; a quitação afeta o caixa. |
| Outra entrada | Aumenta estoque sem despesa; custo informado é opcional. |
| Venda | Conclusão confirma recebimento, baixa estoque e captura custo dos itens. |
| Perda, vencimento | Baixa física com custo econômico quando conhecido; sem novo pagamento. |
| Consumo interno / ajuste | Movimentação de estoque, não venda ou pagamento. |
| Devolução ao fornecedor | Saída física; se selecionada compra vinculada, crédito reduz obrigação ou reembolso reverte parte da despesa paga. |
| Devolução parcial de venda | Reposição dos itens indicados, com limites cumulativos; estorno opcional. |
| Estorno financeiro | Reduz receitas sem reposição física automática. |
| Cancelamento | Estorna somente saldo remanescente; reposição opcional desconta devoluções anteriores. |
| Correção de despesa | Pendentes: correção/cancelamento com histórico. Pagas: reversão, reembolso ou complemento registrado separadamente. Compras vinculadas não são editadas isoladamente. |

### Identificação e consulta

`itensTexto`, `pedidoLabel`, `pedidoResumo`, `pedidoBusca`, `receitaLabel` e `receitaResumo` em `js/global.js` centralizam a identificação. O número do pedido é preservado; os nomes e quantidades vêm de `pedido.itens`, não de uma consulta ao cadastro atual. Um pedido com mais de dois produtos apresenta resumo expansível; a busca considera todos os nomes, inclusive os omitidos do resumo. Consultas e histórico de pedidos, seletores de atualização/cancelamento/devolução/recebimento, notificações, dashboard e busca global foram atualizados. Receitas e histórico financeiro incluem os produtos vinculados quando o perfil também tem acesso a Pedidos; exportação de receitas e movimentações usa descrição completa. Consultas de estoque já exibiam nomes. Não são criados nomes para registros sem informações disponíveis. O CSS mantém Produtos, Origem, Descrição e Valor visíveis no registro mobile recolhido.

### Cálculos e modelo de dados

- Custo médio móvel: `(saldo anterior × custo médio anterior + quantidade recebida × custo unitário) / saldo novo`. Arredondamento do custo médio a seis casas; valores monetários registrados em centavos (duas casas). Se o saldo anterior for positivo com custo desconhecido, a média continua desconhecida até avaliação explícita ou esgotamento do saldo. O cálculo usa a ordem de registro das operações, não reprocessa custos quando uma data anterior é informada.
- Valor atual do estoque: soma de saldo × custo médio; indisponível se qualquer saldo positivo tiver custo desconhecido.
- Receita bruta de caixa: recebimentos positivos; receita líquida: recebimentos menos estornos. Saldo do período: receitas líquidas menos despesas pagas líquidas de reversões; despesas pendentes não reduzem caixa. O saldo do relatório por período inicia em zero, não representa conciliação bancária ou saldo de abertura acumulado.
- Vendas líquidas reconhecidas: totais dos pedidos concluídos na data da venda, menos estornos vinculados a vendas no período. Recebimento antecipado não é venda concluída. CMV: custo registrado nas saídas de venda menos custo das devoluções físicas. Lucro bruto = vendas líquidas reconhecidas − CMV. Margem bruta = lucro bruto / vendas líquidas reconhecidas × 100 (quando denominador positivo).
- Resultado operacional estimado = lucro bruto − perdas registradas − despesas operacionais pagas líquidas de reversões, excluídas compras de estoque. É um indicador gerencial híbrido, não uma DRE contábil. Se há compras antigas sem classificação de natureza ou custos necessários desconhecidos, o resultado fica indisponível. Receitas avulsas não compõem lucro de vendas; não há fichas técnicas, inventário por lote, tributos ou depreciação.
- Reposições usam o custo original de saída, com arredondamento cumulativo do CMV devolvido. Reversões de despesas são lançamentos negativos vinculados à despesa original; complementos são lançamentos positivos vinculados. Correção de lançamento e reembolso real são diferenciados na descrição e histórico; entram na data da correção/reembolso.

Campos aditivos: `custoMedio`, `ultimoCusto`, `historicoCusto` (produtos); `custoUnitario`, `custoTotal` (itens e movimentações), `origem`, `despesaId`, `compraOriginalId`, `creditoDespesaId`, `reembolsoId`, `movimentoOriginalId` (movimentos); `dataVenda` (pedidos); `natureza`, `movimentoId`, `produtoId`, `historico`, `estornoDe`, `ajusteDe`, `tipoAjuste` (despesas). Identificadores e registros anteriores são preservados. `migrar` retorna esquema 4, inicializa campos opcionais, não inventa custos nem lança despesas retroativas. A migração é persistida na próxima gravação normal, sem apagar a chave existente.

### Consistência, arquitetura e limites

`registrarMovimento`, `corrigirDespesa`, `devolverItens` e `indicadores` centralizam a nova lógica. As operações integradas validam antes da gravação única do objeto local e abortam em caso de erro de validação. Tokens de formulário impedem repetição das novas compras e devoluções; finalização e estornos mantêm os controles de saldo e duplicidade anteriores. Compras e créditos vinculados exigem Estoque e Financeiro; os detalhes financeiros de produtos são condicionados às permissões. A autenticação e a autorização continuam demonstrativas, executadas no cliente. localStorage não garante bloqueio entre abas, atomicidade multiusuário, segurança ou auditabilidade inviolável; não é apropriado para operação real.

### Rastreabilidade e modelagem

O diagrama não estava no ZIP analisado. Para atualizar os casos de uso, incluir compra integrada a lançamento financeiro, controle de custo, perdas e devolução ao fornecedor; devolução parcial de venda e estorno opcional; correção/reversão de despesas; consultas de rentabilidade e filtros por produto. Atualizar relações entre Estoque, Pedidos e Financeiro, respeitando a separação de atores. Não se afirma que o diagrama existente foi revisado.

### Arquivos e validação

Alterados `js/dados.js`, `js/estoque.js`, `js/pedidos.js`, `js/financeiro.js`, `js/global.js`, `js/dashboard.js`, `js/administracao.js`, `css/v4.css`, `index.html` e as cinco páginas HTML (referências estáticas versionadas), além deste documento e do README. `css/style.css`, `js/login.js`, `assets/logo.svg` e o relatório V4.1.1 foram preservados. Consulte TESTES_V4.2.md para resultados efetivos e pendências.


## V4.2.1 — Base inicial e restauração

- `inicial()` em `js/dados.js` gera uma base fictícia completa, identificada por `demonstracao.versao` e `ficticio` nos registros iniciais. Os sete produtos mantêm preços, mínimos e saldos finais do catálogo anterior.
- O saldo de abertura é calculado a partir do saldo-alvo, das compras, vendas, reposições e perdas previstas. O custo de abertura representa uma aquisição anterior fictícia, sem despesa de caixa no período. Para produtos sem compra no período, o último custo indica esse custo anterior simulado.
- A sequência cronológica aplica custo médio ponderado móvel com seis casas decimais e arredondamento monetário em centavos. A compra de espresso a R$ 2,50 demonstra alteração da média; cada venda guarda preço e custo históricos. Cada compra gera uma despesa vinculada reciprocamente. O pedido #1005 detalha a antiga receita agregada de R$ 180,00 na nova base, exclusivamente fictícia.
- Existem nove pedidos concluídos, dois em andamento, três compras (duas pagas e uma pendente), quatro despesas operacionais (três pagas e uma pendente), uma devolução de Cappuccino do pedido #1002 com estorno de R$ 14,00 e um desperdício de Brownie de R$ 4,00. O histórico contém 30 movimentos. Nenhuma baixa é aplicada novamente durante a leitura.
- Os cálculos existentes em `indicadores()` e as regras transacionais da V4.2 não foram modificados. A despesa de aquisição afeta o caixa apenas quando paga; o CMV reconhece o custo vendido líquido das reposições. Não há dupla dedução das compras no resultado operacional estimado.
- `ler()` valida a base somente ao criá-la quando não existe armazenamento local; `restaurar()` valida a nova base antes da substituição explicitamente confirmada. A chave `gato-preto-cafe-v1` e a versão do esquema (`4`) permanecem as mesmas. Não há preenchimento retroativo automático dos custos ou alteração de registros anteriormente salvos, inclusive demonstrativos antigos.
- As confirmações de restauração no login e na administração alertam para exportar backup antes da substituição. A seção Custos e rentabilidade explica como experimentar a nova base quando os custos anteriores estão incompletos. As seis páginas HTML referenciam os recursos com `?v=4.2.1`. CSS, layout, permissões e módulos de pedidos e estoque não foram alterados.
- A base fictícia completa apresenta receitas líquidas de R$ 484,00, despesas pagas de R$ 123,00, saldo de caixa de R$ 361,00, despesas pendentes de R$ 102,50, CMV de R$ 183,27, lucro bruto de R$ 300,73, margem aproximada de 62,13%, estoque de R$ 520,73, perdas de R$ 4,00 e resultado operacional estimado de R$ 233,73 quando todo o histórico é selecionado.

Consulte TESTES_V4.2.1.md para os testes e limitações. O sistema continua sendo um protótipo acadêmico de armazenamento local, não um sistema contábil ou financeiro homologado.


## V4.2.2 — Indicadores autoexplicativos

### Arquitetura da apresentação

`js/global.js` centraliza o catálogo `regrasIndicadores`, o componente `stat`, a formatação `percentual` e a construção das memórias. O cartão é um elemento HTML `details` com `summary`, título, valor, detalhe e seta decorativa. A expansão funciona sem bibliotecas, com clique, toque e teclado. `renderIndicators` conserva o estado aberto durante recálculos no mesmo conjunto de cartões. Os cards abertos podem usar toda a largura móvel; os recolhidos mantêm a grade anterior. A transição da seta respeita `prefers-reduced-motion`.

| Área | Abrangência | Critério temporal |
| --- | --- | --- |
| Visão geral e dashboard de pedidos | Pedidos registrados, concluídos, cancelados, ticket médio | Data de registro, situação atual do pedido |
| Resumo de pedidos | Quantidade, em andamento, concluídos, total não cancelado | Todos os registros |
| Estoque | Produtos cadastrados/ativos, categorias, estoque baixo, movimentações | Posição atual; movimentações podem ser filtradas |
| Financeiro | Recebimentos, despesas, caixa, totais de consultas e relatórios | Data do lançamento e filtros ativos |
| Custos e rentabilidade | Receitas, estornos, vendas reconhecidas, CMV, lucro, margens, perdas, valor do estoque, resultado | Data de venda/movimentação/lançamento, conforme a regra; valor de estoque é posição atual |
| Administração | Usuários, ativos, administradores e gerentes | Posição atual, inclusive contas inativas nos totais de perfil |

A comparação com o período anterior utiliza um intervalo de igual duração e a fórmula `(atual − anterior) / abs(anterior) × 100`, somente com base anterior diferente de zero. O ticket médio utiliza o total nominal de pedidos concluídos, não a receita líquida após estornos. A ajuda dos custos do produto usa a precisão do custo médio na memória, mesmo quando a interface monetária arredonda para centavos.

### Memórias financeiras e indisponibilidade

A função `Dados.indicadores(d, de, ate, memoria)` continua retornando os mesmos campos da V4.2.1. O quarto argumento opcional recebe os operandos calculados pela própria função, sem persistência ou nova consulta independente. A camada de apresentação consome esses operandos para explicar os resultados. O campo transitório `margemOperacional` é calculado por `resultado / receitaVendas × 100`, somente quando o resultado é conhecido e as vendas reconhecidas são positivas.

CMV desconhecido indica custo histórico ausente ou inválido nos itens/movimentações pertinentes. O estoque fica indisponível quando há produto com saldo positivo e custo médio desconhecido. Perdas exigem custo histórico; resultado operacional exige CMV, perdas e classificação das despesas de fornecedores. Margens exigem também vendas líquidas positivas. Nenhuma lacuna de custo recebe valor fictício na atualização.

Exemplo com todo o histórico da base V4.2.1: receitas líquidas = 498 − 14 = R$ 484,00; CMV = 188,27 − 5 = R$ 183,27; lucro bruto = 484 − 183,27 = R$ 300,73; margem bruta = 62,13%; resultado = 300,73 − 4 − 63 = R$ 233,73; margem operacional = 233,73 / 484 × 100 = 48,29%. Os resultados são gerenciais e não representam contabilidade homologada.

As memórias mostram até cinco parcelas de somas e o subtotal das restantes, sem listar dados de módulos não autorizados. Custos detalhados por produto continuam condicionados ao acesso financeiro. As prévias de relatórios recebem totais expansíveis, e os relatórios impressos mantêm critérios estáticos. Gráficos e totais de preenchimento de formulários não são cartões gerenciais e conservam seus controles existentes.

### Preservação e publicação

Base, identificadores, migração, credenciais, localStorage e operações financeiras permanecem inalterados. A versão da base demonstrativa continua `4.2.1` porque seus dados não foram modificados. Todos os HTML usam `?v=4.2.2`. Nenhuma dependência foi adicionada à execução do site. Consulte TESTES_V4.2.2.md para a validação e seus limites.


## V4.2.3 — Refinamento visual das tabelas

A concatenação identificada no histórico de estoque decorria da montagem do HTML com texto seguido de elementos `small` inline. Além disso, a regra geral `overflow-wrap:anywhere` permitia fragmentar datas e palavras curtas quando faltava espaço.

- `tabela()` em `js/global.js` utiliza uma área de conteúdo `.cell-content` em todas as células e identifica a natureza das colunas (`data-kind`) para formatar datas, números e descrições sem alterar valores.
- `cellDetail()` organiza descrição principal e metadados escapados, com marcadores neutros para classificações. O histórico de estoque utiliza essa função, preservando o controle de acesso a custos.
- `css/v4.css` padroniza espaçamento vertical, alinhamento numérico, largura de datas e responsáveis, quebra de descrições e distribuição das colunas. No mobile, o conteúdo permanece associado a um único rótulo e os detalhes são expansíveis como anteriormente. Os separadores de metadados são ocultados no mobile para evitar pontuação solta em linhas curtas.
- Ordenação, paginação, filtros, ações e exportações mantêm suas rotinas existentes. Relatórios impressos possuem alinhamento numérico adequado, sem controles interativos adicionais.

As tabelas de todos os módulos, inclusive aquelas utilizadas em modais e relatórios, compartilham o novo padrão. As listas de notificações, busca e seletores foram inspecionadas; não foram reestruturadas por já possuírem separação textual ou não utilizarem o componente de tabela. Em larguras intermediárias, a rolagem horizontal local de tabelas largas é intencional para não comprimir dados.

Nenhuma alteração em `dados.js`, permissões, persistência ou regras de negócio; referências estáticas versionadas com `?v=4.2.3`. A base demonstrativa permanece V4.2.1. Consulte TESTES_V4.2.3.md para resultados e limitações.


## V4.2.4 — Flexibilidade e usabilidade

### Monitoramento de estoque

O campo booleano `monitorarMinimo` é independente do campo numérico `minimo`. Na leitura/migração de dados anteriores, a ausência da opção equivale a `true`; os limites, custos, quantidades e demais registros permanecem intactos. Uma edição com a opção desligada mantém o mínimo anterior, e um novo produto sem monitoramento começa com mínimo numérico zero, mas com a flag desligada. Ativar permite informar/recuperar o limite. O valor zero com flag ligada é distinto de flag desligada.

`Dados.estoqueBaixo(p)` identifica produto ativo com monitoramento ligado e saldo menor que mínimo. `Dados.esgotado(p)` verifica saldo zero de produto ativo, e `Dados.alertaEstoque(p)` reúne os dois critérios. A situação visual usa `Dados.situacaoEstoque(p)`: Inativo, Esgotado, Estoque baixo, Sem mínimo ou Normal. A consulta específica reúne alertas, com filtros de esgotados e produtos abaixo do mínimo com saldo positivo. O indicador conta apenas os monitorados abaixo do mínimo. As notificações de esgotados usam filtro próprio e preservam o destaque contextual. As validações de quantidade na venda continuam obrigatórias.

Os produtos fictícios p1, p2 e p5 (bebidas preparadas) têm monitoramento desativado em novas bases/restauração explícita; não foram alterados os saldos, preços, custos ou lançamentos demonstrativos. Não se atribui automaticamente a configuração nova a bases já existentes. A classificação por fabricação/revenda e fichas técnicas não foi adicionada nesta versão: não é necessária ao monitoramento e poderia induzir interpretação de controle de ingredientes inexistente.

### Indicadores

O catálogo `regrasIndicadores` e `explicacaoIndicador` em `js/global.js` usam linguagem simples. As chaves internas dos indicadores permanecem estáveis, inclusive CMV e vendas reconhecidas, embora os títulos visíveis sejam mais descritivos. As memórias e operandos existentes são reutilizados, e `Dados.indicadores` não foi alterado. Exemplo do CMV: custo da fatia de bolo de R$ 5, mesmo vendida a R$ 12; o custo das devoluções físicas é descontado conforme as datas dos movimentos. Quando custos ou base de cálculo faltam, o cartão explica o motivo sem assumir zero.

### Ações por pedido

`acoesRegistro` é um componente reutilizável. Em pedidos, a primeira transição permitida é a ação principal; pedidos concluídos ou cancelados mostram detalhes. Outras ações originalmente disponíveis ficam no botão de três pontos, e cancelamento mantém a confirmação anterior. Em vez de duplicar eventos, o menu move os próprios botões com seus handlers para um painel fixo diretamente no `body`. Assim não é recortado pelo overflow da tabela. O painel é limitado pelo viewport, reposicionado em scroll/resize, fecha com clique externo, seleção ou Escape (com retorno de foco no Escape). Em mobile a coluna é visível inclusive com o registro recolhido. As consultas de estoque/administração já tinham uma única ação de edição e as financeiras não possuíam grupos de botões por linha; foram preservadas.

### Arquivos e compatibilidade

Modificados: `js/dados.js`, `js/global.js`, `js/estoque.js`, `js/dashboard.js`, `js/pedidos.js`, `js/financeiro.js` (somente textos neste último), `css/v4.css`, todos os HTML (versão dos recursos), README e documentação. A chave `gato-preto-cafe-v1` permanece a mesma. Não há dependências de execução novas. Testes: `tests/validar-estoque-minimo.cjs`, `tests/validar-v424-browser.py` e atualização das expectativas textuais/seletores de `tests/validar-indicadores-browser.py`. Consulte TESTES_V4.2.4.md.


## V4.2.5 — Ciclo de vida e reversões

O cancelamento anterior aceitava vendas concluídas e podia repor estoque. Agora `pedidoAberto`, `transicoesPedido`, `mudarStatusPedido`, `cancelar`, `estornarPedido` e `devolverItens` centralizam as regras. Pendente → Em preparo → Pronto → Concluído; permanece a finalização rápida a partir de um pedido aberto, sempre com confirmação de pagamento. Não há retorno de concluído ou cancelado ao fluxo. Edição somente em pendente/em preparo sem recebimento anterior. Cancelamento de pedido pago antecipadamente exige acesso financeiro e confirmação; não há reposição automática de estoque.

A situação de pagamento é derivada dos recebimentos e seus estornos. A venda concluída mantém valor, itens, custos e data originais. Estornos possuem identificador, motivo, data, forma, vínculo com recebimento e, quando informado, observação. O token de operação bloqueia repetição. A devolução registra condição, quantidades, responsável, data, motivo, vínculos com movimentos e estornos; devoluções sem reposição reduzem a quantidade elegível, sem registrar nova perda no cálculo, pois o custo já está no CMV. A reposição usa o custo histórico e recalcula o custo médio. A devolução pode ser registrada por grupos de mesma condição. Registros legados sem baixa comprovada não oferecem reposição automática. Cancelamentos legados não são reclassificados.

A migração aditiva `versaoPedidos=1` acrescenta listas de devoluções vazias onde inexistentes; devoluções antigas com entrada de estoque continuam contabilizadas pelas movimentações. A chave `gato-preto-cafe-v1` é preservada. As novas operações usam validação antes da gravação em um único objeto localStorage, sem garantias de concorrência entre abas ou segurança de produção. Não há integração bancária. Os indicadores financeiros permanecem calculados pelas fórmulas anteriores.

Arquivos alterados: `js/dados.js`, `js/pedidos.js`, `js/financeiro.js`, todos os HTML (versionamento), README, DOCUMENTACAO e testes. CSS e demais módulos permanecem iguais. O diagrama não acompanha o ZIP: recomenda-se distinguir Cancelar pedido, Estornar recebimento e Devolver produtos e seus vínculos com estoque/financeiro. Consulte TESTES_V4.2.5.md.


## V4.2.6 — Ordenação temporal e rastreabilidade

`instanteCronologico`, `ordenarCronologico`, `celulaCronologica` e `campoOrdem`, em `js/global.js`, centralizam a leitura de timestamps ISO, comparação numérica, apresentação em português brasileiro no fuso do navegador e seleção de ordem. Datas sem horário não são convertidas artificialmente em meia-noite. Empates usam ID, e históricos sem ID utilizam ordem estável da fonte. A ordenação é aplicada antes da paginação; o cabeçalho compara os atributos temporais, não a string exibida.

Em `js/financeiro.js`, a data `data` continua sendo a referência dos filtros e fórmulas financeiras. `registro` preserva o momento de inclusão. A função `Dados.quitar` agora grava também `registroPagamento` (ISO com milissegundos), mantendo `dataOriginal`, `dataPagamento` e o cadastro original. Quitações anteriores sem esse novo campo aparecem com horário não informado e exibem o cadastro quando conhecido. Uma operação informada retroativamente não adquire uma hora efetiva fictícia: o instante exibido é o da confirmação ou registro no sistema. Os relatórios detalhados recebem a ordenação e os timestamps; exportação CSV e impressão usam todas as linhas filtradas, na ordem selecionada. A evolução de caixa permanece agrupada em dias em ordem crescente para manter o acumulado coerente.

Recebimentos, compras, despesas, estornos, reembolsos e devoluções financeiras com lançamento próprio já gravavam `registro: agora()`. Correções de despesas pendentes e créditos sem movimentação de caixa têm seu instante em `historico`, e não geram lançamentos adicionais. O histórico principal é uma consulta de lançamentos, não um log de cada edição. Os históricos de pedidos usam o evento original de criação quando presente; detalhes mostram eventos, recebimentos e devoluções com segundos. Estoque tem filtros independentes de período e ordem no histórico de movimentações. Administração filtra pela data local da atividade.

Não há alteração da chave `localStorage`, fórmulas de rentabilidade ou dados demonstrativos. O campo de quitação é acrescentado apenas a pagamentos novos. A deduplicação de eventos `input`/`change` dos filtros evita reconstruções redundantes ao sair de um campo. Consulte TESTES_V4.2.6.md para escopo, resultados e limitações.


## Edição de código legível da V4.2.6

Esta edição reorganiza o código-fonte com indentação e comentários, sem introduzir funcionalidades. Consulte o [guia de leitura](GUIA_DO_CODIGO.md) e a validação da formatação.

## V4.2.6.1 — Confirmação de estornos

A devolução exige informar explicitamente o valor a devolver, inclusive zero quando não houver estorno. A confirmação indica o efeito financeiro e disponibiliza acesso direto ao histórico do pedido quando houver lançamento. O tipo da movimentação fica visível no celular e a consulta é atualizada ao restaurar uma página financeira. A camada de dados, os cálculos, a chave de armazenamento e os registros existentes permanecem inalterados. Consulte TESTES_V4.2.6.1.md.

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

### Regras de implementação

`Dados.registrarRecebimento`, `Dados.registrarDespesa`, `Dados.classificarDespesa` e `Dados.quitar` usam a transação local existente, com validação de permissões e dados. `Dados.saldoAReceber` usa o total menos o recebimento líquido. `antesDaVenda` distingue estornos de adiantamentos. O histórico geral deriva eventos não monetários de `despesas[].historico`; não cria novos lançamentos de caixa para eles. `dataOperacao` e `movimentoId` preservam vínculo e data de novos créditos. `itensDaReceita` resolve devoluções via `operacaoId` ou IDs de estornos registrados. Registros legados sem vínculos não recebem itens fictícios. A classificação legada modifica apenas a natureza e seu histórico, inclusive os ajustes associados. O filtro `realizado` exclui datas futuras dos indicadores e relatórios de caixa.

A arquitetura continua local e demonstrativa; a consistência de duas gravações simultâneas em abas distintas não é garantida pelo localStorage. O evento `storage` existente recarrega as páginas autorizadas, mas não é controle de concorrência. Não se alterou o critério de consumo interno e ajustes negativos de inventário, pois não eram defeitos comprovados na auditoria e exigem uma decisão contábil.


## V4.2.9 — Homologação e estabilização

A camada `dados.js` aplica `validarDataObrigacao` antes de correções de obrigações pendentes, créditos de fornecedores e quitações, impedindo aplicar saldo atual a datas anteriores a alterações conhecidas. A função `validar` confere os tipos, saldos, vínculos de reposição, compras, reembolsos, créditos, estados de pedidos e datas opcionais de quitação. `dataVenda` exclui pedidos ainda abertos. Não há reconstrução de lançamentos antigos; campos opcionais legados não são inventados.

O sistema mantém a métrica gerencial de resultado, sem redefinir consumo interno ou ajustes de inventário. A V4.2.9 preserva a arquitetura estática e a chave localStorage. Os HTML usam `?v=4.2.9`. Consulte auditoria, testes e matriz de rastreabilidade. Homologação limitada aos cenários executados; segurança e concorrência exigem arquitetura de servidor para uso real.
