// Gastos fixos (fase 3 do Financeiro): quando cada assinatura, parcela ou conta cobra e quanto
// isso pesa por mês e por ano. Datas no formato do banco ("2026-09-13"), contas em UTC.

const partes = (dia) => dia.split('-').map(Number)
const formatar = (ano, mes, dia) => `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
const ultimoDia = (ano, mes) => new Date(Date.UTC(ano, mes, 0)).getUTCDate()

// Mesmo dia do mês, n meses depois; no dia 31, meses curtos caem no último dia (como no banco).
export function somarMeses(dia, n) {
  const [ano, mes, d] = partes(dia)
  const base = new Date(Date.UTC(ano, mes - 1 + n, 1))
  const a = base.getUTCFullYear()
  const m = base.getUTCMonth() + 1
  return formatar(a, m, Math.min(d, ultimoDia(a, m)))
}

export function somarDias(dia, n) {
  const [ano, mes, d] = partes(dia)
  const x = new Date(Date.UTC(ano, mes - 1, d + n))
  return formatar(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate())
}

// Todas as cobranças de um gasto fixo entre dois dias (inclusive), em ordem.
// Pausados não cobram; a data final respeita `fim` e o número de parcelas.
export function cobrancasEntre(rec, inicio, fim) {
  if (!rec.ativa) return []
  const limite = rec.fim && rec.fim < fim ? rec.fim : fim
  const lista = []
  const passo =
    rec.frequencia === 'semanal' ? (i) => somarDias(rec.inicio, 7 * i) : rec.frequencia === 'anual' ? (i) => somarMeses(rec.inicio, 12 * i) : (i) => somarMeses(rec.inicio, i)
  const maximo = rec.tipo === 'parcelada' ? rec.parcelas : 5000
  for (let i = 0; i < maximo; i++) {
    const dia = passo(i)
    if (dia > limite) break
    if (dia >= inicio) lista.push({ dia, parcela: rec.tipo === 'parcelada' ? i + 1 : null })
  }
  return lista
}

// Parcelas: quantas já venceram (até hoje), quantas faltam e quanto falta pagar.
export function progressoParcelas(rec, hoje) {
  const total = rec.parcelas ?? 0
  let pagas = 0
  for (let i = 0; i < total && somarMeses(rec.inicio, i) <= hoje; i++) pagas++
  const restantes = total - pagas
  return { total, pagas, restantes, falta: restantes * rec.valor_centavos }
}

// Quanto o gasto pesa num mês típico (o comprometido). Parcelada só enquanto houver parcela.
export function custoMensal(rec, hoje) {
  if (!rec.ativa) return 0
  if (rec.fim && rec.fim < hoje) return 0
  if (rec.tipo === 'parcelada') return progressoParcelas(rec, hoje).restantes > 0 ? rec.valor_centavos : 0
  if (rec.frequencia === 'anual') return Math.round(rec.valor_centavos / 12)
  if (rec.frequencia === 'semanal') return Math.round((rec.valor_centavos * 52) / 12)
  return rec.valor_centavos
}

// Custo em 12 meses ("Netflix custa R$ 660/ano").
export function custoAnual(rec) {
  if (rec.frequencia === 'anual') return rec.valor_centavos
  if (rec.frequencia === 'semanal') return rec.valor_centavos * 52
  return rec.valor_centavos * 12
}

// Próxima cobrança a partir de hoje (inclusive), ou null se acabou.
export function proximaCobranca(rec, hoje) {
  return cobrancasEntre(rec, hoje, somarMeses(hoje, 13))[0] ?? null
}

// Chave de uma cobrança: o gasto e o dia.
export const chaveCobranca = (recorrenciaId, dia) => `${recorrenciaId}|${dia}`
