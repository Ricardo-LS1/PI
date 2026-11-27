// Interface de estoque: cadastro de produtos, movimentações, consultas e alertas. A opção de estoque mínimo não desativa o controle de saldo.

if (iniciarPagina('estoque')) {
    const podeCusto = allowed(session(), 'financeiro');
    const categorias = () => [...new Set(Dados.ler().produtos.map(p => p.categoria))].sort();
    const produtoOpts = () => opcoes(Dados.ler().produtos.map(p => ({ value: p.id, label: `${p.nome} · ${numero(p.saldo)} ${p.unidade}` })), 'Selecione um produto');

    // Atualiza os indicadores usando o saldo e as regras de monitoramento mínimo.
    const metricas = () => {
        const d = Dados.ler();
        $('#metricas').innerHTML = stat('Produtos cadastrados', d.produtos.length, 'Itens no catálogo', 'estoque', { scope: 'Posição atual.' })
            + stat('Estoque baixo', d.produtos.filter(Dados.estoqueBaixo).length, 'Abaixo do mínimo', 'alert', {
                scope: 'Posição atual.',
                memory: memoriaEstoqueBaixo(d.produtos.filter(Dados.estoqueBaixo))
            })
            + stat('Movimentações', d.movimentos.length, 'Registros de estoque', 'estoque')
            + stat('Categorias', categorias().length, 'Grupos de produtos', 'dashboard', { scope: 'Posição atual.' });
    };
    const tabs = ['Consultar estoque', 'Cadastrar produtos', 'Registrar entrada', 'Registrar saída', 'Ajustar estoque', 'Estoque baixo', 'Gerenciar produtos'];

    // Monta as telas de consulta, cadastro, movimentação e histórico do estoque.
    function render(i) {
        metricas();
        const root = $('#painel'), d = Dados.ler();
        if (i === 6) {
            root.innerHTML = card('Gerenciar produtos cadastrados', 'Edite dados ou inative itens sem perder o histórico.', tabela(['Produto', 'Preço', 'Situação', 'Ação'], d.produtos.map(p => [
                esc(p.nome),
                dinheiro(p.preco),
                pill(p.ativo === false ? 'Inativo' : 'Ativo'),
                btn('Editar', 'small', `type="button" data-edit="${esc(p.id)}"`)
            ])));
            root.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
                const p = Dados.ler().produtos.find(x => x.id === b.dataset.edit);
                const dlg = modal('Editar produto', (`<form id="editar-produto" class="form-grid">` +
                    `${['nome', 'categoria', 'unidade', 'descricao'].map((k, i) => field(['Nome', 'Categoria', 'Unidade', 'Descrição'][i], input(k, 'text', `required value="${esc(p[k])}"`))).join('')}` +
                    `${field('Preço', input('preco', 'number', `required min="0" step="0.01" value="${p.preco}"`))}${camposMinimo(p)}${podeCusto
                        ? field('Custo médio estimado (opcional)', input('custoMedio', 'number', `min="0" step="0.000001" value="${p.custoMedio ?? ''}"`))
                            + field('Motivo da avaliação de custo', input('motivoCusto', 'text', 'maxlength="200"'))
                        : ''}` +
                    `<label class="row full">` +
                    `<input name="ativo" type="checkbox" ${p.ativo !== false ? 'checked' : ''}> Produto ativo para novos pedidos</label>` +
                    `${btn('Salvar alterações')}</form>`));
                bindMinimo($('#editar-produto', dlg));
                handle($('#editar-produto', dlg), v => {
                    Dados.atualizar(dd => {
                        const x = dd.produtos.find(a => a.id === p.id);
                        if (dd.produtos.some(a => a.id !== p.id && a.nome.toLowerCase() === v.nome.trim().toLowerCase()))
                            throw Error('Nome já cadastrado.');
                        for (const k of ['nome', 'categoria', 'unidade', 'descricao'])
                            x[k] = requireText(v[k], k);
                        x.preco = positive(v.preco, 'o preço', true);
                        x.monitorarMinimo = v.monitorarMinimo === 'on';
                        if (x.monitorarMinimo)
                            x.minimo = positive(v.minimo, 'o mínimo', true);
                        x.ativo = v.ativo === 'on';
                        if (podeCusto && v.custoMedio !== undefined) {
                            const novo = v.custoMedio === '' ? null : positive(v.custoMedio, 'o custo', true);
                            if (novo !== x.custoMedio) {
                                const motivo = requireText(v.motivoCusto, 'o motivo da avaliação');
                                x.historicoCusto ??= [];
                                x.historicoCusto.push({
                                    data: Dados.agora(),
                                    usuario: Dados.ator(dd),
                                    anterior: x.custoMedio,
                                    novo,
                                    motivo
                                });
                                x.custoMedio = novo;
                            }
                        }
                    }, 'Edição de produto: ' + p.nome);
                    dlg.close();
                    tabsUI.open(6);
                    feedback('Produto atualizado.');
                });
            });
        }
        else if (i === 0 || i === 5) {
            const baixo = i === 5;
            root.innerHTML = card(baixo ? 'Estoque baixo e esgotados' : 'Consultar estoque', baixo ? 'Produtos abaixo do mínimo monitorado ou esgotados.' : 'Busque por nome e filtre por categoria.', (`<form id="filtro" class="filters">` +
                `${field('Pesquisar produto', input('busca', 'search', 'placeholder="Nome do produto"'))}${field('Categoria', select('categoria', opcoes(categorias(), 'Todas as categorias')))}` +
                `${baixo ? field('Saldo', select('saldo', opcoes([{ value: 'esgotado', label: 'Esgotados' }, { value: 'positivo', label: 'Com saldo' }], 'Todos os saldos'))) : ''}` +
                `</form>` +
                `<div id="lista">` +
                `</div>`))
                + (baixo
                    ? ''
                    : card('Histórico de movimentações', 'Entradas, saídas e ajustes registrados.', `<form id="mov-filtro" class="filters">${dateFields()}${campoOrdem()}</form><div id="mov"></div>`));
            const f = $('#filtro');
            listenFilters(f, () => {
                const v = Object.fromEntries(new FormData(f));
                const ps = Dados.ler().produtos.filter(p => (!baixo || (v.saldo === 'esgotado' ? Dados.esgotado(p) : !v.saldo ? Dados.alertaEstoque(p) : Dados.estoqueBaixo(p)))
                    && (!baixo || !v.saldo || (v.saldo === 'esgotado' ? p.saldo === 0 : p.saldo > 0))
                    && p.nome.toLowerCase().includes(v.busca.toLowerCase())
                    && (!v.categoria || p.categoria === v.categoria));
                $('#lista').innerHTML = tabela(['Produto', 'Categoria', 'Unidade', 'Preço de venda', 'Saldo', 'Mínimo', 'Situação', ...(podeCusto && !baixo ? ['Custos e margem'] : [])], ps.map(p => [
                    `<strong>${esc(p.nome)}</strong><small>${esc(p.descricao)}</small>`,
                    esc(p.categoria),
                    esc(p.unidade),
                    dinheiro(p.preco),
                    numero(p.saldo),
                    minimoLabel(p),
                    pill(Dados.situacaoEstoque(p)),
                    ...(podeCusto && !baixo ? [custosProduto(p)] : [])
                ]), ps.map(p => p.id));
            });
            if (!baixo) {
                const mf = $('#mov-filtro');
                listenFilters(mf, () => {
                    const v = Object.fromEntries(new FormData(mf));
                    const ms = ordenarCronologico(Dados.ler().movimentos.filter(m => periodo(m.data, v.de, v.ate)), v.ordem);
                    $('#mov').innerHTML = tabela(['Data', 'Produto', 'Tipo', 'Quantidade', 'Saldo anterior', 'Saldo atual', 'Motivo / origem', 'Responsável', 'Data de registro'], ms.map(m => [
                        dataBR(m.data),
                        esc(m.nome),
                        pill(m.tipo),
                        numero(m.quantidade),
                        numero(m.anterior),
                        numero(m.novo),
                        cellDetail(m.motivo, [...(m.origem ? [{ text: m.origem, tag: true }] : []), ...(m.pedidoId ? [{ text: 'Pedido integrado' }] : []), ...(podeCusto && m.custoTotal != null ? [{ text: 'Custo: ' + dinheiro(m.custoTotal) }] : [])]),
                        esc(m.usuario || 'Registro anterior'),
                        celulaCronologica(m.registro)
                    ]), ms.map(m => m.id));
                });
                $('#mov').addEventListener('table-sorted', e => {
                    if (e.detail.chronological)
                        mf.elements.ordem.value = e.detail.asc ? 'antigos' : 'recentes';
                });
            }
        }
        else if (i === 1) {
            root.innerHTML = card('Cadastrar produtos', 'Identifique o produto e defina seus parâmetros.', (`<form id="cadastro" class="form-grid">` +
                `${field('Nome do produto', input('nome', 'text', 'required maxlength="100"'))}${field('Categoria', input('categoria', 'text', 'required list="categorias" maxlength="60"')
                    + `<datalist id="categorias">${categorias().map(c => `<option value="${esc(c)}"></option>`).join('')}</datalist>`)}` +
                `${field('Unidade', input('unidade', 'text', 'required placeholder="un, fatia, kg..." maxlength="20"'))}${field('Preço de venda (R$)', input('preco', 'number', 'required min="0" step="0.01"'))}` +
                `${podeCusto ? field('Custo unitário estimado (opcional)', input('custoMedio', 'number', 'min="0" step="0.000001"')) : ''}${field('Saldo inicial', input('saldo', 'number', 'required min="0" step="0.001"'))}` +
                `${camposMinimo()}${field('Descrição', `<textarea name="descricao" maxlength="200" required></textarea>`, true)}<div class="actions full">` +
                `${btn('Salvar produto')}${btn('Limpar', '', 'type="reset"')}</div>` +
                `</form>`));
            bindMinimo($('#cadastro'));
            handle($('#cadastro'), v => {
                const p = {
                    id: Dados.id(),
                    nome: requireText(v.nome, 'o nome'),
                    categoria: requireText(v.categoria, 'a categoria'),
                    unidade: requireText(v.unidade, 'a unidade'),
                    preco: positive(v.preco, 'o preço', true),
                    saldo: positive(v.saldo, 'o saldo', true),
                    monitorarMinimo: v.monitorarMinimo === 'on',
                    minimo: v.monitorarMinimo === 'on' ? positive(v.minimo, 'o mínimo', true) : 0,
                    descricao: requireText(v.descricao, 'a descrição'),
                    ativo: true,
                    custoMedio: podeCusto && v.custoMedio !== '' ? positive(v.custoMedio, 'o custo', true) : null,
                    ultimoCusto: null
                };
                Dados.atualizar(d => {
                    if (d.produtos.some(x => x.nome.toLowerCase() === p.nome.toLowerCase()))
                        throw Error('Já existe um produto com esse nome.');
                    d.produtos.push(p);
                });
                tabsUI.open(0);
                feedback('Produto cadastrado com sucesso.');
            });
        }
        else {
            const tipo = { 2: 'Entrada', 3: 'Saída', 4: 'Ajuste' }[i], ajuste = i === 4;
            root.innerHTML = card(`${ajuste ? 'Ajustar estoque' : 'Registrar ' + tipo.toLowerCase() + ' de produtos'}`, ajuste ? 'Compare o saldo registrado com a quantidade apurada.' : 'Identifique o produto e registre a movimentação.', (`<form id="movimento" class="form-grid">` +
                `${field('Pesquisar produto', input('pesquisa', 'search', 'placeholder="Digite o nome do produto"'), true)}${field('Produto', select('produtoId', produtoOpts(), 'required'), true)}` +
                `<div class="note full" id="saldo">Selecione um produto para conferir o saldo cadastrado.</div>` +
                `${field(ajuste ? 'Quantidade apurada' : 'Quantidade', input('quantidade', 'number', `required min="${ajuste ? '0' : '0.001'}" step="0.001"`))}` +
                `${field('Data', input('data', 'date', `required value="${Dados.dia()}"`))}${field('Origem / finalidade', select('origem', opcoes(ajuste
                    ? ['Ajuste de inventário']
                    : i === 2
                        ? [...(podeCusto ? ['Compra'] : []), 'Produção própria', 'Devolução', 'Ajuste de inventário', 'Outras']
                        : ['Perda ou desperdício', 'Produto vencido', 'Consumo interno', 'Devolução ao fornecedor', 'Ajuste de inventário', 'Outras']), 'required'), true)}` +
                `${podeCusto
                    ? (`<div id="cost-fields" class="form-grid full" hidden>` +
                        `${field('Custo unitário (R$)', input('custoUnitario', 'number', 'min="0" step="0.000001"'))}<div class="field">` +
                        `<span>Custo total</span>` +
                        `<strong id="custo-total">—</strong>` +
                        `</div>` +
                        `<div class="form-grid full" id="purchase-fields" hidden>` +
                        `${field('Fornecedor (opcional)', input('fornecedor'))}${field('Situação do pagamento', select('situacao', opcoes(['Pago', 'Pendente'])))}` +
                        `${field('Forma de pagamento', select('forma', opcoes(d.config.formas, 'Selecione')))}</div>` +
                        `</div>` +
                        `<div class="form-grid full" id="return-fields" hidden>` +
                        `${field('Compra vinculada (obrigatória se houver crédito)', select('despesaId', opcoes([], 'Sem crédito ou reembolso')), true)}${field('Crédito / reembolso confirmado (R$)', input('reembolso', 'number', 'min="0.01" step="0.01"'))}` +
                        `<p class="note full">Compra paga: reembolso recebido. Compra pendente: crédito reduz obrigação. Sem vínculo, não haverá movimentação financeira.</p>` +
                        `</div>`)
                    : ''}` +
                `${field(ajuste ? 'Justificativa' : i === 3 ? 'Motivo da saída' : 'Motivo (opcional)', `<textarea name="motivo" ${i !== 2 ? 'required' : ''} maxlength="200"></textarea>`, true)}` +
                `<div class="total full">` +
                `<span>Saldo após movimentação</span>` +
                `<strong id="previa">—</strong>` +
                `</div>` +
                `<div class="actions full">${btn('Salvar movimentação')}</div>` +
                `</form>`));
            const f = $('#movimento');
            const token = Dados.id();
            const extras = () => {
                if (!podeCusto)
                    return;
                const origem = f.elements.origem.value, compra = origem === 'Compra', entrada = i === 2 || i === 4;
                const cf = $('#cost-fields'), pf = $('#purchase-fields'), rf = $('#return-fields');
                cf.hidden = !entrada;
                pf.hidden = !compra;
                rf.hidden = origem !== 'Devolução ao fornecedor';
                cf.style.display = entrada ? '' : 'none';
                pf.style.display = compra ? '' : 'none';
                rf.style.display = rf.hidden ? 'none' : '';
                f.elements.reembolso.required = !rf.hidden && !!f.elements.despesaId.value;
                f.elements.custoUnitario.required = compra;
                f.elements.forma.required = compra && f.elements.situacao.value === 'Pago';
                const q = Number(f.elements.quantidade.value), c = Number(f.elements.custoUnitario.value);
                $('#custo-total').textContent = f.elements.custoUnitario.value === '' ? '—' : dinheiro(q * c);
                if (!rf.hidden) {
                    const sel = f.elements.despesaId, old = sel.value;
                    const base = Dados.ler();
                    sel.innerHTML = opcoes(base.despesas.filter(x => x.produtoId === f.elements.produtoId.value && x.movimentoId && x.situacao !== 'Cancelado').map(x => {
                        const compra = base.movimentos.find(m => m.id === x.movimentoId);
                        const devolvidas = base.movimentos.filter(m => m.compraOriginalId === compra?.id).reduce((n, m) => n + m.quantidade, 0);
                        return { value: x.id, label: x.descricao + ' · disponível ' + dinheiro(Dados.saldoDespesa(base, x)) + ' · ' + numero((compra?.quantidade || 0) - devolvidas) + ' un.' };
                    }), 'Sem crédito ou reembolso');
                    sel.value = old;
                    f.elements.reembolso.required = !!sel.value;
                }
            };

            // Atualiza a prévia da movimentação antes de confirmar o registro.
            const preview = () => {
                const p = Dados.ler().produtos.find(x => x.id === f.elements.produtoId.value);
                const q = Number(f.elements.quantidade.value);
                $('#saldo').textContent = p ? `Produto cadastrado: ${p.nome} · Saldo atual: ${numero(p.saldo)} ${p.unidade}` : 'Selecione um produto para conferir o saldo cadastrado.';
                $('#previa').textContent = p && f.elements.quantidade.value !== '' ? numero(ajuste ? q : i === 2 ? p.saldo + q : p.saldo - q) + ' ' + p.unidade : '—';
                extras();
            };
            f.elements.pesquisa.addEventListener('input', () => {
                const busca = f.elements.pesquisa.value.toLowerCase();
                const anterior = f.elements.produtoId.value;
                f.elements.produtoId.innerHTML = opcoes(Dados.ler().produtos.filter(p => p.nome.toLowerCase().includes(busca)).map(p => ({ value: p.id, label: `${p.nome} · ${numero(p.saldo)} ${p.unidade}` })), 'Selecione um produto');
                if ([...f.elements.produtoId.options].some(o => o.value === anterior))
                    f.elements.produtoId.value = anterior;
                preview();
            });
            f.addEventListener('input', preview);
            f.addEventListener('change', preview);
            preview();
            handle(f, v => {
                Dados.registrarMovimento({ ...v, tipo, despesaId: v.origem === 'Devolução ao fornecedor' ? v.despesaId : '' }, token);
                const mov = Dados.ler().movimentos.find(m => m.id === token);
                tabsUI.open(0);
                if (mov?.reembolsoId)
                    feedback('Estoque atualizado e reembolso registrado no financeiro.');
                else if (mov?.creditoDespesaId)
                    feedback('Estoque atualizado e crédito abatido da despesa pendente.');
                else if (v.origem === 'Devolução ao fornecedor')
                    feedback('Devolução registrada sem crédito ou reembolso financeiro.');
                else if (v.origem === 'Compra')
                    feedback('Estoque atualizado e compra registrada no financeiro.');
                else
                    feedback('Movimentação registrada e saldo atualizado.');
            });
        }
    }
    const tabsUI = abas(tabs, render);
}
