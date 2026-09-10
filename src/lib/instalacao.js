import { useSyncExternalStore } from 'react'

// Instalação como app (PWA). O navegador avisa que dá para instalar com o evento
// beforeinstallprompt, que pode chegar antes da interface montar; por isso ele é
// capturado aqui, assim que o módulo carrega (main.jsx importa este arquivo).

let pedido = null
let instalado = false
const ouvintes = new Set()
const avisar = () => ouvintes.forEach((ouvinte) => ouvinte())

function emApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function ehIos() {
  const { userAgent, platform, maxTouchPoints } = window.navigator
  return /iphone|ipad|ipod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (evento) => {
    // Sem a barrinha automática do navegador: o convite é o do próprio app.
    evento.preventDefault()
    pedido = evento
    avisar()
  })
  window.addEventListener('appinstalled', () => {
    pedido = null
    instalado = true
    avisar()
  })
}

// 'nativo': o navegador instala com um toque (Android, Chrome e Edge no computador).
// 'ios': iPhone e iPad não têm botão de instalar; o app mostra o passo a passo.
// null: já está instalado, ou o navegador não permite.
function modoInstalacao() {
  if (instalado || emApp()) return null
  if (pedido) return 'nativo'
  if (ehIos()) return 'ios'
  return null
}

function assinar(ouvinte) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

export function useInstalacao() {
  return useSyncExternalStore(assinar, modoInstalacao, () => null)
}

// Abre a janela de instalação do navegador. Cada aviso do navegador só pode ser usado uma vez.
export async function pedirInstalacao() {
  if (!pedido) return
  const atual = pedido
  pedido = null
  avisar()
  await atual.prompt()
}
