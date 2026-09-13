import { useCallback, useEffect, useState } from 'react'
import { chamarAdmin } from './conta'
import { t } from '../i18n/pt-BR'

const ad = t.admin

// Contas e registro do painel (Edge Function admin-usuarios).
export function useContasAdmin() {
  const [estado, setEstado] = useState('carregando') // carregando | pronto | erro
  const [usuarios, setUsuarios] = useState([])
  const [registro, setRegistro] = useState([])

  const aplicar = useCallback((r) => {
    setUsuarios(r.usuarios)
    setRegistro(r.registro)
    setEstado('pronto')
  }, [])
  const falhou = useCallback(() => setEstado('erro'), [])

  const carregar = useCallback(() => chamarAdmin('listar').then(aplicar, falhou), [aplicar, falhou])

  useEffect(() => {
    let ativo = true
    chamarAdmin('listar').then(
      (r) => ativo && aplicar(r),
      () => ativo && falhou(),
    )
    return () => {
      ativo = false
    }
  }, [aplicar, falhou])

  return { estado, usuarios, registro, carregar, setUsuarios }
}

export const mensagemAdmin = (erro) => ad.erros[erro?.codigoAdmin] ?? ad.erros.falha

export const nomeDaConta = (u) => u.nome || u.email

// "12 set" (com o ano quando não é o atual); com hora: "12 set, 14:03".
export function dataCurta(iso, comHora = false) {
  const data = new Date(iso)
  const opcoes = { day: 'numeric', month: 'short', timeZone: 'America/Sao_Paulo' }
  if (data.getFullYear() !== new Date().getFullYear()) opcoes.year = 'numeric'
  if (comHora) Object.assign(opcoes, { hour: '2-digit', minute: '2-digit' })
  return new Intl.DateTimeFormat('pt-BR', opcoes).format(data).replace('.', '').replace(' de ', ' ')
}

// A sua conta primeiro, depois por nome.
export const ordenarContas = (lista) =>
  [...lista].sort((a, b) => Number(b.eu) - Number(a.eu) || nomeDaConta(a).localeCompare(nomeDaConta(b), 'pt-BR'))

// Kanban e Calendário são visões dentro de Tarefas: sem Tarefas, não abrem.
export const DEPENDEM_DE_TAREFAS = ['kanban', 'calendario']
