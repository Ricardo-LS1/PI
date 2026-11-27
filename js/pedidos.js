// Interface de pedidos: consulta, cadastro, edição, andamento, pagamento, cancelamento e devolução. As alterações de negócio são delegadas ao objeto Dados.

if (iniciarPagina('pedidos')) {
    const estados = ['Pendente', 'Em preparo', 'Pronto', 'Concluído', 'Cancelado'];

    // As ações disponíveis seguem as transições definidas na camada de dados.
    const transicoes = Object.fromEntries(estados.map(status => [status, Dados.transicoesPedido({ status })]));
    const cancelavel = Dados.pedidoAberto;
    const tabs = ['Consultar pedidos', 'Registrar pedido', 'Atualizar status', 'Cancelar pedido', 'Histórico de pedidos', 'Devolver itens'];
    const metricas = () => {
        const ps = Dados.ler().pedidos;
        $('#metricas').innerHTML = stat('Pedidos registrados', ps.length, 'Todos os pedidos', 'pedidos')
            + stat('Em andamento', ps.filter(cancelavel).length, 'Pendentes, em preparo ou prontos', 'coffee')
            + stat('Concluídos', ps.filter(p => p.status === 'Concluído').length, 'Pedidos finalizados', 'check')
            + stat('Valor dos pedidos', dinheiro(soma(ps.filter(p => p.status !== 'Cancelado'), p => p.total)), 'Sem pedidos cancelados', 'financeiro', { memory: memoriaSoma(ps.filter(p => p.status !== 'Cancelado'), soma(ps.filter(p => p.status !== 'Cancelado'), p => p.total), dinheiro, p => p.total) });
    };
    function mudarStatus(id, status) {
        Dados.mudarStatusPedido(id, status);
    }

    // Abre a confirmação de pagamento antes de concluir a venda e baixar o estoque.
    function finalizarUI(id) {
        const d = Dados.ler(), p = d.pedidos.find(x => x.id === id);
        if (!p || !cancelavel(p))
            return feedback('Pedido não pode ser concluído.', true);
        const saldo = Dados.resumoPagamento(d, id).liquido;
        const falta = Dados.saldoAReceber(d, p);
        const anterior = d.receitas.find(r => r.pedidoId === id && !r.estornoDe && Dados.saldoEstorno(d, r) > 0);
        const dlg = modal('Finalizar pedido #' + p.numero, (`<form id="finalizar" class="section-gap">` +
            `<div class="total">` +
            `<span>Saldo a receber</span>` +
            `<strong>${dinheiro(falta)}</strong>` +
            `</div>` +
            `${field(falta > 0 ? 'Forma de pagamento do saldo' : 'Forma de pagamento registrada', select('forma', opcoes(d.config.formas, 'Selecione'), 'required'))}<label class="row">` +
            `<input type="checkbox" name="confirmado" required> Confirmo que o pagamento foi recebido (incluindo o saldo restante, se houver).</label>` +
            `<p class="note">` +
            `${saldo > 0 ? 'Já recebido: ' + dinheiro(saldo) + '. Confirme apenas o saldo restante; não será cobrado novamente o valor conciliado.' : 'O estoque e o financeiro serão atualizados juntos.'} Sem pagamento, mantenha o pedido em andamento.</p>` +
            `${btn('Confirmar e finalizar')}</form>`));
        const f = $('#finalizar', dlg);
        if (anterior)
            f.elements.forma.value = anterior.forma;
        handle(f, v => {
            Dados.finalizar(id, v.forma, v.confirmado === 'on');
            dlg.close();
            tabsUI.open(0);
            feedback('Pedido concluído. Estoque e financeiro atualizados.');
        });
    }

    // Confere o estado do pedido e exige confirmação de devolução se houver pagamento antecipado.
    function cancelarUI(id, motivoInicial = '') {
        const d = Dados.ler(), p = d.pedidos.find(x => x.id === id);
        if (!cancelavel(p))
            return feedback('Somente pedidos em andamento podem ser cancelados.', true);
        const saldo = Dados.resumoPagamento(d, id).liquido;
        if (saldo > 0 && !allowed(session(), 'financeiro'))
            return feedback('O pedido possui pagamento antecipado. Solicite a um usuário com acesso financeiro.', true);
        const dlg = modal('Cancelar pedido #' + p.numero, (`<form id="cancelar-rapido" class="section-gap">` +
            `${field('Motivo do cancelamento', '<textarea name="motivo" required maxlength="200"></textarea>')}${saldo > 0
                ? (`<div class="note">Pagamento antecipado: ${dinheiro(saldo)}. Devolva o valor ao cliente antes de confirmar.</div>` +
                    `<label class="row">` +
                    `<input name="confirmado" type="checkbox" required> Confirmo a devolução do pagamento.</label>`)
                : '<div class="note">Não há pagamento a devolver. O estoque não será alterado.</div>'}` +
            `${btn('Confirmar cancelamento', 'danger')}</form>`));
        $('#cancelar-rapido', dlg).elements.motivo.value = motivoInicial;
        handle($('#cancelar-rapido', dlg), v => {
            Dados.cancelar(id, v.motivo, false, v.confirmado === 'on');
            dlg.close();
            tabsUI.open(0);
            feedback('Pedido cancelado; consequências registradas.');
        });
    }
    const elegivelDevolucao = (d, p) => p.status === 'Concluído' && p.integracao === 'v3' && p.itens.some(it => Dados.saldoDevolucao(d, p.id, it.produtoId) > 0);

    // Localiza o lançamento gravado, sem criar um segundo estorno.
    function confirmarDevolucao(pid, token, fisica = false) {
        const d = Dados.ler();
        const estornos = ordenarCronologico(d.receitas.filter(r =>
            r.pedidoId === pid && r.estornoDe && r.operacaoId === token));
        const total = -soma(estornos);
        const mensagem = estornos.length
            ? `Estorno de ${dinheiro(total)} registrado no financeiro.`
            : 'Devolução de itens registrada. Nenhum valor foi estornado; não há nova movimentação financeira.';
        const aviso = document.createElement('div');
        aviso.className = 'notification-context';
        aviso.id = 'resultado-devolucao';
        aviso.setAttribute('role', 'status');
        aviso.innerHTML = `<div><strong>${fisica ? 'Devolução de itens' : 'Estorno financeiro'}</strong><p>${esc(mensagem)}</p></div>`;
        if (estornos.length && allowed(session(), 'financeiro')) {
            const link = document.createElement('a');
            link.className = 'btn small';
            link.textContent = 'Ver no histórico financeiro';
            link.href = 'financeiro.html?' + new URLSearchParams({ alerta: 'Estorno', registro: estornos[0].id });
            aviso.append(link);
        }
        $('#filtro').before(aviso);
        feedback(mensagem);
    }

    // Permite registrar estorno somente para venda concluída com saldo financeiro disponível.
    function estornoUI(id) {
        const d = Dados.ler(), p = d.pedidos.find(x => x.id === id), r = Dados.resumoPagamento(d, id);
        if (!allowed(session(), 'financeiro') || p?.status !== 'Concluído' || r.liquido <= 0)
            return feedback('Não há valor disponível ou permissão para estorno.', true);
        const token = Dados.id(), dlg = modal('Registrar estorno · #' + p.numero, (`<form id="estorno-pedido" class="section-gap">` +
            `<div class="note">Recebido: ${dinheiro(r.bruto)} · Já estornado: ${dinheiro(r.estornado)} · Disponível: ${dinheiro(r.liquido)}` +
            `</div>` +
            `${field('Valor a estornar (R$)', input('valor', 'number', `required min="0.01" max="${r.liquido}" step="0.01"`))}${field('Data da devolução', input('data', 'date', `required value="${Dados.dia()}" max="${Dados.dia()}"`))}` +
            `${field('Forma de devolução', select('forma', opcoes(d.config.formas, 'Selecione'), 'required'))}${field('Motivo', '<textarea name="motivo" required maxlength="200"></textarea>')}` +
            `${field('Observações (opcional)', '<textarea name="observacoes" maxlength="200"></textarea>')}<p class="note" id="efeito-estorno">O estoque não será alterado. Este registro não executa uma transferência bancária.</p>` +
            `<label class="row">` +
            `<input type="checkbox" name="confirmado" required> Confirmo a devolução do valor ao cliente.</label>` +
            `${btn('Confirmar estorno', 'danger')}</form>`));
        const f = $('#estorno-pedido', dlg);
        f.elements.valor.oninput = () => $('#efeito-estorno', dlg).textContent = 'Será descontado ' + dinheiro(Number(f.elements.valor.value) || 0) + ' das receitas. Nenhum produto retornará ao estoque.';
        handle(f, v => {
            if (v.confirmado !== 'on')
                throw Error('Confirme a devolução.');
            Dados.estornarPedido(id, Number(v.valor), v.motivo, { ...v, token });
            dlg.close();
            tabsUI.open(0);
            confirmarDevolucao(id, token);
        });
    }

    // Seleciona a ação principal e as opções secundárias conforme o pedido e as permissões.
    const acoesRapidas = p => {
        const d = Dados.ler(), fin = allowed(session(), 'financeiro'), saldo = Dados.resumoPagamento(d, p.id).liquido;
        const detalhe = btn('Ver pedido', 'small', `type="button" data-pedido="${esc(p.id)}"`), editar = btn('Editar pedido', 'small', `type="button" data-edit="${esc(p.id)}"`), cancelar = btn('Cancelar pedido', 'danger small', `type="button" data-cancel="${esc(p.id)}"`);
        const etapas = transicoes[p.status] || [], botoes = etapas.map(x => btn(({
            'Em preparo': 'Iniciar preparo',
            'Pronto': 'Marcar pronto',
            'Concluído': 'Finalizar'
        })[x], 'small', `type="button" data-quick="${esc(p.id)}" data-status="${esc(x)}"`));
        const podeEditar = Dados.pedidoEditavel(d, p);
        const extras = p.status === 'Concluído'
            ? [...(elegivelDevolucao(d, p) ? [btn('Registrar devolução', 'small', `type="button" data-return="${esc(p.id)}"`)] : []), ...(fin && saldo > 0 ? [btn('Registrar estorno', 'danger small', `type="button" data-refund="${esc(p.id)}"`)] : [])]
            : [];
        return acoesRegistro(botoes.length ? botoes[0].replace('btn small', 'btn primary small') : detalhe, botoes.length ? [detalhe, ...(podeEditar ? [editar] : []), ...botoes.slice(1), ...(saldo <= 0 || fin ? [cancelar] : [])] : extras, `Pedido #${p.numero}`);
    };

    // Permite editar somente pedidos nos estados admitidos pelas regras de negócio.
    function editarUI(id) {
        const p = Dados.ler().pedidos.find(x => x.id === id);
        if (!Dados.pedidoEditavel(Dados.ler(), p))
            return feedback('Pedido não editável ou já pago.', true);
        const d = Dados.ler();
        const dlg = modal('Editar pedido #' + p.numero, (`<form id="editar-pedido" class="section-gap">` +
            `<p class="muted">Ajuste as quantidades. Zero remove um item. O preço dos itens já registrados é preservado.</p>` +
            `${d.produtos.filter(x => x.ativo !== false || p.itens.some(i => i.produtoId === x.id)).map(x => field(esc(p.itens.find(i => i.produtoId === x.id)?.nome ?? x.nome) + ' · ' + dinheiro(p.itens.find(i => i.produtoId === x.id)?.preco ?? x.preco), input('q_' + x.id, 'number', `min="0" step="1" value="${p.itens.filter(i => i.produtoId === x.id).reduce((a, i) => a + i.qtd, 0)}" required`))).join('')}` +
            `<div class="total">` +
            `<span>Novo total</span>` +
            `<strong id="edit-total">` +
            `</strong>` +
            `</div>${btn('Salvar alterações')}</form>`));
        const f = $('#editar-pedido', dlg);
        const itens = () => d.produtos.filter(x => Number(f.elements['q_' + x.id]?.value) > 0).map(x => ({
            produtoId: x.id,
            nome: p.itens.find(i => i.produtoId === x.id)?.nome ?? x.nome,
            preco: p.itens.find(i => i.produtoId === x.id)?.preco ?? x.preco,
            qtd: Number(f.elements['q_' + x.id].value)
        }));
        const total = () => Dados.money(soma(itens(), x => x.preco * x.qtd));
        f.oninput = () => $('#edit-total').textContent = dinheiro(total());
        f.oninput();
        handle(f, () => {
            Dados.atualizar(dd => {
                const atual = dd.pedidos.find(x => x.id === id);
                if (!Dados.pedidoEditavel(dd, atual))
                    throw Error('Pedido já pago ou não editável.');
                Dados.validarItens(dd, itens());
                atual.itens = itens();
                atual.total = total();
                Dados.evento(dd, atual, 'Itens e total alterados');
            }, 'Edição do pedido #' + p.numero);
            dlg.close();
            tabsUI.open(0);
            feedback('Pedido atualizado.');
        });
    }

    // Apresenta a situação financeira sem alterar o estado operacional do pedido.
    const pagamentoLabel = p => {
        const r = Dados.resumoPagamento(Dados.ler(), p.id);
        if (Dados.pedidoAberto(p)) {
            if (r.liquido >= p.total) return 'Pago antecipadamente';
            if (r.liquido > 0) return 'Parcialmente pago';
            if (r.estornado > 0) return 'Aguardando novo pagamento';
        }
        if (p.status === 'Concluído' && r.liquido === p.total) return 'Pago';
        if (r.estornado > 0)
            return r.liquido <= 0 ? 'Integralmente estornado' : 'Parcialmente estornado';
        if (r.bruto > 0)
            return p.status === 'Concluído' ? 'Pago' : 'Pago antecipadamente';
        return p.status === 'Concluído' ? 'Pagamento histórico não conciliado' : p.status === 'Cancelado' ? 'Sem pagamento' : 'Aguardando pagamento';
    };

    // Reúne os eventos do pedido, recebimentos, estornos e devoluções.
    const resumoHistorico = p => {
        const d = Dados.ler(), r = Dados.resumoPagamento(d, p.id), rs = ordenarCronologico(d.receitas.filter(x => x.pedidoId === p.id));
        const estorno = rs.find(x => x.estornoDe);
        const linkHistorico = estorno && allowed(session(), 'financeiro')
            ? `<a class="btn small" href="financeiro.html?${esc(new URLSearchParams({ alerta: 'Estorno', registro: estorno.id }).toString())}">Ver estornos no histórico financeiro</a>`
            : '';
        return (`${allowed(session(), 'financeiro')
            ? (`<div class="note">Valor original: ${dinheiro(p.total)} · Recebido: ${dinheiro(r.bruto)} · Estornado: ${dinheiro(r.estornado)} · Valor líquido recebido: ${dinheiro(r.liquido)}` +
                `</div>`)
            : ''}` +
            `${allowed(session(), 'financeiro') && rs.length
                ? '<h3>Histórico financeiro</h3>'
                    + tabela(['Data', 'Descrição', 'Forma', 'Valor', 'Data de registro'], rs.map(x => [dataBR(x.data), esc(x.descricao), esc(x.forma), dinheiro(x.valor), celulaCronologica(x.registro)]))
                : ''}` + linkHistorico +
            `${p.devolucoes?.length
                ? '<h3>Devoluções registradas</h3>'
                    + tabela(['Data e hora', 'Produtos', 'Condição', 'Reposição', 'Motivo'], ordenarCronologico(p.devolucoes, 'recentes', x => x.data).map(x => [
                        celulaCronologica(x.data),
                        esc(Object.entries(x.quantidades).map(([k, q]) => q + '× ' + (p.itens.find(it => it.produtoId === k)?.nome || k)).join(' · ')),
                        esc(x.condicao),
                        x.repor ? 'Sim' : 'Não',
                        esc(x.motivo)
                    ]))
                : ''}`);
    };
    const detalhes = p => (`<div class="section-gap">` +
        `<div class="row">` +
        `<strong>Pedido #${p.numero}</strong>${pill(p.status)}<span class="muted">${dataBR(p.data)}</span>` +
        `<small>Pagamento: ${esc(pagamentoLabel(p))}</small>` +
        `</div>` +
        `${tabela(['Produto', 'Quantidade', 'Unitário', 'Subtotal', ...(allowed(session(), 'financeiro') && p.integracao ? ['Custo registrado'] : [])], p.itens.map(it => [
            esc(it.nome),
            numero(it.qtd),
            dinheiro(it.preco),
            dinheiro(it.preco * it.qtd),
            ...(allowed(session(), 'financeiro') && p.integracao ? [custoLabel(it.custoTotal)] : [])
        ]))}` +
        `<div class="total">` +
        `<span>Total do pedido</span>` +
        `<strong>${dinheiro(p.total)}</strong>` +
        `</div>` +
        `${p.motivo ? `<div class="note">Motivo do cancelamento: ${esc(p.motivo)}</div>` : ''}${resumoHistorico(p)}<h3>Histórico de eventos</h3>` +
        `${tabela(['Data e hora', 'Evento'], ordenarCronologico(p.eventos, 'recentes', e => e.data).map(e => [celulaCronologica(e.data), esc(e.texto) + (e.usuario ? ' · ' + esc(e.usuario) : '')]))}` +
        `</div>`);

    // Renderiza a funcionalidade escolhida e conecta os formulários e botões às operações.
    function render(i) {
        metricas();
        const root = $('#painel'), d = Dados.ler();
        if (i === 0 || i === 4) {
            const hist = i === 4;
            const criacao = p => p.eventos.find(e => /pedido (registrado|criado)/i.test(e.texto))?.data;
            root.innerHTML = card(hist ? 'Consultar histórico de pedidos' : 'Consultar pedidos', hist ? 'Consulte registros, datas de criação, alterações e cancelamentos.' : 'Localize pedidos e examine seus itens e valores.', (`<form id="filtro" class="filters">` +
                `${field('Pedido ou produto', input('busca', 'search', 'placeholder="Ex.: 1004 ou cappuccino"'))}${dateFields()}${field('Situação', select('status', opcoes(estados, 'Todas')))}` +
                `${campoOrdem()}</form>` +
                `<div id="lista">` +
                `</div>`));
            const f = $('#filtro');
            listenFilters(f, () => {
                const v = Object.fromEntries(new FormData(f));
                const ps = ordenarCronologico(Dados.ler().pedidos.filter(p => pedidoBusca(p, v.busca.replace('#', '')) && periodo(p.data, v.de, v.ate) && (!v.status || p.status === v.status)), v.ordem, criacao);
                $('#lista').innerHTML = tabela(['Pedido', 'Data', 'Produtos', 'Status', 'Total', 'Data de registro', hist ? 'Eventos' : 'Ações'], ps.map(p => [
                    '<strong>#' + p.numero + '</strong>',
                    dataBR(p.data),
                    pedidoResumo(p) + '<small>' + numero(soma(p.itens, it => it.qtd)) + ' itens</small>',
                    pill(p.status) + '<small>Pagamento: ' + esc(pagamentoLabel(p)) + '</small>',
                    dinheiro(p.total),
                    celulaCronologica(criacao(p)),
                    hist ? btn('Ver histórico', 'small', `type="button" data-pedido="${esc(p.id)}"`) : acoesRapidas(p)
                ]), ps.map(p => p.id));
                $('#lista').querySelectorAll('[data-pedido]').forEach(b => b.onclick = () => {
                    const p = Dados.ler().pedidos.find(x => x.id === b.dataset.pedido);
                    modal(hist ? 'Histórico de pedido' : 'Detalhes do pedido', detalhes(p));
                });
                $('#lista').querySelectorAll('[data-quick]').forEach(b => b.onclick = () => {
                    if (b.dataset.status === 'Concluído')
                        return finalizarUI(b.dataset.quick);
                    try {
                        mudarStatus(b.dataset.quick, b.dataset.status);
                        tabsUI.open(0);
                        feedback('Status atualizado.');
                    }
                    catch (e) {
                        feedback(e.message, true);
                    }
                });
                $('#lista').querySelectorAll('[data-cancel]').forEach(b => b.onclick = () => cancelarUI(b.dataset.cancel));
                $('#lista').querySelectorAll('[data-edit]').forEach(b => b.onclick = () => editarUI(b.dataset.edit));
                $('#lista').querySelectorAll('[data-refund]').forEach(b => b.onclick = () => estornoUI(b.dataset.refund));
                $('#lista').querySelectorAll('[data-return]').forEach(b => b.onclick = () => {
                    tabsUI.open(5);
                    const f = $('#devolver-itens');
                    f.elements.id.value = b.dataset.return;
                    f.elements.id.onchange();
                });
            });
            $('#lista').addEventListener('table-sorted', e => {
                if (e.detail.chronological)
                    f.elements.ordem.value = e.detail.asc ? 'antigos' : 'recentes';
            });
        }
        else if (i === 1) {
            let itens = [];
            root.innerHTML = card('Registrar pedido', 'Monte o pedido, confira a disponibilidade e salve.', (`<div class="split">` +
                `<div class="section-gap">` +
                `<form id="item" class="form-grid">` +
                `${field('Selecionar produto', select('produto', opcoes(d.produtos.filter(p => p.ativo !== false).map(p => ({
                    value: p.id,
                    label: `${p.nome} · ${dinheiro(p.preco)}${allowed(session(), 'estoque') ? ` · saldo ${numero(p.saldo)}` : ''}`
                })), 'Escolha um produto'), 'required'), true)}` +
                `${field('Quantidade', input('qtd', 'number', 'required min="1" step="1" value="1"'))}<div class="field">` +
                `<span>&nbsp;</span>${btn('Adicionar item')}</div>` +
                `</form>` +
                `<div id="disp" class="note">Selecione um produto para consultar a disponibilidade.</div>` +
                `<div class="note">O registro verifica o saldo. A baixa e o recebimento são registrados juntos ao finalizar com pagamento confirmado.</div>` +
                `</div>` +
                `<div class="section-gap">` +
                `<h3>Itens do pedido</h3>` +
                `<div id="itens">` +
                `</div>` +
                `<div class="total">` +
                `<span>Total</span>` +
                `<strong id="total">R$ 0,00</strong>` +
                `</div>` +
                `${btn('Salvar pedido', 'primary', 'type="button" id="salvar-pedido" disabled')}</div>` +
                `</div>`));
            const f = $('#item');
            const preview = () => {
                const p = Dados.ler().produtos.find(x => x.id === f.elements.produto.value);
                $('#disp').textContent = p
                    ? `${allowed(session(), 'estoque') ? `Disponível: ${numero(p.saldo)} ${p.unidade} · ` : ''}Preço: ${dinheiro(p.preco)}`
                    : 'Selecione um produto para consultar a disponibilidade.';
            };
            f.addEventListener('change', preview);
            const lista = () => {
                $('#itens').innerHTML = tabela(['Produto', 'Qtd.', 'Subtotal', ''], itens.map(it => [
                    esc(it.nome),
                    numero(it.qtd),
                    dinheiro(it.qtd * it.preco),
                    btn('Remover', 'small', `type="button" data-remove="${esc(it.produtoId)}"`)
                ]));
                $('#total').textContent = dinheiro(soma(itens, x => x.qtd * x.preco));
                $('#salvar-pedido').disabled = !itens.length;
                $('#itens').querySelectorAll('[data-remove]').forEach(b => b.onclick = () => {
                    itens = itens.filter(x => x.produtoId !== b.dataset.remove);
                    lista();
                });
            };
            lista();
            handle(f, v => {
                const p = Dados.ler().produtos.find(x => x.id === v.produto);
                if (!p || p.ativo === false)
                    throw Error('Selecione um produto ativo.');
                const q = positive(v.qtd, 'a quantidade');
                if (!Number.isInteger(q))
                    throw Error('Use uma quantidade inteira.');
                const old = itens.find(x => x.produtoId === p.id);
                if (q + (old?.qtd || 0) > p.saldo)
                    throw Error('Quantidade superior ao saldo disponível.');
                if (old)
                    old.qtd += q;
                else
                    itens.push({
                        produtoId: p.id,
                        nome: p.nome,
                        preco: p.preco,
                        qtd: q
                    });
                lista();
                feedback('Item adicionado.');
            });
            $('#salvar-pedido').onclick = () => {
                try {
                    if (!itens.length)
                        throw Error('Adicione pelo menos um item.');
                    Dados.atualizar(d => {
                        for (const it of itens) {
                            const p = d.produtos.find(x => x.id === it.produtoId);
                            if (!p || p.ativo === false || p.saldo < it.qtd)
                                throw Error(`Saldo insuficiente: ${it.nome}.`);
                        }
                        const n = Math.max(1000, ...d.pedidos.map(p => p.numero)) + 1;
                        d.pedidos.push({
                            id: Dados.id(),
                            numero: n,
                            itens,
                            total: Dados.money(soma(itens, x => x.preco * x.qtd)),
                            status: 'Pendente',
                            data: Dados.dia(),
                            eventos: [{ data: Dados.agora(), texto: 'Pedido registrado', usuario: Dados.ator(d) }],
                            pagamento: 'Pendente'
                        });
                    });
                    itens = [];
                    tabsUI.open(0);
                    feedback('Pedido registrado com sucesso.');
                }
                catch (e) {
                    feedback(e.message, true);
                }
            };
        }
        else if (i === 5) {
            const candidatos = d.pedidos.filter(p => elegivelDevolucao(d, p));
            root.innerHTML = card('Devolver itens vendidos', 'Registre a reposição física dos produtos e, se necessário, o estorno financeiro.', (`<form id="devolver-itens" class="form-grid">` +
                `${field('Pedido', select('id', opcoes(candidatos.map(p => ({ value: p.id, label: pedidoLabel(p) })), 'Selecione'), 'required'), true)}` +
                `<div id="itens-devolver" class="section-gap full">` +
                `</div>` +
                `${allowed(session(), 'financeiro') ? field('Valor a devolver ao cliente (R$)', input('valor', 'number', 'min="0" step="0.01" required placeholder="0 = sem estorno"')) : ''}` +
                `${field('Motivo', '<textarea name="motivo" required maxlength="200"></textarea>', true)}${field('Condição dos produtos', select('condicao', opcoes(['Aproveitável', 'Impróprio', 'Consumido'], 'Selecione'), 'required'))}` +
                `<label class="row full">` +
                `<input name="repor" type="checkbox" disabled> Retornar produtos ao estoque (somente se aptos para venda).</label>` +
                `<p class="note full" id="efeito-devolucao">Produtos impróprios não retornam ao estoque. Estornos são registros internos.</p>` +
                `<label class="row full">` +
                `<input name="confirmado" type="checkbox" required> <span id="confirmacao-devolucao">Confirmo a devolução dos itens.</span></label>` +
                `${btn('Confirmar devolução', 'primary', 'id="confirmar-devolucao"')}</form>`));
            const f = $('#devolver-itens'), token = Dados.id();
            const efeito = () => {
                const valor = Number(f.elements.valor?.value || 0);
                const faltaValor = f.elements.valor && f.elements.valor.value === '';
                f.elements.repor.disabled = f.elements.condicao.value !== 'Aproveitável';
                if (f.elements.repor.disabled)
                    f.elements.repor.checked = false;
                $('#efeito-devolucao').textContent = (f.elements.repor.checked ? 'As quantidades selecionadas retornarão ao estoque. ' : 'Nenhum produto retornará ao estoque. ')
                    + (faltaValor
                        ? 'Informe o valor a devolver ao cliente. Digite 0 somente se não houver devolução de dinheiro.'
                        : valor > 0
                            ? 'Será registrado um estorno de ' + dinheiro(valor) + ' no histórico financeiro.'
                            : 'Nenhum dinheiro será devolvido. Não será criado lançamento financeiro.');
                $('#confirmacao-devolucao').textContent = valor > 0
                    ? 'Confirmo a devolução dos itens e de ' + dinheiro(valor) + ' ao cliente.'
                    : 'Confirmo a devolução dos itens sem novo estorno financeiro.';
                $('#confirmar-devolucao').textContent = valor > 0
                    ? 'Confirmar devolução e estorno'
                    : 'Confirmar devolução sem estorno';
            };
            f.elements.valor?.addEventListener('input', () => f.elements.confirmado.checked = false);
            f.addEventListener('input', efeito);
            f.addEventListener('change', efeito);
            f.elements.id.onchange = () => {
                const p = candidatos.find(p => p.id === f.elements.id.value);
                f.elements.confirmado.checked = false;
                if (f.elements.valor) {
                    f.elements.valor.max = p ? Dados.resumoPagamento(Dados.ler(), p.id).liquido : 0;
                    f.elements.valor.value = p && Number(f.elements.valor.max) === 0 ? '0' : '';
                    f.elements.valor.readOnly = !!p && Number(f.elements.valor.max) === 0;
                }
                $('#itens-devolver').innerHTML = p
                    ? [...new Map(p.itens.map(it => [it.produtoId, it])).values()].map(it => {
                        const q = Dados.saldoDevolucao(Dados.ler(), p.id, it.produtoId);
                        return q ? field(esc(it.nome) + ' · disponíveis ' + numero(q), input('q_' + it.produtoId, 'number', `min="0" max="${q}" step="1" value="0" required`)) : '';
                    }).join('')
                    : '';
                efeito();
            };
            efeito();
            handle(f, v => {
                const quantidades = Object.fromEntries(Object.entries(v).filter(([k]) => k.startsWith('q_')).map(([k, val]) => [k.slice(2), Number(val)]));
                if (v.confirmado !== 'on')
                    throw Error('Confirme a operação.');
                if (f.elements.valor && v.valor === '')
                    throw Error('Informe o valor devolvido, ou zero se não houver estorno.');
                Dados.devolverItens(v.id, quantidades, Number(v.valor || 0), v.motivo, token, { repor: v.repor === 'on', condicao: v.condicao });
                tabsUI.open(0);
                confirmarDevolucao(v.id, token, true);
            });
        }
        else {
            const cancelar = i === 3;
            const candidatos = d.pedidos.filter(p => cancelar ? cancelavel(p) && (allowed(session(), 'financeiro') || Dados.resumoPagamento(d, p.id).liquido <= 0) : transicoes[p.status].length);
            root.innerHTML = card(cancelar ? 'Cancelar pedido' : 'Atualizar status do pedido', cancelar ? 'Confira a situação atual e informe o motivo do cancelamento.' : 'Localize o pedido e selecione uma transição permitida.', (`<form id="alterar" class="form-grid">` +
                `${field('Pedido', select('id', opcoes(candidatos.map(p => ({ value: p.id, label: pedidoLabel(p) })), 'Selecione o pedido'), 'required'), true)}` +
                `<div class="note full" id="atual">Selecione o pedido para conferir a situação.</div>` +
                `${cancelar
                    ? field('Motivo do cancelamento', '<textarea name="motivo" required maxlength="200"></textarea>', true)
                    : field('Novo status', select('status', opcoes([], 'Selecione o pedido'), 'required'), true)}` +
                `<div class="actions full">` +
                `${btn(cancelar ? 'Confirmar cancelamento' : 'Salvar alteração', cancelar ? 'danger' : 'primary')}</div>` +
                `</form>` +
                `<div id="resumo" style="margin-top:18px">` +
                `</div>`));
            const f = $('#alterar');
            f.elements.id.onchange = () => {
                const p = Dados.ler().pedidos.find(x => x.id === f.elements.id.value);
                $('#atual').textContent = p ? `Situação atual: ${p.status}` : 'Selecione o pedido.';
                $('#resumo').innerHTML = p ? detalhes(p) : '';
                if (!cancelar)
                    f.elements.status.innerHTML = opcoes(p ? transicoes[p.status] : [], 'Selecione o novo status');
            };
            handle(f, v => {
                if (cancelar) {
                    cancelarUI(v.id, v.motivo);
                    return;
                }
                if (v.status === 'Concluído') {
                    finalizarUI(v.id);
                    return;
                }
                mudarStatus(v.id, v.status);
                tabsUI.open(0);
                feedback('Status atualizado.');
            });
        }
    }
    const tabsUI = abas(tabs, render);
}
