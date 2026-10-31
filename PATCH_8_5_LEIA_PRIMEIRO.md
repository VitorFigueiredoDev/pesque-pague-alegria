# Patch 8.5 — Mobile, manejo e contatos

## Instalação

1. Faça cópia de segurança do projeto atual.
2. Copie o conteúdo **dentro** da pasta `pesque-pague-alegria/` deste ZIP para a raiz do repositório, com `index.html` na raiz.
3. Abra `index.html` no Live Server, ative a visualização mobile do navegador e teste banners horizontais e verticais, incluindo gestos de deslizar.
4. Confira `pages/informacoes.html`: sem o selo “Confirme a programação” nem a seção grande de preservação; uso do passaguá aparece nas Regras; contatos mostram ícones e não setas.
5. Faça commit/push para o GitHub Pages.

**Não precisa executar SQL.** Seus dados atuais no Supabase foram preservados.

### Comportamento dos banners

- Banner só com imagem: no celular, a altura se ajusta à **proporção real** da imagem; não há faixas pretas artificiais acima/abaixo.
- Imagem mobile cadastrada: usa essa imagem em até 767 px.
- Sem imagem mobile: usa a horizontal, porém sem forçá-la a preencher uma área alta de Stories.
- Banners com título/descrição mantêm o layout com texto.
- Deslize para a esquerda/direita muda o slide; deslizar na vertical continua rolando a página.

### Observação sobre as regras de manejo

A informação do passaguá foi movida para um destaque dentro da seção “Regras”. O conteúdo de “Preservação” anteriormente salvo na tabela `site_information` continua armazenado, mas deixou de aparecer na página pública. No admin, ele está identificado como “legado: não exibida”, para evitar confusão e perda acidental de dados.

### Compatibilidade

Sem novas tabelas, permissões nem migrations. Requer apenas os arquivos estáticos atualizados no GitHub Pages.
