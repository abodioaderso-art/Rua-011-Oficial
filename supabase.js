// supabase.js
// Conexão com o Supabase e helper de imagens.
// Não declare essas constantes em nenhum outro arquivo.

const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_PUBLICA';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Monta a URL pública de uma imagem do bucket "produtos"
function urlImagem(caminho) {
  if (!caminho) return '';
  return `${SUPABASE_URL}/storage/v1/object/public/produtos/${caminho}`;
}
