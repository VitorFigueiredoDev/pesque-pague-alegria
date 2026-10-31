# Checklist de publicação — Pesque e Pague Alegria

## Etapas 6.1–6.5

1. **Backup e revisão**: mantenha cópia do ZIP anterior e confira conteúdos, preço, regras, fotos autorizadas e links oficiais.
2. **Endereço e DNS**: escolha hospedagem estática com HTTPS (ex.: Netlify). Faça primeiro uma publicação de testes; não compartilhe endereço administrativo como forma de segurança.
3. **SEO**: após obter domínio definitivo, execute `python scripts/preparar_publicacao.py https://seu-dominio.com` na pasta raiz. Isso cria `sitemap.xml`, atualiza `robots.txt` e define canonical/og:url nas páginas públicas. Rode novamente se o domínio mudar. Não execute com `localhost` ou um domínio fictício.
4. **Deploy estático**: publique o conteúdo da pasta `pesque-pague-alegria/`, com `index.html` na raiz publicada. No Netlify, arraste a pasta completa da versão *já preparada*, não o ZIP com pasta externa; ou configure o diretório de publicação. A página `404.html` fornece o erro personalizado em provedores compatíveis.
5. **Testes pós-publicação**: Home, Galeria, Peixes, Informações, Personalizar site, login admin, salvar/editar/excluir foto e banner, mobile, navegação por teclado. Verifique console e Network em conexão móvel. Limpe cache se o navegador mostrar uma versão antiga.

## Supabase e segurança

- **Não precisa de SQL novo** neste pacote. Nenhuma tabela é apagada ou alterada.
- Chave `sb_publishable_...` é pública, mas **nunca coloque `service_role`, `sb_secret_...` ou senha** em HTML/JS.
- No Supabase, revise RLS e policies de **todos** os buckets e tabelas. Publicação de arquivos é diferente de autorização para upload/exclusão.
- O painel só é seguro quando a autenticação e as regras RLS impedem escrita por visitantes. Esconder URL não é segurança.
- Não publique informações privadas em `site_content_settings`, que é publicamente legível.
- `robots.txt` e `noindex` impedem rastreio cooperativo; **não protegem páginas privadas**. Proteção real depende de Supabase Auth e RLS.
- O arquivo `_headers` adiciona cabeçalhos básicos em hosts compatíveis; em outros, configure pela hospedagem. Não configure CSP rígida sem testar CDNs, Supabase, fontes e imagens.

## Ferramentas de checagem

- `python scripts/verificar_projeto.py` — testa caminhos internos locais.
- `node --check js/main.js` — verifica sintaxe do slider. Pode aplicar `node --check` a outros JS.
- `python scripts/preparar_publicacao.py https://DOMINIO-REAL` — gera sitemap e URLs canônicas **apenas quando houver domínio real**.

## Ainda depende de você

- Domínio/hospedagem, endereço real, mídias oficiais e confirmação de valores devem ser fornecidos/validados. Não foram inventados.
- Integração e fluxo Auth/RLS dependem de testes em ambiente publicado. Este pacote não equivale a auditoria de segurança nem garante desempenho medido.
