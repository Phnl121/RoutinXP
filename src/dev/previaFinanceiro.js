// Financeiro na pré-visualização de desenvolvimento (/financeiro?previa): mesma interface de
// src/lib/financeiro.js, com dados fictícios em memória.
import { hojeBrasilia } from '../lib/datas'
import { andarMes, limitesDoMes, mesDe } from '../lib/dinheiro'
import { somarMeses } from '../lib/gastosFixos'

let seq = 500
const novoId = () => `fin-${seq++}`
const agora = () => new Date().toISOString()
const espera = () => new Promise((r) => setTimeout(r, 120))

const hoje = hojeBrasilia()
const mes = mesDe(hoje)
const anterior = andarMes(mes, -1)
const diaHoje = Number(hoje.slice(8, 10))
// Dia do mês atual limitado a hoje (os exemplos nunca ficam no futuro).
const noMes = (d) => `${mes}-${String(Math.min(d, diaHoje)).padStart(2, '0')}`
const noAnterior = (d) => `${anterior}-${String(d).padStart(2, '0')}`

let contas = [
  { id: 'fc1', nome: 'Nubank', tipo: 'corrente', cor: null, saldo_inicial_em: `${andarMes(mes, -5)}-01`, saldo_inicial_centavos: 320000, dia_fechamento: null, dia_vencimento: null, arquivada: false, posicao: 0, created_at: agora() },
  { id: 'fc2', nome: 'Poupança', tipo: 'poupanca', cor: null, saldo_inicial_em: `${andarMes(mes, -5)}-01`, saldo_inicial_centavos: 850000, dia_fechamento: null, dia_vencimento: null, arquivada: false, posicao: 1, created_at: agora() },
  { id: 'fc3', nome: 'Cartão Nubank', tipo: 'cartao', cor: null, saldo_inicial_em: `${andarMes(mes, -5)}-01`, saldo_inicial_centavos: -64230, dia_fechamento: 3, dia_vencimento: 10, arquivada: false, posicao: 2, created_at: agora() },
  { id: 'fc4', nome: 'Carteira', tipo: 'dinheiro', cor: null, saldo_inicial_em: `${andarMes(mes, -5)}-01`, saldo_inicial_centavos: 12000, dia_fechamento: null, dia_vencimento: null, arquivada: false, posicao: 3, created_at: agora() },
]

const cat = (id, nome, cor, tipo, grupo, posicao) => ({ id, nome, cor, tipo, grupo, arquivada: false, posicao, created_at: agora() })
let categorias = [
  cat('fk1', 'Moradia', '#6c9be8', 'despesa', 'fixa', 0),
  cat('fk2', 'Alimentação', '#e0a050', 'despesa', 'variavel', 1),
  cat('fk3', 'Transporte', '#5fc4c0', 'despesa', 'variavel', 2),
  cat('fk4', 'Saúde', '#e27d8f', 'despesa', 'variavel', 3),
  cat('fk5', 'Educação', '#b39ddb', 'despesa', 'fixa', 4),
  cat('fk6', 'Lazer', '#d98a6a', 'despesa', 'variavel', 5),
  cat('fk7', 'Compras', '#c9b37e', 'despesa', 'variavel', 6),
  cat('fk8', 'Assinaturas', '#8f9bb3', 'despesa', 'assinatura', 7),
  cat('fk9', 'Outros', '#8f9bb3', 'despesa', 'variavel', 8),
  cat('fr1', 'Salário', '#6c9be8', 'receita', null, 0),
  cat('fr2', 'Freelance', '#5fc4c0', 'receita', null, 1),
  cat('fr3', 'Outros', '#8f9bb3', 'receita', null, 2),
]

const tx = (tipo, valor, data, descricao, conta_id, categoria_id = null, conta_destino_id = null) => ({
  id: novoId(),
  tipo,
  valor_centavos: valor,
  data,
  descricao,
  conta_id,
  conta_destino_id,
  categoria_id,
  origem: 'manual',
  created_at: agora(),
})

let transacoes = [
  tx('entrada', 480000, noMes(5), 'Salário', 'fc1', 'fr1'),
  tx('saida', 180000, noMes(5), 'Aluguel', 'fc1', 'fk1'),
  tx('transferencia', 50000, noMes(5), 'Reserva do mês', 'fc1', null, 'fc2'),
  tx('saida', 5590, noMes(6), 'Spotify e Netflix', 'fc3', 'fk8'),
  tx('saida', 23840, noMes(7), 'Mercado', 'fc3', 'fk2'),
  tx('saida', 3200, noMes(8), 'Uber', 'fc3', 'fk3'),
  tx('entrada', 90000, noMes(9), 'Site para cliente', 'fc1', 'fr2'),
  tx('transferencia', 64230, noMes(10), 'Pagamento da fatura', 'fc1', null, 'fc3'),
  tx('saida', 12990, noMes(11), 'Farmácia', 'fc3', 'fk4'),
  tx('saida', 4500, noMes(12), 'Almoço', 'fc4', 'fk2'),
  tx('saida', 8900, noMes(13), 'Cinema', 'fc3', 'fk6'),
  tx('saida', 2750, noMes(13), 'Padaria', 'fc4', 'fk2'),
  tx('saida', 15000, noMes(13), 'Pix enviado sem descrição', 'fc1'),
  tx('entrada', 480000, noAnterior(5), 'Salário', 'fc1', 'fr1'),
  tx('saida', 180000, noAnterior(5), 'Aluguel', 'fc1', 'fk1'),
  tx('saida', 31200, noAnterior(14), 'Mercado', 'fc3', 'fk2'),
  tx('saida', 5590, noAnterior(6), 'Spotify e Netflix', 'fc3', 'fk8'),
  tx('saida', 42000, noAnterior(20), 'Curso de inglês', 'fc1', 'fk5'),
  tx('entrada', 60000, noAnterior(22), 'Freela de design', 'fc1', 'fr2'),
  // Meses anteriores, para a evolução de 6 meses.
  ...[2, 3, 4, 5].flatMap((n) => {
    const m = andarMes(mes, -n)
    const dia = (d) => `${m}-${String(d).padStart(2, '0')}`
    return [
      tx('entrada', 480000, dia(5), 'Salário', 'fc1', 'fr1'),
      tx('saida', 180000, dia(5), 'Aluguel', 'fc1', 'fk1'),
      tx('saida', 26000 + n * 3100, dia(12), 'Mercado', 'fc3', 'fk2'),
      tx('saida', 5590, dia(6), 'Spotify e Netflix', 'fc3', 'fk8'),
      tx('saida', 9000 * n, dia(18), 'Lazer', 'fc3', 'fk6'),
      ...(n === 3 ? [tx('entrada', 120000, dia(15), 'Projeto freelance', 'fc1', 'fr2')] : []),
      ...(n === 4 ? [tx('saida', 95000, dia(21), 'Conserto do notebook', 'fc1', 'fk7')] : []),
    ]
  }),
]

// Gastos fixos da prévia (fase 3).
const rec = (id, nome, tipo, valor, inicio, conta_id, categoria_id, extra = {}) => ({
  id,
  nome,
  tipo,
  valor_centavos: valor,
  valor_variavel: false,
  frequencia: 'mensal',
  inicio,
  fim: null,
  parcelas: null,
  conta_id,
  categoria_id,
  ativa: true,
  created_at: agora(),
  ...extra,
})
const diaDoMes = (m, d) => `${m}-${String(d).padStart(2, '0')}`
let recorrencias = [
  rec('fr-1', 'Netflix', 'assinatura', 5590, diaDoMes(andarMes(mes, -8), 6), 'fc3', 'fk8'),
  rec('fr-2', 'Spotify', 'assinatura', 2190, diaDoMes(andarMes(mes, -14), 18), 'fc3', 'fk8'),
  rec('fr-3', 'iCloud', 'assinatura', 1490, diaDoMes(andarMes(mes, -3), 22), 'fc3', 'fk8'),
  rec('fr-4', 'Domínio do portfólio', 'assinatura', 6990, diaDoMes(andarMes(mes, 2), 3), 'fc3', 'fk8', { frequencia: 'anual' }),
  rec('fr-5', 'Aluguel', 'conta', 180000, diaDoMes(andarMes(mes, -10), 5), 'fc1', 'fk1'),
  rec('fr-6', 'Conta de luz', 'conta', 18000, diaDoMes(andarMes(mes, -10), 16), 'fc1', 'fk1', {
    valor_variavel: true,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  }),
  rec('fr-7', 'Internet', 'conta', 9990, diaDoMes(andarMes(mes, -10), 12), 'fc1', 'fk1'),
  rec('fr-8', 'Notebook', 'parcelada', 41650, diaDoMes(andarMes(mes, -6), 8), 'fc3', 'fk7', { parcelas: 12 }),
  rec('fr-9', 'Curso de inglês', 'parcelada', 21000, diaDoMes(andarMes(mes, -1), 20), 'fc3', 'fk5', { parcelas: 6 }),
  rec('fr-10', 'Academia', 'outro', 9900, diaDoMes(andarMes(mes, -4), 10), 'fc1', 'fk4', { ativa: false }),
]
// Parcelas de uma compra parcelada: como fin_gerar_parcelas no banco (refaz as futuras).
function gerarParcelas(r) {
  transacoes = transacoes.filter((x) => x.recorrencia_id !== r.id || (x.data <= hoje && x.parcela <= r.parcelas))
  for (let n = 1; n <= r.parcelas; n++) {
    const dia = somarMeses(r.inicio, n - 1)
    if (transacoes.some((x) => x.recorrencia_id === r.id && x.referencia === dia)) continue
    transacoes.push({ ...tx('saida', r.valor_centavos, dia, `${r.nome} (${n}/${r.parcelas})`, r.conta_id, r.categoria_id), recorrencia_id: r.id, referencia: dia, parcela: n })
  }
}
recorrencias.filter((r) => r.tipo === 'parcelada').forEach(gerarParcelas)
// Cobranças já pagas: aluguel e internet deste mês.
// O aluguel deste mês já estava nos lançamentos: só ganha o vínculo.
transacoes = transacoes.map((x) => (x.descricao === 'Aluguel' && x.data === noMes(5) ? { ...x, recorrencia_id: 'fr-5', referencia: noMes(5) } : x))
transacoes.push(
  { ...tx('saida', 9990, noMes(12), 'Internet', 'fc1', 'fk1'), recorrencia_id: 'fr-7', referencia: noMes(12) },
)

const copia = (x) => structuredClone(x)
const falha = (message, code) => Promise.reject({ message, code })

export async function prepararFinanceiro() {
  await espera()
}

export async function listarContasFin() {
  await espera()
  return copia(contas)
}

export async function listarCategoriasFin() {
  await espera()
  return copia(categorias)
}

export async function listarSaldosFin() {
  await espera()
  return contas.map((c) => ({
    conta_id: c.id,
    saldo_centavos:
      c.saldo_inicial_centavos +
      transacoes
        .filter((x) => x.data >= c.saldo_inicial_em && x.data <= hoje)
        .reduce((soma, x) => {
          if (x.conta_id === c.id) return soma + (x.tipo === 'entrada' ? x.valor_centavos : -x.valor_centavos)
          if (x.conta_destino_id === c.id) return soma + x.valor_centavos
          return soma
        }, 0),
  }))
}

export async function listarTransacoesDosMeses(primeiro, ultimo) {
  await espera()
  const inicio = limitesDoMes(primeiro).inicio
  const fim = limitesDoMes(ultimo).fim
  return copia(
    transacoes
      .filter((x) => x.data >= inicio && x.data <= fim)
      .sort((a, b) => b.data.localeCompare(a.data) || b.created_at.localeCompare(a.created_at)),
  )
}

export async function salvarContaFin(conta) {
  await espera()
  if (conta.id) {
    contas = contas.map((c) => (c.id === conta.id ? { ...c, ...conta } : c))
    return copia(contas.find((c) => c.id === conta.id))
  }
  const nova = { cor: null, posicao: contas.length, created_at: agora(), saldo_inicial_em: hoje, ...conta, id: novoId() }
  contas = [...contas, nova]
  return copia(nova)
}

export async function excluirContaFin(id) {
  await espera()
  if (transacoes.some((x) => x.conta_id === id || x.conta_destino_id === id)) return falha('fk', '23503')
  contas = contas.filter((c) => c.id !== id)
}

export async function salvarCategoriaFin(categoria) {
  await espera()
  const repetida = categorias.some(
    (c) => c.id !== categoria.id && c.tipo === categoria.tipo && c.nome.trim().toLowerCase() === categoria.nome.trim().toLowerCase(),
  )
  if (repetida) return falha('duplicada', '23505')
  if (categoria.id) {
    categorias = categorias.map((c) => (c.id === categoria.id ? { ...c, nome: categoria.nome, cor: categoria.cor, grupo: categoria.grupo } : c))
    return copia(categorias.find((c) => c.id === categoria.id))
  }
  const nova = { arquivada: false, posicao: categorias.length, created_at: agora(), ...categoria, id: novoId() }
  categorias = [...categorias, nova]
  return copia(nova)
}

export async function excluirCategoriaFin(id) {
  await espera()
  categorias = categorias.filter((c) => c.id !== id)
  transacoes = transacoes.map((x) => (x.categoria_id === id ? { ...x, categoria_id: null } : x))
}

export async function salvarTransacaoFin(transacao) {
  await espera()
  if (transacao.id) {
    transacoes = transacoes.map((x) => (x.id === transacao.id ? { ...x, ...transacao } : x))
    return copia(transacoes.find((x) => x.id === transacao.id))
  }
  const nova = { origem: 'manual', created_at: agora(), ...transacao, id: novoId() }
  transacoes = [nova, ...transacoes]
  return copia(nova)
}

export async function excluirTransacaoFin(id) {
  await espera()
  transacoes = transacoes.filter((x) => x.id !== id)
}

export async function listarRecorrencias() {
  await espera()
  return copia(recorrencias)
}

export async function salvarRecorrencia(r) {
  // (a prévia não falha ao gerar parcelas: não precisa do plano anterior)
  await espera()
  if (r.id) {
    recorrencias = recorrencias.map((x) => (x.id === r.id ? { ...x, ...r } : x))
    const salva = recorrencias.find((x) => x.id === r.id)
    if (salva.tipo === 'parcelada') gerarParcelas(salva)
    return copia(salva)
  }
  const nova = { ativa: true, created_at: agora(), fim: null, ...r, id: novoId() }
  recorrencias = [...recorrencias, nova]
  if (nova.tipo === 'parcelada') gerarParcelas(nova)
  return copia(nova)
}

export async function excluirRecorrencia(id) {
  await espera()
  transacoes = transacoes.filter((x) => x.recorrencia_id !== id || x.data <= hoje)
  recorrencias = recorrencias.filter((x) => x.id !== id)
  transacoes = transacoes.map((x) => (x.recorrencia_id === id ? { ...x, recorrencia_id: null } : x))
}

export async function listarPagamentos(inicio, fim) {
  await espera()
  return copia(transacoes.filter((x) => x.recorrencia_id && x.referencia >= inicio && x.referencia <= fim))
}

export async function pagarCobranca({ rec: r, referencia, valor_centavos, data, conta_id }) {
  await espera()
  if (transacoes.some((x) => x.recorrencia_id === r.id && x.referencia === referencia)) return falha('duplicada', '23505')
  const nova = { ...tx('saida', valor_centavos, data, r.nome, conta_id, r.categoria_id), recorrencia_id: r.id, referencia }
  transacoes = [nova, ...transacoes]
  return copia(nova)
}
