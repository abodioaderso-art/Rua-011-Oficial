// auth.js
// Cadastro, login, logout e reação às mudanças de sessão.
// Carregado em index.html e produto.html.

const MENSAGENS_ERRO = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.'
};

function traduzirErro(error) {
  return MENSAGENS_ERRO[error.message] || 'Ocorreu um erro. Tente novamente.';
}

async function cadastrar(nome, email, senha) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } } // o trigger da Etapa 4 usa esse nome
  });
  if (error) throw new Error(traduzirErro(error));
  return data.user;
}

async function entrar(email, senha) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha
  });
  if (error) throw new Error(traduzirErro(error));
  return data.user;
}

async function sair() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw new Error('Não foi possível sair. Tente novamente.');
}

async function usuarioAtual() {
  const { data } = await supabaseClient.auth.getUser();
  return data.user; // null se ninguém estiver logado
}

// ⚠️ AJUSTAR: troque os IDs pelos que existem no seu HTML
function atualizarInterfaceLogin(usuario) {
  const btnEntrar = document.getElementById('btn-entrar');
  const btnSair = document.getElementById('btn-sair');
  const saudacao = document.getElementById('saudacao');

  if (usuario) {
    if (btnEntrar) btnEntrar.hidden = true;
    if (btnSair) btnSair.hidden = false;
    if (saudacao) saudacao.textContent = `Olá, ${usuario.user_metadata?.nome ?? usuario.email}`;
  } else {
    if (btnEntrar) btnEntrar.hidden = false;
    if (btnSair) btnSair.hidden = true;
    if (saudacao) saudacao.textContent = '';
  }
}

// Dispara ao carregar a página, ao logar, ao sair e ao expirar a sessão.
// O setTimeout evita chamar o Supabase dentro do próprio listener.
supabaseClient.auth.onAuthStateChange((evento, sessao) => {
  const usuario = sessao?.user ?? null;
  setTimeout(() => {
    atualizarInterfaceLogin(usuario);
    if (typeof iniciarFavoritos === 'function') iniciarFavoritos();
  }, 0);

// ⚠️ AJUSTAR: IDs dos seus formulários e campos
const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await cadastrar(
        document.getElementById('cadastro-nome').value,
        document.getElementById('cadastro-email').value,
        document.getElementById('cadastro-senha').value
      );
      alert('Cadastro realizado!');
    } catch (err) {
      alert(err.message);
    }
  });
}

const formLogin = document.getElementById('form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await entrar(
        document.getElementById('login-email').value,
        document.getElementById('login-senha').value
      );
    } catch (err) {
      alert(err.message);
    }
  });
}

const btnSair = document.getElementById('btn-sair');
if (btnSair) btnSair.addEventListener('click', sair);

});
