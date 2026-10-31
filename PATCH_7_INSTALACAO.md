# Patch 7 — WhatsApp, dicas por peixe, proibições e pesca noturna

## Antes de começar

Faça backup do repositório/site atual e, se possível, exporte os dados do Supabase.

### 1. Atualize o Supabase PRIMEIRO

No painel do Supabase > SQL Editor > New query, execute o conteúdo de:

`supabase/patch_7_whatsapp_peixes_pesca_noturna.sql`

Ao terminar, confirme **Success**. O script cria uma programação semanal, acrescenta quatro colunas a `fish_species` e inicializa o aviso de proibições. Não exclui peixes, fotos nem dados existentes. Também não apaga as informações de horários antigas.

Requisitos: as tabelas `site_admins` e `site_content_settings` devem já existir (patches anteriores).

### 2. Atualize o GitHub Pages

Use o conteúdo **dentro** da pasta `pesque-pague-alegria/` do ZIP na raiz do repositório `pesque-pague-alegria` no GitHub, mantendo `index.html` na raiz. Substitua arquivos de mesmo nome, sem apagar imagens ou personalizações que tenha feito depois do último patch. Se você já fez mudanças próprias, compare/mescle antes de substituir.

Commit e push para a branch configurada em GitHub Settings > Pages. Aguarde o GitHub publicar e faça atualização forçada no navegador (Ctrl+F5).

### 3. Gerencie os novos recursos

- Admin: `https://vitorfigueiredodev.github.io/pesque-pague-alegria/admin/login.html`
- Aba **Peixes**: edite uma espécie, preencha **Isca**, **Anzol**, **Melhor horário** e **Clima**. Esses campos aparecem no modal do catálogo. A mesma aba contém o aviso editável **Estritamente proibido**.
- Aba **Informações** > **Pesca noturna e horários por dia**: marque os dias de pesca noturna, defina abertura/fechamento e salve toda a semana. Os horários são **semanais e não uma agenda com datas únicas**. Você pode mudar novamente no dia necessário.
- O botão flutuante do WhatsApp aparece na Home, Galeria, Peixes e Informações, com o número **553497902740**. Também aceita a URL editável na aba **Personalizar site**.

### 4. Teste

1. Confira as páginas `/pages/peixes.html` e `/pages/informacoes.html`.
2. Confira o botão verde do WhatsApp, inclusive em celular.
3. Preencha as quatro dicas em uma espécie e abra o modal na página pública.
4. Edite o aviso de proibições e confirme a atualização.
5. Na aba Informações, desmarque sábado como pesca noturna e salve; confirme que o destaque desapareceu da Home e da página de horários. Depois reative sábado e salve.

**Atenção:** o patch não faz consulta remota automática ao calendário de eventos; os dias permanecem marcados até que o administrador altere. Não publique chaves `service_role`/secret no GitHub.
