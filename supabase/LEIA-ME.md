# Banco de dados já configurado

Os arquivos SQL de instalação e patches antigos foram removidos **somente deste pacote de código**, pois já foram executados no Supabase. **Nenhuma tabela, política RLS ou dado foi excluído do banco.**

A personalização da logo reutiliza a tabela `public.site_content_settings` (`key`, `value`, `updated_at`) e o bucket público `galeria`, já usados pelo projeto. **Não é necessário executar SQL novo.**

Guarde um backup dos scripts de migração antigos em local privado se desejar reproduzir o banco em outro projeto. Não apague tabelas nem políticas RLS no Supabase.
