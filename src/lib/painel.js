import { diaBrasilia, hojeBrasilia } from './datas'

// Agregações do Painel, calculadas no navegador a partir das próprias tarefas do usuário
// (o RLS já garante que só vêm as dele). Dias sempre no horário de Brasília.

const DIA_MS = 86400000

// Lista dos últimos `n` dias ("AAAA-MM-DD"), do mais antigo para hoje.
export function ultimosDias(n) {
  const [a, m, d] = hojeBrasilia().split('-').map(Number)
  const base = Date.UTC(a, m - 1, d)
  return Array.from({ length: n }, (_, i) => new Date(base - (n - 1 - i) * DIA_MS).toISOString().slice(0, 10))
}

// "2026-09-10" → "qui" (dia da semana curto, sem ponto).
export function rotuloDiaSemana(dia) {
  const [a, m, d] = dia.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(a, m - 1, d)))
    .replace('.', '')
}

// "2026-09-10" → "10/09"
export function rotuloDiaMes(dia) {
  const [, m, d] = dia.split('-')
  return `${d}/${m}`
}

export function resumoPainel(tarefas, categorias, periodo = 7) {
  const concluidas = tarefas.filter((t) => t.status === 'concluida' && t.completed_at)
  const comDia = concluidas.map((t) => ({ ...t, dia: diaBrasilia(t.completed_at) }))
  const dias = ultimosDias(periodo)
  const noPeriodo = new Set(dias)

  const porDia = dias.map((dia) => {
    const doDia = comDia.filter((t) => t.dia === dia)
    return { dia, xp: doDia.reduce((s, t) => s + (t.xp_value ?? 0), 0), concluidas: doDia.length }
  })

  const doPeriodo = comDia.filter((t) => noPeriodo.has(t.dia))

  const porCategoria = categorias
    .map((categoria) => ({ categoria, total: doPeriodo.filter((t) => t.category_id === categoria.id).length }))
    .sort((a, b) => b.total - a.total || a.categoria.nome.localeCompare(b.categoria.nome))

  // "No prazo": concluída até a data prevista (mesma regra do bônus de XP).
  const noPrazo = doPeriodo.filter((t) => t.data_prevista && t.dia <= t.data_prevista).length

  return {
    dias,
    porDia,
    porCategoria,
    maisConcluida: porCategoria[0]?.total > 0 ? porCategoria[0].categoria : null,
    concluidasNoPeriodo: doPeriodo.length,
    xpNoPeriodo: doPeriodo.reduce((s, t) => s + (t.xp_value ?? 0), 0),
    concluidasTotal: concluidas.length,
    noPrazo,
    semPrazoOuAtrasada: doPeriodo.length - noPrazo,
  }
}
