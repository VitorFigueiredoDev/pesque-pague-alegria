# Pesque e Pague Alegria

Site público e painel administrativo, hospedados no GitHub Pages, com dados gerenciados pelo Supabase.

## Páginas
- `index.html`: página inicial, banners e destaques.
- `pages/galeria.html`: galeria.
- `pages/peixes.html`: catálogo de peixes.
- `pages/informacoes.html`: horários, valores e regras.
- `admin/login.html` e `admin/dashboard.html`: painel de administração.

## Identidade visual e logo
Acesse **Admin → Personalizar site → Logo oficial do site** para enviar PNG transparente (até 2 MB) e aplicá-lo na navbar e rodapé. O favicon continua em `assets/icons/favicon.svg`.

A aba **Design system** documenta as cores, tipografia, componentes, responsividade, tamanhos recomendados de imagens e arquitetura do projeto.

## Navbar (Patch 8.1)
Navegação desktop: **Início / Galeria — logo centralizada — Peixes / Informações**. A logo PNG enviada pelo administrador aparece maior (até 91 px de altura no desktop) e permanece adaptada à tela pequena. No celular, os links ficam reunidos no menu sanduíche, com a logo no centro. Sem SQL novo.

## Transições e scrollbar (Patch 8.2)
Nas quatro páginas públicas há um efeito de entrada suave (320 ms) e de saída (190 ms) ao seguir links internos. Links externos, abas novas, âncoras e downloads não são interceptados. Quem ativa **Reduzir movimento** no sistema recebe navegação normal, sem animação.

A barra de rolagem usa laranja `#FF6A00` e fundo escuro no Chrome, Edge, Safari e Firefox. Código em `css/style.css` e `js/page-transitions.js`. O administrador herda somente a scrollbar laranja; login e operações do painel não recebem transições que poderiam interferir na autenticação.

## Banners com imagem pronta (Patch 8.3)
Em **Admin → Banners**, basta enviar uma imagem (ou fornecer uma URL HTTPS). Título, descrição, ordem e botão são opcionais.

- **Somente imagem:** a Home mostra a arte completa, sem textos gerados automaticamente e sem o filtro escuro; no celular o banner ajusta a altura à proporção da arte para evitar faixas vazias.
- **Com texto:** título e descrição aparecem somente se preenchidos. O botão só é exibido quando houver texto e link válidos.
- O título vazio é salvo como string vazia (não `NULL`) para manter compatibilidade com colunas `NOT NULL` existentes no Supabase.
- **Não requer novo SQL** e não modifica banners existentes; versões anteriores continuam válidas.

## Publicação
Copie os arquivos desta pasta para a raiz do repositório GitHub Pages. A configuração Supabase existente continua sendo usada. **Não é necessário executar SQL novo** para esta atualização.

Os SQLs de migração antigos foram retirados desta distribuição por serem scripts de instalação já aplicados. O banco existente não é alterado nem apagado. Consulte `supabase/LEIA-ME.md` e `ATUALIZACAO_LOGO_DESIGN_SYSTEM.md`.

## Segurança
Somente chaves públicas (anon/publishable) no frontend. Nunca coloque `service_role` ou `sb_secret` no repositório. O Supabase deve manter RLS ativo para proteger a escrita e os uploads.


## Patch 8.4

Imagens verticais opcionais para banners (1080 × 1920, Stories) e editor do
bloco “Mais tempo. Mais história.” na aba **Informações**. Execute primeiro
`supabase/patch_8_4_banner_mobile.sql` e consulte `PATCH_8_4_LEIA_PRIMEIRO.md`.

## Patch 8.5 — melhorias mobile e informações

No celular, banners com apenas imagem acompanham a proporção real do arquivo (se houver imagem vertical, usa-a automaticamente). O carrossel aceita deslizar com o dedo para esquerda/direita, mantendo o scroll vertical. Retirado o selo redundante de pesca noturna, removida a seção separada de preservação e integrada a orientação de passaguá às regras. Botões de contato com ícones SVG, sem setas. Sem alterações de banco de dados.
