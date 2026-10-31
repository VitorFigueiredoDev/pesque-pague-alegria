-- PATCH 7: Execute no SQL Editor do Supabase ANTES de enviar os novos arquivos ao GitHub.
-- Seguro para reexecutar: não exclui tabelas, registros ou políticas preexistentes.
-- Depende do SQL setup_admin.sql e do SQL etapas_4_4_a_4_7.sql já executados.
-- A permissão continua controlada pela tabela site_admins e por RLS.

-- Dicas editáveis por espécie; em branco significa “Consulte a equipe”.
ALTER TABLE public.fish_species ADD COLUMN IF NOT EXISTS recommended_bait TEXT NOT NULL DEFAULT '';
ALTER TABLE public.fish_species ADD COLUMN IF NOT EXISTS recommended_hook TEXT NOT NULL DEFAULT '';
ALTER TABLE public.fish_species ADD COLUMN IF NOT EXISTS best_fishing_time TEXT NOT NULL DEFAULT '';
ALTER TABLE public.fish_species ADD COLUMN IF NOT EXISTS best_weather TEXT NOT NULL DEFAULT '';

-- Aviso de proibições em destaque: tabela site_content_settings já existente.
INSERT INTO public.site_content_settings (key,value) VALUES (
  'fish_prohibited_notice',
  'Não são permitidos anzóis com fisga, linhas multifilamento, alicates metálicos de contenção, bebidas de fora ou caixas térmicas trazidas pelos visitantes.'
) ON CONFLICT (key) DO NOTHING;

-- Horários da semana (segunda = 0 ... domingo = 6).
-- Esta tabela substitui as informações antigas da seção 'horarios' apenas na exibição.
CREATE TABLE IF NOT EXISTS public.weekly_fishing_hours (
  day_of_week SMALLINT PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6),
  opening_time TIME,
  closing_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  night_fishing BOOLEAN NOT NULL DEFAULT false,
  night_note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_weekly_hours CHECK (is_closed OR (opening_time IS NOT NULL AND closing_time IS NOT NULL AND closing_time > opening_time)),
  CONSTRAINT valid_night_note_length CHECK (length(night_note) <= 250),
  CONSTRAINT closed_cannot_be_night CHECK (NOT is_closed OR NOT night_fishing)
);
ALTER TABLE public.weekly_fishing_hours ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.weekly_fishing_hours TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.weekly_fishing_hours TO authenticated;
DROP POLICY IF EXISTS "Public reads weekly fishing hours" ON public.weekly_fishing_hours;
CREATE POLICY "Public reads weekly fishing hours" ON public.weekly_fishing_hours FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins write weekly fishing hours" ON public.weekly_fishing_hours;
CREATE POLICY "Admins write weekly fishing hours" ON public.weekly_fishing_hours FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.site_admins WHERE user_id=(SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.site_admins WHERE user_id=(SELECT auth.uid())));

-- Programação inicial: quarta e sábado com pesca noturna até as 22h.
-- ON CONFLICT DO NOTHING: não sobrescreve horários já editados pelo administrador.
INSERT INTO public.weekly_fishing_hours
(day_of_week,is_closed,opening_time,closing_time,night_fishing,night_note) VALUES
(0,true,NULL,NULL,false,''),
(1,false,'09:00','18:00',false,''),
(2,false,'09:00','22:00',true,'Consulte a equipe sobre jantar e condições.'),
(3,false,'09:00','18:00',false,''),
(4,false,'09:00','18:00',false,''),
(5,false,'09:00','22:00',true,''),
(6,false,'09:00','18:00',false,'')
ON CONFLICT (day_of_week) DO NOTHING;
