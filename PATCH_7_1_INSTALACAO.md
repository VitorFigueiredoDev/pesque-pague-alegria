# Patch 7.1 — Correções visuais e links da seção de aluguel

Este ZIP contém a **versão completa do site**, com uma única pasta principal `pesque-pague-alegria/`, atualizada a partir do Patch 7.

## Correções

- Removido o botão **Fale com a equipe** da navbar, preservando o botão flutuante do WhatsApp.
- Removidas as duas letras **A** decorativas: na faixa laranja do final da Home e no rodapé. O rodapé foi reorganizado para três colunas.
- Corrigida a galeria: todas as fotos usam cards com a mesma proporção (4:3); a primeira não ocupa mais duas linhas, inclusive em dispositivos móveis. As imagens continuam usando `object-fit: cover`.
- Os links **Consulte disponibilidade** de cada equipamento agora são âncoras reais, abrem o WhatsApp em outra aba e já incluem uma mensagem identificando o equipamento. Funciona tanto para os cards padrões quanto para os carregados do Supabase e acompanha a URL de WhatsApp configurada pelo administrador.

## Instalação no GitHub Pages

1. Guarde backup dos seus arquivos atuais, principalmente mudanças feitas à mão após o Patch 7.
2. Copie o conteúdo **de dentro** da pasta `pesque-pague-alegria/` para a raiz de seu repositório no GitHub (ao lado de `index.html`), preservando qualquer personalização que queira manter.
3. Faça commit e push. Após a publicação, recarregue o site com `Ctrl+F5` para descartar CSS em cache.
4. Confira a Home, a Galeria e a página de Informações, inclusive no celular.

**Não é necessário executar nenhum SQL novo no Supabase**: nenhuma tabela, política ou coluna foi modificada neste patch. O SQL do Patch 7 permanece na pasta apenas como parte do site completo; caso já tenha sido aplicado, não precisa executá-lo outra vez.

**Arquivos modificados em relação ao Patch 7:** `js/layout.js`, `js/site-settings.js`, `js/informacoes.js`, `css/style.css`, `css/responsive.css`, `css/informacoes.css` e `pages/informacoes.html`.
