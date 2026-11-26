$('#features').innerHTML=[['pedidos','Acompanhe pedidos'],['estoque','Organize seu estoque'],['financeiro','Gerencie o caixa']].map(([i,t])=>`<div class="feature">${icon(i)}${t}</div>`).join('');
const form=$('#login-form');
const entrar=()=>{const login=form.elements.login.value.trim();const senha=form.elements.senha.value;const u=Dados.ler().usuarios.find(x=>x.login===login&&x.senha===senha&&x.ativo);if(!u){$('#login-error').textContent='Usuário ou senha inválidos, ou conta inativa.';return;}localStorage.setItem('gato-session',u.id);location.href='pages/dashboard.html';};
form.addEventListener('submit',e=>{e.preventDefault();try{entrar();}catch(err){$('#login-error').textContent=err.message;}});
document.querySelectorAll('[data-demo]').forEach(b=>b.onclick=()=>{const u=Dados.ler().usuarios.find(x=>x.ativo&&x.perfil===b.dataset.demo);if(!u){feedback('Nenhuma conta ativa para este perfil. Restaure os dados.',true);return;}form.elements.login.value=u.login;form.elements.senha.value=u.senha;$('#login-error').textContent='';});
$('#reset').onclick=()=>{confirmUI('Restaurar dados fictícios','Os registros locais serão substituídos.',()=>{Dados.restaurar();localStorage.removeItem('gato-session');form.reset();$('#login-error').textContent='';feedback('Dados de demonstração restaurados.');});};

$('#show-password').onclick=()=>{const b=$('#show-password'),on=form.elements.senha.type==='password';form.elements.senha.type=on?'text':'password';b.textContent=on?'Ocultar':'Mostrar';b.setAttribute('aria-pressed',String(on));};
