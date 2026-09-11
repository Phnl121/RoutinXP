import { useSyncExternalStore } from 'react'

// Etiquetas das tarefas como no Trello: com o nome ou só a cor. Clicar em qualquer
// etiqueta alterna todas de uma vez, e a escolha fica salva neste navegador.

const CHAVE = 'routinxp:tags:compactas'
const ouvintes = new Set()
let compactas = (() => {
  try {
    return localStorage.getItem(CHAVE) === '1'
  } catch {
    return false
  }
})()

function assinar(ouvinte) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

export function useTagsCompactas() {
  return useSyncExternalStore(assinar, () => compactas, () => false)
}

export function alternarTagsCompactas() {
  compactas = !compactas
  try {
    localStorage.setItem(CHAVE, compactas ? '1' : '0')
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
  ouvintes.forEach((ouvinte) => ouvinte())
}
