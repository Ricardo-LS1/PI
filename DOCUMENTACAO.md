# Documentação técnica — O Gato Preto Café (V4.1)

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
| Consultar pedidos | Buscar número; filtrar data e situação; conferir itens, quantidades, valor e status. | Consultar pedidos / Ver pedido |
| Atualizar status | Localizar registro; validar transição; definir novo status; armazenar data da alteração. | Atualizar status |
| Cancelar pedido | Encontrar pedido; conferir possibilidade de cancelamento; informar motivo; registrar situação. | Cancelar pedido |
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
