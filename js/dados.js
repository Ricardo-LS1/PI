// Camada de dados e regras de negócio. Guarda os registros no localStorage, valida operações e integra pedidos, estoque e financeiro. Não existe banco de dados ou autenticação de servidor.

/* Dados de demonstração. Nenhuma informação real ou servidor é utilizado. */
const Dados = (() => {

    // Chave fixa para manter compatibilidade com os dados gravados pelas versões anteriores.
    const chave = 'gato-preto-cafe-v1';

    // Retorna a data local no formato AAAA-MM-DD, com deslocamento opcional em dias.
    const dia = (deslocamento = 0) => {
        const d = new Date();
        d.setDate(d.getDate() + deslocamento);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Registra o instante atual em ISO, incluindo horário e milissegundos.
    const agora = () => new Date().toISOString();
    const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Um produto só fica abaixo do mínimo se estiver ativo e o monitoramento estiver habilitado.
    const estoqueBaixo = p => p.ativo !== false && p.monitorarMinimo !== false && p.saldo < p.minimo;

    // Mesmo sem monitoramento de mínimo, saldo zero continua indicando produto esgotado.
    const esgotado = p => p.ativo !== false && p.saldo === 0;
    const alertaEstoque = p => estoqueBaixo(p) || esgotado(p);
    const situacaoEstoque = p => p.ativo === false ? "Inativo" : esgotado(p) ? "Esgotado" : estoqueBaixo(p) ? "Estoque baixo" : p.monitorarMinimo === false ? "Sem mínimo" : "Normal";

    // Cria a base fictícia, simulando compras, vendas, devoluções e perdas para os indicadores.
    const inicial = () => {
        // Somente base nova ou restauração expressamente confirmada. Não é uma migração de custos reais.
        const produtos = [
            ['p1', 'Café espresso', 'Bebidas', 'un', 7, 42, 10, 'Café servido em xícara', 2],
            ['p2', 'Cappuccino', 'Bebidas', 'un', 14, 30, 8, 'Café com leite e espuma', 5],
            ['p3', 'Pão de queijo', 'Salgados', 'un', 6, 24, 10, 'Porção individual', 2.5],
            ['p4', 'Bolo de chocolate', 'Doces', 'fatia', 12, 5, 8, 'Fatia de bolo', 5],
            ['p5', 'Chocolate quente', 'Bebidas', 'un', 16, 18, 5, 'Bebida quente', 6],
            ['p6', 'Brownie', 'Doces', 'un', 10, 4, 6, 'Brownie individual', 4],
            ['p7', 'Croissant', 'Salgados', 'un', 11, 16, 5, 'Croissant tradicional', 4.5]
        ].map(([id, nome, categoria, unidade, preco, saldo, minimo, descricao, custoMedio]) => ({
            id,
            nome,
            categoria,
            unidade,
            preco,
            saldo,
            minimo,
            descricao,
            custoMedio,
            ultimoCusto: null,
            ativo: true,
            ficticio: true,
            monitorarMinimo: !["p1", "p2", "p5"].includes(id)
        }));
        const produto = pid => produtos.find(p => p.id === pid);
        const criar = (numero, items, status, offset) => {
            const data = dia(offset);
            const itens = items.map(([pid, qtd]) => {
                const p = produto(pid);
                return {
                    produtoId: pid,
                    nome: p.nome,
                    preco: p.preco,
                    qtd,
                    custoUnitario: null,
                    custoTotal: null
                };
            });
            return {
                id: `o${numero}`,
                numero,
                itens,
                total: money(itens.reduce((s, i) => s + i.preco * i.qtd, 0)),
                status,
                data,
                ficticio: true,
                eventos: [
                    { data: data + 'T10:00:00', texto: 'Pedido registrado', usuario: 'Demonstração' },
                    ...(status === 'Em preparo' ? [{ data: data + 'T10:20:00', texto: 'Status: Em preparo', usuario: 'Demonstração' }] : [])
                ]
            };
        };
        const pedidos = [
            criar(1001, [['p1', 2], ['p3', 2]], 'Concluído', -1),
            criar(1002, [['p2', 2], ['p4', 1]], 'Concluído', 0),
            criar(1003, [['p5', 1], ['p6', 2]], 'Em preparo', 0),
            criar(1004, [['p1', 1], ['p7', 2]], 'Pendente', 0),
            criar(1005, [['p2', 10], ['p6', 4]], 'Concluído', -2)
        ];
        for (let i = 0; i < 6; i++)
            pedidos.push(criar(1010 + i, [[`p${1 + i % 7}`, 2 + i % 3], [i % 7 === 2 ? 'p4' : 'p3', 1 + i % 2]], 'Concluído', -3 - i));
        const receitas = [], despesas = [], movimentos = [], timeline = [];
        const compras = [
            {
                id: 'c1',
                pid: 'p1',
                q: 12,
                unit: 2.5,
                offset: -2,
                situacao: 'Pago',
                forma: 'Pix'
            },
            {
                id: 'c2',
                pid: 'p4',
                q: 6,
                unit: 5,
                offset: -4,
                situacao: 'Pago',
                forma: 'Cartão'
            },
            {
                id: 'c3',
                pid: 'p7',
                q: 5,
                unit: 4.5,
                offset: 0,
                situacao: 'Pendente',
                forma: ''
            }
        ];
        const vendaDevolvida = pedidos.find(p => p.numero === 1002), devolucao = { pid: 'p2', q: 1, valor: 14 }, perda = { pid: 'p6', q: 1, offset: 0 };
        // Estoque de abertura calculado a partir do saldo-alvo e de TODAS as operações seguintes.
        for (const p of produtos) {
            const alvo = p.saldo;
            const vendidos = pedidos.filter(o => o.status === 'Concluído').flatMap(o => o.itens).filter(i => i.produtoId === p.id).reduce((s, i) => s + i.qtd, 0);
            const comprado = compras.filter(c => c.pid === p.id).reduce((s, c) => s + c.q, 0);
            const abertura = alvo + vendidos + (p.id === perda.pid ? perda.q : 0) - (p.id === devolucao.pid ? devolucao.q : 0) - comprado;
            if (abertura < 0)
                throw Error('Abertura demonstrativa inválida.');
            p.saldo = 0;
            p.ultimoCusto = p.custoMedio;
            const data = dia(-9);
            movimentos.push({
                id: 'abertura-' + p.id,
                produtoId: p.id,
                nome: p.nome,
                tipo: 'Entrada',
                origem: 'Ajuste de inventário',
                quantidade: abertura,
                anterior: 0,
                novo: abertura,
                data,
                registro: data + 'T08:00:00',
                motivo: 'Saldo de abertura fictício (sem pagamento no período)',
                usuario: 'Demonstração',
                custoUnitario: p.custoMedio,
                custoTotal: money(abertura * p.custoMedio),
                ficticio: true
            });
            p.saldo = abertura;
        }
        const movimentar = (p, q, tipo, unit, data, hora, extra) => {
            const anterior = p.saldo;
            if (tipo === 'Entrada')
                media(p, q, unit);
            p.saldo = anterior + (tipo === 'Entrada' ? q : -q);
            if (p.saldo < 0)
                throw Error('Saldo demonstrativo negativo.');
            const m = {
                produtoId: p.id,
                nome: p.nome,
                tipo,
                quantidade: q,
                anterior,
                novo: p.saldo,
                data,
                registro: data + 'T' + hora,
                usuario: 'Demonstração',
                custoUnitario: unit,
                custoTotal: money(q * unit),
                ficticio: true,
                ...extra
            };
            movimentos.push(m);
            return m;
        };
        for (const c of compras) {
            const data = dia(c.offset);
            timeline.push({
                ordem: data + 'T09:00:00',
                exec: () => {
                    const p = produto(c.pid), mid = 'compra-' + c.id, did = 'despesa-' + c.id;
                    movimentar(p, c.q, 'Entrada', c.unit, data, '09:00:00', {
                        id: mid,
                        origem: 'Compra',
                        motivo: 'Compra demonstrativa',
                        fornecedor: 'Fornecedor fictício',
                        despesaId: did
                    });
                    p.ultimoCusto = c.unit;
                    despesas.push({
                        id: did,
                        movimentoId: mid,
                        produtoId: p.id,
                        descricao: 'Compra · ' + p.nome + ' · ' + c.q + ' ' + p.unidade + ' · Fornecedor fictício',
                        categoria: 'Fornecedores',
                        natureza: 'Compra de estoque',
                        valor: money(c.q * c.unit),
                        data,
                        situacao: c.situacao,
                        forma: c.forma,
                        registro: data + 'T09:00:00',
                        usuario: 'Demonstração',
                        historico: [],
                        ficticio: true
                    });
                }
            });
        }
        for (const o of pedidos.filter(o => o.status === 'Concluído'))
            timeline.push({
                ordem: o.data + 'T11:00:00',
                exec: () => {
                    const forma = o.numero === 1002 ? 'Cartão' : ['Pix', 'Dinheiro', 'Cartão'][o.numero % 3];
                    Object.assign(o, {
                        integracao: 'v3',
                        dataVenda: o.data,
                        dataConclusao: o.data + 'T11:00:00',
                        pagamento: 'Confirmado',
                        forma
                    });
                    o.eventos.push({
                        data: o.dataConclusao,
                        texto: 'Pedido concluído · pagamento confirmado · baixa de estoque',
                        usuario: 'Demonstração'
                    });
                    const qs = new Map();
                    for (const i of o.itens) {
                        const p = produto(i.produtoId);
                        i.custoUnitario = p.custoMedio;
                        i.custoTotal = money(i.qtd * i.custoUnitario);
                        qs.set(p.id, (qs.get(p.id) || 0) + i.qtd);
                    }
                    for (const [pid, q] of qs) {
                        const p = produto(pid);
                        movimentar(p, q, 'Saída', p.custoMedio, o.data, '11:00:00', {
                            id: 'venda-' + o.id + '-' + pid,
                            pedidoId: o.id,
                            origem: 'Venda',
                            motivo: 'Venda #' + o.numero,
                            movimentoOriginalId: ''
                        });
                    }
                    receitas.push({
                        id: 'receb-' + o.id,
                        pedidoId: o.id,
                        descricao: 'Pedido #' + o.numero,
                        forma,
                        valor: o.total,
                        data: o.data,
                        registro: o.data + 'T11:00:00',
                        origem: 'Pedido',
                        usuario: 'Demonstração',
                        ficticio: true
                    });
                }
            });
        timeline.push({
            ordem: dia() + 'T12:00:00',
            exec: () => {
                const o = vendaDevolvida, p = produto(devolucao.pid), original = movimentos.find(m => m.id === 'venda-' + o.id + '-' + p.id), r = receitas.find(x => x.pedidoId === o.id);
                movimentar(p, devolucao.q, 'Entrada', original.custoUnitario, dia(), '12:00:00', {
                    id: 'devolucao-demo',
                    pedidoId: o.id,
                    origem: 'Devolução de venda',
                    motivo: 'Devolução #' + o.numero,
                    movimentoOriginalId: original.id
                });
                receitas.push({
                    id: 'estorno-demo',
                    pedidoId: o.id,
                    descricao: 'Estorno · Pedido #' + o.numero + ' · Devolução demonstrativa',
                    forma: r.forma,
                    valor: -devolucao.valor,
                    data: dia(),
                    registro: dia() + 'T12:00:00',
                    estornoDe: r.id,
                    origem: 'Estorno',
                    usuario: 'Demonstração',
                    ficticio: true
                });
                o.eventos.push({
                    data: dia() + 'T12:00:00',
                    texto: 'Devolução física de 1 Cappuccino · estorno R$ 14,00',
                    usuario: 'Demonstração'
                });
            }
        });
        timeline.push({
            ordem: dia(perda.offset) + 'T13:00:00',
            exec: () => {
                const p = produto(perda.pid);
                movimentar(p, perda.q, 'Saída', p.custoMedio, dia(perda.offset), '13:00:00', {
                    id: 'perda-demo',
                    origem: 'Perda ou desperdício',
                    motivo: 'Desperdício demonstrativo'
                });
            }
        });
        timeline.sort((a, b) => a.ordem.localeCompare(b.ordem)).forEach(e => e.exec());
        for (const [id, descricao, categoria, valor, offset, situacao] of [
            ['d2', 'Material de limpeza', 'Operacional', 32, 0, 'Pago'],
            ['d3', 'Manutenção', 'Manutenção', 80, 0, 'Pendente'],
            ['d4', 'Embalagens', 'Operacional', 19, -5, 'Pago'],
            ['d5', 'Material de limpeza', 'Operacional', 12, -7, 'Pago']
        ]) {
            const data = dia(offset);
            despesas.push({
                id,
                descricao,
                categoria,
                natureza: 'Despesa operacional',
                valor,
                data,
                situacao,
                forma: situacao === 'Pago' ? 'Pix' : '',
                registro: data + 'T09:30:00',
                usuario: 'Demonstração',
                historico: [],
                ficticio: true
            });
        }
        return {
            produtos,
            pedidos,
            receitas,
            despesas,
            movimentos,
            demonstracao: { versao: '4.2.1', ficticia: true, criadaEm: agora() },
            usuarios: [
                {
                    id: 'u1',
                    nome: 'Proprietário',
                    login: 'admin',
                    senha: 'admin123',
                    perfil: 'Administrador',
                    ativo: true,
                    permissoes: { pedidos: true, estoque: true, financeiro: true }
                },
                {
                    id: 'u2',
                    nome: 'Gerente',
                    login: 'gerente',
                    senha: 'gerente123',
                    perfil: 'Gerente',
                    ativo: true,
                    permissoes: { pedidos: true, estoque: true, financeiro: true }
                }
            ],
            config: {
                nome: 'O Gato Preto Café',
                endereco: 'R. Noel Lourenço de Lima, 12 - Parque do Sol, Guaratinguetá - SP',
                formas: ['Pix', 'Dinheiro', 'Cartão'],
                moeda: 'BRL',
                observacao: 'Protótipo acadêmico · registros iniciais fictícios (V4.2.1)'
            }
        };
    };
    // Mantém a mesma chave da V2: migração não recria dados nem baixa vendas antigas.

    // Complementa campos ausentes em registros antigos sem recriar a base de dados.
    const migrar = d => {
        d.usuarios.forEach(u => u.permissoes ??= { pedidos: true, estoque: true, financeiro: true });
        d.produtos.forEach(p => {
            p.ativo ??= true;
            p.monitorarMinimo ??= true;
        });
        d.pedidos.forEach(p => {
            p.eventos ??= [];
            if (p.status === 'Concluído' && !p.integracao)
                p.integracao = 'legado';
            p.devolucoes ??= [];
        });
        d.atividades ??= [];
        d.notificacoesLidas ??= {};
        d.produtos.forEach(p => {
            p.custoMedio ??= null;
            p.ultimoCusto ??= null;
        });
        d.pedidos.forEach(p => p.itens.forEach(i => {
            i.custoUnitario ??= null;
            i.custoTotal ??= null;
        }));
        d.despesas.forEach(x => {
            x.historico ??= [];
        });
        d.versao = 4;
        d.versaoPedidos = 1;
        return d;
    };

    // Índices temporários evitam percorrer todo o histórico a cada verificação de vínculo.
    const porId = registros => new Map(registros.map(x => [x.id, x]));
    const agrupar = (registros, chave) => {
        const grupos = new Map();
        for (const x of registros) {
            const k = chave(x);
            if (!grupos.has(k))
                grupos.set(k, []);
            grupos.get(k).push(x);
        }
        return grupos;
    };

    // Verifica a estrutura e os valores antes de aceitar dados de backup.
    const validar = d => {
        if (!d || typeof d !== 'object')
            throw Error('Backup inválido.');
        for (const k of ['produtos', 'pedidos', 'receitas', 'despesas', 'movimentos', 'usuarios']) {
            if (!Array.isArray(d[k]) || d[k].some(x => !x || typeof x.id !== 'string') || new Set(d[k].map(x => x.id)).size !== d[k].length)
                throw Error('Registros inválidos: ' + k);
        }
        const produtos = porId(d.produtos), pedidos = porId(d.pedidos), receitas = porId(d.receitas);
        const despesas = porId(d.despesas), movimentos = porId(d.movimentos);
        const movimentosPedido = agrupar(d.movimentos, m => m.pedidoId);
        const receitasPedido = agrupar(d.receitas, r => r.pedidoId);
        const estornos = agrupar(d.receitas, r => r.estornoDe);
        const ajustes = agrupar(d.despesas, x => x.estornoDe || x.ajusteDe);
        // Limita números à faixa que permite representar centavos com segurança.
        const num = x => typeof x === 'number' && Number.isFinite(x) && x >= 0 && Number.isSafeInteger(Math.round(x * 100));
        const str = x => typeof x === 'string';
        const date = x => str(x) && /^\d{4}-\d{2}-\d{2}$/.test(x) && !isNaN(Date.parse(x)) && new Date(x).toISOString().slice(0, 10) === x;
        if (!d.config || !str(d.config.nome) || !str(d.config.endereco) || !Array.isArray(d.config.formas) || !d.config.formas.length
            || d.config.formas.some(x => !str(x) || !x.trim()))
            throw Error('Configuração inválida.');
        if (d.usuarios.some(u => !str(u.nome) || !str(u.login) || !str(u.senha) || !['Gerente', 'Administrador'].includes(u.perfil) || typeof u.ativo !== 'boolean'
            || (u.permissoes && ['pedidos', 'estoque', 'financeiro'].some(k => typeof u.permissoes[k] !== 'boolean')))
            || !d.usuarios.some(u => u.ativo && u.perfil === 'Administrador')
            || new Set(d.usuarios.map(u => u.login.toLowerCase())).size !== d.usuarios.length)
            throw Error('Usuários inválidos ou sem administrador ativo.');
        if (d.produtos.some(p => ![p.nome, p.categoria, p.unidade, p.descricao].every(str) || ![p.preco, p.saldo, p.minimo].every(num)
            || (p.monitorarMinimo != null && typeof p.monitorarMinimo !== "boolean")
            || (p.ativo != null && typeof p.ativo !== "boolean")
            || [p.custoMedio, p.ultimoCusto].some(x => x != null && !num(x))))
            throw Error('Produtos inválidos.');
        if (d.pedidos.some(p => !num(p.numero) || !num(p.total) || !date(p.data) || !['Pendente', 'Em preparo', 'Pronto', 'Concluído', 'Cancelado'].includes(p.status) || !Array.isArray(p.itens)
            || !p.itens.length
            || p.itens.some(i => !str(i.nome) || [i.custoUnitario, i.custoTotal].some(x => x != null && !num(x)) || !num(i.preco) || !Number.isInteger(i.qtd) || i.qtd <= 0
                || !produtos.has(i.produtoId))
            || !Array.isArray(p.eventos)
            || p.eventos.some(e => !str(e.data) || !str(e.texto))))
            throw Error('Pedidos inválidos.');
        // Uma data de venda informada deve ser válida; um pedido aberto ainda não é uma venda.
        if (d.pedidos.some(p => (p.dataVenda && (!date(p.dataVenda) || p.dataVenda < p.data))
            || (pedidoAberto(p) && (p.dataVenda || p.dataConclusao || p.integracao))))
            throw Error('Data ou situação da venda incompatível com o pedido.');
        // O total registrado deve corresponder aos itens, sem inventar descontos.
        if (d.pedidos.some(p => !num(p.itens.reduce((n, i) => n + i.preco * i.qtd, 0))
            || money(p.total) !== money(p.itens.reduce((n, i) => n + i.preco * i.qtd, 0))))
            throw Error('Total de pedido incompatível com os itens. Confira o backup.');
        if (d.pedidos.some(p => p.devolucoes != null
            && (!Array.isArray(p.devolucoes)
                || p.devolucoes.some(x => !x || !str(x.id) || typeof x.repor !== 'boolean' || !x.quantidades || typeof x.quantidades !== 'object' || Array.isArray(x.quantidades)
                    || (x.condicao != null && (!['Aproveitável', 'Impróprio', 'Consumido'].includes(x.condicao)
                        || (x.repor && x.condicao !== 'Aproveitável')))
                    || Object.entries(x.quantidades).some(([k, q]) => !p.itens.some(i => i.produtoId === k) || !Number.isInteger(q) || q <= 0))
                || new Set(p.devolucoes.map(x => x.id)).size !== p.devolucoes.length)))
            throw Error('Histórico de devoluções inválido.');
        if (d.receitas.some(r => !num(Math.abs(r.valor)) || typeof r.valor !== 'number' || !date(r.data) || ![r.forma, r.descricao, r.registro].every(str) || (r.pedidoId && !pedidos.has(r.pedidoId))))
            throw Error('Recebimentos inválidos.');
        if (d.despesas.some(x => !num(Math.abs(x.valor)) || typeof x.valor !== 'number' || (x.valor < 0 && (!x.estornoDe || x.situacao !== 'Pago')) || !date(x.data) || ![x.descricao, x.categoria, x.registro].every(str)
            || !['Pago', 'Pendente', 'Cancelado'].includes(x.situacao)))
            throw Error('Despesas inválidas.');
        if (d.movimentos.some(x => !date(x.data) || !num(x.quantidade) || !num(x.anterior) || !num(x.novo) || [x.custoUnitario, x.custoTotal].some(c => c != null && !num(c))
            || ![x.nome, x.tipo, x.motivo].every(str)
            || !produtos.has(x.produtoId)))
            throw Error('Movimentações inválidas.');
        // A quantidade deve corresponder à diferença entre os saldos da movimentação.
        if (d.movimentos.some(m => {
            const delta = m.novo - m.anterior;
            return !['Entrada', 'Saída', 'Ajuste'].includes(m.tipo)
                || Math.abs(Math.abs(delta) - m.quantidade) > 1e-6
                || (m.tipo === 'Entrada' && delta < 0)
                || (m.tipo === 'Saída' && delta > 0);
        })) throw Error('Tipo, quantidade ou saldos de movimentação incompatíveis.');
        // Vínculos explícitos de reposição devem apontar para a saída do mesmo item e pedido.
        for (const m of d.movimentos.filter(m => m.movimentoOriginalId)) {
            const original = movimentos.get(m.movimentoOriginalId);
            if (!original || original.tipo !== 'Saída' || m.tipo !== 'Entrada'
                || original.produtoId !== m.produtoId || original.pedidoId !== m.pedidoId
                || m.data < original.data)
                throw Error('Vínculo de reposição inválido.');
        }
        for (const p of d.pedidos) {
            for (const dev of p.devolucoes || []) {
                if (dev.estornos != null && (!Array.isArray(dev.estornos)
                    || new Set(dev.estornos).size !== dev.estornos.length
                    || dev.estornos.some(id => {
                        const e = receitas.get(id);
                        return !e || !e.estornoDe || e.pedidoId !== p.id || e.operacaoId !== dev.id;
                    }))) throw Error('Devolução com vínculo de estorno inválido.');
            }
        }
        // A reposição antiga pode não ter um registro em devolucoes; some as entradas físicas
        // e apenas as devoluções sem reposição para não contar o mesmo retorno duas vezes.
        for (const p of d.pedidos) {
            for (const produtoId of new Set(p.itens.map(i => i.produtoId))) {
                const vendido = p.itens.filter(i => i.produtoId === produtoId).reduce((n, i) => n + i.qtd, 0);
                const entradas = (movimentosPedido.get(p.id) || []).filter(m => m.produtoId === produtoId && m.tipo === 'Entrada');
                const reposicao = entradas.reduce((n, m) => n + m.quantidade, 0);
                const semReposicao = (p.devolucoes || []).filter(x => !x.repor).reduce((n, x) => n + (x.quantidades[produtoId] || 0), 0);
                const declaradas = (p.devolucoes || []).filter(x => x.repor).reduce((n, x) => n + (x.quantidades[produtoId] || 0), 0);
                if (reposicao + semReposicao > vendido || declaradas > reposicao)
                    throw Error('Devolução excede a venda ou não possui movimentação correspondente.');
            }
        }
        if (d.movimentos.some(m => m.pedidoId && (!pedidos.has(m.pedidoId) || pedidoAberto(pedidos.get(m.pedidoId)))))
            throw Error('Movimentação vinculada a pedido inexistente ou não concluído.');
        // Cada compra financeira vinculada precisa apontar para sua entrada real.
        for (const x of d.despesas.filter(x => x.movimentoId)) {
            const m = movimentos.get(x.movimentoId);
            if (!m || m.tipo !== 'Entrada' || m.origem !== 'Compra' || m.produtoId !== x.produtoId || m.despesaId !== x.id)
                throw Error('Compra com vínculo de estoque inválido.');
            // Créditos sobre obrigações alteram o saldo, não o custo original da compra.
            const primeiroCredito = Array.isArray(x.historico)
                ? x.historico.find(h => h.acao === 'Crédito por devolução') : null;
            const valorOriginal = primeiroCredito ? primeiroCredito.valorOriginal : x.valor;
            if (m.custoTotal != null && money(valorOriginal) !== money(m.custoTotal))
                throw Error('Valor original da compra incompatível com a entrada de estoque.');
        }
        for (const m of d.movimentos.filter(m => m.despesaId)) {
            if (despesas.get(m.despesaId)?.movimentoId !== m.id)
                throw Error('Entrada de compra sem despesa correspondente.');
        }
        // Devoluções a fornecedores com vínculo explícito precisam conservar origem e contrapartida.
        const retornosCompra = agrupar(d.movimentos.filter(m => m.compraOriginalId), m => m.compraOriginalId);
        for (const [origem, retornos] of retornosCompra) {
            const compra = movimentos.get(origem);
            if (!compra || compra.tipo !== 'Entrada' || compra.origem !== 'Compra'
                || retornos.some(m => m.tipo !== 'Saída' || m.produtoId !== compra.produtoId || m.data < compra.data)
                || retornos.reduce((n, m) => n + m.quantidade, 0) > compra.quantidade + 1e-6)
                throw Error('Devolução ao fornecedor incompatível com a compra original.');
            for (const m of retornos) {
                if (m.reembolsoId && despesas.get(m.reembolsoId)?.estornoDe !== compra.despesaId)
                    throw Error('Reembolso ao fornecedor sem lançamento correspondente.');
                if (m.creditoDespesaId && m.creditoDespesaId !== compra.despesaId)
                    throw Error('Crédito ao fornecedor sem obrigação correspondente.');
            }
        }
        if (d.movimentos.some(m => (m.reembolsoId || m.creditoDespesaId) && !m.compraOriginalId))
            throw Error('Devolução ao fornecedor sem origem vinculada.');
        if (d.despesas.some(x => (x.dataOriginal && (!date(x.dataOriginal) || x.dataOriginal > x.data))
            || (x.dataPagamento && (!date(x.dataPagamento) || x.dataPagamento !== x.data || x.situacao !== 'Pago'))
            || (x.vencimento && !date(x.vencimento))))
            throw Error('Data de cadastro, quitação ou vencimento inválida.');
        // Históricos opcionais de versões anteriores continuam opcionais; quando existem,
        // precisam ter o formato que as telas e os relatórios utilizam.
        if (d.despesas.some(x => x.historico != null && (!Array.isArray(x.historico)
            || x.historico.some(h => !h || !str(h.acao) || !str(h.motivo) || !str(h.data)
                || !num(h.valorOriginal) || !num(h.valorCorrigido)))))
            throw Error('Histórico de despesa inválido.');
        if (d.receitas.some(r => r.itensPedido != null && (!Array.isArray(r.itensPedido)
            || r.itensPedido.some(i => !i || !str(i.nome) || !str(i.produtoId) || !num(i.preco) || !Number.isSafeInteger(i.qtd) || i.qtd <= 0))))
            throw Error('Itens históricos de recebimento inválidos.');
        const totais = [
            d.receitas.reduce((n, x) => n + Math.abs(x.valor), 0),
            d.despesas.reduce((n, x) => n + Math.abs(x.valor), 0),
            d.pedidos.reduce((n, x) => n + x.total, 0),
            d.produtos.reduce((n, x) => n + x.saldo * (x.custoMedio ?? 0), 0),
            d.movimentos.reduce((n, x) => n + (x.custoTotal ?? 0), 0)
        ];
        if (totais.some(x => !num(x)))
            throw Error('O volume monetário excede a precisão suportada pelo sistema.');
        if (d.atividades !== undefined && (!Array.isArray(d.atividades) || d.atividades.some(x => !x || ![x.data, x.usuario, x.modulo, x.acao].every(str))))
            throw Error('Histórico inválido.');
        if (d.notificacoesLidas !== undefined
            && (!d.notificacoesLidas || typeof d.notificacoesLidas !== 'object' || Array.isArray(d.notificacoesLidas)
                || Object.values(d.notificacoesLidas).some(v => !Array.isArray(v) || v.some(x => !str(x)))))
            throw Error('Notificações inválidas.');
        for (const e of d.receitas.filter(r => r.estornoDe || r.valor < 0)) {
            const original = receitas.get(e.estornoDe);
            if (!original || original.estornoDe || original.valor <= 0 || e.valor >= 0 || e.pedidoId !== original.pedidoId || e.data < original.data)
                throw Error('Estorno sem recebimento original válido.');
            const pedido = pedidos.get(e.pedidoId);
            // Adiantamentos devolvidos antes da conclusão são operações legítimas.
            if (pedido?.status === 'Concluído' && pedido.dataVenda && e.antesDaVenda === false
                && e.data < pedido.dataVenda)
                throw Error('Estorno de venda anterior à conclusão.');
        }
        for (const r of d.receitas.filter(r => !r.estornoDe)) {
            if (money(r.valor + (estornos.get(r.id) || []).reduce((a, e) => a + e.valor, 0)) < 0)
                throw Error('Estornos excedem o pagamento.');
        }
        for (const p of d.pedidos.filter(pedidoAberto)) {
            const recebido = (receitasPedido.get(p.id) || []).filter(realizado).reduce((n, r) => n + r.valor, 0);
            if (money(recebido) > money(p.total))
                throw Error('Recebimento acima do total do pedido em andamento.');
        }
        for (const x of d.despesas.filter(x => x.estornoDe)) {
            const o = despesas.get(x.estornoDe);
            if (!o || o.estornoDe || o.situacao !== 'Pago' || x.valor >= 0 || x.data < o.data)
                throw Error('Reversão de despesa inválida.');
        }
        for (const x of d.despesas.filter(x => x.ajusteDe)) {
            const o = despesas.get(x.ajusteDe);
            if (!o || o.estornoDe || o.ajusteDe || o.situacao !== 'Pago' || x.situacao !== 'Pago' || x.valor <= 0 || x.data < o.data)
                throw Error('Complemento inválido.');
        }
        for (const x of d.despesas.filter(x => !x.estornoDe && !x.ajusteDe)) {
            const vinculados = ajustes.get(x.id) || [];
            if (money(x.valor + vinculados.reduce((n, y) => n + y.valor, 0)) < 0)
                throw Error('Reversão excede a despesa.');
            if (vinculados.length) {
                const eventos = agrupar([x, ...vinculados], y => y.data);
                let saldo = 0;
                for (const diaEvento of [...eventos.keys()].sort()) {
                    saldo = money(saldo + eventos.get(diaEvento).reduce((n, y) => n + y.valor, 0));
                    if (saldo < 0)
                        throw Error('Reversão excede os pagamentos da data correspondente.');
                }
            }
        }
        return migrar(d);
    };

    // Serializa os dados em JSON para persistência no navegador.
    const salvar = dados => {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
        }
        catch (e) {
            throw Error('Não foi possível salvar os dados neste navegador. Nenhuma alteração foi confirmada.');
        }
    };

    // Carrega os dados existentes ou inicializa a demonstração; aplica as migrações de compatibilidade.
    const ler = (texto = localStorage.getItem(chave)) => {
        if (texto !== null) {
            try {
                return migrar(JSON.parse(texto));
            }
            catch (e) {
                throw Error('Dados locais inválidos. Restaure um backup ou a demonstração.');
            }
        }
        const d = validar(inicial());
        salvar(d);
        return d;
    };
    const ator = d => d.usuarios.find(u => u.id === localStorage.getItem('gato-session'))?.nome || 'Demonstração';
    const log = (d, modulo, acao) => d.atividades.push({
        id: id(),
        data: agora(),
        usuario: ator(d),
        usuarioId: localStorage.getItem('gato-session') || '',
        modulo,
        acao
    });

    // Aplica uma alteração à base, registra a atividade e persiste o resultado.
    const atualizar = (fn, acao = 'auto', modulo = globalThis.document?.body?.dataset?.page || 'sistema') => {
        // Carrega a mesma fotografia que será comparada antes de salvar.
        if (localStorage.getItem(chave) === null)
            ler();
        const textoOriginal = localStorage.getItem(chave);
        const d = ler(textoOriginal);
        const sessaoOriginal = localStorage.getItem('gato-session');
        const pagina = globalThis.document?.body?.dataset?.page;
        if (['pedidos', 'estoque', 'financeiro', 'administracao', 'dashboard'].includes(pagina))
            permissao(d, pagina);
        const before = acao === 'auto' ? JSON.parse(JSON.stringify(d)) : null;
        const r = fn(d);
        if (acao === 'auto') {
            const changes = [];
            for (const [k, label] of [
                ['produtos', 'Produto'],
                ['pedidos', 'Pedido'],
                ['receitas', 'Recebimento'],
                ['despesas', 'Despesa'],
                ['movimentos', 'Movimentação'],
                ['usuarios', 'Usuário']
            ]) {
                const anteriores = porId(before[k]);
                for (const x of d[k]) {
                    const old = anteriores.get(x.id);
                    if (!old || JSON.stringify(old) !== JSON.stringify(x))
                        changes.push((old ? 'Atualização: ' : 'Novo registro: ') + label + ' ' + (x.nome || x.descricao || (x.numero ? '#' + x.numero : x.tipo || '')));
                }
            }
            if (JSON.stringify(before.config) !== JSON.stringify(d.config))
                changes.push('Configurações atualizadas');
            acao = changes.join(' · ') || 'Registros revisados';
        }
        if (acao)
            log(d, modulo, acao);
        if (pagina)
            validar(d);
        // Detecta alterações concorrentes já gravadas. Não é um bloqueio entre abas.
        if (localStorage.getItem(chave) !== textoOriginal || localStorage.getItem('gato-session') !== sessaoOriginal)
            throw Error('Os registros mudaram em outra aba. Atualize a página e confira a operação.');
        salvar(d);
        globalThis.document?.dispatchEvent(new Event('dados-atualizados'));
        return r;
    };

    // Substitui a base local pelos dados fictícios de demonstração.
    const restaurar = () => salvar(validar(inicial()));

    // Arredonda valores monetários para duas casas decimais.
    const money = n => Math.round((n + Math.sign(n) * Number.EPSILON) * 100) / 100;

    // Distingue custos conhecidos (inclusive zero) de custos não informados.
    const custoValido = x => typeof x === 'number' && Number.isFinite(x) && x >= 0;
    const custo = (p, q) => custoValido(p.custoMedio) ? money(p.custoMedio * q) : null;

    // Atualiza o custo médio ponderado quando há entrada de mercadorias.
    const media = (p, q, unit) => {
        if (q <= 0)
            return;
        if (!custoValido(unit) || p.saldo > 0 && !custoValido(p.custoMedio)) {
            p.custoMedio = null;
            return;
        }
        p.custoMedio = Math.round(((p.saldo ? (p.saldo * p.custoMedio) : 0) + q * unit) / (p.saldo + q) * 1e6) / 1e6;
    };

    // Valida a permissão do usuário local antes de uma operação protegida.
    const permissao = (d, k) => {
        const u = d.usuarios.find(x => x.id === localStorage.getItem('gato-session') && x.ativo);
        if (!u || (k === 'administracao' ? u.perfil !== 'Administrador' : k !== 'dashboard' && u.permissoes?.[k] === false))
            throw Error('Acesso não autorizado: ' + k);
    };
    const dataValida = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !isNaN(Date.parse(x)) && new Date(x).toISOString().slice(0, 10) === x && x <= dia();

    // Agrupa alterações relacionadas antes de persistir a base; não equivale a uma transação de banco de dados.
    const transacao = (fn, mod) => atualizar(d => {
        permissao(d, mod);
        const result = fn(d);
        validar(d);
        return result;
    }, 'auto', mod);

    // Valida entradas e saídas, registra custos e integra compras ao financeiro quando necessário.
    const registrarMovimento = (v, token) => transacao(d => {
        if (token && d.movimentos.some(m => m.id === token))
            throw Error('Movimentação já registrada.');
        const p = d.produtos.find(x => x.id === v.produtoId);
        if (!p)
            throw Error('Produto não encontrado.');
        const tipo = v.tipo, q = Number(v.quantidade), antes = p.saldo;
        if (!['Entrada', 'Saída', 'Ajuste'].includes(tipo) || !Number.isFinite(q) || q < 0 || (tipo !== 'Ajuste' && q === 0) || !dataValida(v.data)
            || !Number.isSafeInteger(Math.round(q * 1000)) || (q > 0 && q < 0.001)
            || Math.abs(q * 1000 - Math.round(q * 1000)) > 1e-6)
            throw Error('Quantidade, tipo ou data inválida.');
        const novo = Math.round((tipo === 'Ajuste' ? q : antes + (tipo === 'Entrada' ? q : -q)) * 1000) / 1000;
        if (novo < 0)
            throw Error('Saldo insuficiente.');
        const origens = tipo === 'Entrada'
            ? ['Compra', 'Produção própria', 'Devolução', 'Ajuste de inventário', 'Outras']
            : tipo === 'Saída'
                ? ['Perda ou desperdício', 'Produto vencido', 'Consumo interno', 'Devolução ao fornecedor', 'Ajuste de inventário', 'Outras']
                : ['Ajuste de inventário'];
        if (!origens.includes(v.origem))
            throw Error('Origem inválida.');
        const motivo = String(v.motivo || '').trim();
        if (tipo !== 'Entrada' && !motivo)
            throw Error('Informe a justificativa.');
        const m = {
            id: token || id(),
            produtoId: p.id,
            nome: p.nome,
            tipo,
            origem: v.origem,
            quantidade: Math.round(Math.abs(novo - antes) * 1000) / 1000,
            anterior: antes,
            novo,
            data: v.data,
            motivo: motivo || v.origem,
            usuario: ator(d),
            registro: agora(),
            custoUnitario: p.custoMedio,
            custoTotal: custo(p, Math.abs(novo - antes))
        };
        if (v.origem === 'Compra') {
            permissao(d, 'financeiro');
            const unit = Number(v.custoUnitario);
            if (v.custoUnitario === '' || !custoValido(unit) || !['Pago', 'Pendente'].includes(v.situacao) || (v.situacao === 'Pago' && !d.config.formas.includes(v.forma)))
                throw Error('Informe custo e pagamento válidos.');
            const valor = money(q * unit);
            if (valor <= 0)
                throw Error('O custo total da compra deve ser positivo.');
            m.custoUnitario = unit;
            m.custoTotal = valor;
            m.fornecedor = String(v.fornecedor || '').trim();
            m.despesaId = id();
            d.despesas.push({
                id: m.despesaId,
                movimentoId: m.id,
                produtoId: p.id,
                descricao: 'Compra · ' + p.nome + ' · ' + q + ' ' + p.unidade + (m.fornecedor ? ' · ' + m.fornecedor : ''),
                categoria: 'Fornecedores',
                natureza: 'Compra de estoque',
                valor,
                data: v.data,
                situacao: v.situacao,
                forma: v.situacao === 'Pago' ? v.forma : '',
                registro: agora(),
                usuario: ator(d),
                historico: []
            });
            media(p, q, unit);
            p.ultimoCusto = unit;
        }
        else if (novo > antes) {
            const unit = v.custoUnitario !== '' && v.custoUnitario != null ? Number(v.custoUnitario) : null;
            if (unit !== null && !custoValido(unit))
                throw Error('Custo inválido.');
            m.custoUnitario = unit;
            m.custoTotal = unit === null ? null : money(unit * (novo - antes));
            media(p, novo - antes, unit);
        }
        // Um crédito informado jamais pode ser descartado por falta de vínculo.
        if (v.origem === 'Devolução ao fornecedor' && !v.despesaId && v.reembolso != null && v.reembolso !== '' && Number(v.reembolso) !== 0)
            throw Error('Vincule a compra original para registrar crédito ou reembolso.');
        if (v.origem === 'Devolução ao fornecedor' && v.despesaId) {
            permissao(d, 'financeiro');
            const x = d.despesas.find(x => x.id === v.despesaId);
            if (!x || x.produtoId !== p.id || !x.movimentoId)
                throw Error('Selecione a compra original deste produto.');
            const original = d.movimentos.find(m => m.id === x.movimentoId);
            const devolvido = d.movimentos.filter(m => m.compraOriginalId === original?.id).reduce((n, m) => n + m.quantidade, 0);
            if (!original || devolvido + q > original.quantidade + 1e-6)
                throw Error('Quantidade superior à compra original.');
            if (v.data < original.data)
                throw Error('A devolução não pode ser anterior à compra original.');
            m.compraOriginalId = original.id;
            const valor = money(Number(v.reembolso));
            if (!Number.isFinite(valor) || valor <= 0)
                throw Error('Informe o valor do crédito ou reembolso.');
            if (x.situacao === 'Pago') {
                const e = reverterDespesaInterno(d, x, valor, 'Reembolso', 'Devolução ao fornecedor: ' + motivo, v.data);
                m.reembolsoId = e.id;
            }
            else if (x.situacao === 'Pendente') {
                validarDataObrigacao(x, v.data);
                if (money(valor) > x.valor)
                    throw Error('Crédito maior que a obrigação.');
                historicoDespesa(d, x, 'Crédito por devolução', motivo, money(x.valor - valor), v.data, m.id);
                x.valor = money(x.valor - valor);
                if (x.valor === 0)
                    x.situacao = 'Cancelado';
                m.creditoDespesaId = x.id;
            }
            else
                throw Error('Compra já cancelada.');
        }
        p.saldo = novo;
        d.movimentos.push(m);
        return m.id;
    }, 'estoque');
    const historicoDespesa = (d, x, acao, motivo, novo, dataOperacao = dia(), movimentoId = '') => {
        x.historico ??= [];
        x.historico.push({
            id: id(),
            data: agora(),
            usuario: ator(d),
            usuarioId: localStorage.getItem('gato-session') || '',
            acao,
            motivo,
            valorOriginal: x.valor,
            valorCorrigido: novo,
            situacaoOriginal: x.situacao,
            descricaoOriginal: x.descricao,
            categoriaOriginal: x.categoria,
            dataOperacao,
            movimentoId
        });
    };

    // Calcula o saldo da despesa considerando ajustes e reversões vinculados.
    const saldoDespesa = (d, x) => money(x.valor + d.despesas.filter(y => y.estornoDe === x.id || y.ajusteDe === x.id).reduce((a, y) => a + y.valor, 0));
    const reverterDespesaInterno = (d, x, valor, tipo, motivo, data) => {
        valor = money(valor);
        if (!x || x.estornoDe || x.ajusteDe || x.situacao !== 'Pago' || !Number.isFinite(valor) || valor <= 0 || valor > saldoDespesa(d, x) || !['Reembolso', 'Correção'].includes(tipo)
            || !String(motivo).trim()
            || !dataValida(data)
            || data < x.data)
            throw Error('Reversão inválida ou superior ao saldo da despesa.');
        // Uma reversão retroativa não pode consumir pagamentos realizados depois dela.
        const eventos = [x, ...d.despesas.filter(y => y.estornoDe === x.id || y.ajusteDe === x.id), { data, valor: -valor }];
        const datas = [...new Set(eventos.map(y => y.data))].sort();
        let saldo = 0;
        for (const diaEvento of datas) {
            saldo = money(saldo + eventos.filter(y => y.data === diaEvento).reduce((n, y) => n + y.valor, 0));
            if (saldo < 0)
                throw Error('A reversão excede os pagamentos realizados até essa data.');
        }
        const e = {
            id: id(),
            estornoDe: x.id,
            descricao: tipo + ' · ' + x.descricao + ' · ' + motivo,
            categoria: x.categoria,
            natureza: x.natureza,
            valor: -valor,
            situacao: 'Pago',
            data,
            registro: agora(),
            usuario: ator(d),
            tipoAjuste: tipo,
            historico: []
        };
        historicoDespesa(d, x, tipo, motivo, money(saldoDespesa(d, x) - valor), data);
        d.despesas.push(e);
        return e;
    };

    // O saldo atual da obrigação já incorpora os créditos e correções anteriores.
    // Não é possível aplicá-lo a uma data anterior sem reconstruir todo o histórico.
    const validarDataObrigacao = (x, data) => {
        const alteracoes = (x.historico || []).filter(h =>
            ['Crédito por devolução', 'Corrigir', 'Cancelar'].includes(h.acao));
        if (alteracoes.some(h => h.dataOperacao && data < h.dataOperacao))
            throw Error('A data deve ser igual ou posterior à última correção ou crédito da obrigação.');
    };

    // Registra correções sem apagar o histórico financeiro original.
    const corrigirDespesa = (rid, v) => transacao(d => {
        const x = d.despesas.find(x => x.id === rid);
        if (!x || x.estornoDe || x.ajusteDe || x.situacao === 'Cancelado' || !String(v.motivo || '').trim())
            throw Error('Despesa ou justificativa inválida.');
        if (x.movimentoId)
            throw Error('Compra vinculada: utilize devolução ao fornecedor no estoque.');
        if (x.situacao === 'Pago') {
            if (v.acao === 'Complemento') {
                const valor = money(Number(v.valor));
                if (!Number.isFinite(valor) || valor <= 0 || !dataValida(v.data) || v.data < x.data)
                    throw Error('Valor ou data inválida.');
                historicoDespesa(d, x, 'Complemento', v.motivo, money(saldoDespesa(d, x) + valor), v.data);
                const e = {
                    id: id(),
                    ajusteDe: x.id,
                    descricao: 'Complemento · ' + x.descricao + ' · ' + v.motivo,
                    categoria: x.categoria,
                    natureza: x.natureza,
                    valor,
                    situacao: 'Pago',
                    data: v.data,
                    registro: agora(),
                    usuario: ator(d),
                    tipoAjuste: 'Complemento',
                    historico: []
                };
                d.despesas.push(e);
                return e.id;
            }
            if (!['Reembolso', 'Correção'].includes(v.acao))
                throw Error('Selecione reembolso ou correção.');
            return reverterDespesaInterno(d, x, Number(v.valor), v.acao, v.motivo, v.data).id;
        }
        if (!['Cancelar', 'Corrigir'].includes(v.acao))
            throw Error('Ação inválida.');
        const valor = v.acao === 'Cancelar' ? 0 : money(Number(v.valor));
        if (!Number.isFinite(valor) || valor < 0 || (v.acao === 'Corrigir' && valor <= 0))
            throw Error('Valor inválido.');
        if (!dataValida(v.data || dia()) || (v.data || dia()) < x.data)
            throw Error('Data da correção inválida.');
        validarDataObrigacao(x, v.data || dia());
        historicoDespesa(d, x, v.acao, v.motivo, valor, v.data || dia());
        if (v.acao === 'Cancelar')
            x.situacao = 'Cancelado';
        else {
            x.valor = valor;
            if (String(v.descricao || '').trim())
                x.descricao = v.descricao.trim();
        }
        return x.id;
    }, 'financeiro');
    // A data efetiva da venda não se confunde com o cadastro do pedido.
    const dataVenda = (d, p) => pedidoAberto(p) ? null : p.dataVenda || d.movimentos.find(m => m.pedidoId === p.id && m.tipo === 'Saída')?.data
        || p.dataConclusao?.slice(0, 10) || (p.integracao === 'legado' ? p.data : null);
    // Os mesmos operandos alimentam o resultado e a memória de cálculo opcional.

    // Calcula receitas, CMV, lucro, margens, perdas e valor do estoque. Custos desconhecidos não são tratados como zero.
    const indicadores = (d, de = '', ate = '', memoria = null) => {
        const inRange = x => (!de || x >= de) && (!ate || x <= ate);
        const rs = d.receitas.filter(x => realizado(x) && inRange(x.data)), ds = d.despesas.filter(x => inRange(x.data) && (x.situacao !== 'Pago' || realizado(x)));
        const vendidos = d.pedidos.filter(p => dataVenda(d, p) && dataVenda(d, p) <= dia());
        const vendas = vendidos.filter(p => inRange(dataVenda(d, p)));
        const ms = d.movimentos.filter(m => m.pedidoId && realizado(m) && inRange(m.data) && ['Saída', 'Entrada'].includes(m.tipo));
        const itensSemCusto = vendas.reduce((n, p) => n + p.itens.filter(i => !custoValido(i.custoTotal)).length, 0);
        // Um item com custo informado não prova que houve baixa. Sem a saída original,
        // o CMV não é verificável: mostrar indisponível é mais seguro que mostrar zero.
        const movimentosPorPedido = agrupar(ms, m => m.pedidoId);
        const baixasAusentes = vendas.filter(p => [...new Set(p.itens.map(i => i.produtoId))].some(pid => {
            const esperado = p.itens.filter(i => i.produtoId === pid).reduce((n, i) => n + i.qtd, 0);
            const baixado = (movimentosPorPedido.get(p.id) || []).filter(m => m.produtoId === pid && m.tipo === 'Saída').reduce((n, m) => n + m.quantidade, 0);
            return baixado !== esperado;
        })).length;
        const movSemCusto = ms.filter(m => !custoValido(m.custoTotal)).length;
        const desconhecido = itensSemCusto > 0 || movSemCusto > 0 || baixasAusentes > 0;
        const cmv = desconhecido ? null : money(ms.reduce((n, m) => n + (m.tipo === 'Saída' ? 1 : -1) * m.custoTotal, 0));
        const idsVendidos = new Set(vendidos.map(p => p.id));
        // Estornos de adiantamento anteriores à venda não reduzem a venda que só foi concluída depois.
        const estornosVenda = rs.filter(x => {
            if (!x.estornoDe || !idsVendidos.has(x.pedidoId) || x.antesDaVenda === true)
                return false;
            const p = d.pedidos.find(p => p.id === x.pedidoId);
            return x.antesDaVenda === false || !(Number.isFinite(Date.parse(x.registro)) && Number.isFinite(Date.parse(p.dataConclusao)) && Date.parse(x.registro) < Date.parse(p.dataConclusao));
        });
        const vendasBrutas = vendas.reduce((n, p) => n + p.total, 0), ajustesVenda = estornosVenda.reduce((n, x) => n + x.valor, 0);
        const receitaVendas = money(vendasBrutas + ajustesVenda);
        const perdas = d.movimentos.filter(m => m.tipo === 'Saída' && ['Perda ou desperdício', 'Produto vencido'].includes(m.origem) && realizado(m) && inRange(m.data));
        const perdasSemCusto = perdas.filter(m => !custoValido(m.custoTotal)).length;
        const perda = perdasSemCusto ? null : money(perdas.reduce((n, m) => n + m.custoTotal, 0));
        const estoqueSemCusto = d.produtos.filter(p => p.saldo > 0 && !custoValido(p.custoMedio)).length;
        const estoque = estoqueSemCusto ? null : money(d.produtos.reduce((n, p) => n + (p.saldo ? p.saldo * p.custoMedio : 0), 0));
        const lucro = cmv === null ? null : money(receitaVendas - cmv);
        const operacional = money(ds.filter(x => x.situacao === 'Pago' && x.natureza !== 'Compra de estoque').reduce((n, x) => n + x.valor, 0));
        const legado = ds.some(x => x.situacao === 'Pago' && x.categoria === 'Fornecedores' && !x.natureza);
        const resultado = lucro === null || perda === null || legado ? null : money(lucro - perda - operacional);
        const k = {
            bruta: money(rs.filter(x => x.valor > 0).reduce((n, x) => n + x.valor, 0)),
            estornos: money(-rs.filter(x => x.valor < 0).reduce((n, x) => n + x.valor, 0)),
            liquida: money(rs.reduce((n, x) => n + x.valor, 0)),
            pagas: money(ds.filter(x => x.situacao === 'Pago').reduce((n, x) => n + x.valor, 0)),
            pendentes: money(ds.filter(x => x.situacao === 'Pendente').reduce((n, x) => n + x.valor, 0)),
            receitaVendas,
            cmv,
            lucro,
            margem: lucro === null || receitaVendas <= 0 ? null : lucro / receitaVendas * 100,
            estoque,
            perda,
            resultado
        };
        if (memoria)
            Object.assign(memoria, {
                vendasBrutas,
                ajustesVenda,
                operacional,
                itensSemCusto,
                baixasAusentes,
                movSemCusto,
                perdasSemCusto,
                estoqueSemCusto,
                legado,
                custoSaidas: desconhecido ? null : ms.filter(m => m.tipo === 'Saída').reduce((n, m) => n + m.custoTotal, 0),
                custoReposicoes: desconhecido ? null : ms.filter(m => m.tipo === 'Entrada').reduce((n, m) => n + m.custoTotal, 0),
                qtdPerdas: perdas.length,
                qtdProdutos: d.produtos.filter(p => p.saldo !== 0).length,
                parcelasEstoque: estoque === null ? [] : d.produtos.filter(p => p.saldo !== 0).map(p => ({ valor: p.saldo * p.custoMedio })),
                parcelasPerdas: perda === null ? [] : perdas.map(m => ({ valor: m.custoTotal })),
                parcelasBrutas: rs.filter(x => x.valor > 0).map(x => ({ valor: x.valor })),
                parcelasEstornos: rs.filter(x => x.valor < 0).map(x => ({ valor: -x.valor })),
                margemOperacional: resultado === null || receitaVendas <= 0 ? null : resultado / receitaVendas * 100
            });
        return k;
    };

    // Registra uma entrada ou saída vinculada ao pedido, preservando os custos correspondentes.
    const movimento = (d, p, q, tipo, pedido, motivo, original = null) => {
        const anterior = p.saldo, unit = original ? original.custoUnitario : p.custoMedio, valor = original ? original.custoTotal : custo(p, q);
        if (tipo === 'Entrada')
            media(p, q, unit);
        const novo = Math.round((anterior + (tipo === 'Saída' ? -q : q)) * 1000) / 1000;
        if (novo < 0)
            throw Error('Estoque insuficiente: ' + p.nome);
        p.saldo = novo;
        d.movimentos.push({
            id: id(),
            produtoId: p.id,
            nome: pedido.itens.find(i => i.produtoId === p.id)?.nome || p.nome,
            tipo,
            quantidade: q,
            anterior,
            novo,
            data: dia(),
            registro: agora(),
            pedidoId: pedido.id,
            motivo,
            usuario: ator(d),
            custoUnitario: unit ?? null,
            custoTotal: valor ?? null,
            origem: tipo === 'Saída' ? 'Venda' : 'Devolução de venda',
            movimentoOriginalId: original?.id || ''
        });
    };
    const evento = (d, p, texto) => p.eventos.push({ data: agora(), texto, usuario: ator(d) });

    // Define as próximas etapas permitidas; pedidos concluídos ou cancelados não voltam ao fluxo.
    const transicoesPedido = p => ({
        'Pendente': ['Em preparo', 'Concluído'],
        'Em preparo': ['Pronto', 'Concluído'],
        'Pronto': ['Concluído']
    }[p?.status] || []);
    const pedidoAberto = p => ['Pendente', 'Em preparo', 'Pronto'].includes(p?.status);
    // Um adiantamento integralmente devolvido não deve bloquear uma edição legítima.
    const pedidoEditavel = (d, p) => ['Pendente', 'Em preparo'].includes(p?.status)
        && resumoPagamento(d, p.id).liquido === 0;
    const mudarStatusPedido = (pid, status) => transacao(d => {
        const p = localizar(d, pid);
        if (status === 'Concluído' || !transicoesPedido(p).includes(status))
            throw Error('Transição não permitida.');
        const anterior = p.status;
        p.status = status;
        evento(d, p, 'Status: ' + status);
        Object.assign(p.eventos.at(-1), { tipo: 'Status', anterior, novo: status });
    }, 'pedidos');
    const recebimentosPedido = (d, pid) => d.receitas.filter(r => r.pedidoId === pid && !r.estornoDe && r.valor > 0 && realizado(r));

    // Soma o recebido e os estornos relacionados ao pedido para determinar o saldo líquido.
    const resumoPagamento = (d, pid) => {
        const rs = recebimentosPedido(d, pid), bruto = money(rs.reduce((n, r) => n + r.valor, 0)), liquido = money(rs.reduce((n, r) => n + saldoEstorno(d, r), 0));
        return { bruto, liquido, estornado: money(bruto - liquido) };
    };

    // Calcula quantas unidades ainda podem ser devolvidas, incluindo devoluções sem reposição.
    const saldoDevolucao = (d, pid, produtoId) => {
        const ms = d.movimentos.filter(m => m.pedidoId === pid && m.produtoId === produtoId), p = d.pedidos.find(x => x.id === pid);
        const descartados = (p?.devolucoes || []).filter(x => !x.repor).reduce((n, x) => n + Number(x.quantidades[produtoId] || 0), 0);
        return Math.max(0, ms.filter(m => m.tipo === 'Saída').reduce((n, m) => n + m.quantidade, 0) - ms.filter(m => m.tipo === 'Entrada').reduce((n, m) => n + m.quantidade, 0) - descartados);
    };

    // Repõe apenas quantidades elegíveis e utiliza o custo histórico da saída original.
    const reporItens = (d, p, quantidades) => {
        for (const [pid, q] of Object.entries(quantidades)) {
            if (!Number.isInteger(q) || q < 0 || q > saldoDevolucao(d, p.id, pid))
                throw Error('Quantidade superior à disponível para devolução.');
            if (!q)
                continue;
            const original = d.movimentos.find(m => m.pedidoId === p.id && m.produtoId === pid && m.tipo === 'Saída'), prod = d.produtos.find(x => x.id === pid);
            if (!original || !prod)
                throw Error('Baixa original não encontrada.');
            const anteriores = d.movimentos.filter(m => m.pedidoId === p.id && m.produtoId === pid && m.tipo === 'Entrada');
            const jaReposto = anteriores.reduce((n, m) => n + m.quantidade, 0);
            const custoTotal = original.custoTotal == null ? null : money(money(original.custoTotal * (jaReposto + q) / original.quantidade) - anteriores.reduce((n, m) => n + (m.custoTotal ?? 0), 0));
            movimento(d, prod, q, 'Entrada', p, 'Devolução #' + p.numero, { ...original, custoTotal });
        }
    };

    // Distribui o estorno pelos recebimentos elegíveis, respeitando o saldo disponível.
    const estornarPedidoInterno = (d, p, valor, motivo, meta = {}) => {
        permissao(d, 'financeiro');
        valor = money(Number(valor));
        if (!Number.isFinite(valor) || valor <= 0 || valor > resumoPagamento(d, p.id).liquido)
            throw Error('Valor excede o saldo recebido ou é inválido.');
        if (meta.token && d.receitas.some(r => r.operacaoId === meta.token))
            throw Error('Estorno já registrado.');
        let resto = valor;
        for (const r of recebimentosPedido(d, p.id)) {
            const parte = Math.min(resto, saldoEstorno(d, r));
            if (parte > 0)
                estornarInterno(d, r, parte, motivo, meta);
            resto = money(resto - parte);
        }
    };
    const estornarPedido = (pid, valor, motivo, meta = {}) => transacao(d => {
        const p = localizar(d, pid);
        if (p.status !== 'Concluído')
            throw Error('Selecione uma venda concluída.');
        estornarPedidoInterno(d, p, valor, motivo, meta);
    }, 'pedidos');

    // Registra a devolução física, com reposição somente se aproveitável e estorno quando solicitado.
    const devolverItens = (pid, quantidades, valor, motivo, token, op = {}) => transacao(d => {
        const p = localizar(d, pid);
        if (p.status !== 'Concluído' || p.integracao !== 'v3' || !String(motivo || '').trim() || !Object.values(quantidades).some(q => q > 0))
            throw Error('Informe um pedido concluído, itens e motivo.');
        if (token && (p.devolucoes || []).some(e => e.id === token))
            throw Error('Devolução já registrada.');
        for (const [k, q] of Object.entries(quantidades))
            if (!Number.isInteger(q) || q < 0 || q > saldoDevolucao(d, pid, k))
                throw Error('Quantidade superior à disponível para devolução.');
        valor = money(Number(valor));
        if (!Number.isFinite(valor) || valor < 0)
            throw Error('Valor inválido.');
        const repor = op.repor !== false, condicao = op.condicao || (repor ? 'Aproveitável' : 'Impróprio');
        if (!['Aproveitável', 'Impróprio', 'Consumido'].includes(condicao) || repor && condicao !== 'Aproveitável')
            throw Error('Produto impróprio não pode retornar ao estoque.');
        if (op.data && (!dataValida(op.data) || op.data < dataVenda(d, p)))
            throw Error('Data da devolução incompatível com a venda.');
        const operacaoId = token || id();
        if (valor > 0)
            estornarPedidoInterno(d, p, valor, motivo, { ...op, token: operacaoId });
        const inicio = d.movimentos.length;
        if (repor)
            reporItens(d, p, quantidades);
        const registro = {
            id: operacaoId,
            data: agora(),
            usuario: ator(d),
            motivo,
            condicao,
            repor,
            quantidades: Object.fromEntries(Object.entries(quantidades).filter(([, q]) => q > 0)),
            valor,
            movimentos: d.movimentos.slice(inicio).map(m => m.id),
            estornos: d.receitas.filter(r => r.operacaoId === operacaoId).map(r => r.id)
        };
        (p.devolucoes ??= []).push(registro);
        evento(d, p, 'Devolução: ' + motivo + ' · ' + condicao + ' · ' + (repor ? 'estoque reposto' : 'sem reposição') + ' · estorno R$ ' + valor.toFixed(2));
        Object.assign(p.eventos.at(-1), { operacaoId, tipo: 'Devolução' });
    }, 'pedidos');
    const localizar = (d, pid) => {
        const p = d.pedidos.find(x => x.id === pid);
        if (!p)
            throw Error('Pedido não encontrado.');
        return p;
    };

    // Agrupa quantidades por produto e impede vendas sem saldo suficiente.
    const validarItens = (d, itens) => {
        if (!itens.length)
            throw Error('Adicione itens.');
        const qs = new Map();
        for (const it of itens) {
            if (!Number.isInteger(it.qtd) || it.qtd <= 0)
                throw Error('Quantidade inválida.');
            qs.set(it.produtoId, (qs.get(it.produtoId) || 0) + it.qtd);
        }
        for (const [pid, q] of qs) {
            const p = d.produtos.find(x => x.id === pid);
            if (!p || p.ativo === false || p.saldo < q)
                throw Error('Produto indisponível ou saldo insuficiente: ' + (p?.nome || pid));
        }
        return qs;
    };

    // Confirma pagamento, evita duplicidades, baixa o estoque e grava os custos históricos da venda.
    const finalizar = (pid, forma, confirmado) => transacao(d => {
        const p = localizar(d, pid);
        if (!['Pendente', 'Em preparo', 'Pronto'].includes(p.status) || p.integracao || d.movimentos.some(m => m.pedidoId === pid && m.tipo === 'Saída'))
            throw Error('Pedido já finalizado ou inválido.');
        if (!confirmado || !d.config.formas.includes(forma))
            throw Error('Confirme o pagamento e a forma.');
        const qs = validarItens(d, p.itens);
        const saldo = resumoPagamento(d, pid).liquido;
        if (saldo < 0 || saldo > money(p.total))
            throw Error('Recebimento anterior incompatível. Confira o financeiro.');
        const falta = money(p.total - saldo);
        // Registra somente o saldo que falta, inclusive após um estorno antecipado.
        if (falta > 0)
            d.receitas.push({
                id: id(),
                pedidoId: pid,
                descricao: 'Pedido #' + p.numero,
                forma,
                valor: falta,
                data: dia(),
                registro: agora(),
                origem: 'Pedido',
                usuario: ator(d)
            });
        for (const it of p.itens) {
            const prod = d.produtos.find(x => x.id === it.produtoId);
            it.custoUnitario = prod.custoMedio ?? null;
            it.custoTotal = custo(prod, it.qtd);
        }
        for (const [k, q] of qs)
            movimento(d, d.produtos.find(x => x.id === k), q, 'Saída', p, 'Venda #' + p.numero);
        p.status = 'Concluído';
        p.integracao = 'v3';
        p.dataConclusao = agora();
        p.dataVenda = dia();
        p.pagamento = 'Confirmado';
        const formasRecebidas = [...new Set(recebimentosPedido(d, pid).filter(r => saldoEstorno(d, r) > 0).map(r => r.forma))];
        p.forma = formasRecebidas.length > 1 ? 'Múltiplas formas' : formasRecebidas[0] || forma;
        evento(d, p, 'Pedido concluído · pagamento confirmado · baixa de estoque');
        log(d, 'estoque', 'Baixa automática #' + p.numero);
        log(d, 'financeiro', falta > 0 ? 'Recebimento de saldo restante #' + p.numero : 'Recebimentos existentes conciliados #' + p.numero);
    }, 'pedidos');

    // Limita o estorno ao valor recebido menos os estornos anteriores.
    const saldoEstorno = (d, r) => money(r.valor + d.receitas.filter(x => x.estornoDe === r.id && realizado(x)).reduce((a, x) => a + x.valor, 0));

    // Cria um lançamento financeiro negativo vinculado ao recebimento original.
    const estornarInterno = (d, r, valor, motivo, meta = {}) => {
        const data = meta.data || dia(), forma = meta.forma || r?.forma;
        if (!r || r.valor <= 0 || r.estornoDe || !Number.isFinite(valor) || money(valor) <= 0 || money(valor) > saldoEstorno(d, r) || !String(motivo || '').trim() || !dataValida(data)
            || data < r.data
            || (!d.config.formas.includes(forma) && forma !== r.forma))
            throw Error('Estorno inválido, data incompatível ou superior ao saldo disponível.');
        const venda = d.pedidos.find(p => p.id === r.pedidoId);
        if (venda?.status === 'Concluído' && dataVenda(d, venda) && data < dataVenda(d, venda))
            throw Error('O estorno não pode ser anterior à conclusão da venda.');
        const eid = id();
        d.receitas.push({
            id: eid,
            pedidoId: r.pedidoId || '',
            descricao: 'Estorno · ' + r.descricao + ' · ' + motivo,
            forma,
            valor: -money(valor),
            data,
            registro: agora(),
            estornoDe: r.id,
            origem: 'Estorno',
            usuario: ator(d),
            motivo,
            observacoes: String(meta.observacoes || ''),
            operacaoId: meta.token || eid,
            antesDaVenda: !!d.pedidos.find(p => p.id === r.pedidoId && pedidoAberto(p))
        });
        const p = d.pedidos.find(p => p.id === r.pedidoId);
        if (p) {
            evento(d, p, 'Estorno de R$ ' + money(valor).toFixed(2) + ' · ' + motivo);
            Object.assign(p.eventos.at(-1), {
                tipo: 'Estorno',
                operacaoId: meta.token || eid,
                receitaId: eid,
                valor: money(valor)
            });
        }
        return eid;
    };
    const estornar = (rid, valor, motivo, meta = {}) => transacao(d => {
        if (meta.token && d.receitas.some(r => r.operacaoId === meta.token))
            throw Error('Estorno já registrado.');
        const r = d.receitas.find(r => r.id === rid);
        if (r?.pedidoId && d.pedidos.find(p => p.id === r.pedidoId)?.status === 'Cancelado')
            throw Error('Pedido cancelado: consulte o histórico.');
        return estornarInterno(d, r, valor, motivo, meta);
    }, 'financeiro');

    // Cancela somente pedidos em andamento; trata pagamento antecipado sem reposição indevida.
    const cancelar = (pid, motivo, repor = false, confirmado = false) => transacao(d => {
        const p = localizar(d, pid);
        if (!pedidoAberto(p) || p.integracao || d.movimentos.some(m => m.pedidoId === pid && m.tipo === 'Saída') || !String(motivo || '').trim())
            throw Error('Somente pedidos ainda não concluídos podem ser cancelados.');
        const saldo = resumoPagamento(d, pid).liquido;
        if (saldo > 0) {
            if (!confirmado)
                throw Error('Confirme a devolução do pagamento antecipado.');
            estornarPedidoInterno(d, p, saldo, motivo);
        }
        const anterior = p.status;
        p.status = 'Cancelado';
        p.motivo = motivo;
        p.pagamento = 'Cancelado';
        evento(d, p, 'Cancelado: ' + motivo + ' · sem reposição de estoque');
        Object.assign(p.eventos.at(-1), {
            tipo: 'Cancelamento',
            anterior,
            novo: p.status,
            valorEstornado: saldo
        });
    }, 'pedidos');

    // Datas futuras já gravadas por versões antigas permanecem consultáveis, mas fora do caixa realizado.
    const realizado = x => dataValida(x.data);
    const saldoAReceber = (d, p) => money(p.total - resumoPagamento(d, p.id).liquido);
    const registrarRecebimento = (v, token) => transacao(d => {
        const valor = money(Number(v.valor));
        if (!Number.isFinite(valor) || valor <= 0 || !dataValida(v.data) || !d.config.formas.includes(v.forma) || !String(v.descricao || '').trim())
            throw Error('Informe descrição, valor, forma e data de recebimento até hoje.');
        if (token && d.receitas.some(r => r.id === token))
            throw Error('Recebimento já registrado.');
        if (v.pedidoId) {
            permissao(d, 'pedidos');
            const p = localizar(d, v.pedidoId);
            if (!pedidoAberto(p) || v.data < p.data || valor > saldoAReceber(d, p))
                throw Error('Pedido inválido, data anterior ao pedido ou valor superior ao saldo devido.');
        }
        const r = {
            id: token || id(),
            pedidoId: v.pedidoId || '',
            descricao: v.descricao.trim(),
            forma: v.forma,
            valor,
            data: v.data,
            registro: agora(),
            usuario: ator(d),
            origem: 'Manual',
            ...(v.pedidoId ? { itensPedido: localizar(d, v.pedidoId).itens.map(i => ({ nome: i.nome, qtd: i.qtd, preco: i.preco, produtoId: i.produtoId })) } : {})
        };
        d.receitas.push(r);
        if (v.pedidoId)
            evento(d, localizar(d, v.pedidoId), 'Recebimento antecipado de R$ ' + valor.toFixed(2));
        return r.id;
    }, 'financeiro');
    const registrarDespesa = (v, token) => transacao(d => {
        const valor = money(Number(v.valor));
        if (!Number.isFinite(valor) || valor <= 0 || !dataValida(v.data) || !String(v.descricao || '').trim() || !String(v.categoria || '').trim() || !['Pago', 'Pendente'].includes(v.situacao))
            throw Error('Informe descrição, categoria, valor e data válida até hoje.');
        if (v.vencimento && (!/^\d{4}-\d{2}-\d{2}$/.test(v.vencimento) || !Number.isFinite(Date.parse(v.vencimento)) || new Date(v.vencimento).toISOString().slice(0, 10) !== v.vencimento))
            throw Error('Vencimento inválido.');
        if (v.natureza && v.natureza !== 'Despesa operacional')
            throw Error('Compras de estoque devem ser registradas pelo Estoque.');
        if (token && d.despesas.some(x => x.id === token))
            throw Error('Despesa já registrada.');
        const x = {
            id: token || id(),
            descricao: v.descricao.trim(),
            categoria: v.categoria,
            natureza: 'Despesa operacional',
            situacao: v.situacao,
            valor,
            data: v.data,
            vencimento: v.vencimento || '',
            registro: agora(),
            usuario: ator(d),
            historico: []
        };
        d.despesas.push(x);
        return x.id;
    }, 'financeiro');
    // Classificação explícita de registros legados, sem mudar valores nem criar compras fictícias.
    const classificarDespesa = (rid, natureza, motivo) => transacao(d => {
        const x = d.despesas.find(x => x.id === rid);
        if (!x || x.natureza || x.movimentoId || x.estornoDe || x.ajusteDe || !['Despesa operacional', 'Compra de estoque'].includes(natureza) || !String(motivo || '').trim())
            throw Error('Classificação inválida.');
        historicoDespesa(d, x, 'Classificação', motivo, x.valor);
        x.natureza = natureza;
        d.despesas.filter(y => y.estornoDe === rid || y.ajusteDe === rid).forEach(y => y.natureza = natureza);
    }, 'financeiro');

    // Registra a quitação e seu horário, preservando a data e o instante originais do cadastro.
    const quitar = (rid, forma, data) => transacao(d => {
        const x = d.despesas.find(x => x.id === rid);
        if (!x || x.situacao !== 'Pendente' || !d.config.formas.includes(forma) || !dataValida(data) || data < x.data)
            throw Error('Despesa ou data de pagamento inválida.');
        validarDataObrigacao(x, data);
        x.dataOriginal = x.data;
        x.data = data;
        x.dataPagamento = data;
        x.registroPagamento = agora();
        x.forma = forma;
        x.situacao = 'Pago';
        x.usuario = ator(d);
    }, 'financeiro');
    return {
        permissao,
        pedidoAberto,
        pedidoEditavel,
        dataVenda,
        transicoesPedido,
        mudarStatusPedido,
        resumoPagamento,
        saldoAReceber,
        realizado,
        registrarRecebimento,
        registrarDespesa,
        classificarDespesa,
        estornarPedido,
        estoqueBaixo,
        esgotado,
        alertaEstoque,
        situacaoEstoque,
        ler,
        salvar,
        atualizar,
        restaurar,
        dia,
        agora,
        id,
        validar,
        ator,
        evento,
        validarItens,
        finalizar,
        cancelar,
        estornar,
        saldoEstorno,
        quitar,
        registrarMovimento,
        corrigirDespesa,
        saldoDespesa,
        indicadores,
        money,
        saldoDevolucao,
        devolverItens
    };
})();
