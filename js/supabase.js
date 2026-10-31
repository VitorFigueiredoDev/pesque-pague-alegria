// Chave publishable pública fornecida para este projeto.
// Nunca use a chave service_role/secret no navegador.
const SUPABASE_URL = "https://tloasswxdlrvvoadxpln.supabase.co";
const SUPABASE_KEY = "sb_publishable_Q10_hISr6YR54Q8hzNqmWg_okv_0cq1";

window.db = null;
if (window.supabase?.createClient) {
  try {
    window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (error) {
    console.error("Não foi possível iniciar a conexão com o Supabase:", error);
  }
} else {
  console.warn("Biblioteca Supabase indisponível. O site continua exibindo conteúdo estático.");
}
