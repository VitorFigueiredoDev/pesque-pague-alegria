# Checklist de seguranca — GitHub Pages + Supabase

1. Adicione o `.gitignore` na pasta raiz `pesque-pague-alegria/`, ao lado de `index.html`.
2. Nunca publique chaves secretas ou service_role do Supabase no JavaScript/HTML.
3. A URL e a chave `anon` / `publishable` podem ficar no frontend: valide as politicas RLS de todas as tabelas e do Storage.
4. Nao confie apenas em esconder `admin/`: o controle de acesso deve ocorrer no Supabase (Auth + RLS).
5. SQLs de setup que criam contas administrativas ou contem credenciais devem ser revisados antes de ir para o repositorio.
6. Se um segredo ja foi commitado, `.gitignore` NAO o remove: revogue/rotacione a credencial imediatamente e remova-o do historico, se necessario.
7. Confirme o que esta sendo rastreado com `git ls-files` e confira a lista de arquivos antes de cada commit.
8. O arquivo `security-canary.txt` e uma isca publica e passiva. GitHub Pages nao oferece logs de acesso individualizados para essa isca.
9. Para deteccao real de varreduras, considere uma solucao com logs/telemetria no servidor ou plataforma de seguranca. GitHub Pages e hospedagem estatica.
