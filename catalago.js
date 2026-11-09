// catalogo.js
async function carregarProdutos() {
  const { data, error } = await supabaseClient
    .from('produtos')
    .select(`
      id, nome, descricao, preco, preco_antigo, categoria,
      marca, imagem, destaque, badge, cor_principal,
      variacoes ( cor, tamanho, imagem, estoque )
    `)
    .eq('ativo', true)
    .order('id');

  if (error) {
    console.error('Erro ao carregar produtos:', error.message);
    return null; // null sinaliza falha, para o site usar o plano B
  }

  return data.map(adaptarProduto);
}

// Converte o formato do banco para o formato que o seu site já usa.
// Ajuste os nomes das chaves (name, price, etc.) para os que o seu script.js usa.
function adaptarProduto(p) {
  const variacoes = (p.variacoes || []).map(v => ({
    cor: v.cor,
    tamanho: v.tamanho,
    imagem: urlImagem(v.imagem),
    estoque: v.estoque,
    disponivel: v.estoque > 0
  }));

  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    preco: Number(p.preco),
    precoAntigo: p.preco_antigo ? Number(p.preco_antigo) : null,
    categoria: p.categoria,
    marca: p.marca,
    imagem: urlImagem(p.imagem),
    destaque: p.destaque,
    badge: p.badge,
    corPrincipal: p.cor_principal,
    variacoes,
    cores: [...new Set(variacoes.map(v => v.cor))],
    tamanhos: [...new Set(variacoes.map(v => v.tamanho))].sort((a, b) => a - b)
  };
}
