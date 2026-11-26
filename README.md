# O Gato Preto Café — Protótipo de gestão V2

Projeto Integrador de Análise e Desenvolvimento de Sistemas. Interface interna voltada aos donos e gerentes do estabelecimento. Base: **Diagrama Gato Preto Café Revisado** (5 páginas) e **Sistema de Gestão do O Gato Preto Café** (6 páginas), fornecidos pelo grupo.

## Executar

O projeto utiliza HTML, CSS e JavaScript puro, sem dependências, backend ou banco de dados. Recomenda-se abrir por HTTP para que todas as páginas compartilhem o mesmo LocalStorage. No terminal, dentro da pasta do projeto:

```sh
python3 -m http.server 8000
```

Acesse `http://localhost:8000/`. O comportamento de LocalStorage com `file://` depende do navegador; o servidor local é apenas para servir arquivos estáticos.

## GitHub Pages

1. Crie um repositório no GitHub, por exemplo `gato-preto-cafe`.
2. Envie **o conteúdo** desta pasta à raiz da branch `main` (o `index.html` deve ficar na raiz do repositório).
3. Abra Settings > Pages, selecione Deploy from a branch, `main` e `/ (root)` e salve.
4. Acesse o endereço indicado pelo GitHub Pages. Não é necessário instalar dependências ou configurar um servidor de aplicação.

## Acessos fictícios

| Perfil | Login | Senha inicial |
|---|---|---|
| Administrador | admin | admin123 |
| Gerente | gerente | gerente123 |

Os botões de demonstração preenchem as credenciais de uma conta ativa do perfil correspondente. Por padrão, o gerente utiliza Pedidos, Estoque e Financeiro; o administrador também utiliza Administração. Os módulos operacionais podem ser liberados ou bloqueados individualmente por um administrador. Todas as páginas possuem modo escuro persistente. Os dados e a sessão ficam no navegador, não são compartilhados entre dispositivos. A autenticação e as permissões são somente simulações, sem segurança de produção. Não use dados pessoais, financeiros ou senhas reais. É possível restaurar a base fictícia pela tela de login ou pela Administração.

## Rastreabilidade do diagrama revisado

Cada linha corresponde a um caso de uso. As duas subfunções e quatro operações do documento estão relacionadas aos controles ou comportamentos descritos. Login, painel inicial, exportação CSV, identidade visual e restauração são complementos de demonstração.

| Módulo / caso de uso | Subfunções e operações / localização |
|---|---|
| Pedidos — Registrar pedido | Montar pedido: selecionar produtos, informar quantidades; concluir registro: verificar disponibilidade, calcular total e salvar. Aba Registrar pedido. |
| Pedidos — Consultar pedidos | Localizar pedidos: pesquisar número, filtrar data/status; examinar pedido: ver itens/quantidades, consultar valor/situação. Aba Consultar pedidos e Ver pedido. |
| Pedidos — Atualizar status | Validar alteração: localizar pedido, verificar transição; registrar mudança: selecionar status, salvar data. Aba Atualizar status. |
| Pedidos — Cancelar pedido | Verificar cancelamento: localizar pedido, conferir situação; efetivar cancelamento: informar motivo, registrar status. Aba Cancelar pedido. |
| Pedidos — Consultar histórico | Pesquisar registros: período e situação; consultar eventos: criação/alterações e datas de cancelamento. Aba Histórico de pedidos. |
| Estoque — Cadastrar produtos | Identificar produto: nome/categoria, unidade/descrição; definir parâmetros: preço, saldo inicial/mínimo. Aba Cadastrar produtos. |
| Estoque — Consultar estoque | Pesquisar produtos: nome, categoria; verificar disponibilidade: saldo, preço/unidade. Aba Consultar estoque. |
| Estoque — Registrar entrada | Identificar item: pesquisar/selecionar produto e conferir cadastro; registrar entrada: quantidade/data, atualizar saldo/histórico. Aba Registrar entrada. |
| Estoque — Registrar saída | Validar retirada: selecionar produto, conferir saldo; registrar saída: quantidade/motivo, atualizar saldo/histórico. Aba Registrar saída. |
| Estoque — Ajustar estoque | Conferir divergência: saldo registrado e quantidade apurada; aplicar correção: justificativa, saldo/histórico. Aba Ajustar estoque. |
| Estoque — Consultar produtos com estoque baixo | Detectar nível baixo: comparar saldo ao mínimo, identificar abaixo do limite; consultar alertas: listar críticos, filtrar categoria. Aba Estoque baixo. |
| Financeiro — Registrar recebimentos | Identificar origem: vínculo opcional com pedido, forma de pagamento; registrar entrada: valor/data, salvar caixa. Aba Registrar recebimentos. |
| Financeiro — Registrar despesas | Caracterizar despesa: descrição/categoria; lançar despesa: valor/data, situação. Aba Registrar despesas. |
| Financeiro — Consultar receitas | Pesquisar recebimentos: período/forma; consolidar receitas: lançamentos/total. Aba Consultar receitas. |
| Financeiro — Consultar despesas | Pesquisar despesas: período/categoria; consolidar despesas: lançamentos/total. Aba Consultar despesas. |
| Financeiro — Consultar fluxo de caixa | Apurar movimentações: somar recebimentos/despesas pagas; apresentar saldo: saldo do período/evolução por data. Aba Fluxo de caixa. |
| Financeiro — Gerar relatórios | Definir relatório: tipo/período; preparar relatório: dados/totais, visualizar ou exportar. Aba Relatórios financeiros. |
| Financeiro — Consultar histórico | Pesquisar lançamentos: período/tipo; examinar registros: origem/valor e data de registro. Aba Histórico financeiro. |
| Administração — Cadastrar usuários | Identificar usuário: nome/login e credenciais iniciais; atribuir acesso: perfil e ativação. Aba Cadastrar usuários. |
| Administração — Gerenciar usuários e permissões | Manter contas: editar dados, ativar/inativar; administrar permissões: alterar perfil, revisar e configurar acesso por módulo. Aba Gerenciar usuários e permissões. |
| Administração — Configurar sistema | Ajustar operação: dados do café, formas de pagamento; gerenciar configurações: parâmetros gerais, salvar. Aba Configurar sistema. |

## Decisões de demonstração

- O diagrama revisado tem prioridade para as operações detalhadas. A apresentação fornece o contexto do negócio. O logo SVG é uma identidade gráfica proposta, não uma reprodução do logo oficial.
- Status de pedido: Pendente, Em preparo, Pronto, Concluído e Cancelado. Transições progressivas podem pular etapas, inclusive finalizar diretamente. Cancelamento permitido antes da conclusão, mediante motivo. Essas regras são propostas, não validadas com a empresa.
- Pedidos conferem disponibilidade, mas não reservam nem baixam estoque automaticamente. Entradas, saídas e recebimentos são registrados manualmente nos módulos correspondentes, porque a integração automática não está especificada.
- Saldo crítico significa estritamente abaixo do mínimo. Quantidades de pedido são inteiras; estoque admite até três casas decimais. O catálogo demonstra produtos vendidos individualmente.
- Fluxo de caixa considera despesas pagas; consulta de despesas inclui pagas e pendentes. Saldo do período é a diferença entre recebimentos e despesas pagas nesse período, sem saldo inicial anterior.
- Configuração administrativa mantém os dois perfis do diagrama e permite personalizar acessos operacionais individualmente. Administração continua exclusiva do perfil Administrador. Moeda BRL fixa; observação geral e dados do café editáveis. Não é possível retirar o acesso administrativo da própria sessão.
- Formas de pagamento editáveis, relatório CSV para abrir em planilhas, relatório A4 dedicado com gráficos e paginação via impressão do navegador e tema persistente. O projeto não integra WhatsApp nem Excel automaticamente.


## Novidades da V2

- Painel inicial e dashboards de Pedidos, Estoque e Financeiro, com filtros de período independentes. Os indicadores gerais dos módulos abrangem todo o histórico; o dashboard expandível apresenta os indicadores filtrados. Saldo de estoque representa sempre a posição atual.
- Gráficos nativos em SVG/CSS (pizza, rosca, linhas, área e barras horizontais/verticais), derivados dos registros locais. Produtos mais vendidos considera somente pedidos concluídos. Movimentações de estoque contabiliza registros por tipo, evitando somar unidades diferentes.
- Finalização, atualização progressiva e cancelamento rápidos diretamente na consulta de pedidos, mantendo as abas originais e o histórico.
- Permissões por conta, menu e painel filtrados e verificação de acesso na inicialização de cada página. Usuários sem acesso ao estoque podem selecionar itens do catálogo ao registrar pedidos, mas não consultam os saldos na interface. Sem acesso a Pedidos, não podem vincular novos recebimentos a pedidos. Dados já lançados em um módulo autorizado continuam visíveis nesse módulo. A proteção é apenas demonstrativa, não impede inspeção do código ou armazenamento.
- Campos de data com texto brasileiro, máscara, calendário nativo e validação de período. Datas de lançamento mantêm a sugestão do dia atual; filtros começam vazios. Se um filtro é inválido, o último resultado válido fica visível e as exportações são desabilitadas.
- Menu recolhível, tabelas em cartões nas telas pequenas, modo escuro persistente, foco visível e tela cheia (com alternativa visual se a API de tela cheia não for suportada). Smart TVs antigas podem não suportar todos os recursos nativos; testar o navegador do aparelho antes da apresentação.
- Histórico fictício adicional na base inicial V2. Registros locais da V1 são mantidos se a hospedagem/origem não mudar; permissões antigas recebem acesso padrão. Para visualizar o novo histórico, use Restaurar dados de demonstração (substitui os dados locais).

### Relatórios PDF

Financeiro → Relatórios financeiros → selecione tipo e período → **Imprimir / salvar PDF**. Na janela de impressão, escolha Salvar como PDF, papel A4, escala padrão e desative cabeçalhos/rodapés do navegador se estiverem habilitados. O relatório tem capa gerencial, indicadores, gráfico, resumo, tabelas de registros e rodapé numerado. Não há biblioteca PDF externa. O navegador é responsável pelo arquivo final; resultados podem variar conforme navegador e opções de impressão.

## Verificação V2

- Revisão dos arquivos e da matriz de rastreabilidade, sintaxe JavaScript e referências HTML relativas.
- Chromium em ambiente de teste com HTML/CSS/JS carregados diretamente e armazenamento simulado: login, filtros de data, tema, cadastro e movimentações de estoque, registro/finalização/cancelamento de pedido, histórico, recebimentos e despesas, permissões e ocultação de módulos.
- Layout das cinco telas internas verificado sem transbordamento horizontal global nas larguras de 360, 768, 1920 e 3840 px.
- PDF de fluxo de caixa gerado e inspecionado, com correção da quebra de página do rodapé.
- Limitações: o ambiente de teste bloqueou navegação direta por HTTP, HTTPS e file://; portanto não foi possível homologar navegação real, armazenamento real entre páginas, download CSV pela janela do navegador ou publicação. A interface e os controles foram testados diretamente; nem todos os caminhos de erro, navegadores, controles remotos, calendários nativos e combinações de dispositivos foram exercitados. A validação final no Firefox/GitHub Pages e em dispositivos físicos ainda é necessária.
