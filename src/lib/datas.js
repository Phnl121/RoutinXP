import { t } from '../i18n/pt-BR'

// Prazo de uma tarefa pendente, relativo ao dia de hoje (local):
// "hoje", "amanhã" ou "12 set"; estado 'atrasada' | 'hoje' | 'futura' | 'sem'.
export function formatarPrazo(iso) {
  if (!iso) return { texto: t.tarefas.semData, estado: 'sem' }
  const [ano, mes, dia] = iso.split('-').map(Number)
  const alvo = new Date(ano, mes - 1, dia)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const diferenca = Math.round((alvo - hoje) / 86400000)
  if (diferenca === 0) return { texto: t.tarefas.hoje, estado: 'hoje' }
  if (diferenca === 1) return { texto: t.tarefas.amanha, estado: 'futura' }
  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(alvo).replace('.', '')
  return { texto: `${dia} ${nomeMes}`, estado: diferenca < 0 ? 'atrasada' : 'futura' }
}

// Pendentes: data prevista mais próxima primeiro; sem data no fim.
export function ordenarPendentes(a, b) {
  if (a.data_prevista && b.data_prevista) {
    return a.data_prevista.localeCompare(b.data_prevista) || a.created_at.localeCompare(b.created_at)
  }
  if (a.data_prevista) return -1
  if (b.data_prevista) return 1
  return a.created_at.localeCompare(b.created_at)
}

// Concluídas: mais recente primeiro.
export function ordenarConcluidas(a, b) {
  return (b.completed_at ?? '').localeCompare(a.completed_at ?? '')
}

export function iniciaisDoEmail(email) {
  const letras = (email ?? '').split('@')[0].replace(/[^a-zA-Z]/g, '')
  return (letras.slice(0, 2) || '?').toUpperCase()
}
