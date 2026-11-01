/* Pesque e Pague Alegria | PWA 9.0
   O conteúdo Supabase é sempre obtido online e não é interceptado aqui.
   A área administrativa também fica fora do cache para segurança e atualização.
*/
const CACHE_NAME = 'pesque-alegria-public-v9-0-1';
const LOCAL_SHELL = [
  './offline.html',
  './assets/icons/app-icon-192.png',
  './assets/icons/app-icon-512.png',
  './assets/icons/app-icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './css/style.css',
  './css/responsive.css'
];
const SCOPE_URL = new URL(self.registration.scope);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(LOCAL_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('pesque-alegria-public-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
    )),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== SCOPE_URL.origin || !url.pathname.startsWith(SCOPE_URL.pathname)) return;
  // Não interceptar autenticação nem operações administrativas.
  const relativePath = url.pathname.slice(SCOPE_URL.pathname.length);
  if (relativePath.startsWith('admin/')) return;
      // Recursos requisitados por uma página administrativa nunca entram no cache.
      if (request.referrer) {
        try {
          const referring = new URL(request.referrer);
          if (referring.origin === SCOPE_URL.origin &&
              referring.pathname.startsWith(SCOPE_URL.pathname + 'admin/')) return;
        } catch { /* Referência inválida: continua somente para arquivos públicos. */ }
      }
      if (/^js\/(?:admin(?:-login)?|.*-admin)\.js$/i.test(relativePath)) return;

  // Navegação sempre tenta rede. Quando offline, exibe instruções claras.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const offline = await caches.match(new URL('./offline.html', SCOPE_URL).href);
        return offline || Response.error();
      })
    );
    return;
  }

  // Recursos estáticos: rede primeiro, cache somente como reserva offline.
  // Evita manter scripts antigos em versões futuras do site.
  if (/\.(?:css|js|svg|png|webp|jpe?g|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
        }
        return response;
      }).catch(() => caches.match(request))
    );
  }
});
