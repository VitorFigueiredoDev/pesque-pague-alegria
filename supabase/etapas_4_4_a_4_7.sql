-- ETAPAS 4.4–4.7: configurações públicas e textos personalizáveis.
-- Pode reexecutar. Usa tabela nova pois site_settings legado possui estrutura incompatível.
-- Não altera, migra nem apaga a tabela legada site_settings.
-- Nunca armazene senhas, tokens ou dados privados nesta tabela: leitura pública.
CREATE TABLE IF NOT EXISTS public.site_content_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_content_settings_key_valid CHECK (key ~ '^[a-z0-9_]{3,80}$'),
  CONSTRAINT site_content_settings_value_length CHECK (length(value) <= 3000)
);
ALTER TABLE public.site_content_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.site_content_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content_settings TO authenticated;
DROP POLICY IF EXISTS "Public read site settings" ON public.site_content_settings;
CREATE POLICY "Public read site settings" ON public.site_content_settings
FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins insert site settings" ON public.site_content_settings;
CREATE POLICY "Admins insert site settings" ON public.site_content_settings
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.site_admins WHERE user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS "Admins update site settings" ON public.site_content_settings;
CREATE POLICY "Admins update site settings" ON public.site_content_settings
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.site_admins WHERE user_id = (SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.site_admins WHERE user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS "Admins delete site settings" ON public.site_content_settings;
CREATE POLICY "Admins delete site settings" ON public.site_content_settings
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.site_admins WHERE user_id = (SELECT auth.uid())));
