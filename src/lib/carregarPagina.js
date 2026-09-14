import { lazy } from 'react'

const CHAVE = 'routinxp:recarregou-pagina'

// lazy() das páginas com uma rede de segurança: depois de um deploy, uma aba aberta pode pedir
// um arquivo de página que não existe mais (o nome muda a cada versão). Nesse caso a página
// recarrega uma vez e já busca a versão nova; se falhar de novo, o erro segue normalmente.
export function carregarPagina(importar) {
  return lazy(() =>
    importar().then(
      (modulo) => {
        try {
          sessionStorage.removeItem(CHAVE)
        } catch {
          /* sem armazenamento */
        }
        return modulo
      },
      (erro) => {
        let jaRecarregou = false
        try {
          jaRecarregou = sessionStorage.getItem(CHAVE) === '1'
          if (!jaRecarregou) sessionStorage.setItem(CHAVE, '1')
        } catch {
          jaRecarregou = true
        }
        if (jaRecarregou || !navigator.onLine) throw erro
        window.location.reload()
        // Nunca resolve: a página já está recarregando.
        return new Promise(() => {})
      },
    ),
  )
}
