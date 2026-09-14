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

// ---------- Resumo do mês (fase 2) ----------

// Os n meses que terminam em `mes`, do mais antigo para o mais recente.
export const mesesAte = (mes, n) => Array.from({ length: n }, (_, i) => andarMes(mes, i - (n - 1)))

// "set"
export function mesCurto(mes) {
  const [ano, m] = mes.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, m - 1, 1))).replace('.', '')
}

// Entradas, saídas e resultado de cada mês da lista.
export function somarPorMes(transacoes, meses) {
  return meses.map((mes) => ({ mes, ...somar(transacoes.filter((x) => x.data.startsWith(mes))) }))
}

// Saídas do mês por categoria, da maior para a menor, com a fatia do total.
// Lançamentos sem categoria entram juntos como "a revisar" (categoria null).
export function gastosPorCategoria(transacoes, categoriaPorId) {
  const totais = new Map()
  for (const x of transacoes) {
    if (x.tipo !== 'saida') continue
    const chave = categoriaPorId[x.categoria_id] ? x.categoria_id : null
    totais.set(chave, (totais.get(chave) ?? 0) + x.valor_centavos)
  }
  const geral = [...totais.values()].reduce((a, b) => a + b, 0)
  return [...totais.entries()]
    .map(([id, total]) => ({ categoria: id ? categoriaPorId[id] : null, total, fatia: geral ? total / geral : 0 }))
    .sort((a, b) => b.total - a.total)
}

// DRE pessoal: receitas menos despesas fixas, variáveis, assinaturas e o que ainda está sem
// categoria. Cada linha traz as categorias que a compõem.
export function montarDre(transacoes, categoriaPorId) {
  const linha = () => ({ total: 0, itens: new Map() })
  const linhas = { receitas: linha(), fixa: linha(), variavel: linha(), assinatura: linha(), revisar: linha() }
  for (const x of transacoes) {
    if (x.tipo === 'transferencia') continue
    const categoria = categoriaPorId[x.categoria_id]
    const chave = x.tipo === 'entrada' ? 'receitas' : categoria ? categoria.grupo : 'revisar'
    const alvo = linhas[chave] ?? linhas.variavel
    alvo.total += x.valor_centavos
    if (categoria) alvo.itens.set(categoria.id, { categoria, total: (alvo.itens.get(categoria.id)?.total ?? 0) + x.valor_centavos })
  }
  const pronto = Object.fromEntries(
    Object.entries(linhas).map(([chave, l]) => [chave, { total: l.total, itens: [...l.itens.values()].sort((a, b) => b.total - a.total) }]),
  )
  const despesas = pronto.fixa.total + pronto.variavel.total + pronto.assinatura.total + pronto.revisar.total
  return { ...pronto, resultado: pronto.receitas.total - despesas }
}

// Variação percentual inteira entre dois valores; null quando não há base de comparação.
export const variacaoPct = (atual, anterior) => (anterior > 0 ? Math.round(((atual - anterior) / anterior) * 100) : null)

// Entradas, saídas e transferências somadas; com uma conta escolhida, a transferência entra ou sai
// daquela conta. Lançamentos com data futura (parcelas agendadas) não contam.
export function somarFiltro(lista, contaId) {
  const hojeDia = hojeBrasilia()
  const efetivas = lista.filter((x) => x.data <= hojeDia)
  if (!contaId) return somar(efetivas)
  const soma = efetivas.reduce(
    (s, x) => {
      const entra = x.tipo === 'entrada' || (x.tipo === 'transferencia' && x.conta_destino_id === contaId)
      return entra ? { ...s, entradas: s.entradas + x.valor_centavos } : { ...s, saidas: s.saidas + x.valor_centavos }
    },
    { entradas: 0, saidas: 0 },
  )
  return { ...soma, resultado: soma.entradas - soma.saidas }
}
