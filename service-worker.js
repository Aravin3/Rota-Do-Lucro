/**
 * ============================================================
 *  Rota do Lucro — Service Worker
 *  Estratégia: Cache-First para assets, Network-First para o HTML
 *  Atualização automática ao detectar nova versão
 * ============================================================
 */

// ── Versão do cache ──────────────────────────────────────────
// Incremente CACHE_VERSION ao fazer deploy de uma nova versão.
// O SW antigo será descartado e o novo cache será criado.
const CACHE_VERSION  = 'rota-lucro-v1';
const CACHE_STATIC   = `${CACHE_VERSION}-static`;

// ── Arquivos que serão cacheados na instalação ───────────────
const STATIC_ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  // Fonte do Google — armazenada em cache após primeira visita
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap',
];

// ── Domínios externos que também devem ser cacheados ────────
const CACHE_ORIGINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/* ============================================================
   INSTALL — pré-cacheia os assets essenciais
   ============================================================ */
self.addEventListener('install', event => {
  console.log('[SW] Instalando versão:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      // Adiciona cada arquivo individualmente para não falhar tudo
      // caso um recurso externo esteja indisponível offline
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err =>
            console.warn('[SW] Não foi possível cachear:', url, err.message)
          )
        )
      );
    }).then(() => {
      // Força o novo SW a ativar imediatamente
      // sem esperar as abas antigas fecharem
      return self.skipWaiting();
    })
  );
});

/* ============================================================
   ACTIVATE — remove caches de versões antigas
   ============================================================ */
self.addEventListener('activate', event => {
  console.log('[SW] Ativando versão:', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('rota-lucro-') && name !== CACHE_STATIC)
          .map(name => {
            console.log('[SW] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Assume controle de todas as abas abertas imediatamente
      return self.clients.claim();
    })
  );
});

/* ============================================================
   FETCH — intercepta requisições
   Estratégia:
     • index.html      → Network-First (sempre tenta versão mais recente)
     • Demais assets   → Cache-First  (rápido, com fallback para rede)
     • Fontes externas → Cache-First  (evita re-download)
   ============================================================ */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-GET
  if (request.method !== 'GET') return;

  // Ignora extensões de browser e chrome-extension
  if (!url.protocol.startsWith('http')) return;

  // ── HTML principal: Network-First ──────────────────────────
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // ── Fontes e assets externos: Cache-First ──────────────────
  if (CACHE_ORIGINS.includes(url.hostname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // ── Assets locais: Cache-First ─────────────────────────────
  event.respondWith(cacheFirstStrategy(request));
});

/* ============================================================
   ESTRATÉGIA: Network-First
   Tenta buscar da rede; se falhar, serve do cache.
   ============================================================ */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Atualiza o cache com a resposta mais recente
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    // Offline: tenta servir do cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fallback para o index.html se for uma navegação
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }

    return new Response('Sem conexão e sem cache disponível.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

/* ============================================================
   ESTRATÉGIA: Cache-First
   Serve do cache se disponível; caso contrário, busca na rede
   e armazena no cache para uso futuro.
   ============================================================ */
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    return new Response('Recurso indisponível offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

/* ============================================================
   MENSAGENS — comunicação com a página
   Permite que a página peça update manual ao SW
   ============================================================ */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
