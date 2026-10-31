-- PATCH 8.4 — imagem vertical opcional por banner.
-- Execute UMA VEZ no SQL Editor do projeto Supabase já existente.
-- Não exclui dados, nem muda autenticação ou políticas RLS.
ALTER TABLE public.home_banners
  ADD COLUMN IF NOT EXISTS mobile_image_url text;

COMMENT ON COLUMN public.home_banners.mobile_image_url IS
  'URL HTTPS opcional da imagem vertical do banner (Story 9:16, exibido em telas <= 767px).';
