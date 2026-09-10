import { useSyncExternalStore } from 'react'

function assinar(ouvinte) {
  window.addEventListener('online', ouvinte)
  window.addEventListener('offline', ouvinte)
  return () => {
    window.removeEventListener('online', ouvinte)
    window.removeEventListener('offline', ouvinte)
  }
}

// true com internet, false sem. Segue os eventos online/offline do navegador.
export function useConexao() {
  return useSyncExternalStore(assinar, () => window.navigator.onLine, () => true)
}
