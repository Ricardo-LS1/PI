/* Dados de demonstração. Nenhuma informação real ou servidor é utilizado. */
const Dados = (() => {
  const chave = 'gato-preto-cafe-v1';
  const dia = (deslocamento=0) => { const d=new Date();d.setDate(d.getDate()+deslocamento);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const agora = () => new Date().toISOString();
  const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inicial = () => {
    const produtos=[['p1','Café espresso','Bebidas','un',7,42,10,'Café servido em xícara'],['p2','Cappuccino','Bebidas','un',14,30,8,'Café com leite e espuma'],['p3','Pão de queijo','Salgados','un',6,24,10,'Porção individual'],['p4','Bolo de chocolate','Doces','fatia',12,5,8,'Fatia de bolo'],['p5','Chocolate quente','Bebidas','un',16,18,5,'Bebida quente'],['p6','Brownie','Doces','un',10,4,6,'Brownie individual'],['p7','Croissant','Salgados','un',11,16,5,'Croissant tradicional']].map(([id,nome,categoria,unidade,preco,saldo,minimo,descricao])=>({id,nome,categoria,unidade,preco,saldo,minimo,descricao}));
    const criar=(numero,items,status,offset)=>{const data=dia(offset);const itens=items.map(([pid,qtd])=>{const p=produtos.find(x=>x.id===pid);return {produtoId:pid,nome:p.nome,preco:p.preco,qtd};});return {id:`o${numero}`,numero,itens,total:itens.reduce((s,i)=>s+i.preco*i.qtd,0),status,data,eventos:[{data:data+'T10:00:00',texto:'Pedido registrado' },...(status==='Pendente'?[]:[{data:data+'T10:20:00',texto:'Status: '+status}])]};};
    const pedidos=[criar(1001,[['p1',2],['p3',2]],'Concluído',-1),criar(1002,[['p2',2],['p4',1]],'Concluído',0),criar(1003,[['p5',1],['p6',2]],'Em preparo',0),criar(1004,[['p1',1],['p7',2]],'Pendente',0)];
    const receitas=[{id:'r1',pedidoId:'o1001',descricao:'Pedido #1001',forma:'Pix',valor:26,data:dia(-1),registro:dia(-1)+'T11:00:00'},{id:'r2',pedidoId:'o1002',descricao:'Pedido #1002',forma:'Cartão',valor:40,data:dia(),registro:dia()+'T11:30:00'},{id:'r3',pedidoId:'',descricao:'Vendas anteriores',forma:'Dinheiro',valor:180,data:dia(-2),registro:dia(-2)+'T17:00:00'}];
    const despesas=[{id:'d1',descricao:'Reposição de produtos',categoria:'Fornecedores',valor:95,data:dia(-2),situacao:'Pago',registro:dia(-2)+'T09:00:00'},{id:'d2',descricao:'Material de limpeza',categoria:'Operacional',valor:32,data:dia(),situacao:'Pago',registro:dia()+'T09:00:00'},{id:'d3',descricao:'Manutenção',categoria:'Manutenção',valor:80,data:dia(),situacao:'Pendente',registro:dia()+'T09:30:00'}];
    // Histórico ilustrativo adicional da V2, sem modificar os registros já existentes de uma instalação V1.
    for(let i=0;i<6;i++){const off=-3-i, n=1010+i, pedido=criar(n,[[`p${1+i%7}`,2+i%3],[i%7===2?'p4':'p3',1+i%2]],'Concluído',off);pedidos.push(pedido);receitas.push({id:`rv2-${i}`,pedidoId:pedido.id,descricao:`Pedido #${n}`,forma:['Pix','Cartão','Dinheiro'][i%3],valor:pedido.total,data:dia(off),registro:dia(off)+'T15:00:00'});despesas.push({id:`dv2-${i}`,descricao:['Reposição de insumos','Material de limpeza','Embalagens'][i%3],categoria:['Fornecedores','Operacional','Operacional'][i%3],valor:[28,12,19,25,15,10][i],data:dia(off),situacao:'Pago',registro:dia(off)+'T09:00:00'});}
    return {produtos,pedidos,receitas,despesas,movimentos:[{id:'m1',produtoId:'p1',nome:'Café espresso',tipo:'Entrada',quantidade:12,anterior:30,novo:42,data:dia(-1),motivo:'Reposição inicial'}],usuarios:[{id:'u1',nome:'Proprietário',login:'admin',senha:'admin123',perfil:'Administrador',ativo:true,permissoes:{pedidos:true,estoque:true,financeiro:true}},{id:'u2',nome:'Gerente',login:'gerente',senha:'gerente123',perfil:'Gerente',ativo:true,permissoes:{pedidos:true,estoque:true,financeiro:true}}],config:{nome:'O Gato Preto Café',endereco:'R. Noel Lourenço de Lima, 12 - Parque do Sol, Guaratinguetá - SP',formas:['Pix','Dinheiro','Cartão'],moeda:'BRL',observacao:'Protótipo acadêmico'}};
  };
  // Mantém a mesma chave da V2: migração não recria dados nem baixa vendas antigas.
  const migrar = d => {
    d.usuarios.forEach(u=>u.permissoes??={pedidos:true,estoque:true,financeiro:true});
    d.produtos.forEach(p=>p.ativo??=true);
    d.pedidos.forEach(p=>{p.eventos??=[];if(p.status==='Concluído'&&!p.integracao)p.integracao='legado';});
    d.atividades??=[];d.notificacoesLidas??={};d.versao=3;return d;
  };
  const validar = d => {
    if(!d||typeof d!=='object')throw Error('Backup inválido.');
    for(const k of ['produtos','pedidos','receitas','despesas','movimentos','usuarios']){
      if(!Array.isArray(d[k])||d[k].some(x=>!x||typeof x.id!=='string')||new Set(d[k].map(x=>x.id)).size!==d[k].length)throw Error('Registros inválidos: '+k);
    }
    const num=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
    const str=x=>typeof x==='string'; const date=x=>str(x)&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
    if(!d.config||!str(d.config.nome)||!str(d.config.endereco)||!Array.isArray(d.config.formas)||!d.config.formas.length||d.config.formas.some(x=>!str(x)||!x.trim()))throw Error('Configuração inválida.');
    if(d.usuarios.some(u=>!str(u.nome)||!str(u.login)||!str(u.senha)||!['Gerente','Administrador'].includes(u.perfil)||typeof u.ativo!=='boolean'||(u.permissoes&&['pedidos','estoque','financeiro'].some(k=>typeof u.permissoes[k]!=='boolean')))||!d.usuarios.some(u=>u.ativo&&u.perfil==='Administrador')||new Set(d.usuarios.map(u=>u.login.toLowerCase())).size!==d.usuarios.length)throw Error('Usuários inválidos ou sem administrador ativo.');
    if(d.produtos.some(p=>![p.nome,p.categoria,p.unidade,p.descricao].every(str)||![p.preco,p.saldo,p.minimo].every(num)))throw Error('Produtos inválidos.');
    if(d.pedidos.some(p=>!num(p.numero)||!num(p.total)||!date(p.data)||!['Pendente','Em preparo','Pronto','Concluído','Cancelado'].includes(p.status)||!Array.isArray(p.itens)||!p.itens.length||p.itens.some(i=>!str(i.nome)||!num(i.preco)||!Number.isInteger(i.qtd)||i.qtd<=0||!d.produtos.some(p=>p.id===i.produtoId))||!Array.isArray(p.eventos)||p.eventos.some(e=>!str(e.data)||!str(e.texto))))throw Error('Pedidos inválidos.');
    if(d.receitas.some(r=>!Number.isFinite(r.valor)||!date(r.data)||![r.forma,r.descricao,r.registro].every(str)||(r.pedidoId&&!d.pedidos.some(p=>p.id===r.pedidoId))))throw Error('Recebimentos inválidos.');
    if(d.despesas.some(x=>!num(x.valor)||!date(x.data)||![x.descricao,x.categoria,x.registro].every(str)||!['Pago','Pendente'].includes(x.situacao)))throw Error('Despesas inválidas.');
    if(d.movimentos.some(x=>!date(x.data)||!num(x.quantidade)||!num(x.anterior)||!num(x.novo)||![x.nome,x.tipo,x.motivo].every(str)||!d.produtos.some(p=>p.id===x.produtoId)))throw Error('Movimentações inválidas.');
    if(d.atividades!==undefined&&(!Array.isArray(d.atividades)||d.atividades.some(x=>!x||![x.data,x.usuario,x.modulo,x.acao].every(str))))throw Error('Histórico inválido.');
    if(d.notificacoesLidas!==undefined&&(!d.notificacoesLidas||typeof d.notificacoesLidas!=='object'||Array.isArray(d.notificacoesLidas)||Object.values(d.notificacoesLidas).some(v=>!Array.isArray(v)||v.some(x=>!str(x)))))throw Error('Notificações inválidas.');
    for(const e of d.receitas.filter(r=>r.estornoDe||r.valor<0)){const original=d.receitas.find(r=>r.id===e.estornoDe);if(!original||original.estornoDe||original.valor<=0||e.valor>=0||e.pedidoId!==original.pedidoId)throw Error('Estorno sem recebimento original válido.');}
    for(const r of d.receitas.filter(r=>!r.estornoDe)){if(money(r.valor+d.receitas.filter(e=>e.estornoDe===r.id).reduce((a,e)=>a+e.valor,0))<0)throw Error('Estornos excedem o pagamento.');}
    return migrar(d);
  };
  const salvar = dados => {try{localStorage.setItem(chave,JSON.stringify(dados));}catch(e){throw Error('Não foi possível salvar os dados neste navegador. Nenhuma alteração foi confirmada.');}};
  const ler = () => {const texto=localStorage.getItem(chave);if(texto){try{return migrar(JSON.parse(texto));}catch(e){throw Error('Dados locais inválidos. Restaure um backup ou a demonstração.');}}const d=migrar(inicial());salvar(d);return d;};
  const ator=d=>d.usuarios.find(u=>u.id===localStorage.getItem('gato-session'))?.nome||'Demonstração';
  const log=(d,modulo,acao)=>d.atividades.push({id:id(),data:agora(),usuario:ator(d),usuarioId:localStorage.getItem('gato-session')||'',modulo,acao});
  const atualizar = (fn,acao='auto',modulo=globalThis.document?.body?.dataset?.page||'sistema') => {const d=ler();const before=acao==='auto'?JSON.parse(JSON.stringify(d)):null;const r=fn(d);if(acao==='auto'){const changes=[];for(const [k,label] of [['produtos','Produto'],['pedidos','Pedido'],['receitas','Recebimento'],['despesas','Despesa'],['movimentos','Movimentação'],['usuarios','Usuário']])for(const x of d[k]){const old=before[k].find(y=>y.id===x.id);if(!old||JSON.stringify(old)!==JSON.stringify(x))changes.push((old?'Atualização: ':'Novo registro: ')+label+' '+(x.nome||x.descricao||(x.numero?'#'+x.numero:x.tipo||'')));}if(JSON.stringify(before.config)!==JSON.stringify(d.config))changes.push('Configurações atualizadas');acao=changes.join(' · ')||'Registros revisados';}if(acao)log(d,modulo,acao);salvar(d);globalThis.document?.dispatchEvent(new Event('dados-atualizados'));return r;};
  const restaurar = () => salvar(migrar(inicial()));
  const money=n=>Math.round(n*100)/100;
  const movimento=(d,p,q,tipo,pedido,motivo)=>{const anterior=p.saldo,novo=Math.round((anterior+(tipo==='Saída'?-q:q))*1000)/1000;if(novo<0)throw Error('Estoque insuficiente: '+p.nome);p.saldo=novo;d.movimentos.push({id:id(),produtoId:p.id,nome:p.nome,tipo,quantidade:q,anterior,novo,data:dia(),registro:agora(),pedidoId:pedido.id,motivo,usuario:ator(d)});};
  const evento=(d,p,texto)=>p.eventos.push({data:agora(),texto,usuario:ator(d)});
  const localizar=(d,pid)=>{const p=d.pedidos.find(x=>x.id===pid);if(!p)throw Error('Pedido não encontrado.');return p;};
  const validarItens=(d,itens)=>{if(!itens.length)throw Error('Adicione itens.');const qs=new Map();for(const it of itens){if(!Number.isInteger(it.qtd)||it.qtd<=0)throw Error('Quantidade inválida.');qs.set(it.produtoId,(qs.get(it.produtoId)||0)+it.qtd);}for(const [pid,q] of qs){const p=d.produtos.find(x=>x.id===pid);if(!p||p.ativo===false||p.saldo<q)throw Error('Produto indisponível ou saldo insuficiente: '+(p?.nome||pid));}return qs;};
  const finalizar=(pid,forma,confirmado)=>atualizar(d=>{
    const p=localizar(d,pid);if(!['Pendente','Em preparo','Pronto'].includes(p.status)||p.integracao||d.movimentos.some(m=>m.pedidoId===pid&&m.tipo==='Saída'))throw Error('Pedido já finalizado ou inválido.');
    if(!confirmado||!d.config.formas.includes(forma))throw Error('Confirme o pagamento e a forma.');const qs=validarItens(d,p.itens);
    const prev=d.receitas.filter(r=>r.pedidoId===pid&&!r.estornoDe);if(prev.length>1||prev.some(r=>money(r.valor)!==money(p.total)||r.forma!==forma||d.receitas.some(e=>e.estornoDe===r.id)))throw Error('Recebimento anterior incompatível. Confira o financeiro.');
    if(!prev.length)d.receitas.push({id:id(),pedidoId:pid,descricao:'Pedido #'+p.numero,forma,valor:money(p.total),data:dia(),registro:agora(),origem:'Pedido',usuario:ator(d)});
    for(const [k,q] of qs)movimento(d,d.produtos.find(x=>x.id===k),q,'Saída',p,'Venda #'+p.numero);
    p.status='Concluído';p.integracao='v3';p.dataConclusao=agora();p.pagamento='Confirmado';p.forma=forma;evento(d,p,'Pedido concluído · pagamento confirmado · baixa de estoque');log(d,'estoque','Baixa automática #'+p.numero);log(d,'financeiro',prev.length?'Recebimento existente conciliado #'+p.numero:'Recebimento automático #'+p.numero);
  },'Finalização integrada do pedido','pedidos');
  const saldoEstorno=(d,r)=>money(r.valor+d.receitas.filter(x=>x.estornoDe===r.id).reduce((a,x)=>a+x.valor,0));
  const estornarInterno=(d,r,valor,motivo)=>{if(!r||r.valor<=0||r.estornoDe||!Number.isFinite(valor)||valor<=0||money(valor)>saldoEstorno(d,r)||!String(motivo).trim())throw Error('Estorno inválido ou superior ao saldo disponível.');d.receitas.push({id:id(),pedidoId:r.pedidoId||'',descricao:'Estorno · '+r.descricao+' · '+motivo,forma:r.forma,valor:-money(valor),data:dia(),registro:agora(),estornoDe:r.id,origem:'Estorno',usuario:ator(d)});};
  const estornar=(rid,valor,motivo)=>atualizar(d=>estornarInterno(d,d.receitas.find(r=>r.id===rid),valor,motivo),'Estorno de recebimento','financeiro');
  const cancelar=(pid,motivo,repor=false)=>atualizar(d=>{const p=localizar(d,pid);if(p.status==='Cancelado'||!String(motivo).trim())throw Error('Informe o motivo de um pedido válido.');for(const r of d.receitas.filter(r=>r.pedidoId===pid&&r.valor>0&&!r.estornoDe)){const saldo=saldoEstorno(d,r);if(saldo>0)estornarInterno(d,r,saldo,motivo);}
    if(repor&&p.integracao==='v3'){const ms=d.movimentos.filter(m=>m.pedidoId===pid&&m.tipo==='Saída');for(const m of ms){const produto=d.produtos.find(x=>x.id===m.produtoId);if(!produto)throw Error('Produto não localizado.');movimento(d,produto,m.quantidade,'Entrada',p,'Devolução #'+p.numero);}}
    p.status='Cancelado';p.motivo=motivo;p.pagamento='Cancelado';evento(d,p,'Cancelado: '+motivo+(repor&&p.integracao==='v3'?' · estoque reposto':' · sem reposição de estoque'));log(d,'financeiro','Conferência de estornos #'+p.numero);if(repor&&p.integracao==='v3')log(d,'estoque','Reposição por cancelamento #'+p.numero);
  },'Cancelamento de pedido','pedidos');
  const quitar=(rid,forma,data)=>atualizar(d=>{const x=d.despesas.find(x=>x.id===rid);if(!x||x.situacao!=='Pendente'||!d.config.formas.includes(forma)||!data||data<x.data||data>dia())throw Error('Despesa ou data de pagamento inválida.');x.dataOriginal=x.data;x.data=data;x.dataPagamento=data;x.forma=forma;x.situacao='Pago';x.usuario=ator(d);},'Quitação de despesa','financeiro');
  return {ler,salvar,atualizar,restaurar,dia,agora,id,validar,ator,evento,validarItens,finalizar,cancelar,estornar,saldoEstorno,quitar};
})();
