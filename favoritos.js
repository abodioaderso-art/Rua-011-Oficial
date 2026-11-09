// favoritos.js
// Lê e grava favoritos no banco. O RLS garante que cada usuário vê só os seus.

let favoritosIds = new Set();

async function carregarFavoritos() {
  const { data, error } = await supabaseClient
    .from('favoritos')
    .select('produto_id');

  if (error) {
    console.error('Erro ao carregar favoritos:', error.message);
    return [];
  }
  return data.map(f => f.produto_id);
}

async function alternarFavorito(produtoId, jaEstaFavoritado) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    throw new Error('Faça login para salvar favoritos.');
  }

  if (jaEstaFavoritado) {
    const { error } = await supabaseClient
      .from('favoritos')
      .delete()
      .eq('produto_id', produtoId)
      .eq('usuario_id', usuario.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from('favoritos')
      .insert({ usuario_id: usuario.id, produto_id: produtoId });
    if (error) throw error;
  }
}

// Chamado pelo auth.js sempre que a sessão muda
async function iniciarFavoritos() {
  const usuario = await usuarioAtual();

  if (!usuario) {
    favoritosIds = new Set();
  } else {
    const ids = await carregarFavoritos();
    favoritosIds = new Set(ids);
  }

  if (typeof atualizarCoracoes === 'function') atualizarCoracoes(); // função do script.js
}

// Chamado no clique do coração
async function clicarFavorito(produtoId) {
  const jaEstaFavoritado = favoritosIds.has(produtoId);

  try {
    await alternarFavorito(produtoId, jaEstaFavoritado);
    if (jaEstaFavoritado) {
      favoritosIds.delete(produtoId);
    } else {
      favoritosIds.add(produtoId);
    }
    if (typeof atualizarCoracoes === 'function') atualizarCoracoes();
  } catch (err) {
    alert(err.message);
  }
}

function estaFavoritado(produtoId) {
  return favoritosIds.has(produtoId);
}
