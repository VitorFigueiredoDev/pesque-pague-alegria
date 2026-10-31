# Patch 8.4 — banners responsivos + destaque noturno editável

## 1. Supabase — SQL obrigatório antes de publicar

Abra o SQL Editor do projeto Supabase e execute o arquivo
`supabase/patch_8_4_banner_mobile.sql`.

A migração só adiciona `mobile_image_url` (texto, opcional) à tabela `home_banners`.
Ela é idempotente, não apaga fotos, não altera registros e não muda RLS.

**IMPORTANTE**: Não apague esta migração da sua cópia local antes de executá-la.

## 2. GitHub Pages ou Live Server

Copie o conteúdo de `pesque-pague-alegria/` para a raiz do projeto,
conservando `index.html` na raiz. Depois faça commit/push para o GitHub.

## 3. Banners no administrador

Aba Banners:
- Imagem desktop (arquivo ou URL HTTPS) — obrigatória, sugerido **1920x1080 (16:9)**.
- Imagem mobile — opcional, sugerido **1080x1920 (9:16)**, mesmo formato dos Stories.
- Ambos formatos: JPG/PNG/WebP, até 6 MB por arquivo.
- Título, descrição, botão e ordem — opcionais.
- Ao editar um banner, o campo da URL mobile exibe a imagem já salva.
  Apague a URL mobile e salve sem selecionar novo arquivo para remover a versão vertical.
- Sem imagem mobile, o site mantém a imagem desktop em telas pequenas.
- Em telas até 767 px, é carregada a imagem vertical. Artes completas não são cortadas.

## 4. Seção “Mais tempo. Mais história.” na Home

Aba Informações → **Destaque da pesca noturna na Home**:
- Primeira e segunda linhas do título, descrição, legenda da foto, selo opcional;
- Foto via upload (até 6 MB) ou URL HTTPS;
- Texto e link do botão. Caso ambos fiquem vazios, os valores padrão são mantidos;
- Deixe o selo vazio para mostrar os dias automaticamente a partir da programação semanal.

O editor dos horários semanais na mesma aba continua definindo os dias e horários
que alimentam chips de destaque, horários públicos e FAQ.

## 5. Testes rápidos

1. No desktop: cadastre um banner horizontal sem texto e veja a arte completa na Home.
2. No celular (ou DevTools ≤ 767px): confira a arte vertical do mesmo banner.
3. No admin: altere título e foto da seção noturna e atualize a Home.
4. Modifique a pesca noturna do sábado e confirme os chips da Home.

Não publique chaves `service_role` ou qualquer token secreto no GitHub.
