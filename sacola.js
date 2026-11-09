// sacola.js
// Formato único de item usado pelo catálogo e pela página do produto.
// Item: { produtoId, nome, preco, imagem, cor, tamanho, quantidade }

// ⚠️ AJUSTAR: use a mesma chave que o seu código atual usa no localStorage
const SACOLA_KEY = 'rua011_sacola';

function lerSacola() {
  try {
    return JSON.parse(localStorage.getItem(SACOLA_KEY)) || [];
  } catch {
    return [];
  }
}

function salvarSacola(sacola) {
  localStorage.setItem(SACOLA_KEY, JSON.stringify(sacola));
}

function chaveItem(produtoId, cor, tamanho) {
  return `${produtoId}|${cor}|${tamanho}`;
}

function adicionarNaSacola(produto, cor, tamanho, quantidade = 1) {
  const variacao = produto.variacoes.find(v => v.cor === cor && v.tamanho === tamanho);
  if (!variacao || !variacao.disponivel) {
    throw new Error(`Sem estoque de ${produto.nome} (${cor}, ${tamanho}).`);
  }

  const sacola = lerSacola();
  const chave = chaveItem(produto.id, cor, tamanho);
  const existente = sacola.find(i => chaveItem(i.produtoId, i.cor, i.tamanho) === chave);
  const quantidadeFinal = (existente?.quantidade ?? 0) + quantidade;

  if (quantidadeFinal > variacao.estoque) {
    throw new Error(`Estoque insuficiente: restam ${variacao.estoque} unidade(s).`);
  }

  if (existente) {
    existente.quantidade = quantidadeFinal;
  } else {
    sacola.push({
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      cor,
      tamanho,
      quantidade
    });
  }

  salvarSacola(sacola);
  return sacola;
}

function removerDaSacola(produtoId, cor, tamanho) {
  const chave = chaveItem(produtoId, cor, tamanho);
  const sacola = lerSacola().filter(i => chaveItem(i.produtoId, i.cor, i.tamanho) !== chave);
  salvarSacola(sacola);
  return sacola;
}

function totalSacola() {
  return lerSacola().reduce((soma, i) => soma + i.preco * i.quantidade, 0);
}
