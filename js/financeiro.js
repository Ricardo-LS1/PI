// Interface financeira: entradas, despesas, quitações, estornos, histórico, relatórios e rentabilidade. O caixa considera pagamentos efetivos; o CMV usa custos históricos.

if (iniciarPagina('financeiro')) {
    const categorias = () => [...new Set(['Fornecedores', 'Operacional', 'Manutenção', 'Pessoal', 'Outros', ...Dados.ler().despesas.map(x => x.categoria)])];
    const tabs = ['Fluxo de caixa', 'Registrar recebimentos', 'Registrar despesas', 'Consultar receitas', 'Consultar despesas', 'Relatórios financeiros', 'Histórico financeiro', 'Quitar despesas', 'Registrar estornos', 'Corrigir despesas', 'Custos e rentabilidade'];

    // Atualiza os totais de receitas, pagamentos e despesas pendentes.
    const metrics = () => {
        const d = Dados.ler(), recebidos = d.receitas.filter(Dados.realizado), r = soma(recebidos), pagos = d.despesas.filter(x => x.situacao === 'Pago' && Dados.realizado(x)), pend = d.despesas.filter(x => x.situacao === 'Pendente'), p = soma(pagos), pv = soma(pend);
        $('#metricas').innerHTML = stat('Receitas líquidas', dinheiro(r), 'Todos os recebimentos', 'financeiro', { memory: memoriaReceitas(recebidos, r) })
            + stat('Despesas pagas líquidas', dinheiro(p), 'Pagamentos menos reversões', 'financeiro', { memory: memoriaSoma(pagos, p) })
            + stat('Saldo de caixa', dinheiro(r - p), 'Recebimentos − despesas pagas', 'dashboard', { memory: memoriaSaldo(r, p) })
            + stat('Despesas pendentes', dinheiro(pv), 'Ainda não pagas', 'alert', { memory: memoriaSoma(pend, pv) });
    };
    // Data informada da operação e instante de lançamento/confirmação são independentes.
    // Quitações antigas sem timestamp próprio nunca herdam a hora do cadastro.
    const registroFinanceiro = x => x.situacao === 'Pago' && (x.dataOriginal || x.dataPagamento || x.registroPagamento) ? x.registroPagamento || null : x.registro;
    const ordenarHistorico = (xs, ordem) => ordenarCronologico(xs, ordem, registroFinanceiro, x => x.id);
    const registroCelula = x => celulaCronologica(registroFinanceiro(x))
        + (x.dataOriginal
            ? (`<small>Cadastro: ${instanteCronologico(x.registro) === null
                ? 'Horário não informado'
                : esc(new Date(x.registro).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }))}` +
                `</small>`)
            : '');
    const registroCSV = x => instanteCronologico(registroFinanceiro(x)) === null ? 'Horário não informado' : registroFinanceiro(x);

    // O histórico distingue caixa realizado, obrigações e eventos sem impacto no caixa.
    // Eventos de correção são derivados do histórico original: não criam lançamentos duplicados.
    const registros = d => {
        const receitas = d.receitas.map(x => ({
            ...x,
            tipo: !Dados.realizado(x) ? 'Registro futuro' : x.estornoDe ? 'Estorno' : 'Entrada',
            origem: receitaLabel(x, d),
            detalhe: x.forma + ' · ' + (x.origem || 'Registro anterior') + (!Dados.realizado(x) ? ' · Não integra o caixa atual' : '')
        }));
        const despesas = d.despesas.map(x => ({
            ...x,
            tipo: x.situacao === 'Pendente' ? 'Despesa pendente' : x.situacao === 'Cancelado' ? 'Despesa cancelada' : !Dados.realizado(x) ? 'Registro futuro' : x.estornoDe ? 'Reversão de despesa' : 'Saída',
            origem: x.descricao,
            detalhe: x.categoria + ' · ' + x.situacao + (x.forma ? ' · ' + x.forma : '') + (x.situacao !== 'Pago' || !Dados.realizado(x) ? ' · Sem saída de caixa' : '')
        }));
        const eventos = d.despesas.flatMap(x => (x.historico || []).flatMap((h, i) => {
            const tipo = ({ 'Crédito por devolução': 'Crédito do fornecedor', 'Corrigir': 'Correção de obrigação', 'Cancelar': 'Cancelamento de obrigação', 'Classificação': 'Classificação de despesa' })[h.acao];
            if (!tipo)
                return [];
            const mov = d.movimentos.find(m => m.id === h.movimentoId);
            const data = h.dataOperacao || mov?.data || (Number.isFinite(Date.parse(h.data)) ? new Date(h.data).toLocaleDateString('sv-SE') : x.data);
            return [{
                id: 'evento-despesa:' + (h.id || x.id + ':' + i),
                data,
                registro: h.data || '',
                tipo,
                origem: h.descricaoOriginal || x.descricao,
                detalhe: (h.motivo || '') + ' · Sem movimentação de caixa' + (tipo === 'Classificação de despesa' ? ' · ' + (x.natureza || '') : ''),
                valor: Dados.money(h.valorCorrigido - h.valorOriginal),
                situacao: 'Evento'
            }];
        }));
        return [...receitas, ...despesas, ...eventos];
    };
    const tiposHistorico = ['Entrada', 'Saída', 'Estorno', 'Reversão de despesa', 'Despesa pendente', 'Despesa cancelada', 'Crédito do fornecedor', 'Correção de obrigação', 'Cancelamento de obrigação', 'Classificação de despesa', 'Registro futuro'];
    const saidaLancada = x => ['Saída', 'Reversão de despesa', 'Despesa pendente'].includes(x.tipo);
    const receitaTable = rs => tabela(['Data', 'Origem', 'Forma de pagamento', 'Tipo', 'Valor', 'Registro / quitação'], rs.map(x => [
        dataBR(x.data),
        receitaResumo(x),
        esc(x.forma),
        esc(x.origem || 'Registro anterior'),
        dinheiro(x.valor),
        registroCelula(x)
    ]), rs.map(x => x.id));
    const despesaTable = ds => tabela(['Data', 'Descrição', 'Categoria', 'Situação', 'Valor', 'Registro / quitação'], ds.map(x => [
        dataBR(x.data),
        esc(x.descricao) + (x.tipoAjuste ? '<small>' + esc(x.tipoAjuste) + '</small>' : '')
            + (x.historico?.length
                ? (`<details class="record-items">` +
                    `<summary>Histórico de alterações</summary>` +
                    `${x.historico.map(h => (`<small>${esc(h.acao)} · ${esc(h.motivo)} · ${esc(h.usuario)} · ${celulaCronologica(h.data)} · ${dinheiro(h.valorOriginal)} → ${dinheiro(h.valorCorrigido)}` +
                        `</small>`)).join('')}` +
                    `</details>`)
                : '')
            + (x.vencimento ? `<small>Vencimento: ${dataBR(x.vencimento)}</small>` : '')
            + (x.dataOriginal ? `<small>Original: ${dataBR(x.dataOriginal)} · ${esc(x.forma || '')}</small>` : ''),
        esc(x.categoria),
        pill(x.situacao),
        dinheiro(x.valor),
        registroCelula(x)
    ]), ds.map(x => x.id));
    const histTable = xs => tabela(['Data', 'Tipo', 'Origem', 'Detalhes', 'Valor', 'Registro / quitação'], xs.map(x => [
        dataBR(x.data),
        pill(x.tipo),
        (x.pedidoId ? receitaResumo(x) : esc(x.origem))
            + (x.situacao === 'Evento' ? '<small>Sem movimentação de caixa</small>'
                : ['Despesa pendente', 'Despesa cancelada'].includes(x.tipo) ? '<small>Sem saída de caixa</small>'
                    : x.tipo === 'Registro futuro' ? '<small>Fora do caixa atual</small>' : ''),
        esc(x.detalhe),
        dinheiro(x.valor),
        registroCelula(x)
    ]), xs.map(x => x.id)).replace('class="table-wrap"', 'class="table-wrap financial-history"');

    // Calcula entradas, saídas e saldo acumulado em ordem cronológica.
    function caixa(rs, ds, de, ate) {
        const pagos = ds.filter(x => x.situacao === 'Pago' && Dados.realizado(x)), r = soma(rs), s = soma(pagos);
        const datas = [...new Set([...rs, ...pagos].map(x => x.data))].sort();
        let acumulado = 0;
        const rows = datas.map(data => {
            const e = soma(rs.filter(x => x.data === data)), v = soma(pagos.filter(x => x.data === data));
            acumulado += e - v;
            return [dataBR(data), dinheiro(e), dinheiro(v), dinheiro(e - v), dinheiro(acumulado)];
        });
        return (`<div class="grid three">` +
            `${stat('Recebimentos', dinheiro(r), 'No período', 'financeiro', { scope: escopoPeriodo(de, ate), memory: memoriaReceitas(rs, r) })}${stat('Despesas pagas', dinheiro(s), 'No período', 'financeiro', { scope: escopoPeriodo(de, ate), memory: memoriaSoma(pagos, s) })}` +
            `${stat('Saldo do período', dinheiro(r - s), 'Entradas − saídas efetivas', 'dashboard', { scope: escopoPeriodo(de, ate), memory: memoriaSaldo(r, s) })}` +
            `</div>` +
            `<h3 style="margin-top:20px;margin-bottom:10px">Evolução por data</h3>` +
            `${tabela(['Data', 'Entradas', 'Saídas', 'Saldo diário', 'Saldo acumulado'], rows)}<p class="muted" style="margin-top:12px">Despesas pendentes não são deduzidas até serem pagas. O saldo acumulado começa em zero no período selecionado.</p>`);
    }

    // Monta a aba financeira selecionada, conecta os filtros e executa a operação correspondente.
    function render(i) {
        metrics();
        const root = $('#painel'), d = Dados.ler();
        if (i === 10) {
            root.innerHTML = card('Custos e rentabilidade', 'Indicadores econômicos separados do caixa. Custos históricos desconhecidos não são estimados.', `<form id="filtro" class="filters">${dateFields()}</form><div id="rentabilidade"></div>`);
            listenFilters($('#filtro'), () => {
                const v = Object.fromEntries(new FormData($('#filtro'))), m = {}, k = Dados.indicadores(Dados.ler(), v.de, v.ate, m), scope = escopoPeriodo(v.de, v.ate);
                const whyCMV = [m.itensSemCusto || m.movSemCusto ? `Falta informar o custo de ${m.itensSemCusto} item(ns) de vendas e ${m.movSemCusto} movimentação(ões).` : '', m.baixasAusentes ? `${m.baixasAusentes} venda(s) não possuem baixas de estoque completas. Confira o histórico.` : '', 'O sistema não considera esses custos como zero.'].filter(Boolean).join(' ');
                const whyResult = [k.cmv === null ? 'Faltam custos ou registros de baixa dos produtos vendidos.' : '', k.perda === null ? 'Faltam custos dos produtos perdidos.' : '', m.legado ? 'Há despesas de fornecedores que ainda precisam ser classificadas como compra de estoque ou despesa operacional.' : ''].filter(Boolean).join(' ');
                const whyMargin = k.lucro === null ? whyCMV : 'O valor das vendas após estornos precisa ser maior que zero para calcular a margem.';
                const money = dinheiro, formulaMargem = (x) => `(${money(x)} ÷ ${money(k.receitaVendas)}) × 100`;
                const vals = [
                    ['Receitas brutas', k.bruta, memoriaSoma(m.parcelasBrutas, k.bruta)],
                    ['Estornos', k.estornos, memoriaSoma(m.parcelasEstornos, k.estornos)],
                    ['Receitas líquidas', k.liquida, `${money(k.bruta)} − ${money(k.estornos)} = ${money(k.liquida)}.`],
                    ['Vendas líquidas reconhecidas', k.receitaVendas, `${money(m.vendasBrutas)} + (${money(m.ajustesVenda)}) = ${money(k.receitaVendas)}.`],
                    ['CMV líquido de reposições', k.cmv, k.cmv === null ? '' : `${money(m.custoSaidas)} − ${money(m.custoReposicoes)} = ${money(k.cmv)}.`, whyCMV],
                    ['Lucro bruto estimado', k.lucro, k.lucro === null ? '' : `${money(k.receitaVendas)} − ${money(k.cmv)} = ${money(k.lucro)}.`, whyCMV],
                    ['Margem bruta', k.margem, k.margem === null ? '' : `${formulaMargem(k.lucro)} = ${percentual(k.margem)}.`, whyMargin, true],
                    ['Valor atual do estoque', k.estoque, k.estoque === null ? '' : `${memoriaSoma(m.parcelasEstoque, k.estoque)} Os valores exibidos são arredondados; o total usa o custo médio completo.`, `${m.estoqueSemCusto} produto(s) com saldo positivo não têm custo médio conhecido.`],
                    ['Perdas e desperdícios', k.perda, k.perda === null ? '' : memoriaSoma(m.parcelasPerdas, k.perda), `${m.perdasSemCusto} registro(s) de perda sem custo informado.`],
                    ['Resultado operacional estimado', k.resultado, k.resultado === null ? '' : `${money(k.lucro)} − ${money(k.perda)} − ${money(m.operacional)} = ${money(k.resultado)}.`, whyResult],
                    ['Margem operacional estimada', m.margemOperacional, m.margemOperacional === null ? '' : `${formulaMargem(k.resultado)} = ${percentual(m.margemOperacional)}.`, k.resultado === null ? whyResult : 'O valor das vendas após estornos precisa ser maior que zero para calcular a margem.', true]
                ];
                const html = (`<div class="grid two">` +
                    `${vals.map(([label, val, memory, reason, pct]) => stat(label, val === null ? 'Indisponível' : pct ? percentual(val) : money(val), val === null ? 'Consulte a explicação' : label === 'Valor atual do estoque' ? 'Saldo atual, não histórico' : 'Período selecionado', 'financeiro', {
                        scope: label === 'Valor atual do estoque' ? 'Considera o estoque de hoje.' : scope,
                        memory,
                        reason: val === null ? reason : undefined
                    })).join('')}` +
                    `</div>` +
                    `<p class="note">Lucro bruto = vendas concluídas líquidas de estornos − CMV líquido das reposições físicas. Recebimentos antecipados não são vendas até a conclusão. O resultado operacional desconta perdas e pagamentos operacionais identificados; compras de estoque não são deduzidas novamente. Indicadores gerenciais, não contábeis.</p>` +
                    `${[k.cmv, k.estoque, k.resultado].some(x => x === null)
                        ? '<p class="note">Registros sem custo histórico ou classificação podem impedir o cálculo. Para experimentar a base fictícia completa, exporte um backup dos registros atuais e restaure os dados de demonstração em Administração ou no login. A restauração substitui a base local.</p>'
                        : ''}`);
                renderIndicators($('#rentabilidade'), html);
            });
        }
        else if (i === 9) {
            const candidatos = d.despesas.filter(x => !x.estornoDe && !x.ajusteDe && !x.movimentoId && x.situacao !== 'Cancelado' && (x.situacao === 'Pendente' || Dados.saldoDespesa(d, x) > 0 || !x.natureza));
            root.innerHTML = card('Corrigir ou reverter despesas', 'Preserve o lançamento original e o motivo. Compras vinculadas são tratadas no estoque.', (`<form id="corrigir-despesa" class="form-grid">` +
                `${field('Despesa', select('id', opcoes(candidatos.map(x => ({ value: x.id, label: x.descricao + ' · ' + x.situacao + ' · ' + dinheiro(x.valor) })), 'Selecione'), 'required'), true)}` +
                `${field('Operação', select('acao', opcoes([], 'Selecione a despesa'), 'required'))}${field('Valor (R$)', input('valor', 'number', 'min="0.01" step="0.01"'))}` +
                `${field('Natureza (para classificação)', select('natureza', opcoes(['Despesa operacional', 'Compra de estoque'], 'Selecione')))}${field('Descrição corrigida (opcional)', input('descricao'))}${field('Data da reversão', input('data', 'date', `required value="${Dados.dia()}"`))}` +
                `${field('Motivo', '<textarea name="motivo" required maxlength="200"></textarea>', true)}<p class="note full">Correção: redução de lançamento incorreto. Complemento: aumento de valor pago subregistrado. Reembolso: dinheiro efetivamente devolvido. Cancelamento: obrigação ainda não paga. Classificação: informe a natureza verdadeira de uma despesa antiga; não altera caixa nem cria estoque.</p>` +
                `${btn('Confirmar alteração')}</form>`));
            const f = $('#corrigir-despesa');
            f.elements.id.onchange = () => {
                const x = candidatos.find(x => x.id === f.elements.id.value);
                f.elements.acao.innerHTML = opcoes(x ? [...(x.situacao === 'Pago' ? ['Reembolso', 'Correção', 'Complemento'] : ['Corrigir', 'Cancelar']), ...(!x.natureza ? ['Classificar'] : [])] : [], 'Selecione');
                f.elements.valor.value = x?.situacao === 'Pendente' ? x.valor : '';
                f.elements.descricao.value = x?.situacao === 'Pendente' ? x.descricao : '';
            };
            handle(f, v => {
                if (v.acao === 'Classificar')
                    Dados.classificarDespesa(v.id, v.natureza, v.motivo);
                else
                    Dados.corrigirDespesa(v.id, v);
                tabsUI.open(4);
                feedback('Alteração registrada com histórico.');
            });
        }
        else if (i === 7) {
            const pend = d.despesas.filter(x => x.situacao === 'Pendente');
            root.innerHTML = card('Quitar despesas pendentes', 'Somente pagamentos confirmados afetam o caixa.', (`<form id="quitar" class="form-grid">` +
                `${field('Despesa', select('id', opcoes(pend.map(x => ({ value: x.id, label: x.descricao + ' · ' + dinheiro(x.valor) })), 'Selecione'), 'required'), true)}` +
                `${field('Forma', select('forma', opcoes(d.config.formas, 'Selecione'), 'required'))}${field('Data do pagamento', input('data', 'date', `required value="${Dados.dia()}"`))}` +
                `${btn('Confirmar quitação')}</form>`));
            handle($('#quitar'), v => {
                Dados.quitar(v.id, v.forma, v.data);
                tabsUI.open(4);
                feedback('Despesa quitada. Caixa atualizado.');
            });
        }
        else if (i === 8) {
            const rs = d.receitas.filter(r => !r.estornoDe && r.valor > 0 && Dados.realizado(r) && Dados.saldoEstorno(d, r) > 0 && (!r.pedidoId || d.pedidos.find(p => p.id === r.pedidoId)?.status !== 'Cancelado'));
            root.innerHTML = card('Registrar estornos', 'Estorne somente valores efetivamente recebidos, sem exceder o saldo.', (`<form id="estorno" class="form-grid">` +
                `${field('Recebimento original', select('id', opcoes(rs.map(r => ({
                    value: r.id,
                    label: receitaLabel(r, d, 2) + ' · disponível ' + dinheiro(Dados.saldoEstorno(d, r))
                })), 'Selecione'), 'required'), true)}` +
                `${field('Valor', input('valor', 'number', 'min="0.01" step="0.01" required'))}${field('Justificativa', '<textarea name="motivo" required maxlength="200"></textarea>', true)}` +
                `${field('Data da devolução', input('data', 'date', `required value="${Dados.dia()}" max="${Dados.dia()}"`))}${field('Forma de devolução', select('forma', opcoes(d.config.formas, 'Mesma forma do recebimento')))}` +
                `${field('Observações (opcional)', input('observacoes', 'text', 'maxlength="200"'), true)}<label class="row full">` +
                `<input name="confirmado" type="checkbox" required> Confirmo que devolvi o valor. Nenhum produto retornará ao estoque.</label>` +
                `${btn('Registrar estorno', 'danger')}</form>`));
            const token = Dados.id();
            handle($('#estorno'), v => {
                if (v.confirmado !== 'on')
                    throw Error('Confirme a devolução.');
                Dados.estornar(v.id, positive(v.valor, 'o valor'), requireText(v.motivo, 'a justificativa'), { ...v, token });
                tabsUI.open(3);
                feedback('Estorno registrado.');
            });
        }
        else if (i === 1) {
            root.innerHTML = card('Registrar recebimentos', 'Identifique a origem, a forma de pagamento e registre a entrada no caixa.', (`<form class="form-grid" id="receber">` +
                `${field('Vincular pedido (opcional)', select('pedidoId', opcoes(d.pedidos.filter(p => allowed(session(), 'pedidos') && Dados.pedidoAberto(p) && Dados.saldoAReceber(d, p) > 0).map(p => ({ value: p.id, label: pedidoLabel(p) })), 'Sem pedido vinculado'), ''), true)}` +
                `${field('Origem / descrição', input('descricao', 'text', 'required maxlength="120"'))}${field('Forma de pagamento', select('forma', opcoes(d.config.formas, 'Selecione'), 'required'))}` +
                `${field('Valor (R$)', input('valor', 'number', 'required min="0.01" step="0.01"'))}${field('Data do recebimento', input('data', 'date', `required value="${Dados.dia()}"`))}` +
                `<div class="note full">Para pagamento de pedido, selecione o pedido acima. Use recebimento avulso apenas para valores sem relação com pedidos. Na conclusão será cobrado somente o saldo restante.</div>` +
                `<div class="actions full">${btn('Salvar recebimento')}</div>` +
                `</form>`));
            const f = $('#receber');
            f.elements.pedidoId.onchange = () => {
                const p = Dados.ler().pedidos.find(x => x.id === f.elements.pedidoId.value);
                if (p) {
                    f.elements.descricao.value = 'Pedido #' + p.numero;
                    f.elements.valor.value = Dados.saldoAReceber(Dados.ler(), p).toFixed(2);
                }
            };
            const token = Dados.id();
            handle(f, v => {
                Dados.registrarRecebimento(v, token);
                tabsUI.open(3);
                feedback('Recebimento registrado no caixa.');
            });
        }
        else if (i === 2) {
            root.innerHTML = card('Registrar despesas', 'Registre despesas operacionais. Compras de mercadorias devem ser registradas em Estoque → Registrar entrada → Compra.', (`<form id="despesa" class="form-grid">` +
                `${field('Descrição', input('descricao', 'text', 'required maxlength="120"'), true)}${field('Categoria', select('categoria', opcoes(categorias(), 'Selecione'), 'required'))}` +
                `${field('Situação do pagamento', select('situacao', opcoes(['Pago', 'Pendente']), 'required'))}${field('Valor (R$)', input('valor', 'number', 'required min="0.01" step="0.01"'))}` +
                `${field('Data do registro / pagamento', input('data', 'date', `required value="${Dados.dia()}" max="${Dados.dia()}"`))}${field('Vencimento (opcional)', input('vencimento', 'date'))}<p class="note full">A data de pagamento não pode ser futura. Para uma conta a vencer, selecione Pendente.</p><div class="actions full">` +
                `${btn('Salvar despesa')}</div>` +
                `</form>`));
            const token = Dados.id();
            handle($('#despesa'), v => {
                Dados.registrarDespesa(v, token);
                tabsUI.open(4);
                feedback('Despesa registrada.');
            });
        }
        else {
            let title = ['Consultar fluxo de caixa', '', '', 'Consultar receitas', 'Consultar despesas', 'Gerar relatórios financeiros', 'Consultar histórico financeiro'][i];
            let filtro = dateFields();
            if ([3, 4, 6].includes(i))
                filtro += field('Pesquisar descrição ou produto', input('busca', 'search', 'placeholder="Nome ou código"'));
            if (i === 3)
                filtro += field('Forma de pagamento', select('forma', opcoes([...new Set([...d.config.formas, ...d.receitas.map(x => x.forma)])], 'Todas')));
            if (i === 4)
                filtro += field('Categoria', select('categoria', opcoes(categorias(), 'Todas')))
                    + field('Situação', select('situacao', opcoes(['Pendente', 'Pago', 'Cancelado'], 'Todas')));
            if (i === 6)
                filtro += field('Tipo', select('tipo', opcoes(tiposHistorico, 'Todos')));
            if (i === 5)
                filtro += field('Tipo de relatório', select('tipo', opcoes(['Fluxo de caixa', 'Receitas', 'Despesas', 'Movimentações'])));
            if ([3, 4, 5, 6].includes(i))
                filtro += campoOrdem();
            root.innerHTML = card(title, i === 6
                ? 'Filtre pela data da operação. Créditos e alterações de obrigações são eventos sem caixa; registros futuros antigos não entram nos totais realizados. A ordem usa o horário de registro ou quitação.'
                : 'Selecione o período e consulte os lançamentos registrados.', (`<form id="filtro" class="filters">${filtro}</form>` +
                `<div id="resultado" class="section-gap">` +
                `</div>` +
                `${i === 5
                    ? (`<div class="actions" style="margin-top:16px">` +
                        `${btn('Exportar CSV', 'primary', 'type="button" id="exportar"')}${btn('Imprimir / salvar PDF', 'primary', 'type="button" id="imprimir"')}` +
                        `</div>`)
                    : ''}`));
            const f = $('#filtro');
            let csv = [], relatorio = null, idsCSV = [];
            listenFilters(f, () => {
                const v = Object.fromEntries(new FormData(f));
                const dd = Dados.ler();
                const rs = ordenarHistorico(dd.receitas.filter(x => Dados.realizado(x) && periodo(x.data, v.de, v.ate) && (!v.forma || x.forma === v.forma) && (!v.busca || normalizarBusca(receitaLabel(x, dd)).includes(normalizarBusca(v.busca)))), v.ordem), ds = ordenarHistorico(dd.despesas.filter(x => (x.situacao !== 'Pago' || Dados.realizado(x)) && periodo(x.data, v.de, v.ate) && (!v.categoria || x.categoria === v.categoria) && (!v.situacao || x.situacao === v.situacao)
                    && (!v.busca || normalizarBusca(x.descricao).includes(normalizarBusca(v.busca)))), v.ordem);
                const hist = ordenarHistorico(registros(dd).filter(x => periodo(x.data, v.de, v.ate) && (i !== 6 || !v.tipo || x.tipo === v.tipo) && (!v.busca || normalizarBusca(x.origem + ' ' + x.detalhe).includes(normalizarBusca(v.busca)))), v.ordem);
                const tipo = i === 5 ? v.tipo : {
                    0: 'Fluxo de caixa',
                    3: 'Receitas',
                    4: 'Despesas',
                    6: 'Movimentações'
                }[i];
                const scope = [
                    escopoPeriodo(v.de, v.ate),
                    v.busca ? 'Busca: ' + v.busca : '',
                    v.forma ? 'Forma: ' + v.forma : '',
                    v.categoria ? 'Categoria: ' + v.categoria : '',
                    v.situacao ? 'Situação: ' + v.situacao : '',
                    i === 6 && v.tipo ? 'Tipo: ' + v.tipo : ''
                ].filter(Boolean).join(' · ');
                const total = (label, valor, key, memory) => stat(label, dinheiro(valor), 'Registros filtrados', 'financeiro', { key, scope, memory }).replace('card stat indicator', 'card stat indicator indicator-total');
                let html = '';
                if (tipo === 'Receitas') {
                    html = total('Receitas líquidas de estornos', soma(rs), 'Receitas líquidas', memoriaReceitas(rs, soma(rs))) + receitaTable(rs);
                    csv = [
                        ['Data', 'Origem', 'Forma', 'Valor', 'Registro / quitação'],
                        ...rs.map(x => [x.data, receitaLabel(x, dd), x.forma, x.valor, registroCSV(x)]),
                        ['Total', '', '', soma(rs), '']
                    ];
                }
                else if (tipo === 'Despesas') {
                    html = total(v.situacao ? 'Total de despesas · ' + v.situacao : 'Total de despesas (pagas e pendentes)', soma(ds.filter(x => x.situacao !== 'Cancelado')), 'Total de despesas', memoriaSoma(ds.filter(x => x.situacao !== 'Cancelado'), soma(ds.filter(x => x.situacao !== 'Cancelado'))))
                        + despesaTable(ds);
                    csv = [
                        ['Data', 'Descrição', 'Categoria', 'Situação', 'Valor', 'Registro / quitação', 'Cadastro original (se quitada)'],
                        ...ds.map(x => [x.data, x.descricao, x.categoria, x.situacao, x.valor, registroCSV(x), x.dataOriginal ? (x.registro || '') : '']),
                        ['Total (sem canceladas)', '', '', '', soma(ds.filter(x => x.situacao !== 'Cancelado')), '', '']
                    ];
                }
                else if (tipo === 'Fluxo de caixa') {
                    html = caixa(rs, ds, v.de, v.ate);
                    const ps = ds.filter(x => x.situacao === 'Pago');
                    let acum = 0;
                    csv = [
                        ['Data', 'Entradas', 'Saídas', 'Saldo diário', 'Acumulado'],
                        ...[...new Set([...rs, ...ps].map(x => x.data))].sort().map(data => {
                            const a = soma(rs.filter(x => x.data === data)), b = soma(ps.filter(x => x.data === data));
                            acum += a - b;
                            return [data, a, b, Math.round((a - b) * 100) / 100, Math.round(acum * 100) / 100];
                        }),
                        ['Total', soma(rs), soma(ps), Math.round((soma(rs) - soma(ps)) * 100) / 100, '']
                    ];
                }
                else {
                    html = (i === 5
                        ? total('Total de entradas', soma(hist.filter(x => x.tipo === 'Entrada')), 'Total de entradas', memoriaSoma(hist.filter(x => x.tipo === 'Entrada'), soma(hist.filter(x => x.tipo === 'Entrada'))))
                            + total('Estornos', -soma(hist.filter(x => x.tipo === 'Estorno')), 'Estornos do histórico', memoriaSoma(hist.filter(x => x.tipo === 'Estorno'), -soma(hist.filter(x => x.tipo === 'Estorno')), dinheiro, x => -x.valor))
                            + total('Total de saídas lançadas', soma(hist.filter(saidaLancada)), 'Total de saídas lançadas', memoriaSoma(hist.filter(saidaLancada), soma(hist.filter(saidaLancada))))
                        : '')
                        + histTable(hist);
                    csv = [
                        ['Data', 'Tipo', 'Origem', 'Detalhes', 'Valor', 'Registro / quitação', 'Cadastro original (se quitada)'],
                        ...hist.map(x => [x.data, x.tipo, x.origem, x.detalhe, x.valor, registroCSV(x), x.dataOriginal ? (x.registro || '') : '']),
                        ['Total de entradas', '', '', '', soma(hist.filter(x => x.tipo === 'Entrada')), '', ''],
                        ['Total de estornos', '', '', '', soma(hist.filter(x => x.tipo === 'Estorno')), '', ''],
                        [
                            'Total de saídas lançadas',
                            '',
                            '',
                            '',
                            soma(hist.filter(saidaLancada)),
                            '',
                            ''
                        ]
                    ];
                }
                idsCSV = (tipo === 'Receitas' ? rs : tipo === 'Despesas' ? ds : tipo === 'Movimentações' ? hist : []).map(x => x.id);
                if (i === 5)
                    f.elements.ordem.closest('.field').hidden = tipo === 'Fluxo de caixa';
                renderIndicators($('#resultado'), html);
                if (i === 5) {
                    relatorio = {
                        tipo,
                        de: v.de,
                        ate: v.ate,
                        rs,
                        ds,
                        hist,
                        csv
                    };
                    $('#resultado').insertAdjacentHTML('afterbegin', (`<div class="report-preview">` +
                        `<span class="eyebrow">RELATÓRIO GERENCIAL</span>` +
                        `<h2>${esc(tipo)}</h2>` +
                        `<p>${v.de ? dataBR(v.de) : 'Início dos registros'} — ${v.ate ? dataBR(v.ate) : 'Último registro'}</p>` +
                        `</div>`));
                }
            });
            $('#resultado').addEventListener('table-sorted', e => {
                if (e.detail.chronological && f.elements.ordem)
                    f.elements.ordem.value = e.detail.asc ? 'antigos' : 'recentes';
                if (i === 5 && idsCSV.length && e.detail.ids.length === idsCSV.length && e.detail.ids.every(id => idsCSV.includes(id))) {
                    const byId = new Map(idsCSV.map((id, j) => [id, csv[j + 1]]));
                    csv = [csv[0], ...e.detail.ids.map(id => byId.get(id)), ...csv.slice(idsCSV.length + 1)];
                    idsCSV = e.detail.ids;
                    relatorio.csv = csv;
                }
            });
            if (i === 5) {
                $('#exportar').onclick = () => {
                    downloadCSV('relatorio-financeiro.csv', csv);
                    feedback('Relatório exportado.');
                };
                $('#imprimir').onclick = () => {
                    if (relatorio)
                        imprimirRelatorio(relatorio);
                };
            }
        }
    }
    const tabsUI = abas(tabs, render);
    // Uma página restaurada pelo navegador pode conter uma tabela anterior ao estorno.
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        const f = $('#filtro');
        if (f) {
            metrics();
            f.dispatchEvent(new Event('change', { bubbles: true }));
            refreshModuleDashboard(Number($('#module-select').value));
        } else {
            tabsUI.refresh();
        }
    });
}
/* Relatório A4 independente da tela. A impressão do navegador permite salvar em PDF. */

// Prepara o relatório para impressão, com indicadores, gráficos e páginas de registros.
function imprimirRelatorio(r) {
    const d = Dados.ler(), recebido = soma(r.rs), pago = soma(r.ds.filter(x => x.situacao === 'Pago')), pendente = soma(r.ds.filter(x => x.situacao === 'Pendente')), f = financialSeries(r.rs, r.ds), dataEmissao = horaBR(Dados.agora()), periodoLabel = `${r.de ? dataBR(r.de) : 'Início dos registros'} a ${r.ate ? dataBR(r.ate) : 'Último registro'}`;
    const tipo = r.tipo, rows = r.csv.slice(1).filter(x => !String(x[0]).startsWith('Total')), headers = r.csv[0];
    const formatCell = (x, i) => {
        if (typeof x === 'number')
            return dinheiro(x);
        if (instanteCronologico(x) !== null)
            return new Date(x).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(x)))
            return dataBR(x);
        return String(x ?? '');
    };
    const pages = [];
    let chunk = [], weight = 0;
    for (const row of rows) {
        const w = Math.max(1, ...row.map(x => Math.ceil(String(x ?? '').length / (headers.length > 5 ? 18 : 25)))) + 1;
        if (chunk.length && (weight + w > 24 || chunk.length >= 12)) {
            pages.push(chunk);
            chunk = [];
            weight = 0;
        }
        chunk.push(row);
        weight += w;
    }
    if (chunk.length || !pages.length)
        pages.push(chunk);
    const cards = (tipo === 'Receitas'
        ? [['Receitas líquidas', recebido], ['Lançamentos', r.rs.length, 'count']]
        : tipo === 'Despesas'
            ? [['Despesas lançadas', pago + pendente], ['Pagas', pago], ['Pendentes', pendente]]
            : [
                ['Receitas líquidas', recebido],
                ['Despesas pagas', pago],
                ['Saldo do período', recebido - pago],
                ['Despesas pendentes', pendente]
            ]);
    const chart = tipo === 'Receitas'
        ? rawRing(groupValues(r.rs.filter(x => x.valor > 0), x => x.forma), true, dinheiro)
        : tipo === 'Despesas'
            ? rawBars(groupValues(r.ds.filter(x => x.situacao !== 'Cancelado' && x.valor > 0), x => x.categoria).slice(0, 8), true, dinheiro)
            : rawLines(f.labels, [{ label: 'Receitas', values: f.r }, { label: 'Despesas pagas', values: f.p }]);
    const totalPages = pages.length + 1;
    const head = (page) => (`<header class="report-header">` +
        `<img src="../assets/logo.svg" alt="">` +
        `<div>` +
        `<strong>${esc(d.config.nome)}</strong>` +
        `<small>GESTÃO FINANCEIRA · PROJETO INTEGRADOR</small>` +
        `</div>` +
        `<span>RELATÓRIO<br>GERENCIAL</span>` +
        `</header>` +
        `<div class="report-title">` +
        `<span>FINANCEIRO / ${esc(tipo.toUpperCase())}</span>` +
        `<h1>${esc(page === 1 ? tipo : 'Detalhamento dos registros')}</h1>` +
        `<p>${esc(periodoLabel)} · Emissão: ${esc(dataEmissao)}</p>` +
        `</div>`);
    const foot = i => (`<footer class="report-footer">` +
        `<span>${esc(d.config.nome)} · Dados fictícios de demonstração</span>` +
        `<strong>${String(i).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}</strong>` +
        `</footer>`);
    let report = $('#print-report');
    if (!report) {
        report = document.createElement('div');
        report.id = 'print-report';
        document.body.append(report);
    }
    report.innerHTML = (`<section class="report-page">${head(1)}<div class="report-kpis">` +
        `${cards.map(([label, value, count]) => `<div><small>${esc(label)}</small><strong>${esc(count ? numero(value) : dinheiro(value))}</strong></div>`).join('')}` +
        `</div>` +
        `<div class="report-chart">` +
        `<h2>Visão de desempenho</h2>` +
        `<p>` +
        `${tipo === 'Receitas'
            ? 'Recebimentos brutos por forma de pagamento (estornos excluídos)'
            : tipo === 'Despesas' ? 'Despesas por categoria' : 'Recebimentos e pagamentos por data (R$)'}` +
        `</p>${chart}</div>` +
        `<div class="report-summary">` +
        `<h2>Resumo e critérios</h2>` +
        `<p>` +
        `${esc(tipo === 'Receitas'
            ? `Foram registrados ${r.rs.length} lançamentos de receita (recebimentos e estornos). Receita líquida = soma dos valores positivos e negativos.`
            : tipo === 'Despesas'
                ? `Foram registradas ${r.ds.length} despesas. Despesas lançadas = pagas + pendentes (sem canceladas); pendentes não representam saída efetiva do caixa.`
                : `Foram registrados ${r.rs.length} recebimentos e ${r.ds.length} despesas. Receitas líquidas = recebimentos menos estornos. Saldo = receitas líquidas menos despesas pagas (líquidas de reversões), sem saldo anterior.`)}` +
        `</p>` +
        `<p>Os registros detalhados constam nas páginas seguintes. Documento demonstrativo, sem validade contábil ou fiscal.</p>` +
        `</div>${foot(1)}</section>` +
        `${pages.map((chunk, i) => (`<section class="report-page">${head(i + 2)}<h2>${esc(tipo)} · registros ${rows.length ? pages.slice(0, i).reduce((n, p) => n + p.length, 0) + 1 : 0} a ${pages.slice(0, i + 1).reduce((n, p) => n + p.length, 0)} de ${rows.length}` +
            `</h2>` +
            `${tabela(headers, chunk.map(row => row.map((x, j) => esc(formatCell(x, j)))))}${foot(i + 2)}</section>`)).join('')}`);
    document.body.classList.add('printing-report');
    window.print();
}
window.addEventListener('afterprint', () => document.body.classList.remove('printing-report'));
