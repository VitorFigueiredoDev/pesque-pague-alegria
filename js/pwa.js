(() => {
  'use strict';
  // Caminhos relativos suportam tanto GitHub Pages /repositorio/ quanto Live Server.
  const root = document.body.dataset.root || '.';
  const protocolAllowed = location.protocol === 'https:' ||
    ['localhost', '127.0.0.1'].includes(location.hostname);
  if (protocolAllowed && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${root}/sw.js`, { scope: `${root}/` })
        .catch(error => console.warn('PWA: não foi possível registrar o Service Worker', error));
    });
  }

  const footer = document.querySelector('#site-footer .footer-bottom');
  if (!footer) return;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (standalone()) return;

  const strip = document.createElement('div');
  strip.className = 'pwa-install-strip';
  strip.hidden = true;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pwa-install-button';
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M12 7v8m-3-3 3 3 3-3"/></svg><span>Instalar aplicativo</span>';
  button.setAttribute('aria-label','Adicionar o Pesque e Pague Alegria à tela inicial');
  strip.append(button);
  footer.before(strip);

  let deferredInstall = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const show = () => { if (!standalone()) strip.hidden = false; };
  const hide = () => { strip.hidden = true; deferredInstall = null; };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstall = event;
    show();
  });
  window.addEventListener('appinstalled', hide);
  window.matchMedia('(display-mode: standalone)').addEventListener?.('change', event => {
    if (event.matches) hide();
  });

  if (isIOS) show(); // No iPhone/iPad, instalação é feita pelo menu Compartilhar.

  button.addEventListener('click', async () => {
    if (deferredInstall) {
      const promptEvent = deferredInstall;
      deferredInstall = null;
      try {
        await promptEvent.prompt();
        const result = await promptEvent.userChoice;
        if (result?.outcome === 'accepted' || result?.outcome === 'dismissed') hide();
      } catch (error) {
        console.warn('PWA: o navegador não abriu a instalação', error);
      }
      return;
    }
    if (!isIOS) { hide(); return; }
    let dialog = document.querySelector('#pwa-install-help');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'pwa-install-help';
      dialog.className = 'pwa-install-dialog';
      dialog.innerHTML = '<h2>Adicionar à Tela de Início</h2><p>No Safari, toque no ícone <strong>Compartilhar</strong>, selecione <strong>Adicionar à Tela de Início</strong> e confirme.</p><button class="btn btn-orange" type="button">Entendi</button>';
      document.body.append(dialog);
      dialog.querySelector('button').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
      });
    }
    dialog.showModal();
  });
})();
