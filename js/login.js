// Tela de acesso demonstrativa. Valida o usuário local, preenche credenciais de exemplo e permite restaurar os dados fictícios.

$('#features').innerHTML = [['pedidos', 'Acompanhe pedidos'], ['estoque', 'Organize seu estoque'], ['financeiro', 'Gerencie o caixa']].map(([i, t]) => `<div class="feature">${icon(i)}${t}</div>`).join('');
const form = $('#login-form');

// Confere as credenciais fictícias e grava a sessão no navegador antes de abrir o painel.
const entrar = () => {
    const login = form.elements.login.value.trim();
    const senha = form.elements.senha.value;
    const u = Dados.ler().usuarios.find(x => x.login === login && x.senha === senha && x.ativo);
    if (!u) {
        $('#login-error').textContent = 'Usuário ou senha inválidos, ou conta inativa.';
        return;
    }
    localStorage.setItem('gato-session', u.id);
    location.href = 'pages/dashboard.html';
};
form.addEventListener('submit', e => {
    e.preventDefault();
    try {
        entrar();
    }
    catch (err) {
        $('#login-error').textContent = err.message;
    }
});
document.querySelectorAll('[data-demo]').forEach(b => b.onclick = () => {
    // Os atalhos só preenchem credenciais públicas da demonstração, nunca senhas alteradas.
    const padrao = b.dataset.demo === 'Administrador' ? ['admin', 'admin123'] : ['gerente', 'gerente123'];
    const u = Dados.ler().usuarios.find(x => x.ativo && x.perfil === b.dataset.demo && x.login === padrao[0] && x.senha === padrao[1]);
    if (!u) {
        feedback('As credenciais padrão não estão disponíveis. Entre com sua conta cadastrada.', true);
        return;
    }
    form.elements.login.value = u.login;
    form.elements.senha.value = u.senha;
    $('#login-error').textContent = '';
});
$('#reset').onclick = () => {
    confirmUI('Restaurar dados fictícios', 'Os registros locais serão substituídos pela base fictícia V4.2.1. Se quiser preservá-los, cancele e exporte um backup em Administração → Backup e restauração.', () => {
        Dados.restaurar();
        localStorage.removeItem('gato-session');
        form.reset();
        $('#login-error').textContent = '';
        feedback('Dados de demonstração restaurados.');
    });
};
$('#show-password').onclick = () => {
    const b = $('#show-password'), on = form.elements.senha.type === 'password';
    form.elements.senha.type = on ? 'text' : 'password';
    b.textContent = on ? 'Ocultar' : 'Mostrar';
    b.setAttribute('aria-pressed', String(on));
};
// Em telas compactas, os perfis de demonstração ficam sob demanda.
const demoDetails = $('.demo-disclosure');
const compactLogin = matchMedia('(max-width: 760px)');
demoDetails.open = !compactLogin.matches;
compactLogin.addEventListener('change', e => {
    demoDetails.open = !e.matches;
});
