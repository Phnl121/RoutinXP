import { useEffect, useState } from 'react'

// Tema do app (pedido do usuário, 2026-09-14): escuro (o original), claro, bege ou o do sistema.
// Guardado por navegador. O index.html aplica antes do primeiro desenho, sem piscar.
const CHAVE = 'routinxp:tema'
const EVENTO = 'routinxp:tema'
const COR_BARRA = { escuro: '#0d0e12', claro: '#fbfbfd', bege: '#f7f1e5' }
export const TEMAS = ['sistema', 'claro', 'bege', 'escuro']

const sistemaClaro = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches

export function lerTema() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    return TEMAS.includes(salvo) ? salvo : 'escuro'
  } catch {
    return 'escuro'
  }
}

// 'sistema' vira 'claro' ou 'escuro' conforme o aparelho.
export const temaEfetivo = (preferencia) => (preferencia === 'sistema' ? (sistemaClaro() ? 'claro' : 'escuro') : preferencia)

export function aplicarTema(preferencia) {
  const tema = temaEfetivo(preferencia)
  document.documentElement.dataset.tema = tema
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_BARRA[tema])
}

export function salvarTema(preferencia) {
  try {
    localStorage.setItem(CHAVE, preferencia)
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
  aplicarTema(preferencia)
  window.dispatchEvent(new Event(EVENTO))
}

// [preferência, efetivo, mudar]. Acompanha outras telas abertas e a troca de tema do sistema.
export function useTema() {
  const [preferencia, setPreferencia] = useState(lerTema)
  const [, setVersao] = useState(0)

  useEffect(() => {
    const atualizar = () => {
      setPreferencia(lerTema())
      setVersao((n) => n + 1)
    }
    const sistema = window.matchMedia?.('(prefers-color-scheme: light)')
    const aoMudarSistema = () => {
      if (lerTema() === 'sistema') aplicarTema('sistema')
      atualizar()
    }
    window.addEventListener(EVENTO, atualizar)
    window.addEventListener('storage', aoMudarSistema)
    sistema?.addEventListener('change', aoMudarSistema)
    return () => {
      window.removeEventListener(EVENTO, atualizar)
      window.removeEventListener('storage', aoMudarSistema)
      sistema?.removeEventListener('change', aoMudarSistema)
    }
  }, [])

  return [preferencia, temaEfetivo(preferencia), salvarTema]
}
