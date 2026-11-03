# PATCH 9.1 — Desempenho e otimização de imagens

Base: Patch 9.0 (PWA + slider mobile). Mantém todas as páginas e funcionalidades.

## Instalação

1. Extraia o arquivo ZIP.
2. Copie o **conteúdo** de `pesque-pague-alegria/` para a raiz do seu repositório GitHub Pages, substituindo os arquivos anteriores.
3. Publique/commit as alterações. Verifique o PWA e a Home no computador e no celular.
4. No painel `/admin/login.html`, vá até a aba **Design System** e procure **Otimização de imagens já cadastradas**.
5. Clique **Otimizar imagens existentes**, confirme a operação e acompanhe o resultado. Este passo é importante para corrigir **os banners PNG e as fotos JPEG que já estão pesados no Supabase**, encontrados no Lighthouse. O patch por si só não altera remotamente arquivos nem registros do banco.
6. Depois, teste a Home e a Galeria no Chrome/Lighthouse e compare os resultados antes/depois, preferencialmente com condições e dispositivo semelhantes.

## Melhorias

- Novos uploads de galerias, banners desktop e mobile, foto de pesca noturna, logos de parceiros e logo do site: redução proporcional de resolução, conversão para WebP quando realmente reduz o peso, preservando transparência. Os uploads ainda aceitam JPG, PNG e WebP; a logo continua sendo selecionada em PNG no formulário.
- A ação de otimização antiga lê apenas imagens do próprio bucket público `galeria` do projeto Supabase; URL externas são ignoradas. Imagens novas são armazenadas com nomes diferentes, sem apagar os arquivos originais. Atualiza referências no banco somente após upload confirmado.
- O slider público agora usa `<picture>` com imagem de verdade para banners sem texto, prioriza a primeira arte e deixa as outras imagens com prioridade menor; reduz download de fundos duplicados.
- A Home reserva 16:9 para o primeiro banner durante o carregamento no celular, em vez de começar alta e encolher. Em caso de indisponibilidade do Supabase, os banners de reserva reaparecem; há limite de 5,5 segundos para o estado de carregamento.
- Fontes externas iniciam em paralelo à folha CSS principal; fotos da galeria e logo usam dimensões reservadas.
- Service Worker PWA atualizado de `v9-0-1` para `v9-1-1` para evitar CSS antigo no cache.

## Limitações e atenção

- Nenhuma migração SQL nova.
- Para remover o peso dos arquivos que **já existiam**, execute a otimização dentro do admin **depois de publicar**. Esta operação faz upload de novas imagens e altera URLs nos registros do Supabase; por isso requer login autorizado e confirma sua intenção.
- **Os arquivos originais permanecem no Storage**, para permitir recuperar uma versão anterior. Isso pode aumentar temporariamente o espaço usado; não os apague antes de conferir o site.
- Imagens externas informadas por URL (inclusive fotos de peixes hospedadas em terceiros) não são alteradas e podem permanecer pesadas.
- A otimização automática é feita no navegador e precisa de suporte a Canvas/WebP. Quando converter não diminuir significativamente o peso, o original é preservado.
- Qualidade, tamanhos e notas do Lighthouse variam por rede, navegador, conteúdo real do Supabase e publicação. Não foi executado teste de estresse de usuários simultâneos; esta etapa é uma otimização do carregamento.

## Arquivos principais modificados

`index.html`, `pages/*.html`, `admin/dashboard.html`, `css/style.css`, `css/responsive.css`, `js/main.js`, `js/gallery.js`, `js/layout.js`, `js/admin.js`, `js/night-feature-admin.js`, `js/site-logo-admin.js`, `js/image-optimizer.js` (novo), `js/image-optimizer-admin.js` (novo), `sw.js`.
