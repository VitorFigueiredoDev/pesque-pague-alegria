# Patch 9.0 — Site instalável e duas correções mobile

## Novidades

1. O site agora possui PWA instalável com `site.webmanifest`, ícones PNG,
   `sw.js`, `offline.html` e `js/pwa.js`.
2. Nas páginas públicas, o rodapé mostra **Instalar aplicativo** quando
   o navegador oferece a instalação. No iPhone/iPad, há instruções para
   **Compartilhar → Adicionar à Tela de Início**.
3. No celular, as setas, indicadores e contador do slider ficam numa faixa
   escura **abaixo da arte**, não escondendo textos do banner. O gesto de
   deslizar o banner com o dedo continua funcionando.
4. O botão **Ver toda a galeria** passa para uma linha abaixo do texto na
   versão mobile, sem espremer o conteúdo da seção.
5. A aba **Design system** do administrador documenta o PWA e as correções.

## Instalação

- Copie **o conteúdo** da pasta `pesque-pague-alegria/` para a raiz do seu
  repositório (com `index.html` na raiz) e faça push ao GitHub.
- **Não é necessário executar SQL.** Não foi alterado o banco do Supabase.
- No Chrome Android, abra o site hospedado em HTTPS e procure **Instalar
  aplicativo** no rodapé (o botão só é exibido se o navegador oferecer a
  instalação). Também é possível pelo menu do Chrome.
- No Safari iPhone/iPad, use Compartilhar → Adicionar à Tela de Início.
- No Live Server (localhost) o registro do PWA pode funcionar, mas a
  elegibilidade de instalação deve ser conferida no GitHub Pages HTTPS.
- Teste com o modo dispositivo do Chrome DevTools e com banners 16:9 e 9:16.
- Depois de publicar, recarregue a página para atualizar o Service Worker.
  Se o aplicativo já estava instalado, talvez seja necessário reinstalá-lo
  para atualizar o ícone.

## Segurança / atualização

- O Service Worker não intercepta requisições externas (incluindo Supabase)
  nem páginas do administrador. Não grava tokens de autenticação.
- O app precisa de internet para consultar banners, galeria e horários
  atualizados. Ao tentar abrir uma página offline, aparece o aviso offline.
- A logo configurada no Supabase para navbar/rodapé não altera o ícone do
  aplicativo já instalado. Para mudar o ícone, substitua os PNG em
  `assets/icons/` e publique a versão nova.
