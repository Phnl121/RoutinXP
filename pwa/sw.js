// Service worker do RoutinXP (modelo). O build (plugin em vite.config.js) troca os marcadores
// pela versão e pela lista de arquivos gerados e grava o resultado em dist/sw.js.
//
// - Instala: guarda a casca do app (HTML, JS, CSS, fontes, ícones) para abrir na hora e offline.
// - Navegação: rede primeiro (sempre a versão mais nova); sem internet, usa o index.html guardado.
// - Arquivos do app: do cache (os nomes têm hash, então nunca ficam velhos).
// - Supabase, Turnstile e qualquer outro domínio: nunca passam pelo cache.

const VERSAO = '__VERSAO__'
const ARQUIVOS = /* ARQUIVOS */ []
const CACHE = `routinxp-${VERSAO}`

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)))
  // Versão nova assume sem esperar as abas antigas fecharem: o app atualiza sozinho.
  self.skipWaiting()
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('routinxp-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request
  if (pedido.method !== 'GET') return
  if (new URL(pedido.url).origin !== self.location.origin) return

  if (pedido.mode === 'navigate') {
    evento.respondWith(fetch(pedido).catch(() => caches.match('/index.html')))
    return
  }

  evento.respondWith(caches.match(pedido).then((guardado) => guardado ?? fetch(pedido)))
})
