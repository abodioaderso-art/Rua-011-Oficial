// supabase.js
// Conexão com o Supabase + funções compartilhadas entre index.html e produto.html.
// Carregue este arquivo ANTES de script.js e produto.js.

const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_PUBLICA';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- utilitários ---------- */

const brl = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Evita injeção de HTML ao montar textos vindos do banco
function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

/* ---------- imagens ---------- */

// Aceita caminho do bucket ("tenis/air.jpg"), URL completa ou caminho local ("img/air.jpg")
function urlImagem(caminho) {
  if (!caminho) return '';
  if (/^(https?:|img\/)/.test(caminho)) return caminho;
  return `${SUPABASE_URL}/storage/v1/object/public/produtos/${caminho}`;
}

/* ---------- produtos ---------- */

const CAMPOS_PRODUTO = `
  id, nome, descricao, preco, preco_antigo, categoria, marca,
  imagem, badge, cor_principal,
  variacoes ( id, cor, tamanho, imagem, estoque )
`;

// Converte o formato do banco para o formato usado pelo site
function adaptarProduto(p) {
  return {
    id: p.id,
    name: p.nome,
    brand: p.marca ?? '',
    description: p.descricao ?? '',
    price: Number(p.preco),
    oldPrice: p.preco_antigo ? Number(p.preco_antigo) : null,
    category: p.categoria,
    badge: p.badge ?? '',
    color: p.cor_principal ?? '',
    image: urlImagem(p.imagem),
    variants: (p.variacoes ?? [])
      .map((v) => ({
        id: v.id,
        color: v.cor,
        size: v.tamanho,
        image: urlImagem(v.imagem),
        stock: v.estoque
      }))
      .sort((a, b) => a.size - b.size)
  };
}

// Retorna a lista de produtos ativos, ou null em caso de erro
async function carregarProdutos() {
  const { data, error } = await supabaseClient
    .from('produtos')
    .select(CAMPOS_PRODUTO)
    .eq('ativo', true)
    .order('id');

  if (error) {
    console.error('Erro ao carregar produtos:', error.message);
    return null;
  }
  return data.map(adaptarProduto);
}

// Retorna um produto pelo id, ou null se não existir ou houver erro
async function carregarProduto(id) {
  const { data, error } = await supabaseClient
    .from('produtos')
    .select(CAMPOS_PRODUTO)
    .eq('id', id)
    .eq('ativo', true)
    .maybeSingle();

  if (error) {
    console.error('Erro ao carregar produto:', error.message);
    return null;
  }
  return data ? adaptarProduto(data) : null;
}

/* ---------- sacola (localStorage, compartilhada entre páginas) ---------- */

const CHAVE_SACOLA = 'rua011-sacola';

function lerSacola() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SACOLA)) || [];
  } catch {
    return [];
  }
}

function salvarSacola(itens) {
  localStorage.setItem(CHAVE_SACOLA, JSON.stringify(itens));
}

function chaveItem(id, cor, tamanho) {
  return `${id}|${cor}|${tamanho}`;
}

// Adiciona uma unidade (ou mais) respeitando o estoque da variação escolhida
function adicionarAoCarrinho(produto, cor, tamanho, quantidade = 1) {
  const variante = produto.variants.find((v) => v.color === cor && v.size === tamanho);
  if (!variante || variante.stock <= 0) {
    throw new Error('Este tamanho está sem estoque.');
  }

  const sacola = lerSacola();
  const chave = chaveItem(produto.id, cor, tamanho);
  const existente = sacola.find((i) => chaveItem(i.id, i.color, i.size) === chave);
  const novaQuantidade = (existente?.qty ?? 0) + quantidade;

  if (novaQuantidade > variante.stock) {
    throw new Error(`Estoque insuficiente: restam ${variante.stock} unidade(s).`);
  }

  if (existente) {
    existente.qty = novaQuantidade;
  } else {
    sacola.push({
      id: produto.id,
      name: produto.name,
      brand: produto.brand,
      price: produto.price,
      image: produto.image,
      color: cor,
      size: tamanho,
      qty: quantidade
    });
  }

  salvarSacola(sacola);
  return sacola;
}

/* ---------- autenticação ---------- */

// Cria a conta. O nome vai em user_meta_data para o trigger copiar para "usuarios"
async function cadastrarUsuario(nome, email, senha) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } }
  });

  if (error) throw new Error(traduzirErroAuth(error.message));
  return data.user;
}

async function entrarUsuario(email, senha) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) throw new Error(traduzirErroAuth(error.message));
  return data.user;
}

async function sairUsuario() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw new Error(traduzirErroAuth(error.message));
}

async function usuarioAtual() {
  const { data } = await supabaseClient.auth.getUser();
  return data?.user ?? null;
}

function traduzirErroAuth(mensagem) {
  const m = String(mensagem).toLowerCase();
  if (m.includes('already registered')) return 'Este e-mail já está cadastrado.';
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (m.includes('password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  return mensagem;
}
