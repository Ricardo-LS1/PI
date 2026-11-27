# Guia de leitura do código — Gato Preto Café V4.2.9

> Pacote de publicação: os scripts, relatórios de auditoria e evidências de testes citados neste documento estão no ZIP completo da V4.2.9, não neste pacote.

O guia nasceu na edição de código legível da V4.2.6 e acompanha as correções posteriores até a V4.2.9. O sistema continua em HTML, CSS e JavaScript.

## 1. Por onde começar

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Tela de acesso: estrutura HTML e formulário. |
| `js/login.js` | Ações da tela de acesso e sessão local. |
| `pages/*.html` | Estrutura inicial das páginas internas. |
| `js/dashboard.js` | Indicadores e visão geral. |
| `js/pedidos.js` | Formulários, consultas e ações dos pedidos. |
| `js/estoque.js` | Cadastro de produtos, movimentações e alertas. |
| `js/financeiro.js` | Receitas, despesas, histórico e relatórios. |
| `js/administracao.js` | Usuários, permissões, configurações e backups. |
| `js/dados.js` | Armazenamento local e regras de negócio integradas. |
| `js/global.js` | Funções e componentes usados por vários módulos. |
| `css/style.css` | Estilos gerais, cores, formulários, tabelas e gráficos. |
| `css/v4.css` | Ajustes de interface e responsividade da série V4. |
| `assets/logo.svg` | Logotipo vetorial. |
| `tests/` | Testes automatizados e evidências de validação. |

Para estudar, uma sequência possível é: `index.html` → `login.js` → `dados.js` (começando por `ler`, `salvar` e `atualizar`) → `pedidos.js` → demais módulos.

## 2. Convenções de leitura

- Indentação de quatro espaços: o conteúdo de um bloco fica deslocado em relação ao bloco externo.
- `//`: comentário de uma linha em JavaScript; `/* ... */`: comentário em JavaScript ou CSS; `<!-- ... -->`: comentário em HTML.
- `const` declara uma referência que não pode ser reatribuída; `let` permite reatribuição.
- `=>` indica uma função de seta (arrow function). Por exemplo, `p => p.saldo === 0` recebe um produto e verifica se o saldo é zero.
- `map`, `filter`, `find` e `reduce` transformam, filtram, localizam e acumulam elementos de listas, respectivamente.
- `$()` é uma função definida em `global.js`, que utiliza `querySelector` para localizar elementos da página.
- `${...}` insere o resultado de uma expressão em uma string de template delimitada por crases. Fragmentos de HTML são concatenados com `+` para permitir a leitura sem acrescentar espaços ao conteúdo gerado.
- `localStorage` guarda dados no navegador. O sistema é um protótipo: não oferece autenticação de servidor nem um banco de dados transacional.

## 3. Como uma venda funciona

1. O usuário confirma o pedido e o pagamento na interface (`pedidos.js`, função `finalizarUI`).
2. A interface chama `Dados.finalizar` (`dados.js`).
3. Essa função valida o estado do pedido, o pagamento e o saldo dos produtos.
4. A operação registra a receita, a saída de estoque e o custo dos itens e marca o pedido como concluído.
5. Os dados são persistidos localmente e a interface atualiza a consulta.

Estornos e devoluções usam funções distintas da função de cancelamento. Os indicadores econômicos são calculados em `Dados.indicadores`. O histórico financeiro utiliza a ordenação cronológica compartilhada em `global.js`.

## 4. O que foi e não foi alterado

O HTML, CSS, JavaScript do aplicativo e SVG foram formatados, e comentários explicativos em português foram acrescentados aos trechos relevantes. Os quatro scripts de teste Node.js também receberam formatação. Os scripts de teste Python e os arquivos históricos de resultados foram preservados. Nomes de funções, identificadores, estrutura de armazenamento, algoritmos, dados demonstrativos e versão funcional permanecem os mesmos. Expressões curtas e algumas strings longas foram mantidas quando dividi-las tornaria a leitura pior ou exigiria refatoração adicional.

Consulte `TESTES_LEGIBILIDADE.md` para as verificações realmente executadas nesta edição.

### V4.2.6.1

A função `confirmarDevolucao`, em `js/pedidos.js`, consulta os estornos já persistidos e cria o aviso com acesso ao histórico, sem alterar os dados. O destino é tratado em `notificationContext` (`js/global.js`).

## V4.2.7

O arquivo `dados.js` concentra as operações de recebimento, despesa, classificação, quitação e validação de datas. `saldoAReceber` evita pagamentos duplicados em pedidos, e `antesDaVenda` distingue estornos de adiantamento dos estornos de vendas concluídas. `financeiro.js` deriva os eventos de obrigações do histórico das despesas, sem duplicar os totais de caixa. `global.js` resolve quais itens pertencem a um estorno e compartilha as regras de caixa com os indicadores. `estoque.js` informa o efeito financeiro das devoluções aos fornecedores e exige vínculo quando há crédito.

## V4.2.8

- `dados.js`: `validar` confere estrutura, limites e vínculos; `atualizar` verifica sessão e fotografia dos dados antes de salvar. `porId` e `agrupar` são índices temporários, não tabelas novas.
- `estornarInterno`, `devolverItens` e `reverterDespesaInterno` conferem a sequência das datas. `indicadores` verifica a presença das baixas originais da venda.
- `pedidoEditavel` considera o pagamento líquido, não apenas a existência de recebimentos; o recebimento guarda os itens da época.
- `global.js`: escapamento de atributos, CSV e ordenação de valores. `login.js`: atalhos fictícios. `administracao.js`: verificações adicionais de acesso.
- `tests/validar-auditoria-v428.cjs`: testes independentes de dados. `tests/validar-auditoria-v428-browser.py`: verificações em Chromium offline.
- A verificação de concorrência não substitui um banco transacional. Dados previamente incoerentes não são reparados sem evidência.


## V4.2.9

- `validarDataObrigacao`: compara a data solicitada com as datas conhecidas das alterações de saldo. É chamada antes de registrar correções, créditos e quitações.
- `validar`: novas verificações de consistência de dados e vínculos de backups. Uma exceção impede a persistência da operação.
- `dataVenda`: pedidos abertos não são contabilizados como vendas.
- `tests/validar-homologacao-v429.cjs`: casos específicos, com comparação antes/depois.
- `tests/validar-propriedades-v429.cjs`: modelo de referência em centavos e quantidades inteiras, com sementes reproduzíveis.
