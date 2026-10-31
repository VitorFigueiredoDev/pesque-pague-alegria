> **Correção de compatibilidade:** O banco já tinha uma tabela legada `site_settings`, com colunas id, name, phone etc. Para preservar essa tabela, a personalização agora usa `site_content_settings`. As colunas adicionadas anteriormente à tabela legada podem ficar como estão; não é preciso removê-las.

# Pesque e Pague Alegria — pacote de evolução 4.4 a 4.7

Este ZIP **substitui** o da etapa 4.3. Mantém Home, Galeria, Informações, Peixes, Parceiros, Banners e painel administrativo. Não apaga dados do Supabase.

## Etapas incluídas

- **4.4 — Textos da Home:** edite as descrições de infraestrutura, pesca noturna, galeria e visita no painel.
- **4.5 — Canais oficiais:** configure WhatsApp, Instagram e localização no painel. Links válidos aparecem no cabeçalho, rodapé e seção Contato; a Home recebe um link de mapa quando cadastrado. Não inventamos endereço ou contatos.
- **4.6 — SEO básico:** títulos específicos, descrições e metadados Open Graph nas páginas. Domínio canônico e imagem de compartilhamento ficam para a publicação.
- **4.7 — Responsividade e manutenção:** nova aba Personalizar site no painel, estados de carregamento/erro e estilos adaptáveis preservando dark mode e identidade laranja.

## Instalação

1. Faça uma cópia de segurança da pasta anterior, especialmente quaisquer edições locais suas.
2. Extraia este ZIP em **outra pasta**, abra-a no VS Code e inicie o Live Server nessa pasta. Não misture versões em pastas diferentes.
3. No **Supabase → SQL Editor**, execute o arquivo `supabase/etapas_4_4_a_4_7.sql` uma vez. Ele cria somente `site_content_settings` e suas permissões; não exclui tabelas nem registros existentes. **Não execute o SQL antigo que criava `site_content_settings`.**
4. Entre em `admin/login.html` e abra **Personalizar site**. Insira os links oficiais confirmados e textos que quiser personalizar. Clique em Salvar.
5. Recarregue a Home e a página Informações com Ctrl+F5. Verifique também Galeria, Peixes, Parceiros e Banners.

## Segurança

`site_content_settings` é uma tabela PUBLICAMENTE legível — somente armazene textos e URLs públicos. As policies de escrita exigem usuário autenticado inscrito em `site_admins`.

Não coloque senhas, números privados, chaves secretas ou dados sensíveis em `site_content_settings`, `js/config.js` ou outros arquivos frontend. A configuração local `js/config.js` continua funcionando como reserva quando a tabela estiver indisponível.

## Limites

- Os quatro textos editáveis são descrições de seções da Home; banners continuam gerenciados na aba Banners.
- Esta versão não oferece edição arbitrária de toda a estrutura visual pelo painel.
- A integração online deve ser validada no seu Supabase. Se a tabela ainda não existir, o site usa conteúdo padrão, sem deixar as páginas vazias.
- Não configure URLs inventadas; cadastre apenas WhatsApp/Instagram/mapa confirmados.


## Pacote adicional — Etapas 5.1 a 5.4 (sem novo SQL)

- **5.1 — Galeria pesquisável:** busca por título/descrição (ignorando acentos) e ordenação por data ou título, com contador e botão limpar.
- **5.2 — Catálogo de peixes:** busca com tolerância a acentos e ordenação alfabética crescente/decrescente.
- **5.3 — Acessibilidade:** link “Pular para o conteúdo” nas páginas públicas, nomes acessíveis nas imagens e preservação de navegação por teclado e opção de movimento reduzido.
- **5.4 — Experiência e desempenho:** decodificação assíncrona das imagens da galeria/catálogo, controles adaptáveis ao celular e estados vazios claros.

### Instalação
Extraia o arquivo ZIP. Ele contém **uma única pasta raiz `pesque-pague-alegria/`** com o projeto completo; abra essa pasta pelo VS Code/Live Server. Guarde backup da versão anterior e **não execute nenhum SQL** para este pacote.

### Testes
1. Na Galeria, pesquise uma palavra do título ou da descrição de uma foto e altere a ordenação.
2. Em Peixes, pesquise um nome com/sem acento e altere a ordem.
3. Pressione Tab ao abrir a Home e use o link “Pular para o conteúdo”.
4. Teste a galeria e o catálogo no celular, especialmente os controles de pesquisa.

As mudanças estão no frontend e não alteram as tabelas nem os registros do Supabase.


## Novo pacote — Etapas 6.1 a 6.5 (preparação para publicação)

Sem SQL. Inclui 404 personalizada, cabeçalhos de proteção para hosts compatíveis, metadados de redes sociais, manifesto, gerador de sitemap/canonical por domínio definitivo, validador local de links e pausa no slider durante interação. O roteiro de implantação e segurança está no arquivo **PUBLICACAO.md**. O ZIP mantém apenas a pasta raiz `pesque-pague-alegria/`.
