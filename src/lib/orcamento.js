// Orçamento e metas (fase 6 do Financeiro): limite do mês por categoria de despesa, com aviso em
// 80% e 100%, e a meta de poupança do mês. Contam só lançamentos que já aconteceram (parcelas
// agendadas para depois de hoje ficam de fora, como no restante do Controle).

export const PERTO = 0.8

// Uma linha por limite definido, da categoria mais apertada para a mais folgada.
export function progressoOrcamento(transacoes, orcamentos, categoriaPorId, hoje) {
  const gastos = new Map()
  for (const x of transacoes) {
    if (x.tipo !== 'saida' || !x.categoria_id || x.data > hoje) continue
    gastos.set(x.categoria_id, (gastos.get(x.categoria_id) ?? 0) + x.valor_centavos)
  }
  return orcamentos
    .filter((o) => categoriaPorId[o.categoria_id])
    .map((o) => {
      const gasto = gastos.get(o.categoria_id) ?? 0
      const fatia = gasto / o.limite_centavos
      return {
        categoria: categoriaPorId[o.categoria_id],
        limite: o.limite_centavos,
        gasto,
        fatia,
        estado: fatia >= 1 ? 'estourou' : fatia >= PERTO ? 'perto' : 'ok',
      }
    })
    .sort((a, b) => b.fatia - a.fatia || a.categoria.nome.localeCompare(b.categoria.nome))
}

// Média mensal de saídas por categoria nos meses anteriores ao da tela (ajuda a definir o limite).
// Divide só pelos meses que têm algum lançamento (quem começou há um mês não vê a média diluída).
export function mediaPorCategoria(historico, meses) {
  const doPeriodo = historico.filter((x) => meses.includes(x.data.slice(0, 7)))
  const comLancamento = new Set(doPeriodo.map((x) => x.data.slice(0, 7))).size
  if (!comLancamento) return {}
  const totais = {}
  for (const x of doPeriodo) {
    if (x.tipo === 'saida' && x.categoria_id) totais[x.categoria_id] = (totais[x.categoria_id] ?? 0) + x.valor_centavos
  }
  return Object.fromEntries(Object.entries(totais).map(([id, total]) => [id, Math.round(total / comLancamento)]))
}

// Meta de poupança: o alvo do mês (parte das entradas ou valor fixo) e quanto já sobrou.
export function metaDoMes(preferencias, soma) {
  const { meta_tipo: tipo, meta_valor: valor } = preferencias ?? {}
  if (!tipo || !valor) return null
  const alvo = tipo === 'pct' ? Math.round((soma.entradas * valor) / 100) : valor
  const guardado = soma.entradas - soma.saidas
  return { tipo, valor, alvo, guardado, fatia: alvo > 0 ? Math.max(guardado, 0) / alvo : 0, batida: alvo > 0 && guardado >= alvo }
}
