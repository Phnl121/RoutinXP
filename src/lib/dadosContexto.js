import { createContext, useContext } from 'react'

// Dados do usuário (useDados) compartilhados entre as páginas dentro do menu lateral.
export const DadosContexto = createContext(null)

export function useDadosApp() {
  return useContext(DadosContexto)
}
