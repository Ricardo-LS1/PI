# Relatório de testes — Gato Preto Café V4.1.1

## Ambiente e metodologia

Chromium headless controlado por Playwright. Os HTML, estilos e scripts do ZIP foram inseridos diretamente nos documentos, na ordem de carregamento do projeto. O armazenamento local foi simulado em memória e os parâmetros de URL foram simulados nos testes de navegação contextual; nenhuma alteração de teste foi incorporada ao código de entrega. Dados demonstrativos e registros temporários foram utilizados apenas no ambiente de testes.

## Matriz de responsividade executada

| Dimensão (px) | Tema claro | Tema escuro |
| --- | --- | --- |
| 320 × 568 | Aprovado | Aprovado |
| 360 × 640 | Aprovado | Aprovado |
| 375 × 667 | Aprovado | Aprovado |
| 390 × 844 | Aprovado | Aprovado |
| 412 × 915 | Aprovado | Aprovado |
| 480 × 800 | Aprovado | Aprovado |
| 768 × 1024 | Aprovado | Aprovado |
| 1024 × 768 | Aprovado | Aprovado |
| 1440 × 900 | Aprovado | Aprovado |
| 568 × 320 | Aprovado | Aprovado |
| 640 × 360 | Aprovado | Aprovado |
| 844 × 390 | Aprovado | Aprovado |
| 915 × 412 | Aprovado | Aprovado |

Em cada combinação de tamanho e tema, foram renderizados o dashboard e as 26 funcionalidades dos módulos pedidos, estoque, financeiro e administração. Os painéis expansíveis foram abertos para testar indicadores, gráficos, filtros e tabelas. Foram verificadas as dimensões do cabeçalho, a ausência de interseção entre seus controles e o conteúdo, os limites do menu da conta e dos modais, o espaço reservado para a navegação inferior e a ausência de overflow horizontal da página. A matriz também conferiu a grade de duas colunas dos indicadores quando visíveis em largura mobile.

| Verificação executada | Quantidade / resultado |
| --- | --- |
| Combinações de telas e funcionalidades | 702, sem falhas nas asserções |
| Cabeçalhos | 130, sem sobreposição nas verificações geométricas |
| Menus da conta abertos/fechados | 120, sem falhas |
| Barras inferiores em largura mobile | 80, espaço reservado confirmado |
| Modais de busca e notificações | 52, limites geométricos aprovados |
| Layouts de login | 26, sem overflow horizontal |
| Exceções JavaScript não tratadas (`pageerror`) | 0 capturadas na matriz |
| Rolagem horizontal indevida do documento | 0 detectada na matriz |
| Sintaxe JavaScript | Todos os oito arquivos JS verificados com `node --check` |

## Regressão funcional executada

- 21 cenários de navegação contextual: seis tipos de destino e um registro em página posterior, em 320×568, 390×844 e 1024×768. Links relativos, abas, filtros, destaque e limpeza de contexto verificados com parâmetros simulados. Registro indisponível também verificado.
- Login nessas três dimensões: acesso aos perfis demonstrativos e alternância da visibilidade da senha; em 360×320, botão acessível por rolagem com o campo de senha focado. Não se trata de teclado físico.
- Cadastro de produto e entrada no estoque; registro e conclusão de pedido, baixa de estoque e recebimento integrado. Os dados do produto foram transferidos entre documentos usando o armazenamento simulado.
- Registro e quitação de despesa em 320×568 no tema escuro, conferindo a alteração no armazenamento simulado.
- Perfil Gerente em cinco dimensões, com ausência da administração na navegação; identificação do cargo e alternância de tema verificadas.
- Recolhimento do menu lateral desktop, busca global, notificações, filtros de período e controle de legenda de gráfico.
- Omissão do botão de tela cheia quando `fullscreenEnabled` é falso (condição simulada); contador de alertas acima de 99 exibido como `99+`.

## Inspeção de código e integridade

- `js/dados.js` e os módulos de negócio foram comparados byte a byte com a V4.1 e permanecem intactos. A chave de armazenamento não foi alterada. Os mecanismos de autenticação, permissões, persistência, download e impressão permanecem no projeto.
- As referências relativas de CSS/JS e os caminhos das páginas foram preservados, mantendo a estrutura destinada ao GitHub Pages.
- As áreas de segurança são compensadas por CSS `env(safe-area-inset-*)`; os valores físicos de recortes e barras de sistema não foram reproduzidos.
- A rolagem permanece disponível para conteúdo longo e telas pequenas. A navegação inferior é usada até 760 px; acima disso é aplicado o layout de tablet/desktop, inclusive quando a tela está na horizontal.

## Limitações e pendências

O ambiente bloqueou navegação real por HTTP e `file://`. Assim, os testes não comprovam navegação de ponta a ponta em hospedagem, persistência real entre páginas e versões, autorização de tela cheia, comportamento do teclado virtual e recortes físicos, impressão/PDF ou downloads. Não foi feita homologação em Safari ou Firefox nem em dispositivo físico. Foram monitoradas exceções JavaScript não tratadas, não uma auditoria exaustiva de todas as mensagens de console/rede. A captura do problema mencionada no pedido não estava disponível; a auditoria foi realizada sobre o ZIP da V4.1.

Para validação final, publicar no mesmo endereço do GitHub Pages, sem restaurar os dados, e confirmar os registros preexistentes, menu, notificações, login, teclado virtual e a navegação em ambas as orientações no dispositivo real. A autenticação e os dados continuam sendo demonstrativos, não adequados a uso de produção.
