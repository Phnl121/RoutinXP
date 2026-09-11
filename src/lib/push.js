// Avisos por Web Push da página Foco: o fim de uma fase chega como notificação do sistema
// mesmo com a tela bloqueada, a aba escondida ou o app fechado (servidor: Edge Function
// avisos-foco). Precisa do service worker, que só é registrado em produção.
//
// No iPhone e no iPad o push só funciona com o app instalado na tela inicial (iOS 16.4+).

// Chave pública VAPID (a privada fica só nos segredos do Supabase).
const CHAVE_PUBLICA = 'BO-oEatv1tWvA-q1sjlblnw_pcbin9j7HCFCg4vrrXkl4-8uo1BC96Wl4CbkcDZ0H47jDVH282M-SsH7tXLTUg4'

export const pushSuportado = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

// iPhone/iPad no navegador (fora do app instalado): o push não existe ali.
export const iosSemInstalar = () =>
  typeof window !== 'undefined' &&
  /iPhone|iPad|iPod/.test(navigator.userAgent) &&
  !window.matchMedia?.('(display-mode: standalone)').matches &&
  !navigator.standalone

// 'granted' | 'denied' | 'default' | 'indisponivel'
export const permissaoAtual = () => (typeof Notification === 'undefined' ? 'indisponivel' : Notification.permission)

function bytesDaChave(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const texto = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  return Uint8Array.from(texto, (c) => c.charCodeAt(0))
}

let inscrito = false

// Inscreve este navegador (uma vez por abertura do app) e manda a inscrição ao servidor.
export async function garantirInscricao(registrar) {
  if (inscrito || !pushSuportado() || Notification.permission !== 'granted') return inscrito
  const registro = await navigator.serviceWorker.getRegistration()
  if (!registro) return false
  const inscricao =
    (await registro.pushManager.getSubscription()) ??
    (await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytesDaChave(CHAVE_PUBLICA) }))
  const { endpoint, keys } = inscricao.toJSON()
  await registrar({ endpoint, p256dh: keys.p256dh, auth: keys.auth })
  inscrito = true
  return true
}
