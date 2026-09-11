// Player do Spotify na página Foco: o player embutido oficial (iFrame API), a partir de um link
// colado pelo usuário. Não conecta conta: funciona com Spotify grátis ou Premium, no computador
// e no celular. Quem está logado no Spotify naquele navegador ouve as músicas inteiras;
// quem não está ouve trechos de 30 segundos (regra do próprio Spotify).

const TIPOS = ['playlist', 'album', 'track', 'episode', 'show', 'artist']
const ID = /^[A-Za-z0-9]{22}$/

// Link do Spotify (open.spotify.com/playlist/…, com ou sem /intl-pt/) ou URI (spotify:playlist:…)
// → URI "spotify:tipo:id". Devolve null quando não é um link de conteúdo do Spotify.
export function uriSpotify(texto) {
  const valor = (texto ?? '').trim()
  const uri = valor.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/)
  if (uri) return TIPOS.includes(uri[1]) && ID.test(uri[2]) ? `spotify:${uri[1]}:${uri[2]}` : null
  let url
  try {
    url = new URL(valor)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com') return null
  const partes = url.pathname.split('/').filter((p) => p && !p.startsWith('intl-') && p !== 'embed')
  const [tipo, id] = partes
  return TIPOS.includes(tipo) && ID.test(id ?? '') ? `spotify:${tipo}:${id}` : null
}

// Links curtos (spotify.link/…) só abrem no Spotify; a tela pede o link completo.
export const ehLinkCurto = (texto) => /^https?:\/\/(spotify\.link|spoti\.fi)\//i.test((texto ?? '').trim())

let carregando = null

// Carrega o script oficial uma vez e devolve o IFrameAPI.
export function carregarApiSpotify() {
  if (carregando) return carregando
  carregando = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api)
    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    script.onerror = () => {
      carregando = null
      script.remove()
      reject(new Error('spotify_indisponivel'))
    }
    document.body.appendChild(script)
  })
  return carregando
}
