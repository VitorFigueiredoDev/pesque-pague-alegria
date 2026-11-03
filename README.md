# Pesque e Pague Alegria

Site estático com páginas públicas e painel administrativo, publicado no **GitHub Pages**. Conteúdo editável e imagens ficam no **Supabase** (Auth, banco de dados e Storage).

## Estrutura

- `index.html` — início, banners e destaques.
- `pages/` — Galeria, Peixes e Informações.
- `admin/login.html` — acesso ao painel; `admin/dashboard.html` — gerenciamento de conteúdo.
- `css/` e `js/` — estilos e scripts do site.
- `assets/icons/`, `site.webmanifest`, `sw.js` e `offline.html` — ícones e PWA (instalação na tela inicial).
- `supabase/banner_mobile_migration.sql` — **somente** para migrar bancos antigos sem a coluna `mobile_image_url`. Não execute novamente se o site já utiliza banners mobile.

## Executar e publicar

1. Abra a pasta no VS Code e execute pelo **Live Server** (não pelo arquivo `file://`).
2. Teste a Home, páginas internas e login do administrador.
3. Publique **o conteúdo desta pasta na raiz do repositório** do GitHub Pages (com `index.html` na raiz). Não suba o ZIP como um arquivo.
4. Teste o site público no celular e, após mudanças no PWA, atualize a página para receber o cache novo.

## Administração

Acesse `/admin/login.html` no endereço publicado. Pelo painel é possível editar banners, galeria, peixes, informações e identidade do site. Imagens enviadas por arquivo são otimizadas quando isso reduz seu peso; o Design System do painel permite otimizar também as imagens cadastradas anteriormente.

## Segurança

`js/supabase.js` deve conter **somente** URL pública e chave `anon`/`publishable` do Supabase. Nunca publique `service_role`, `sb_secret`, senhas nem `.env`. Ative e revise as políticas **RLS** e as permissões do Storage: esconder o endereço do painel não é proteção de acesso.

## Verificação

Rode `python scripts/verificar_projeto.py` na pasta raiz para conferir caminhos locais. Não há SQL novo necessário para esta atualização e nenhum dado do Supabase é apagado.
