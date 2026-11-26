if(iniciarPagina('dashboard')){
 const u=session();
 $('#conteudo').innerHTML=`<section class="card dashboard-filter"><form id="dash-filter" class="filters dashboard-period">${quickPeriodField()}<details class="period-details"><summary>Personalizar datas</summary><div class="period-fields">${dateFields()}</div></details></form></section><div id="dash-content" class="section-gap"></div>`;
 const f=$('#dash-filter');bindQuickPeriod(f);
 const disclosure=(id,title,subtitle,body)=>`<details class="card disclosure" id="${id}"><summary><span><strong>${title}</strong><small>${subtitle}</small></span></summary>${body}</details>`;
 listenFilters(f,()=>{
  const previous=new Map([...document.querySelectorAll('#dash-content details')].map(x=>[x.id,x.open]));
  const {de,ate}=Object.fromEntries(new FormData(f)),d=Dados.ler(),ps=d.pedidos.filter(p=>periodo(p.data,de,ate)),baixos=d.produtos.filter(p=>p.ativo!==false&&p.saldo<p.minimo);
  let primary='',secondary='',charts='',tables='';
  const selected={pedidos:[0],estoque:[1],financeiro:[0,2]};
  for(const key of ['pedidos','estoque','financeiro'])if(allowed(u,key)){
   const template=document.createElement('template');template.innerHTML=quickPeriodMetrics(key,d,de,ate);
   [...template.content.children].forEach((el,i)=>{if(selected[key].includes(i))primary+=el.outerHTML;else secondary+=el.outerHTML;});
   charts+=chartCards(key,d,de,ate);
  }
  if(allowed(u,'pedidos'))tables+=card('Pedidos recentes','Últimos registros no período',tabela(['Pedido','Data','Status','Total'],[...ps].sort((a,b)=>b.data.localeCompare(a.data)||b.numero-a.numero).slice(0,5).map(p=>['#'+p.numero,dataBR(p.data),pill(p.status),dinheiro(p.total)]))+`<div class="actions"><a class="btn" href="pedidos.html">Ver pedidos ${icon('arrow')}</a></div>`);
  if(allowed(u,'estoque'))tables+=card('Atenção ao estoque','Posição atual · itens abaixo do mínimo',tabela(['Produto','Categoria','Saldo','Mínimo'],baixos.map(p=>[esc(p.nome),esc(p.categoria),pill('Crítico')+' '+numero(p.saldo),numero(p.minimo)]))+`<div class="actions"><a class="btn" href="estoque.html">Consultar estoque ${icon('arrow')}</a></div>`);
  const links=`<div class="section-heading"><h2>Acesso rápido</h2></div><div class="grid four quick-links balanced">${modules.slice(1).filter(m=>allowed(u,m[0])).map(([k,n])=>`<a class="card module-link" href="${k}.html"><span class="stat-icon">${icon(k)}</span><div><h3>${n}</h3><small>${descriptions[k][1]}</small></div><span class="module-arrow">${icon('arrow')}</span></a>`).join('')}</div>`;
  $('#dash-content').innerHTML=(primary?`<div class="section-heading"><h2>Indicadores essenciais</h2><span class="muted">Período selecionado</span></div><div class="grid four balanced primary-kpis">${primary}</div>`:'<div class="card note">Nenhum módulo operacional autorizado. Entre em contato com o administrador.</div>')+links+(tables?disclosure('dash-operation','Acompanhe a operação','Pedidos recentes e alertas de estoque',`<div class="grid two balanced operation-grid">${tables}</div>`):'')+(secondary?disclosure('dash-more','Mais indicadores','Detalhamento de pedidos, estoque e financeiro',`<div class="grid four balanced">${secondary}</div>`):'')+(charts?disclosure('dash-charts','Análise de desempenho','Todos os gráficos e suas legendas',`<div class="grid two chart-grid balanced">${charts}</div>`):'');
  const operation=$('#dash-operation');if(operation&&!previous.has(operation.id))operation.open=matchMedia('(min-width:761px)').matches;previous.forEach((open,id)=>{const el=document.getElementById(id);if(el)el.open=open;});
 });
}
