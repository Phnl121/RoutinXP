import { hojeBrasilia } from './datas'

// Valores do Financeiro: sempre em centavos (inteiros), formatados só na tela.

const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// 4590 → "R$ 45,90". Com sinal: "+R$ 45,90" / "−R$ 45,90" (sinal de menos tipográfico).
export function formatarReais(centavos, { sinal = false } = {}) {
  const texto = reais.format(Math.abs(centavos) / 100)
  if (centavos < 0) return `−${texto}`
  if (sinal && centavos > 0) return `+${texto}`
  return texto
}

// O que a pessoa digita no campo de valor vira centavos: "4590" → 4590 ("45,90").
// Até 12 dígitos (R$ 9.999.999.999,99).
export const lerCentavos = (texto) => Number(String(texto).replace(/\D/g, '').slice(0, 12) || 0)

// ---------- Meses ("2026-09") ----------

export const mesDe = (dia) => dia.slice(0, 7)
export const mesAtual = () => mesDe(hojeBrasilia())

export function andarMes(mes, passos) {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(Date.UTC(ano, m - 1 + passos, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

// Primeiro e último dia do mês, no formato do banco.
export function limitesDoMes(mes) {
  const [ano, m] = mes.split('-').map(Number)
  const ultimo = new Date(Date.UTC(ano, m, 0)).getUTCDate()
  return { inicio: `${mes}-01`, fim: `${mes}-${String(ultimo).padStart(2, '0')}` }
}

// "Setembro de 2026"
export function rotuloMes(mes) {
  const [ano, m] = mes.split('-').map(Number)
  const texto = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, m - 1, 1)))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// "setembro"
export function nomeDoMes(mes) {
  const [ano, m] = mes.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, m - 1, 1)))
}

// "sex, 12 set"
export function rotuloDia(dia) {
  const [ano, m, d] = dia.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(ano, m - 1, d)))
    .replaceAll('.', '')
}

// ---------- Somas ----------

// Entradas, saídas e resultado de uma lista (transferências não contam: o dinheiro só mudou de conta).
export function somar(transacoes) {
  let entradas = 0
  let saidas = 0
  for (const x of transacoes) {
    if (x.tipo === 'entrada') entradas += x.valor_centavos
    else if (x.tipo === 'saida') saidas += x.valor_centavos
  }
  return { entradas, saidas, resultado: entradas - saidas }
}

// Efeito de um lançamento no resultado: + entrada, − saída, 0 transferência.
export const efeito = (x) => (x.tipo === 'entrada' ? x.valor_centavos : x.tipo === 'saida' ? -x.valor_centavos : 0)

// Grupos por dia, do mais recente para o mais antigo, com o resultado de cada dia.
export function agruparPorDia(transacoes) {
  const grupos = new Map()
  for (const x of transacoes) {
    if (!grupos.has(x.data)) grupos.set(x.data, [])
    grupos.get(x.data).push(x)
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dia, itens]) => ({ dia, itens, total: itens.reduce((soma, x) => soma + efeito(x), 0) }))
}
