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

// ---------- Avisos da página Foco (Web Push) ----------
// O servidor (Edge Function avisos-foco) manda { titulo, corpo, url } quando uma fase acaba.
// Mesma etiqueta do aviso local: se os dois chegarem, um substitui o outro.
self.addEventListener('push', (evento) => {
  let dados = {}
  try {
    dados = evento.data ? evento.data.json() : {}
  } catch {
    dados = { corpo: evento.data ? evento.data.text() : '' }
  }
  // O app aberto pode ter avisado há pouco: substitui sem tocar de novo (o push precisa sempre
  // mostrar uma notificação, então ela é mostrada mesmo assim). Cada tipo de aviso tem a sua
  // etiqueta: o de vencimento não apaga o do foco. Só o do foco fica até ser tocado.
  const tag = dados.tag === 'routinxp-vencimento' ? dados.tag : 'routinxp-foco'
  evento.waitUntil(
    self.registration.getNotifications({ tag }).then((abertas) =>
      self.registration.showNotification(dados.titulo || 'RoutinXP', {
        body: dados.corpo || '',
        icon: '/marca/routinxp-icone-192.png',
        tag,
        renotify: !abertas.some((n) => Date.now() - n.timestamp < 120000),
        requireInteraction: tag === 'routinxp-foco',
        data: { url: dados.url || '/foco' },
      }),
    ),
  )
})

// Tocar no aviso: traz a janela aberta para a frente (e pede a página Foco) ou abre o app nela.
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close()
  const caminho = (evento.notification.data && evento.notification.data.url) || '/foco'
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      const janela = janelas.find((j) => new URL(j.url).origin === self.location.origin)
      if (janela) {
        janela.postMessage({ tipo: 'abrir', url: caminho })
        return janela.focus()
      }
      return self.clients.openWindow(caminho)
    }),
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
