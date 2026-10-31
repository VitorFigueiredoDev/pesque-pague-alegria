# Atualização — logo PNG e design system

1. Copie o conteúdo desta pasta para a raiz do repositório GitHub Pages, preservando `index.html` na raiz.
2. Não execute SQL: a função reutiliza `site_content_settings` e o bucket `galeria`.
3. Entre em `/admin/login.html` e abra **Personalizar site** → **Logo oficial do site**.
4. Envie um PNG transparente de até 2 MB. A logo substituirá o ícone na navbar e no rodapé das páginas públicas.
5. Em **Design system**, consulte cores, fontes, componentes, tamanhos de banners, galeria, logos e arquitetura.
6. Para voltar ao ícone anterior, use **Restaurar ícone original**.

**Nota:** o favicon (ícone da aba do navegador) continua em `assets/icons/favicon.svg`. A troca via admin altera a identidade da navbar/rodapé, não o favicon. Arquivos SQL antigos foram retirados apenas do pacote; as tabelas permanecem no Supabase. O histórico Git não é apagado.

**Segurança:** a publicação da logo depende das políticas RLS já existentes. Caso o upload falhe por permissão, revise a política de escrita do bucket `galeria` para administradores autenticados; não torne o bucket gravável anonimamente.
