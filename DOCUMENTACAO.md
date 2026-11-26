# Documentação técnica — O Gato Preto Café (V2)

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
